import { getNoteUUID } from "./utils.js";

/**
 * Runs the Basic dice roller command in Amplenote.
 * @param {Object} app - Amplenote plugin API object.
 * @returns {Promise<void>} - Resolves after the prompt is handled and the audit report is queued.
 */
export default async function (app) {
  const existingSetting = await app.settings["Previous_Roll"];
  let result;
  if (existingSetting) {
    let parsed = (existingSetting || "").split(",").map(value => (value === "" || value === "null") ? null : value);
    if (parsed.length === 13) {
      parsed.splice(12, 0, "false");
    }
    const [
      numDicez,
      facesz,
      minz,
      maxz,
      keepHighestz,
      keepCountz,
      dropHighestz,
      dropCountz,
      explodez,
      explodeTargetz,
      sortOptionz,
      uniquez,
      navigateToNotez,
      lookUpz
    ] = parsed.map((value, index) => {
      const defaults = [1, 6, null, null, false, 0, false, 0, false, 0, 1, false, false, 5];
      if (value === void 0 || value === null) {
        return defaults[index];
      }
      if ([0, 1, 2, 3, 5, 7, 9, 10, 13].includes(index)) return Number(value) || defaults[index];
      if ([4, 6, 8, 11, 12].includes(index)) return String(value).toLowerCase() === "true";
      return value;
    });
    result = await app.prompt("Roll the Dice! (Previous Roll is remembered)", {
      inputs: [
        { label: "Number of Dice", type: "string", value: numDicez },
        { label: "Number of Faces", type: "string", value: facesz },
        { label: "Minimum Number (Limit)", type: "string", value: minz },
        { label: "Maximum Number (Limit)", type: "string", value: maxz },
        { label: "Keep Highest Roll (Drop the remaining)", type: "checkbox", value: keepHighestz },
        { label: "Keep Highest Roll Count", type: "string", value: keepCountz },
        { label: "Drop Highest Roll (keep the remaining)", type: "checkbox", value: dropHighestz },
        { label: "Drop Highest Roll Count", type: "string", value: dropCountz },
        { label: "Explode (An additional Die)", type: "checkbox", value: explodez },
        { label: "Explode Target", type: "string", value: explodeTargetz },
        { label: "Sort the output", type: "select", options: [{ label: "None", value: 1 }, { label: "Ascending", value: 2 }, { label: "Descending", value: 3 }], value: sortOptionz || 1 },
        { label: "Unique (Every Die is Unique)", type: "checkbox", value: uniquez },
        { label: "Navigate to the Looked Up Note", type: "checkbox", value: navigateToNotez },
        { label: "Look Up in your Notes (Sorted By)", type: "select", options: [{ label: "None", value: 5 }, { label: "Name", value: 1 }, { label: "Created", value: 2 }, { label: "Modified", value: 3 }, { label: "UUID", value: 6 }, { label: "Tags", value: 7 }, { label: "Random", value: 4 }], value: lookUpz || 5 }
      ]
    });
  } else {
    result = await app.prompt("Roll the Dice!", {
      inputs: [
        { label: "Number of Dice", type: "string" },
        { label: "Number of Faces", type: "string" },
        { label: "Minimum Number", type: "string" },
        { label: "Maximum Number", type: "string" },
        { label: "Keep Highest Roll", type: "checkbox" },
        { label: "Keep Highest Roll Count", type: "string" },
        { label: "Drop Highest Roll", type: "checkbox" },
        { label: "Drop Highest Roll Count", type: "string" },
        { label: "Explode", type: "checkbox" },
        { label: "Explode Target", type: "string" },
        { label: "Sort the output", type: "select", options: [{ label: "None", value: 1 }, { label: "Ascending", value: 2 }, { label: "Descending", value: 3 }], value: 1 },
        { label: "Unique", type: "checkbox" },
        { label: "Navigate to the Looked Up Note", type: "checkbox", value: false },
        { label: "Look Up in your Notes (Sorted By)", type: "select", options: [{ label: "None", value: 5 }, { label: "Name", value: 1 }, { label: "Created", value: 2 }, { label: "Modified", value: 3 }, { label: "UUID", value: 6 }, { label: "Tags", value: 7 }, { label: "Random", value: 4 }], value: 5 }
      ]
    });
  }

  /**
   * Rolls dice with optional constraints, exploding dice, sorting, keep/drop, and uniqueness.
   * @param {Object} options - Dice rolling options.
   * @param {number|null} options.numDice - Number of dice to roll.
   * @param {number|null} options.faces - Number of faces on each die.
   * @param {number|null} options.min - Minimum allowed value for each die.
   * @param {number|null} options.max - Maximum allowed value for each die.
   * @param {{highest: boolean, count: number}|null} options.keep - Keep modifier configuration.
   * @param {{highest: boolean, count: number}|null} options.drop - Drop modifier configuration.
   * @param {{target: number, reroll: boolean}|null} options.explode - Exploding dice configuration.
   * @param {"asc"|"desc"|null} options.sort - Sort direction for final rolls.
   * @param {boolean} options.unique - Whether duplicate values should be removed.
   * @returns {{rolls: number[], total: number}} - Final rolls and their total.
   */
  function rollDice({
    numDice = null,
    faces = null,
    min = null,
    max = null,
    keep = null,
    drop = null,
    explode = null,
    sort = null,
    unique = false
  } = {}) {
    const rollSingleDie = () => Math.floor(Math.random() * faces) + 1;
    let rolls = Array.from({ length: numDice }, rollSingleDie);
    if (min !== null) rolls = rolls.map((roll) => Math.max(roll, min));
    if (max !== null) rolls = rolls.map((roll) => Math.min(roll, max));
    if (explode) {
      const { target, reroll } = explode;
      const newRolls = [];
      rolls.forEach((roll) => {
        newRolls.push(roll);
        let count = 0;
        let currentRoll = roll;
        while (currentRoll === target && count < 100) {
          const extraRoll = rollSingleDie();
          newRolls.push(extraRoll);
          currentRoll = extraRoll;
          count++;
          if (!reroll) break;
        }
      });
      rolls = newRolls;
    }
    if (unique) rolls = [...new Set(rolls)];
    if (sort === "asc") rolls.sort((a, b) => a - b);
    if (sort === "desc") rolls.sort((a, b) => b - a);
    if (keep) {
      const { highest, count } = keep;
      rolls = highest ? rolls.slice(-count) : rolls.slice(0, count);
    }
    if (drop) {
      const { highest, count } = drop;
      rolls = highest ? rolls.slice(0, rolls.length - count) : rolls.slice(count);
    }
    return {
      rolls,
      total: rolls.reduce((sum, roll) => sum + roll, 0)
    };
  }

  /**
   * Sorts notes according to the selected lookup mode and selects one by dice total.
   * @param {number} lookUp - Lookup mode selected in the prompt.
   * @param {number} pickNote - Note index, usually derived from the dice total.
   * @param {Array<Object>|null} preFetchedNotes - Optional note list to avoid refetching.
   * @returns {Promise<string|null>} - Selected note UUID, or null when none can be selected.
   */
  async function sortNotesByLookUp(lookUp, pickNote, preFetchedNotes) {
    let notesByGroup = preFetchedNotes;
    if (!notesByGroup) {
      try {
        notesByGroup = await app.filterNotes({});
        if (!notesByGroup || !Array.isArray(notesByGroup)) {
          notesByGroup = [];
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
        notesByGroup = [];
        return null;
      }
    }
    
    // Filter out null/undefined notes and ensure each has required properties
    notesByGroup = notesByGroup.filter((note) => {
      if (!note || typeof note !== 'object') return false;
      // Check if note has at least one identifiable property
      return note.uuid || note.name || note.created || note.updated;
    });

    if (notesByGroup.length === 0) {
      console.log("No valid notes available.");
      return null;
    }

    switch (lookUp) {
      case 1:
        notesByGroup.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case 2:
        notesByGroup.sort((a, b) => new Date(a.created || 0) - new Date(b.created || 0));
        break;
      case 3:
        notesByGroup.sort((a, b) => new Date(a.updated || 0) - new Date(b.updated || 0));
        break;
      case 4:
        notesByGroup = shuffleArray(notesByGroup);
        break;
      case 6:
        notesByGroup.sort((a, b) => (a.uuid || "").localeCompare(b.uuid || ""));
        break;
      case 7:
        notesByGroup.sort((a, b) => {
          const aTag = a.tags && a.tags.length > 0 ? a.tags[0].toLowerCase() : "";
          const bTag = b.tags && b.tags.length > 0 ? b.tags[0].toLowerCase() : "";
          if (aTag !== bTag) {
            return aTag.localeCompare(bTag);
          }
          return (a.name || "").localeCompare(b.name || "");
        });
        break;
      case 5:
        return null;
      default:
        notesByGroup.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    const totalNotes = notesByGroup.length;
    if (totalNotes === 0) {
      console.log("No valid notes available to pick.");
      return null;
    }

    const pickNumber = typeof pickNote === "number" ? pickNote : 0;
    const adjustedPickNote = ((pickNumber % totalNotes) + totalNotes) % totalNotes;
    const selectedNote = notesByGroup[adjustedPickNote];
    
    // Ensure we always return a string or null
    if (selectedNote && typeof selectedNote === 'object' && selectedNote.uuid) {
      return String(selectedNote.uuid); // Convert to string to be safe
    }
    return null;

    /**
     * Randomizes an array in place using the Fisher-Yates algorithm.
     * @param {Array<*>} array - Array to shuffle.
     * @returns {Array<*>} - The same array after shuffling.
     */
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
  }

  if (result) {
    const [
      numDice,
      faces,
      min,
      max,
      keepHighest,
      keepCount,
      dropHighest,
      dropCount,
      explode,
      explodeTarget,
      sortOption,
      unique,
      navigateToNote,
      lookUp
    ] = result;

    const numDiceNum = Number(numDice);
    const facesNum = Number(faces);
    if (numDiceNum < 1 || facesNum < 1) {
      app.alert("Number of dice and faces must be at least 1");
      return;
    }

    const resultx = `**NumDice**: ${numDice},
**Faces**: ${faces},
**Min**: ${min},
**Max**: ${max},
**Keep Highest**: ${keepHighest},
**Keep Count**: ${keepCount},
**Drop Highest**: ${dropHighest},
**Drop Count**: ${dropCount},
**Explode**: ${explode},
**Explode Target**: ${explodeTarget},
**Sort Option**: ${sortOption},
**Unique**: ${unique},
**Navigate To Note**: ${navigateToNote},
**LookUp**: ${lookUp},`;

    const finalResultx = `[Report][^ADV]
[^ADV]: []()${resultx}
`;

    await app.setSetting("Previous_Roll", result);

    const sortMap = { 1: null, 2: "asc", 3: "desc" };

    const diceResult = rollDice({
      numDice: Number(numDice) || 1,
      faces: Number(faces) || 6,
      min: min ? Number(min) : null,
      max: max ? Number(max) : null,
      keep: keepHighest ? { highest: true, count: Number(keepCount) || 1 } : null,
      drop: dropHighest ? { highest: true, count: Number(dropCount) || 1 } : null,
      explode: explode ? { target: Number(explodeTarget) || 6, reroll: true } : null,
      sort: sortMap[sortOption],
      unique: !!unique
    });

    const pickNote = diceResult.total;

    const now = new Date();
    const YYMMDD = now.toISOString().slice(2, 10).replace(/-/g, "");
    const HHMMSS = now.toTimeString().slice(0, 8).replace(/:/g, "");

    const auditNoteName = `Dice Results Audit`;
    const auditTagName = ["-reports/-dice"];
    const auditnoteUUID = await getNoteUUID(app, auditNoteName, auditTagName);

    // Check if notes exist before attempting to look up
    if ([1, 2, 3, 4, 6, 7].includes(lookUp)) {
      let preFetchedNotes = null;
      try {
        preFetchedNotes = await app.filterNotes({});
        if (!preFetchedNotes || !Array.isArray(preFetchedNotes) || preFetchedNotes.length === 0) {
          app.alert("No notes found in your account. Please create some notes first.");
          // Still audit but don't navigate to a note
          const auditReport = `- <mark>Basic:</mark> ***When:** ${YYMMDD}_${HHMMSS}*; <mark>**Dice rolled:** ${diceResult.rolls}; **Total:** ${diceResult.total};</mark> **No notes found!**; **Options:** ${finalResultx}`;
          await app.insertNoteContent({ uuid: auditnoteUUID }, auditReport);
          await app.navigate(`https://www.amplenote.com/notes/${auditnoteUUID}`);
          return;
        }
      } catch (error) {
        console.error("Error checking notes:", error);
        // Continue but will handle null UUID later
      }

      (async () => {
        try {
          const uuid = await sortNotesByLookUp(lookUp, pickNote, preFetchedNotes);
          if (uuid && typeof uuid === "string" && uuid.trim() !== "") {
            const auditReport = `- <mark>Basic:</mark> ***When:** ${YYMMDD}_${HHMMSS}*; <mark>**Dice rolled:** ${diceResult.rolls}; **Total:** ${diceResult.total};</mark> **UUID:** ${uuid}; **Options:** ${finalResultx}`;
            await app.insertNoteContent({ uuid: auditnoteUUID }, auditReport);
            if (navigateToNote) {
              await app.navigate(`https://www.amplenote.com/notes/${uuid}`);
            } else {
              await app.navigate(`https://www.amplenote.com/notes/${auditnoteUUID}`);
            }
          } else {
            const auditReport = `- <mark>Basic:</mark> ***When:** ${YYMMDD}_${HHMMSS}*; <mark>**Dice rolled:** ${diceResult.rolls}; **Total:** ${diceResult.total};</mark> **Note not found!**; **Options:** ${finalResultx}`;
            await app.insertNoteContent({ uuid: auditnoteUUID }, auditReport);
            await app.navigate(`https://www.amplenote.com/notes/${auditnoteUUID}`);
          }
        } catch (error) {
          console.error(error.message);
          const auditReport = `- <mark>Basic:</mark> ***When:** ${YYMMDD}_${HHMMSS}*; <mark>**Dice rolled:** ${diceResult.rolls}; **Total:** ${diceResult.total};</mark> **Error:** ${error.message}; **Options:** ${finalResultx}`;
          await app.insertNoteContent({ uuid: auditnoteUUID }, auditReport);
          await app.navigate(`https://www.amplenote.com/notes/${auditnoteUUID}`);
        }
      })();
    } else {
      (async () => {
        try {
          const auditReport = `- <mark>Basic:</mark> ***When:** ${YYMMDD}_${HHMMSS}*; <mark>**Dice rolled:** ${diceResult.rolls}; **Total:** ${diceResult.total};</mark> **Options:** ${finalResultx}`;
          await app.insertNoteContent({ uuid: auditnoteUUID }, auditReport);
          await app.navigate(`https://www.amplenote.com/notes/${auditnoteUUID}`);
        } catch (error) {
          console.error(error.message);
        }
      })();
    }
  }
}
