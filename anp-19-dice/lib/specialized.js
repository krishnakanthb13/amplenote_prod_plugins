import { getNoteUUID } from "./utils.js";
/**
 * Runs the specialized dice simulator command in Amplenote.
 * @param {Object} app - Amplenote plugin API object.
 * @returns {Promise<void>} - Resolves after the selected simulation is audited.
 */
export default async function (app) {

    const existingSetting = await app.settings["Previous_Roll_Spc"];

      const [
        numDicez,
        specializedDicez,
        pokerVariz,
		addProbz
      ] = (existingSetting || "")
	  .split(",");

  // Prompt user with pre-filled inputs - 4
  const result = await app.prompt("Select the approprate parameters!", {
	inputs: [
        { label: "Number of Dice", type: "string", value: numDicez || 5 },
        { label: "Select the Specialized Dice.", type: "select", options: [ { label: "Sicherman Dice", value: "sicherman" }, { label: "Intransitive Dice", value: "intransitive" }, { label: "Poker Dice", value: "poker" } ], value: specializedDicez || "poker" },
        { label: "Select the Poker Variation.", type: "select", options: [ { label: "Standard", value: "standard" }, { label: "Numeric", value: "numeric" }, { label: "Crown", value: "crown" } ], value: pokerVariz || "standard" },
        { label: "Add probabilities", type: "checkbox", value: addProbz || false }
	],
  });

      const [
        numDice,
        specializedDice,
        pokerVari,
		addProb
      ] = result;

      await app.setSetting("Previous_Roll_Spc", result);

	// Dice configurations
	const DICE_VARIATIONS = {
		sicherman: {
			die1: [1, 3, 4, 5, 6, 8],
			die2: [1, 2, 2, 3, 3, 4]
		},
		intransitive: {
			dieA: [2, 2, 4, 4, 9, 9],
			dieB: [1, 1, 6, 6, 8, 8],
			dieC: [3, 3, 5, 5, 7, 7]
		},
		poker: {
			standard: ['A', 'K', 'Q', 'J', '10', '9'],
			numeric: [1, 2, 3, 4, 5, 6],
			crown: ['Crown', 'Queen', 'Jack', 'Ten', 'Nine', 'Eight']
		}
	};

	class DiceSimulator {
		/**
		 * Creates a simulator for specialized dice configurations.
		 * @param {Object|null} customDice - Optional dice configuration override.
		 * @returns {DiceSimulator} - Simulator instance.
		 */
		constructor(customDice = null) {
			this.results = [];
			this.diceConfig = customDice || DICE_VARIATIONS;
		}

		/**
		 * Rolls one value from the provided face list.
		 * @param {Array<number|string>} faces - Available faces for the die.
		 * @returns {number|string} - Selected die face.
		 */
		rollDie(faces) {
			return faces[Math.floor(Math.random() * faces.length)];
		}

		/**
		 * Calculates theoretical sum probabilities for the configured Sicherman dice.
		 * @returns {Array<{sum: number, probability: string}>} - Sum probability rows.
		 */
		calculateSichermanProbabilities() {
			const probabilities = new Map();
			const die1 = this.diceConfig.sicherman.die1;
			const die2 = this.diceConfig.sicherman.die2;
			
			for (let v1 of die1) {
				for (let v2 of die2) {
					const sum = v1 + v2;
					probabilities.set(sum, (probabilities.get(sum) || 0) + 1);
				}
			}
			
			// Convert to percentages
			const totalOutcomes = die1.length * die2.length;
			return Array.from(probabilities.entries())
				.map(([sum, count]) => ({
					sum,
					probability: (count / totalOutcomes * 100).toFixed(2) + '%'
				}))
				.sort((a, b) => a.sum - b.sum);
		}

		/**
		 * Calculates pairwise win probabilities for the intransitive dice set.
		 * @returns {Object<string, string>} - Win probabilities by dice matchup.
		 */
		calculateIntransitiveProbabilities() {
			const dieA = this.diceConfig.intransitive.dieA;
			const dieB = this.diceConfig.intransitive.dieB;
			const dieC = this.diceConfig.intransitive.dieC;

			const calculateWinProbability = (die1, die2) => {
				let wins = 0;
				let total = 0;
				for (let v1 of die1) {
					for (let v2 of die2) {
						if (v1 > v2) wins++;
						total++;
					}
				}
				return (wins / total * 100).toFixed(2) + '%';
			};

			return {
				'A vs B': calculateWinProbability(dieA, dieB),
				'B vs C': calculateWinProbability(dieB, dieC),
				'C vs A': calculateWinProbability(dieC, dieA)
			};
		}

		/**
		 * Classifies a poker dice hand.
		 * @param {Array<number|string>} hand - Rolled poker dice faces.
		 * @returns {string} - Poker hand label.
		 */
		analyzePokerHand(hand) {
			// Convert face cards to numeric values for comparison
			const valueMap = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11 };
			const numericHand = hand.map(card => 
				valueMap[card] || parseInt(card)
			).sort((a, b) => b - a);

			// Count frequencies of each value
			const frequencies = new Map();
			numericHand.forEach(value => 
				frequencies.set(value, (frequencies.get(value) || 0) + 1)
			);

			// Check for different hand types
			const counts = Array.from(frequencies.values()).sort((a, b) => b - a);
			
			if (counts[0] === 5) return "Five of a kind";
			if (counts[0] === 4) return "Four of a kind";
			if (counts[0] === 3 && counts[1] === 2) return "Full house";
			if (counts[0] === 3) return "Three of a kind";
			if (counts[0] === 2 && counts[1] === 2) return "Two pair";
			if (counts[0] === 2) return "One pair";
			
			// Check for straight
			let isStrait = true;
			for (let i = 1; i < numericHand.length; i++) {
				if (numericHand[i] !== numericHand[i-1] - 1) {
					isStrait = false;
					break;
				}
			}
			if (isStrait) return "Straight";
			
			return "High card";
		}

		/**
		 * Simulates Sicherman dice rolls.
		 * @param {number} rolls - Number of two-dice rolls to simulate.
		 * @returns {{rolls: string, probabilities: Array<{sum: number, probability: string}>}} - Formatted rolls and probability rows.
		 */
		simulateSicherman(rolls = 1) {
			this.results = [];
			const probabilities = this.calculateSichermanProbabilities();
			
			for (let i = 0; i < rolls; i++) {
				const die1 = this.rollDie(this.diceConfig.sicherman.die1);
				const die2 = this.rollDie(this.diceConfig.sicherman.die2);
				this.results.push({
					die1,
					die2,
					sum: die1 + die2
				});
			}
			
			return {
				rolls: this.formatSichermanResults(),
				probabilities: probabilities
			};
		}

		/**
		 * Simulates intransitive dice rolls.
		 * @param {number} rolls - Number of three-dice rolls to simulate.
		 * @returns {{rolls: string, probabilities: Object<string, string>}} - Formatted rolls and matchup probabilities.
		 */
		simulateIntransitive(rolls = 1) {
			this.results = [];
			const probabilities = this.calculateIntransitiveProbabilities();
			
			for (let i = 0; i < rolls; i++) {
				const dieA = this.rollDie(this.diceConfig.intransitive.dieA);
				const dieB = this.rollDie(this.diceConfig.intransitive.dieB);
				const dieC = this.rollDie(this.diceConfig.intransitive.dieC);
				this.results.push({ dieA, dieB, dieC });
			}
			
			return {
				rolls: this.formatIntransitiveResults(),
				probabilities: probabilities
			};
		}

		/**
		 * Simulates a poker dice hand.
		 * @param {number} rolls - Number of dice to roll.
		 * @param {string} diceVariation - Poker dice variation key.
		 * @returns {{hand: string, analysis: string, probabilities: Object<string, string>}} - Formatted hand, analysis, and probabilities.
		 */
		simulatePoker(rolls = 5, diceVariation = 'standard') {
			this.results = [];
			for (let i = 0; i < rolls; i++) {
				this.results.push(this.rollDie(this.diceConfig.poker[diceVariation]));
			}
			
			const hand = this.results;
			const handType = this.analyzePokerHand(hand);
			
			return {
				hand: this.formatPokerResults(),
				analysis: handType,
				probabilities: this.calculatePokerProbabilities(diceVariation)
			};
		}

		/**
		 * Returns theoretical poker dice hand probabilities.
		 * @param {string} diceVariation - Poker dice variation key.
		 * @returns {Object<string, string>} - Probability labels by hand type.
		 */
		calculatePokerProbabilities(diceVariation) {
			

			// These are theoretical probabilities for a standard 6-sided poker dice
			const probabilities = {
				"Five of a kind": "0.08%",
				"Four of a kind": "1.93%",
				"Full house": "3.86%",
				"Three of a kind": "15.43%",
				"Two pair": "23.15%",
				"One pair": "46.30%",
				"Straight": "1.54%",
				"High card": "7.71%"
			};

			return probabilities;
		}

		/**
		 * Formats the most recent Sicherman simulation.
		 * @returns {string} - Multiline Sicherman roll report.
		 */
		formatSichermanResults() {
			return this.results.map((roll, index) => 
				`Roll ${index + 1}: Die 1 = ${roll.die1}, Die 2 = ${roll.die2}, Sum = ${roll.sum}`
			).join('\n');
		}

		/**
		 * Formats the most recent intransitive dice simulation.
		 * @returns {string} - Multiline intransitive roll report.
		 */
		formatIntransitiveResults() {
			return this.results.map((roll, index) =>
				`Roll ${index + 1}: Die A = ${roll.dieA}, Die B = ${roll.dieB}, Die C = ${roll.dieC}`
			).join('\n');
		}

		/**
		 * Formats the most recent poker dice hand.
		 * @returns {string} - Poker hand report.
		 */
		formatPokerResults() {
			return `Poker Dice Hand: ${this.results.join(' ')}`;
		}

		/**
		 * Adds a custom dice configuration to the simulator.
		 * @param {string} name - Custom dice configuration name.
		 * @param {Array<number|string>} faces - Faces available for the custom die.
		 * @returns {void}
		 */
		addCustomDiceConfiguration(name, faces) {
			if (!this.diceConfig.custom) {
				this.diceConfig.custom = {};
			}
			this.diceConfig.custom[name] = faces;
		}
	}

	/**
	 * Dispatches the selected specialized dice simulation.
	 * @param {string} diceType - Specialized dice type.
	 * @param {number} numberOfRolls - Number of rolls to simulate.
	 * @param {Object} options - Optional simulation settings.
	 * @returns {Object|string} - Simulation result or validation message.
	 */
	function simulateDice(diceType, numberOfRolls = 1, options = {}) {
		const simulator = new DiceSimulator();
		
		// Add custom dice if provided
		if (options.customDice) {
			simulator.addCustomDiceConfiguration(options.customDice.name, options.customDice.faces);
		}
		
		switch(diceType.toLowerCase()) {
			case 'sicherman':
				return simulator.simulateSicherman(numberOfRolls);
			case 'intransitive':
				return simulator.simulateIntransitive(numberOfRolls);
			case 'poker':
				return simulator.simulatePoker(5, options.pokerVariation || 'standard');
			default:
				return 'Invalid dice type. Please choose "sicherman", "intransitive", or "poker"';
		}
	}

	// Example usage:
	// Basic usage
	/*
	const sichermanResult1 = simulateDice("poker", 5);
	// console.log(sichermanResult1);  // Shows rolls and probabilities

	// Poker dice with custom variation
	// Adding custom dice
	const customOptions = {
		customDice: {
			name: 'special',
			faces: [1, 2, 3, 4, 5, 6]
		}
	};
	const customResult = simulateDice("poker", 5, customOptions);
	// console.log(customResult);
	*/
	
	let finalResult = ``;

	if (specializedDice === "sicherman") {
		const sichermanResult = simulateDice("sicherman", numDice);
		finalResult += `<mark>-- **Sicherman Dice. Dice#:** ${numDice} --</mark>\n`;
		finalResult += `**Rolls:**\n${sichermanResult.rolls}\n`;
		if (addProb) { 
		// Check array format
		if (Array.isArray(sichermanResult.probabilities)) {
			finalResult += "**Probabilities:**\n";
			// console.log("**Probabilities:**");
			sichermanResult.probabilities.forEach(item => {
				if (item.sum !== undefined && item.probability !== undefined) {
					finalResult += `Sum: ${item.sum}, Probability: ${item.probability}\n`;
					// console.log(`Sum: ${item.sum}, Probability: ${item.probability}`);
				} else {
					console.error("Invalid item structure:", item);
				}
			});
		} else {
			console.error("Probabilities is not an array:", sichermanResult.probabilities);
		}
		}
		// console.log(sichermanResult.rolls);  // Shows rolls and probabilities
		// console.log(sichermanResult.probabilities);  // Shows rolls and probabilities
		// console.log(finalResult);  // Shows rolls and probabilities		
	} else if (specializedDice === "intransitive") {
		const intransitiveResult = simulateDice("intransitive", numDice);
		finalResult += `<mark>-- **Intransitive Dice. Dice#:** ${numDice} --</mark>\n`;
		finalResult += `**Rolls:**\n${intransitiveResult.rolls}\n`;
		if (addProb) { 
			finalResult += "**Probabilities:**\n";
			// console.log("**Probabilities:**");
			finalResult += `"A vs B": "55.56%",\n"B vs C": "55.56%",\n"C vs A": "55.56%"`;
			// console.log(`"A vs B": "55.56%",\n"B vs C": "55.56%",\n"C vs A": "55.56%"`);
		}
		// console.log(intransitiveResult.rolls);  // Shows rolls and probabilities
		// console.log(intransitiveResult.probabilities);  // Shows rolls and probabilities
		// console.log(finalResult);  // Shows rolls and probabilities	
	} else if (specializedDice === "poker") {
		const pokerResult = simulateDice("poker", numDice, { pokerVariation: pokerVari });
		finalResult += `<mark>-- **Poker Dice. Variation: ${pokerVari}. Dice#:** ${numDice}. --</mark>\n`;
		finalResult += `**Analysis:** ${pokerResult.analysis}\n`;
		finalResult += `**Hand:** ${pokerResult.hand}\n`;
		if (addProb) { 
			finalResult += "**Probabilities:**\n";
			// console.log("**Probabilities:**");
			finalResult += `"Five of a kind": "0.08%",\n"Four of a kind": "1.93%",\n"Full house": "3.86%",\n"Three of a kind": "15.43%",\n"Two pair": "23.15%",\n"One pair": "46.30%",\n"Straight": "1.54%",\n"High card": "7.71%"`;
			// console.log(`"Five of a kind": "0.08%",\n"Four of a kind": "1.93%",\n"Full house": "3.86%",\n"Three of a kind": "15.43%",\n"Two pair": "23.15%",\n"One pair": "46.30%",\n"Straight": "1.54%",\n"High card": "7.71%"`);
		}
		// console.log(pokerResult.analysis);  // Shows hand, analysis, and probabilities
		// console.log(pokerResult.hand);  // Shows hand, analysis, and probabilities
		// console.log(pokerResult.probabilities);  // Shows hand, analysis, and probabilities
		// console.log(finalResult);  // Shows rolls and probabilities	
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
		  const auditReport = `- <mark>Specialized:</mark> ***When:** ${YYMMDD}_${HHMMSS}*; <mark>**Dice rolled Report:**</mark> ${finalResultz}`;
		  await app.insertNoteContent({ uuid: auditnoteUUID }, auditReport);
		  await app.navigate(`https://www.amplenote.com/notes/${auditnoteUUID}`);
		} catch (error) {
		  console.error(error.message);
		}
	  })();


}
