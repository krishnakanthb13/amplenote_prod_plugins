import { getNoteUUID } from "./utils.js";
/**
 * Runs the Advanced dice expression command in Amplenote.
 * @param {Object} app - Amplenote plugin API object.
 * @returns {Promise<void>} - Resolves after expressions are evaluated and audited.
 */
export default async function (app) {

    // const existingSetting1 = await app.settings["Previous_Roll_ADV1"];
    // const existingSetting2 = await app.settings["Previous_Roll_ADV2"];

	class DiceParser {
		/**
		 * Creates a parser for dice expressions.
		 * @returns {DiceParser} - Parser instance with reset input state.
		 */
		constructor() {
			this.pos = 0;
			this.input = '';
		}

		/**
		 * Rolls one die with the requested number of sides.
		 * @param {number} sides - Number of sides on the die.
		 * @returns {number} - Random value between 1 and sides.
		 */
		rollDie(sides) {
			return Math.floor(Math.random() * sides) + 1;
		}

		/**
		 * Rolls multiple dice and returns their sum.
		 * @param {number} count - Number of dice to roll.
		 * @param {number} sides - Number of sides on each die.
		 * @returns {number} - Sum of all dice.
		 */
		rollDice(count, sides) {
			let sum = 0;
			for (let i = 0; i < count; i++) {
				sum += this.rollDie(sides);
			}
			return sum;
		}

		/**
		 * Advances the parser past whitespace characters.
		 * @returns {void}
		 */
		skipWhitespace() {
			while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
				this.pos++;
			}
		}

		/**
		 * Parses either a literal number or dice notation such as 2d6.
		 * @returns {number} - Parsed literal or rolled dice total.
		 */
		parseNumber() {
			this.skipWhitespace();
			
			// Check for dice notation
			if (/\d/.test(this.input[this.pos])) {
				let start = this.pos;
				while (this.pos < this.input.length && /\d/.test(this.input[this.pos])) {
					this.pos++;
				}
				
				if (this.pos < this.input.length && this.input[this.pos] === 'd') {
					const count = parseInt(this.input.slice(start, this.pos));
					this.pos++; // skip 'd'
					
					start = this.pos;
					while (this.pos < this.input.length && /\d/.test(this.input[this.pos])) {
						this.pos++;
					}
					const sides = parseInt(this.input.slice(start, this.pos));
					
					return this.rollDice(count, sides);
				} else {
					return parseInt(this.input.slice(start, this.pos));
				}
			}
			
			throw new Error('Invalid number or dice expression');
		}

		/**
		 * Parses a parenthesized expression or a number-like term.
		 * @returns {number} - Parsed expression value.
		 */
		parseParentheses() {
			this.skipWhitespace();
			
			if (this.input[this.pos] === '(') {
				this.pos++;
				const result = this.parseExpression();
				this.skipWhitespace();
				
				if (this.input[this.pos] !== ')') {
					throw new Error('Missing closing parenthesis');
				}
				this.pos++;
				
				return result;
			}
			
			return this.parseNumber();
		}

		/**
		 * Parses exponent operations.
		 * @returns {number} - Parsed exponent expression value.
		 */
		parseExponent() {
			let left = this.parseParentheses();
			this.skipWhitespace();
			
			while (this.pos < this.input.length && this.input[this.pos] === '^') {
				this.pos++;
				const right = this.parseParentheses();
				left = Math.pow(left, right);
				this.skipWhitespace();
			}
			
			return left;
		}

		/**
		 * Parses multiplication and division operations.
		 * @returns {number} - Parsed multiplication/division expression value.
		 */
		parseMultiplyDivide() {
			let left = this.parseExponent();
			this.skipWhitespace();
			
			while (this.pos < this.input.length && (this.input[this.pos] === '*' || this.input[this.pos] === '/')) {
				const operator = this.input[this.pos];
				this.pos++;
				const right = this.parseExponent();
				
				if (operator === '*') {
					left *= right;
				} else {
					left /= right;
				}
				
				this.skipWhitespace();
			}
			
			return left;
		}

		/**
		 * Parses addition and subtraction operations.
		 * @returns {number} - Parsed expression value.
		 */
		parseExpression() {
			let left = this.parseMultiplyDivide();
			this.skipWhitespace();
			
			while (this.pos < this.input.length && (this.input[this.pos] === '+' || this.input[this.pos] === '-')) {
				const operator = this.input[this.pos];
				this.pos++;
				const right = this.parseMultiplyDivide();
				
				if (operator === '+') {
					left += right;
				} else {
					left -= right;
				}
				
				this.skipWhitespace();
			}
			
			return left;
		}

		/**
		 * Parses a complete dice expression.
		 * @param {string} input - Dice expression to parse.
		 * @returns {number} - Evaluated expression value.
		 */
		parse(input) {
			this.input = input.replace(/\s+/g, '').toLowerCase();
			this.pos = 0;
			
			const result = this.parseExpression();
			
			if (this.pos < this.input.length) {
				throw new Error('Invalid expression');
			}
			
			return result;
		}
	}

	/**
	 * Evaluates a dice expression and returns an error string when parsing fails.
	 * @param {string} expression - Dice expression entered by the user.
	 * @returns {number|string} - Evaluated result or formatted error message.
	 */
	function evaluateDiceExpression(expression) {
		const parser = new DiceParser();
		try {
			return parser.parse(expression);
		} catch (error) {
			return `Error: ${error.message}`;
		}
	}

	/**
	 * Prompts for advanced dice expressions, evaluates them, and writes an audit report.
	 * @returns {Promise<void>} - Resolves after prompt processing finishes.
	 */
	async function main() {

	// Test examples
	const examplez = `1d2,\n3d4 + 3,\n1d12 + 1d10 + 5,\n3d4+3d4-(3d4 * 1d4) - 2^1d7`;

	  // Prompt user with pre-filled inputs
	  const result = await app.prompt("Add / Modify the Formulas that you want to run the Dice for.", {
		inputs: [
		  { label: "Single Dice Formula", type: "string", value: `1d2` },
		  { label: "Multiple Dice Formulas", type: "text", value: `${examplez}` },
		],
	  });

      // console.log("result",result);

	  if (result) {
		const [singleDice, multipleDice] = result;
		// const multipleDicez = [Array.from(multipleDice)];

	  let finalResult = ``;
	  // await app.setSetting("Previous_Roll_ADV1", singleDice);
	  // await app.setSetting("Previous_Roll_ADV2", multipleDice);

		if (singleDice) {
				finalResult += `<mark>-- **Expression:** ${singleDice} --</mark>\n`;
				finalResult += `**Result:** ${evaluateDiceExpression(singleDice)}\n`;
				// console.log(`Expression: ${singleDice}`);
				// console.log(`Result: ${evaluateDiceExpression(singleDice)}`);
				// console.log('---');			
		}
		
		if (multipleDice) {
			// Split by newlines and commas, then clean up each expression
			const multipleDicez = multipleDice
				.split(/[\n,]/)                // Split on newlines or commas
				.map(dice => dice.trim())      // Remove whitespace
				.filter(dice => dice !== '');  // Remove empty entries

			for (let i = 0; i < multipleDicez.length; i++) {
				const dice = multipleDicez[i];
				finalResult += `<mark>-- **Expression:** ${dice} --</mark>\n`;
				finalResult += `**Result:** ${evaluateDiceExpression(dice)}\n`;
				// console.log(`Expression: ${dice}`);
				// console.log(`Result: ${evaluateDiceExpression(dice)}`);
				// console.log('---');
			}		
		}

		// Generate the filename based on the current date and time
		const now = new Date();
		const YYMMDD = now.toISOString().slice(2, 10).replace(/-/g, '');
		const HHMMSS = now.toTimeString().slice(0, 8).replace(/:/g, '');

		// Audit Report
		const auditNoteName = `Dice Results Audit`;
		const auditTagName = ['-reports/-dice'];
		const auditnoteUUID = await getNoteUUID(app, auditNoteName, auditTagName);

	const finalResultz = `[Report][^ADV]
[^ADV]: []()${finalResult}
`;

	  (async () => {
		try {
		  const auditReport = `- <mark>Advanced:</mark> ***When:** ${YYMMDD}_${HHMMSS}*; <mark>**Dice rolled Report:**</mark> ${finalResultz}`;
		  await app.insertNoteContent({ uuid: auditnoteUUID }, auditReport);
		  await app.navigate(`https://www.amplenote.com/notes/${auditnoteUUID}`);
		} catch (error) {
		  console.error(error.message);
		}
	  })();

	  }

	}

	// Run the program
	main();


}
