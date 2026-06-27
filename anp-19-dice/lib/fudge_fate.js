import { getNoteUUID } from "./utils.js";
/**
 * Runs the Fudge/Fate dice command in Amplenote.
 * @param {Object} app - Amplenote plugin API object.
 * @returns {Promise<void>} - Resolves after the prompt is handled and results are audited.
 */
export default async function (app) {

    const existingSetting = await app.settings["Previous_Roll_FF"];

	/**
	 * Rolls Fudge/Fate dice and totals plus/minus faces.
	 * @param {number} numDice - Number of Fudge dice to roll.
	 * @returns {Promise<{results: string[], total: number}>} - Rolled faces and numeric total.
	 */
	async function rollFudgeDice(numDice = 4) {
	  // Map numeric rolls to Fudge outcomes
	  const outcomes = ["-", " ", "+"]; // 1, 2 = '-', 3, 4 = ' ', 5, 6 = '+'
	  let results = [];
	  let total = 0;

	  // Roll dice and calculate results
	  for (let i = 0; i < numDice; i++) {
		const roll = Math.floor(Math.random() * 6); // Random number 0-5
		const face = outcomes[Math.floor(roll / 2)]; // Map to "-", " ", "+"
		results.push(face);
		total += face === "+" ? 1 : face === "-" ? -1 : 0;
	  }

	  return { results, total };
	}

	/**
	 * Prompts for a Fudge/Fate dice count and writes the result to the audit note.
	 * @returns {Promise<void>} - Resolves after prompt processing finishes.
	 */
	async function main() {
	  // Pre-filled number of dice (default to 4)
	  const numDicez = existingSetting;

	  // Prompt user with pre-filled inputs
	  const result = await app.prompt("Fudge/Fate, Roll the Dice!", {
		inputs: [
		  { label: "Number of Dice", type: "string", value: numDicez || 4 },
		],
	  });

      // console.log("result",result);

	  if (result) {
		const numDiceInput = result;
		const numDice = parseInt(numDiceInput, 10) || 4;
		await app.setSetting("Previous_Roll_FF", numDice);

		if (numDice <= 0) {
		  console.error("Number of dice must be a positive integer!");
		  return;
		}

		const { results, total } = await rollFudgeDice(numDice);

		// Generate the filename based on the current date and time
		const now = new Date();
		const YYMMDD = now.toISOString().slice(2, 10).replace(/-/g, '');
		const HHMMSS = now.toTimeString().slice(0, 8).replace(/:/g, '');

		// Audit Report
		const auditNoteName = `Dice Results Audit`;
		const auditTagName = ['-reports/-dice'];
		const auditnoteUUID = await getNoteUUID(app, auditNoteName, auditTagName);

	  (async () => {
		try {
		  // console.log(`You rolled ${numDice} dice: [${results.join(", ")}]\nTotal result: ${total}`);
		  // No Lookup. Just Audit.
		  const auditReport = `- <mark>Fudge/Fate:</mark> ***When:** ${YYMMDD}_${HHMMSS}*; **Options: ${numDice}**; <mark>**Dice rolled:** [${results.join(", ")}]; **Total:** ${total};</mark>`;
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
