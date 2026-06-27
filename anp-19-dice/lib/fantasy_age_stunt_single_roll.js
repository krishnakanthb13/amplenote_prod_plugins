import { getNoteUUID } from "./utils.js";
/**
 * Runs a single Fantasy AGE stunt dice roll in Amplenote.
 * @param {Object} app - Amplenote plugin API object.
 * @returns {Promise<void>} - Resolves after the roll is audited and displayed.
 */
export default async function (app) {

	/**
	 * Rolls one six-sided die.
	 * @returns {number} - Random value between 1 and 6.
	 */
	function rollDie() {
		return Math.floor(Math.random() * 6) + 1;
	}

	/**
	 * Rolls three Fantasy AGE dice, detects doubles, and writes an audit report.
	 * @returns {Promise<void>} - Resolves after the roll is reported.
	 */
	async function rollFantasyAGE() {
		// Roll three six-sided dice
		let dice = [rollDie(), rollDie(), rollDie()];
		let total = dice.reduce((sum, die) => sum + die, 0);
		let stuntDie = dice[0]; // Assume the first die is the stunt die by convention

		// Check if there's a stunt (any two dice showing the same number)
		let hasStunt = new Set(dice).size < 3; // Less than 3 unique numbers means doubles exist
		let stuntPoints = hasStunt ? stuntDie : 0;

		// Generate the filename based on the current date and time
		const now = new Date();
		const YYMMDD = now.toISOString().slice(2, 10).replace(/-/g, '');
		const HHMMSS = now.toTimeString().slice(0, 8).replace(/:/g, '');

		// Audit Report
		const auditNoteName = `Dice Results Audit`;
		const auditTagName = ['-reports/-dice'];
		const auditnoteUUID = await getNoteUUID(app, auditNoteName, auditTagName);

		// Display results
		// console.log(`Dice rolled: ${dice.join(', ')}`);
		// console.log(`Total: ${total}`);
		if (hasStunt) {

		  (async () => {
			try {
			  const auditReport = `- <mark>Fantasy AGE Stunt - Single:</mark> ***When:** ${YYMMDD}_${HHMMSS}*; <mark>**Dice rolled:** [${dice.join(', ')}]; **Total:** ${total}; AYE! You rolled doubles! **Stunt Points:** ${stuntPoints};</mark>`;
			  await app.insertNoteContent({ uuid: auditnoteUUID }, auditReport);
			  await app.navigate(`https://www.amplenote.com/notes/${auditnoteUUID}`);
			} catch (error) {
			  console.error(error.message);
			}
		  })();

			const messageResult = `Fantasy AGE Stunt Dice Result:\nDice rolled: [${dice.join(', ')}].\nTotal: ${total}.\n> AYE! You rolled doubles! Stunt Points: ${stuntPoints}.`;
			app.alert(messageResult);
			// console.log(messageResult);
		} else {

		  (async () => {
			try {
			  const auditReport = `- <mark>Fantasy AGE Stunt - Single:</mark> ***When:** ${YYMMDD}_${HHMMSS}*; <mark>**Dice rolled:** [${dice.join(', ')}]; **Total:** ${total}; **Stunt Points:** No stunt this time. Better Luck Next Time!;</mark>`;
			  await app.insertNoteContent({ uuid: auditnoteUUID }, auditReport);
			  await app.navigate(`https://www.amplenote.com/notes/${auditnoteUUID}`);
			} catch (error) {
			  console.error(error.message);
			}
		  })();

			const messageResult = `Fantasy AGE Stunt Dice Result:\nDice rolled: ${dice.join(', ')}.\nTotal: ${total}.\n> No stunt this time. Better Luck Next Time!`;
			app.alert(messageResult);
			// console.log(messageResult);
		}
	}

	// Run the function
	rollFantasyAGE();


}
