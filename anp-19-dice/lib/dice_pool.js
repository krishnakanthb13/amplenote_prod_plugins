import { getNoteUUID } from "./utils.js";

/**
 * Handles the Dice Pool (Shadowrun/WoD) command.
 * @param {Object} app - The Amplenote application instance.
 * @returns {Promise<void>}
 */
export default async function (app) {
  const existingSetting = await app.settings["Previous_DicePool"];

  let parsedDefaults = { poolSize: 5, targetNumber: 5, explode: false, countType: "hits" };
  if (existingSetting) {
    try {
      const parts = existingSetting.split(",");
      parsedDefaults.poolSize = parseInt(parts[0]) || 5;
      parsedDefaults.targetNumber = parseInt(parts[1]) || 5;
      parsedDefaults.explode = parts[2] === "true";
      parsedDefaults.countType = parts[3] || "hits";
    } catch (e) { }
  }

  const result = await app.prompt("Dice Pool Roller", {
    inputs: [
      {
        label: "Number of Dice in Pool",
        type: "string",
        value: parsedDefaults.poolSize.toString()
      },
      {
        label: "Target Number (TN) for Success",
        type: "string",
        value: parsedDefaults.targetNumber.toString()
      },
      {
        label: "Exploding 6s (re-roll on 6)",
        type: "checkbox",
        value: parsedDefaults.explode
      },
      {
        label: "Count Method",
        type: "select",
        options: [
          { label: "Count Hits (dice >= TN)", value: "hits" },
          { label: "Sum All Dice", value: "sum" },
          { label: "Count Successes (TN as difficulty)", value: "successes" }
        ],
        value: parsedDefaults.countType
      }
    ]
  });

  if (result) {
    const [poolSizeStr, targetNumberStr, explode, countType] = result;
    const poolSize = parseInt(poolSizeStr) || 5;
    const targetNumber = parseInt(targetNumberStr) || 5;

    await app.setSetting("Previous_DicePool", `${poolSize},${targetNumber},${explode},${countType}`);

    /**
     * Rolls a pool of dice and counts successes.
     * @param {number} size - Number of dice in the pool.
     * @param {number} tn - Target number for success.
     * @param {boolean} [exploding=false] - Whether 6s explode.
     * @returns {{rolls: number[], successes: number, ones: number}} - Roll results.
     */
    function rollPool(size, tn, exploding = false) {
      let rolls = [];
      let successes = 0;
      let ones = 0;

      for (let i = 0; i < size; i++) {
        let roll = Math.floor(Math.random() * 6) + 1;
        rolls.push(roll);

        if (roll === 1) ones++;
        if (roll >= tn) successes++;

        // Handle exploding 6s
        while (exploding && roll === 6) {
          roll = Math.floor(Math.random() * 6) + 1;
          rolls.push(roll);
          if (roll >= tn) successes++;
          if (roll === 1) ones++;
        }
      }

      return { rolls, successes, ones };
    }

    const result2 = rollPool(poolSize, targetNumber, explode);

    let finalResult = `<mark>**Dice Pool Results**</mark>\n`;
    finalResult += `**Pool Size:** ${poolSize}d6\n`;
    finalResult += `**Target Number:** ${targetNumber}+\n`;
    finalResult += `**Dice Rolled:** [${result2.rolls.join(", ")}]\n`;
    finalResult += `**Successes (>=${targetNumber}):** ${result2.successes}\n`;
    finalResult += `**Ones (1s):** ${result2.ones}\n`;
    finalResult += `**Net Successes:** ${result2.successes - result2.ones}\n`;

    // Display dice with visual indicators
    finalResult += `**Roll Details:**\n`;
    for (let i = 0; i < Math.min(result2.rolls.length, poolSize); i++) {
      const roll = result2.rolls[i];
      let indicator = roll >= targetNumber ? "✓" : (roll === 1 ? "✗" : "-");
      finalResult += `Die ${i + 1}: ${roll} ${indicator}\n`;
    }

    const now = new Date();
    const YYMMDD = now.toISOString().slice(2, 10).replace(/-/g, "");
    const HHMMSS = now.toTimeString().slice(0, 8).replace(/:/g, "");
    const auditNoteName = `Dice Results Audit`;
    const auditTagName = ["-reports/-dice"];
    const auditnoteUUID = await getNoteUUID(app, auditNoteName, auditTagName);

    (async () => {
      try {
        const auditReport = `- <mark>Dice Pool:</mark> ***When:** ${YYMMDD}_${HHMMSS}*; Pool: ${poolSize}d6, TN: ${targetNumber}, Explode: ${explode} | <mark>**Successes:** ${result2.successes}, **Net:** ${result2.successes - result2.ones}</mark> | Rolls: [${result2.rolls.join(", ")}]`;
        await app.insertNoteContent({ uuid: auditnoteUUID }, auditReport);
        await app.navigate(`https://www.amplenote.com/notes/${auditnoteUUID}`);
        app.alert(finalResult);
      } catch (error) {
        console.error(error.message);
      }
    })();
  }
}
