import { getNoteUUID } from "./utils.js";
/**
 * Runs the note-level table randomizer command in Amplenote.
 * @param {Object} app - Amplenote plugin API object.
 * @param {string} noteUUID - UUID of the note whose markdown tables should be randomized.
 * @returns {Promise<void>} - Resolves after random combinations are generated and audited.
 */
export default async function (app, noteUUID) {

	// *************************************************************** //

	let markdown;
	try {
		markdown = await app.getNoteContent({ uuid: noteUUID });
		if (!markdown) throw new Error("No content found");
	} catch (err) {
		console.error("Error retrieving note content:", err);
		app.alert("Failed to read note content. Please ensure a valid note is selected.");
		return;
	}

	/**
	 * Removes HTML comments from markdown content.
	 * @param {string} content - Markdown content to clean.
	 * @returns {string} - Markdown content without HTML comments.
	 */
	const removeHtmlComments = (content) => content.replace(/<!--[\s\S]*?-->/g, '').trim();

	// *************************************************************** //

	/**
	 * Removes empty rows and empty columns from a markdown table.
	 * @param {string} table - Markdown table text.
	 * @returns {string} - Cleaned markdown table text.
	 */
	const removeEmptyRowsAndColumns = (table) => {
		const rows = table.split('\n').filter(row => row.trim().startsWith('|'));
		// console.log("Rows before filtering:", rows);

		// Remove completely empty rows
		const filteredRows = rows.filter(row => {
			const cells = row.split('|').slice(1, -1); // Exclude the leading and trailing empty cells
			// console.log("Cells in current row:", cells);
			const hasContent = cells.some(cell => cell.trim() !== '');
			// console.log("Row has content:", hasContent);
			return hasContent;
		});

		// console.log("Filtered rows (no empty rows):", filteredRows);

		if (filteredRows.length === 0) {
			// console.log("All rows are empty, returning empty string.");
			return ''; // If all rows are empty, return empty string
		}

		// Determine the columns that are not empty across all rows
		const columnCount = filteredRows[0].split('|').length - 2;
		// console.log("Column count:", columnCount);
		const nonEmptyColumns = Array.from({ length: columnCount }, (_, colIndex) =>
			filteredRows.some(row => row.split('|')[colIndex + 1].trim() !== '')
		);

		// console.log("Non-empty columns flags:", nonEmptyColumns);

		// Remove empty columns
		const cleanedRows = filteredRows.map(row => {
			const cells = row.split('|').slice(1, -1); // Exclude the leading and trailing empty cells
			// console.log("Cells before filtering empty columns:", cells);
			const filteredCells = cells.filter((_, i) => nonEmptyColumns[i]);
			// console.log("Filtered cells (no empty columns):", filteredCells);
			return `| ${filteredCells.join(' | ')} |`;
		});

		// console.log("Cleaned rows after removing empty columns:", cleanedRows);

		return cleanedRows.join('\n');
	};

	// *************************************************************** //

	const lines = markdown.split('\n');
	// console.log("Lines:", lines);

	let tableCount = 0;
	let inTable = false;
	const tables = [];
	let currentTable = [];

	lines.forEach((line, index) => {
		// console.log(`Processing line ${index}:`, line);

		if (line.trim().startsWith('|')) {  // Identifying table rows
			if (!inTable) {
				tableCount++;
				// console.log("New table detected, tableCount incremented:", tableCount);

				if (tableCount > 1) {
					tables.push('---');  // Add separator between tables
					// console.log("Added table separator ('---').");
				}
				tables.push(`# Table ${tableCount}\n`);
				inTable = true;
				// console.log("In table set to true:", inTable);
			}

			if (currentTable.length === 0 && line.split('|').every(cell => cell.trim() === '')) {
				const columnCount = line.split('|').length - 2;
				const headers = Array.from({ length: columnCount }, (_, i) => `Column ${i + 1}`).join(' | ');
				// currentTable.push(`| ${headers} |`); // Automatically Adding Columns is disabled for now!
				// console.log("Added headers to empty table row:", currentTable);
			}

			currentTable.push(line);
			// console.log("Current table content:", currentTable);
		} else if (inTable) {
			inTable = false;
			// console.log("End of table detected, inTable set to false.");

			const tableContent = currentTable.join('\n');
			// console.log("Current table content before cleaning:", tableContent);

			// tables.push(removeEmptyRowsAndColumns(tableContent));
			tables.push(tableContent);
			tables.push('');  // Add an additional blank line between tables
			// console.log("Added cleaned table and blank line to tables:", tables);

			currentTable = [];
			// console.log("Reset currentTable:", currentTable);
		}
	});

	// Ensure the last table is pushed if the markdown ends with a table
	if (currentTable.length > 0) {
		const tableContent = currentTable.join('\n');
		// console.log("Final table content before cleaning:", tableContent);

		tables.push(removeEmptyRowsAndColumns(tableContent));
		// console.log("Added final cleaned table to tables:", tables);
	}

	// Join all tables and remove HTML comments at the end
	const processedContent = tables.join('\n\n');
	// console.log("Processed content before removing HTML comments:", processedContent);

	const cleanedContent = removeHtmlComments(processedContent);
	// console.log("Cleaned content after removing HTML comments:", cleanedContent);

	const markdownText = cleanedContent;

	// app.alert(cleanedContent);
	// console.log("Final cleaned content:", cleanedContent);

	// *************************************************************** //	

	/**
	 * Builds prompt options for every detected generated table header.
	 * @param {string} markdownContent - Processed markdown containing numbered table headers.
	 * @returns {Array<{label: string, value: string}>} - Radio options for table selection.
	 */
	function getTableDetails(markdownContent) {
		// Regex to find markdown headers like "# Table 1", "# Table 2", etc.
		const headerRegex = /#\s*Table\s*\d+/g;

		// Match all headers that follow the pattern "# Table X"
		const headers = markdownContent.match(headerRegex);

		// If no headers are found, return an empty array
		if (!headers) return [];

		// Map the headers to an array of objects in the desired format
		const tableDetails = headers.map(header => {
			// Remove the '#' from the header text
			const tableName = header.replace('# ', '');
			return { label: tableName, value: tableName };
		});

		// Add an "All" entry at the beginning of the list
		tableDetails.unshift({ label: "All Tables", value: "All" });

		return tableDetails;
	}

	// Count the number of tables
	const numberOfTables = getTableDetails(markdownText);
	// console.log("Number of tables found:", numberOfTables);

	if (numberOfTables < 1) {
		app.alert("Warning: This Note does not contain any Tables. Select this option on Notes which contain Tables.")
		return;
	}

	const existingSetting = await app.settings["Previous_Roll_Ran"];

	// Prompt the user to select tags and choose options
	const result = await app.prompt(
		"Fill in or Update the Details, based on your requirments.",
		{
			inputs: [
				{
					label: "Select the Table - To Randomize!",
					type: "radio",
					options: numberOfTables,
					value: "All"
				},
				{ label: "Select number of Randomizations.", type: "string", value: existingSetting || 3 },
				{ label: "The Table has Headers", type: "checkbox", value: true }
			]
		}
	);

	if (result) {
		// Variables and constants to define the game setup
		const [
			nthTable, // User-defined parameter to select the nth table
			numberCombo, // Number of combinations
			hasHeader // Specify whether the table has headers to skip the first row of data
		] = result;

		await app.setSetting("Previous_Roll_Ran", numberCombo);

		class ColumnRandomPicker {
			/**
			 * Creates a random picker for markdown tables.
			 * @param {string} markdownText - Processed markdown containing named tables.
			 * @param {boolean} keepHeaders - Whether source tables include headers.
			 * @returns {ColumnRandomPicker} - Picker instance with parsed tables.
			 */
			constructor(markdownText, keepHeaders = true) {
				this.keepHeaders = keepHeaders;
				this.tables = this.parseTables(markdownText);
			}

			/**
			 * Parses numbered markdown tables into a table map.
			 * @param {string} markdownText - Markdown containing generated table headings.
			 * @returns {Object<string, string[][]>} - Table data keyed by table name.
			 */
			parseTables(markdownText) {
				const tables = {};
				let currentTable = [];
				let currentTableName = '';

				// Split into lines
				const lines = markdownText.split('\n');

				for (const line of lines) {
					if (line.startsWith('# ')) {
						if (currentTable.length > 0) {
							tables[currentTableName] = this.processTable(currentTable);
							currentTable = [];
						}
						currentTableName = line.substring(2).trim();
					} else if (line.includes('|') && !line.trim().startsWith('---')) {
						currentTable.push(line);
					}
				}

				// Process the last table
				if (currentTable.length > 0 && currentTableName) {
					tables[currentTableName] = this.processTable(currentTable);
				}

				return tables;
			}

			/**
			 * Converts table lines into cell arrays, skipping markdown separator/header rows.
			 * @param {string[]} tableLines - Raw markdown table lines.
			 * @returns {string[][]} - Parsed table body cells.
			 */
			processTable(tableLines) {
				// Skip the first two lines (table formatting)
				// If the table has headers, skip the 3rd row (the header names)
				const startIndex = this.keepHeaders ? 3 : 2;

				// Process each line into an array of cells
				const data = tableLines.slice(startIndex).map(line => {
					return line.split('|')
						.slice(1, -1)  // Remove empty first/last elements
						.map(cell => cell.trim());
				});

				return data;
			}

			/**
			 * Picks one non-empty value from an array.
			 * @param {string[]} arr - Candidate values.
			 * @returns {string} - Random value, or an empty string when none are available.
			 */
			getRandomValueFromArray(arr) {
				// Filter out empty values before selecting
				const validValues = arr.filter(value => value !== '');
				if (validValues.length === 0) return '';
				return validValues[Math.floor(Math.random() * validValues.length)];
			}

			/**
			 * Picks one random value from each column of a table.
			 * @param {string} tableName - Name of the parsed table.
			 * @returns {string[]|null} - Column-based random combination, or null if missing.
			 */
			getColumnBasedRandomCombination(tableName) {
				const table = this.tables[tableName];
				if (!table) return null;

				// Get number of columns from first row
				const numColumns = table[0].length;

				// Create arrays for each column
				const columns = Array(numColumns).fill().map(() => []);

				// Populate column arrays
				table.forEach(row => {
					row.forEach((value, colIndex) => {
						if (value !== '') {
							columns[colIndex].push(value);
						}
					});
				});

				// Pick one random value from each column
				return columns.map(column => this.getRandomValueFromArray(column));
			}

			/**
			 * Generates multiple random combinations for one table.
			 * @param {string} tableName - Name of the parsed table.
			 * @param {number} count - Number of combinations to generate.
			 * @returns {string[][]} - Generated combinations.
			 */
			generateMultipleCombinations(tableName, count) {
				const combinations = [];
				for (let i = 0; i < count; i++) {
					const combo = this.getColumnBasedRandomCombination(tableName);
					if (combo) combinations.push(combo);
				}
				return combinations;
			}

			/**
			 * Generates random combinations for every parsed table.
			 * @param {number} count - Number of combinations per table.
			 * @returns {Object<string, string[][]>} - Generated combinations keyed by table name.
			 */
			generateCombinationsForAllTables(count = 1) {
				const result = {};
				for (const tableName of Object.keys(this.tables)) {
					result[tableName] = this.generateMultipleCombinations(tableName, count);
				}
				return result;
			}

			/**
			 * Generates random combinations for a single parsed table.
			 * @param {string} tableName - Name of the parsed table.
			 * @param {number} count - Number of combinations to generate.
			 * @returns {Object<string, string[][]>} - Generated combinations keyed by table name.
			 */
			generateCombinationsForOneTable(tableName, count = 1) {
				const result = {};
				if (this.tables[tableName]) {
					result[tableName] = this.generateMultipleCombinations(tableName, count);
				} else {
					console.error("Table not found: ", tableName);
				}
				return result;
			}

			/**
			 * Formats generated combinations as markdown tables.
			 * @param {Object<string, string[][]>|string[][]} combinations - Generated random combinations.
			 * @returns {string} - Markdown report.
			 */
			formatAsMarkdown(combinations) {
				let output = '';

				// Check if combinations is an array (indicating one table) or an object (multiple tables)
				if (Array.isArray(combinations)) {
					// Handle single table
					const tableData = Object.entries(combinations);
					output += `<mark>Table</mark>\n`;
					output += '|' + tableData[0].map((_, i) => ` Column ${i + 1} `).join('|') + '|\n';
					output += '|' + tableData[0].map(() => '---').join('|') + '|\n';
					tableData.forEach(row => {
						output += '|' + row.map(cell => ` ${cell} `).join('|') + '|\n';
					});
				} else {
					// Handle multiple tables (object with tableName as keys)
					for (const [tableName, tableData] of Object.entries(combinations)) {
						output += `<mark>${tableName}</mark>\n`;
						output += '|' + tableData[0].map((_, i) => ` Column ${i + 1} `).join('|') + '|\n';
						output += '|' + tableData[0].map(() => '---').join('|') + '|\n';
						tableData.forEach(row => {
							output += '|' + row.map(cell => ` ${cell} `).join('|') + '|\n';
						});
						output += '...............\n';
					}
				}

				return output;
			}

		}

		// Example usage:
		const picker = new ColumnRandomPicker(markdownText, hasHeader);
		let finalOutput;

		if (nthTable === "All") {
			// Generate multiple combinations for each table
			const multipleCombinations = picker.generateCombinationsForAllTables(numberCombo);
			// console.log(picker.formatAsMarkdown(multipleCombinations));
			finalOutput = picker.formatAsMarkdown(multipleCombinations);
		} else {
			// Get one random combination for Table 1
			const tableCombo = picker.generateCombinationsForOneTable(nthTable, numberCombo);
			// console.log(picker.formatAsMarkdown(tableCombo));
			finalOutput = picker.formatAsMarkdown(tableCombo);
		}

		// Generate the filename based on the current date and time
		const now = new Date();
		const YYMMDD = now.toISOString().slice(2, 10).replace(/-/g, '');
		const HHMMSS = now.toTimeString().slice(0, 8).replace(/:/g, '');

		// Audit Report
		const auditNoteName = `Dice Results Audit`;
		const auditTagName = ['-reports/-dice'];
		const auditnoteUUID = await getNoteUUID(app, auditNoteName, auditTagName);

		const finalResultz = `[Report][^AGER]
[^AGER]: []()${finalOutput}
`;

		const auditReport = `- <mark>Table - Randomizer:</mark> ***When:** ${YYMMDD}_${HHMMSS}*; **UUID:** ${noteUUID} ; <mark>**Data:**</mark> ${finalResultz}`;
		await app.insertNoteContent({ uuid: auditnoteUUID }, auditReport);
		
		const safeUUID = String(auditnoteUUID);
		await app.navigate(`https://www.amplenote.com/notes/${safeUUID}`);

		app.alert(finalOutput);
		// console.log(finalOutput);


	}

}
