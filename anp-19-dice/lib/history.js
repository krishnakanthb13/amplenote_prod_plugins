/**
 * Clears the entire audit history note content after user confirmation.
 * @param {Object} app - Amplenote plugin API object.
 * @returns {Promise<void>} - Resolves after clearing history.
 */
export async function clearAuditHistory(app) {
  const confirm = await app.prompt("Clear all dice audit history?", {
    inputs: [{ label: "Type 'YES' to confirm", type: "string" }]
  });
  if (confirm && confirm[0] === "YES") {
    const uuid = await app.settings["Dice_Audit_UUID [Do not Edit!]"];
    if (uuid) {
      await app.setNoteContent({ uuid }, "");
      app.alert("Audit history cleared!");
    } else {
      app.alert("No audit note found to clear.");
    }
  }
}

export async function viewRollHistory(app) {
  const uuid = await app.settings["Dice_Audit_UUID [Do not Edit!]"];
  if (uuid) {
    try {
      const content = await app.getNoteContent({ uuid });
      if (!content || content.trim() === "") {
        app.alert("Audit history is empty. Roll some dice first!");
        return;
      }
      await app.navigate(`https://www.amplenote.com/notes/${uuid}`);
    } catch (error) {
      app.alert("Could not access audit note.");
    }
  } else {
    app.alert("No audit note found. Roll some dice first!");
  }
}
