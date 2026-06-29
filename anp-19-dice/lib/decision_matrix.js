import { getNoteUUID } from "./utils.js";

/**
 * Handles the Decision Matrix command.
 * @param {Object} app - The Amplenote application instance.
 * @returns {Promise<void>}
 */
export default async function (app) {
  const result = await app.prompt("Decision Matrix Setup", {
    inputs: [
      {
        label: "Options (comma-separated)",
        type: "text",
        placeholder: "e.g., Option A, Option B, Option C"
      },
      {
        label: "Criteria (comma-separated)",
        type: "text",
        placeholder: "e.g., Cost, Time, Quality, Risk"
      },
      {
        label: "Criteria Weights (comma-separated, 1-10)",
        type: "text",
        placeholder: "e.g., 8, 5, 9, 3"
      }
    ]
  });

  if (result) {
    const [optionsStr, criteriaStr, weightsStr] = result;
    const options = optionsStr.split(",").map(o => o.trim()).filter(o => o);
    const criteria = criteriaStr.split(",").map(c => c.trim()).filter(c => c);
    const weights = weightsStr.split(",").map(w => parseFloat(w.trim())).filter(w => !isNaN(w));

    if (options.length < 2 || criteria.length < 2) {
      app.alert("Need at least 2 options and 2 criteria.");
      return;
    }

    if (criteria.length !== weights.length) {
      app.alert("Number of criteria must match number of weights.");
      return;
    }

    // Generate random scores for each option-criteria pair
    const scores = [];
    for (let i = 0; i < options.length; i++) {
      scores[i] = [];
      for (let j = 0; j < criteria.length; j++) {
        // Random score 1-10 with slight bias toward middle values (5-7)
        scores[i][j] = Math.floor(Math.random() * 10) + 1;
      }
    }

    // Calculate weighted scores
    const weightedScores = options.map((option, i) => {
      let total = 0;
      criteria.forEach((criterion, j) => {
        total += scores[i][j] * weights[j];
      });
      return { option, total, scores: scores[i] };
    });

    // Sort by total score
    weightedScores.sort((a, b) => b.total - a.total);

    // Generate report
    let finalResult = `<mark>**Decision Matrix Results**</mark>\n`;

    // Matrix table
    finalResult += `| Option | ${criteria.join(" | ")} | **Total** |\n`;
    finalResult += `|${"---|".repeat(criteria.length + 2)}\n`;

    weightedScores.forEach(item => {
      finalResult += `| ${item.option} | ${item.scores.join(" | ")} | **${item.total}** |\n`;
    });

    finalResult += `<mark>**Rankings:**</mark>\n`;
    weightedScores.forEach((item, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `.${i + 1}.`;
      finalResult += `${medal} **${item.option}** - Score: ${item.total}\n`;
    });

    finalResult += `**Criteria Weights:** ${criteria.map((c, i) => `${c}: ${weights[i]}`).join(", ")}`;

    const now = new Date();
    const YYMMDD = now.toISOString().slice(2, 10).replace(/-/g, "");
    const HHMMSS = now.toTimeString().slice(0, 8).replace(/:/g, "");
    const auditNoteName = `Dice Results Audit`;
    const auditTagName = ["-reports/-dice"];
    const auditnoteUUID = await getNoteUUID(app, auditNoteName, auditTagName);

    (async () => {
      try {
        const winner = weightedScores[0];
        const auditReport = `- <mark>Decision Matrix:</mark> ***When:** ${YYMMDD}_${HHMMSS}*; <mark>**Winner:** ${winner.option} (Score: ${winner.total})</mark> | Options: ${options.join(", ")} | Criteria: ${criteria.join(", ")}`;
        await app.insertNoteContent({ uuid: auditnoteUUID }, auditReport);
        await app.navigate(`https://www.amplenote.com/notes/${auditnoteUUID}`);
        app.alert(finalResult);
      } catch (error) {
        console.error(error.message);
      }
    })();
  }
}
