import { getNoteUUID } from "./utils.js";

/**
 * Handles the Weighted Random selector.
 * @param {Object} app - The Amplenote application instance.
 * @returns {Promise<void>}
 */
export default async function (app) {
  const existingSetting = await app.settings["Previous_Weighted"];

  let result;
  if (existingSetting) {
    const [items, weights] = existingSetting.split("||");
    result = await app.prompt("Weighted Random Selector", {
      inputs: [
        {
          label: "Items (comma-separated)",
          type: "text",
          value: items,
          placeholder: "e.g., Sword, Shield, Potion, Gold, Magic Ring"
        },
        {
          label: "Weights (comma-separated, corresponding to items)",
          type: "text",
          value: weights,
          placeholder: "e.g., 10, 20, 30, 25, 15"
        }
      ]
    });
  } else {
    result = await app.prompt("Weighted Random Selector", {
      inputs: [
        {
          label: "Items (comma-separated)",
          type: "text",
          placeholder: "e.g., Sword, Shield, Potion, Gold, Magic Ring"
        },
        {
          label: "Weights (comma-separated, corresponding to items)",
          type: "text",
          placeholder: "e.g., 10, 20, 30, 25, 15"
        }
      ]
    });
  }

  if (result) {
    const [itemsStr, weightsStr] = result;
    const items = itemsStr.split(",").map(i => i.trim()).filter(i => i);
    const weights = weightsStr.split(",").map(w => parseFloat(w.trim())).filter(w => !isNaN(w) && w > 0);

    if (items.length === 0 || weights.length === 0) {
      app.alert("Please provide both items and weights.");
      return;
    }

    if (items.length !== weights.length) {
      app.alert("Number of items must match number of weights.");
      return;
    }

    // Save settings
    await app.setSetting("Previous_Weighted", `${itemsStr}||${weightsStr}`);

    /**
     * Picks a random item based on weights.
     * @param {string[]} items - The list of items.
     * @param {number[]} weights - The weights corresponding to the items.
     * @returns {string} - The selected item.
     */
    function weightedRandom(items, weights) {
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      let random = Math.random() * totalWeight;

      for (let i = 0; i < items.length; i++) {
        random -= weights[i];
        if (random <= 0) {
          return items[i];
        }
      }
      return items[items.length - 1]; // Fallback
    }

    const selected = weightedRandom(items, weights);

    // Calculate probabilities for reporting
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const probabilities = items.map((item, i) => ({
      item,
      weight: weights[i],
      probability: ((weights[i] / totalWeight) * 100).toFixed(1)
    }));

    let finalResult = `<mark>**Weighted Random Selection**</mark>\n`;
    finalResult += `**Selected:** ${selected}\n`;
    finalResult += `**Probabilities:**\n`;
    probabilities.forEach(p => {
      finalResult += `.- ${p.item}: ${p.probability}% (weight: ${p.weight})\n`;
    });

    const now = new Date();
    const YYMMDD = now.toISOString().slice(2, 10).replace(/-/g, "");
    const HHMMSS = now.toTimeString().slice(0, 8).replace(/:/g, "");
    const auditNoteName = `Dice Results Audit`;
    const auditTagName = ["-reports/-dice"];
    const auditnoteUUID = await getNoteUUID(app, auditNoteName, auditTagName);

    (async () => {
      try {
        const auditReport = `- <mark>Weighted Random:</mark> ***When:** ${YYMMDD}_${HHMMSS}*; <mark>**Selected:** ${selected}</mark> | Items: ${items.join(", ")} | Weights: ${weights.join(", ")}`;
        await app.insertNoteContent({ uuid: auditnoteUUID }, auditReport);
        await app.navigate(`https://www.amplenote.com/notes/${auditnoteUUID}`);
        app.alert(finalResult);
      } catch (error) {
        console.error(error.message);
      }
    })();
  }
}
