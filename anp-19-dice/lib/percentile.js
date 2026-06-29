import { getNoteUUID } from "./utils.js";

/**
 * Handles the Percentile (D100) Roll command.
 * @param {Object} app - The Amplenote application instance.
 * @returns {Promise<void>}
 */
export default async function (app) {
  const result = await app.prompt("Percentile Roll (D100)", {
    inputs: [
      {
        label: "Target Number (1-100, leave blank for open roll)",
        type: "string",
        placeholder: "e.g., 65"
      },
      {
        label: "Roll Type",
        type: "select",
        options: [
          { label: "Standard (00-99)", value: "standard" },
          { label: "1-100 (00 = 100)", value: "one_to_hundred" },
          { label: "Flip to Succeed (CoC style)", value: "flip" }
        ],
        value: "one_to_hundred"
      }
    ]
  });

  if (result) {
    const [targetStr, rollType] = result;
    const target = parseInt(targetStr);

    /**
     * Rolls a percentile (D100) die.
     * @param {string} type - The roll type ('standard', 'one_to_hundred', 'flip').
     * @returns {number|Object} - The result of the roll.
     */
    function rollD100(type) {
      const tens = Math.floor(Math.random() * 10) * 10;
      const ones = Math.floor(Math.random() * 10);

      if (type === "standard") {
        return tens + ones; // 0-99
      } else if (type === "one_to_hundred") {
        return (tens === 0 && ones === 0) ? 100 : tens + ones; // 1-100
      } else if (type === "flip") {
        const roll = tens + ones;
        const effectiveRoll = roll === 0 ? 100 : roll;
        return {
          roll: effectiveRoll,
          tensDigit: Math.floor(tens / 10),
          onesDigit: ones,
          flipped: Math.floor(tens / 10) * 1 + ones * 10
        };
      }
    }

    let finalResult = `<mark>**Percentile Roll**</mark>\n`;
    let roll;

    if (rollType === "flip" && target) {
      roll = rollD100("flip");
      const normalSuccess = roll.roll <= target;
      const flipSuccess = roll.flipped <= target;

      finalResult += `**Tens Die:** ${roll.tensDigit} | **Ones Die:** ${roll.onesDigit}\n`;
      finalResult += `**Roll:** ${roll.roll} (Target: <=${target})\n`;
      finalResult += `**Flipped Roll:** ${roll.flipped}\n`;

      if (normalSuccess && flipSuccess) {
        finalResult += `**Result:** Critical Success! (Both rolls succeed)`;
      } else if (normalSuccess || flipSuccess) {
        finalResult += `**Result:** Regular Success (One roll succeeds)`;
      } else {
        finalResult += `**Result:** Failure`;
      }
    } else {
      roll = rollD100(rollType);
      finalResult += `**Roll:** ${roll}\n`;

      if (target) {
        const success = rollType === "standard" ? roll < target : roll <= target;
        finalResult += `**Target:** <=${target}\n`;
        finalResult += `**Result:** ${success ? "Success! ✓" : "Failure ✗"}\n`;

        if (rollType === "one_to_hundred") {
          // Special results
          if (roll === 1) finalResult += `**Critical Success!** 🎯\n`;
          if (roll === 100) finalResult += `**Fumble!** 💥\n`;
          if (roll === target) finalResult += `**Exactly target!** 👌\n`;
        }
      }
    }

    finalResult += `**Roll Type:** ${rollType}`;

    const now = new Date();
    const YYMMDD = now.toISOString().slice(2, 10).replace(/-/g, "");
    const HHMMSS = now.toTimeString().slice(0, 8).replace(/:/g, "");
    const auditNoteName = `Dice Results Audit`;
    const auditTagName = ["-reports/-dice"];
    const auditnoteUUID = await getNoteUUID(app, auditNoteName, auditTagName);

    (async () => {
      try {
        const rollValue = typeof roll === 'object' ? roll.roll : roll;
        const success = target ? (rollValue <= target ? "Success" : "Fail") : "Open";
        const auditReport = `- <mark>Percentile:</mark> ***When:** ${YYMMDD}_${HHMMSS}*; <mark>**Roll:** ${rollValue}, **Target:** ${target || "Open"}, **Result:** ${success}</mark> | Type: ${rollType}`;
        await app.insertNoteContent({ uuid: auditnoteUUID }, auditReport);
        await app.navigate(`https://www.amplenote.com/notes/${auditnoteUUID}`);
        app.alert(finalResult);
      } catch (error) {
        console.error(error.message);
      }
    })();
  }
}
