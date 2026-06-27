import { getNoteUUID } from "./utils.js";
/**
 * Runs batch Fantasy AGE stunt dice rolls in Amplenote.
 * @param {Object} app - Amplenote plugin API object.
 * @returns {Promise<void>} - Resolves after all rolls are audited and displayed.
 */
export default async function (app) {

    const existingSetting = await app.settings["Previous_Roll_AGE"];
	let result;
    if (existingSetting) {
	// Split and map existing settings, using default values where applicable
    const [
      playerCountz,
      charactersPerPlayerz
    ] = (existingSetting || "") // Ensure existingSetting is not null or undefined
      .split(",")
      .map((value, index) => {
        const defaults = [3, 2]; // Default values
        if (value === undefined || value === null || value.trim() === "") {
          return defaults[index]; // Use default if value is missing or empty
        }
        // Parse value based on expected type
        if ([0, 1].includes(index)) return Number(value) || defaults[index]; // Numbers
        return value; // Strings or other types (not expected here)
      });


	  // Prompt user with pre-filled inputs
	  result = await app.prompt("Fantasy AGE Stunt - Roll All At Once!", {
		inputs: [
		  { label: "Number of Players", type: "string", value: playerCountz },
		  { label: "Number of Characters Per Player", type: "string", value: charactersPerPlayerz },
		],
	  });
	  
	} else {
	  // Prompt user with pre-filled inputs
	  result = await app.prompt("Fantasy AGE Stunt - Roll All At Once!", {
		inputs: [
		  { label: "Number of Players", type: "string", value: 3 },
		  { label: "Number of Characters Per Player", type: "string", value: 2 },
		],
	  });		
	}
	  
	  let finalResult = `**Fantasy AGE Stunt - Roll All At Once**`;

	/**
	 * Rolls one six-sided die.
	 * @returns {number} - Random value between 1 and 6.
	 */
	function rollDie() {
		return Math.floor(Math.random() * 6) + 1;
	}

	/**
	 * Rolls one Fantasy AGE stunt check and appends the formatted result.
	 * @param {string} playerName - Display name for the player.
	 * @param {string} characterName - Display name for the character.
	 * @returns {void}
	 */
	function rollFantasyAGE(playerName, characterName) {
		// Roll three six-sided dice
		let dice = [rollDie(), rollDie(), rollDie()];
		let total = dice.reduce((sum, die) => sum + die, 0);
		let stuntDie = dice[0]; // Assume the first die is the stunt die by convention

		// Check if there's a stunt (any two dice showing the same number)
		let hasStunt = new Set(dice).size < 3; // Less than 3 unique numbers means doubles exist
		let stuntPoints = hasStunt ? stuntDie : 0;

		// Display results
		// console.log(`-- ${playerName}'s Character: ${characterName} --`);
		// console.log(`Dice rolled: ${dice.join(', ')}`);
		// console.log(`Total: ${total}`);
		finalResult += `<mark>\n-- ${playerName}'s Character: ${characterName} --</mark>`;
		finalResult += `\nDice rolled: ${dice.join(', ')}`;
		finalResult += `\nTotal: ${total}`;
		if (hasStunt) {
			// console.log(`AYE! You rolled doubles! Stunt Points: ${stuntPoints}`);
			finalResult += `\nAYE! You rolled doubles! Stunt Points: ${stuntPoints}`;
		} else {
			// console.log("No stunt this time. Better Luck Next Time!");
			finalResult += `\nNo stunt this time. Better Luck Next Time!`;
		}
	}

	/**
	 * Rolls Fantasy AGE stunt checks for every requested player and character.
	 * @param {number} playerCount - Number of players to process.
	 * @param {number} charactersPerPlayer - Number of characters per player.
	 * @returns {void}
	 */
	function playFantasyAGE(playerCount, charactersPerPlayer) {
		// console.log(`Starting Fantasy AGE with ${playerCount} players and ${charactersPerPlayer} characters each.`);
		for (let i = 1; i <= playerCount; i++) {
			let playerName = `Player ${i}`;
			for (let j = 1; j <= charactersPerPlayer; j++) {
				let characterName = `Character ${j}`;
				rollFantasyAGE(playerName, characterName);
			}
		}
	}

    if (result) {
	// Variables and constants to define the game setup
      const [
        playerCount, // Total number of players
        charactersPerPlayer // Number of characters each player controls
      ] = result;
	  
	  await app.setSetting("Previous_Roll_AGE", result);

	// Start the game
	playFantasyAGE(playerCount, charactersPerPlayer);

	// Generate the filename based on the current date and time
	const now = new Date();
	const YYMMDD = now.toISOString().slice(2, 10).replace(/-/g, '');
	const HHMMSS = now.toTimeString().slice(0, 8).replace(/:/g, '');

	// Audit Report
	const auditNoteName = `Dice Results Audit`;
	const auditTagName = ['-reports/-dice'];
	const auditnoteUUID = await getNoteUUID(app, auditNoteName, auditTagName);

	const finalResultz = `[Report][^AGER]
[^AGER]: []()${finalResult}
`;

	  const auditReport = `- <mark>Fantasy AGE Stunt - All:</mark> ***When:** ${YYMMDD}_${HHMMSS}*; <mark>**Player Count:** ${playerCount}; **Characters Per Player:** ${charactersPerPlayer}; **Stunt Points:**</mark> ${finalResultz}`;
	  await app.insertNoteContent({ uuid: auditnoteUUID }, auditReport);
	  await app.navigate(`https://www.amplenote.com/notes/${auditnoteUUID}`);

		app.alert(finalResult);
		// console.log(finalResult);

	
}

}
