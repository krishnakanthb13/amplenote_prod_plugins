import { getNoteUUID } from "./utils.js";

/**
 * Handles the Quick Roll Presets command.
 * @param {Object} app - The Amplenote application instance.
 * @returns {Promise<void>}
 */
export default async function (app) {
  // Define common presets
  const presets = {
    "D&D Ability Score": { numDice: 4, faces: 6, keepHighest: true, keepCount: 3 },
    "D20 Check": { numDice: 1, faces: 20 },
    "D&D Fireball (8d6)": { numDice: 8, faces: 6 },
    "D&D Attack (1d8+3)": { numDice: 1, faces: 8, min: 4, max: 11 },
    "Savage Worlds": { numDice: 2, faces: 6, explode: true, explodeTarget: 6 },
    "2d6 (standard)": { numDice: 2, faces: 6 },
    "3d6 (GURPS)": { numDice: 3, faces: 6 },
    "Fudge/Fate (4dF)": { numDice: 4, faces: "fudge", type: "fudge" },
    "Coin Flip": { numDice: 1, faces: 2 },
    "D66 Table": { numDice: 2, faces: 6, sort: "asc", unique: false },
    "Custom Faces": { numDice: 2, faces: 6 } // Included from step 5 of ds.md
  };

  const presetOptions = Object.keys(presets).map(key => ({
    label: key,
    value: key
  }));

  const result = await app.prompt("Quick Roll Presets", {
    inputs: [
      {
        label: "Select Preset",
        type: "select",
        options: presetOptions,
        value: "D20 Check"
      },
      {
        label: "Add Modifier (+/-)",
        type: "string",
        placeholder: "e.g., +3 or -2"
      }
    ]
  });

  if (result) {
    const [presetName, modifierStr] = result;
    const preset = presets[presetName];
    const modifier = parseInt(modifierStr) || 0;

    let rolls, total;

    if (preset.type === "fudge") {
      // Handle Fudge dice
      const outcomes = ["-", " ", "+"];
      rolls = [];
      total = 0;
      for (let i = 0; i < preset.numDice; i++) {
        const roll = Math.floor(Math.random() * 6);
        const face = outcomes[Math.floor(roll / 2)];
        rolls.push(face);
        total += face === "+" ? 1 : face === "-" ? -1 : 0;
      }
    } else {
      // Standard dice
      const numDice = preset.numDice || 1;
      const faces = preset.faces || 6;
      const min = preset.min;
      const max = preset.max;

      rolls = [];
      for (let i = 0; i < numDice; i++) {
        let roll = Math.floor(Math.random() * faces) + 1;
        if (min) roll = Math.max(roll, min);
        if (max) roll = Math.min(roll, max);
        rolls.push(roll);
      }

      // Handle keep highest
      if (preset.keepHighest) {
        rolls.sort((a, b) => b - a);
        rolls = rolls.slice(0, preset.keepCount);
      }

      // Handle exploding
      if (preset.explode) {
        const newRolls = [...rolls];
        for (let i = 0; i < newRolls.length; i++) {
          while (newRolls[i] === preset.explodeTarget) {
            const extraRoll = Math.floor(Math.random() * faces) + 1;
            newRolls.push(extraRoll);
          }
        }
        rolls = newRolls;
      }

      // Handle sort
      if (preset.sort === "asc") rolls.sort((a, b) => a - b);

      total = rolls.reduce((sum, r) => sum + r, 0);
    }

    const finalTotal = total + modifier;

    let finalResult = `<mark>**Quick Roll: ${presetName}**</mark>\n`;
    finalResult += `**Dice:** [${rolls.join(", ")}]\n`;
    finalResult += `**Base Total:** ${total}\n`;
    if (modifier !== 0) finalResult += `**Modifier:** ${modifier > 0 ? '+' : ''}${modifier}\n`;
    finalResult += `**Final Total:** ${finalTotal}\n`;

    if (presetName === "Coin Flip") {
      finalResult += `**Result:** ${rolls[0] === 1 ? 'Heads' : 'Tails'}\n`;
    }

    const now = new Date();
    const YYMMDD = now.toISOString().slice(2, 10).replace(/-/g, "");
    const HHMMSS = now.toTimeString().slice(0, 8).replace(/:/g, "");
    const auditNoteName = `Dice Results Audit`;
    const auditTagName = ["-reports/-dice"];
    const auditnoteUUID = await getNoteUUID(app, auditNoteName, auditTagName);

    (async () => {
      try {
        const auditReport = `- <mark>Quick Roll (${presetName}):</mark> ***When:** ${YYMMDD}_${HHMMSS}*; <mark>**Rolls:** [${rolls.join(", ")}], **Total:** ${finalTotal}</mark>`;
        await app.insertNoteContent({ uuid: auditnoteUUID }, auditReport);
        await app.navigate(`https://www.amplenote.com/notes/${auditnoteUUID}`);
        app.alert(finalResult);
      } catch (error) {
        console.error(error.message);
      }
    })();
  }
}
