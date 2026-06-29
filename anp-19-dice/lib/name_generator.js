import { getNoteUUID } from "./utils.js";

/**
 * Handles the Random Name Generator command.
 * @param {Object} app - The Amplenote application instance.
 * @returns {Promise<void>}
 */
export default async function (app) {
  const nameStyles = {
    fantasy: {
      prefixes: ["Al", "An", "Ar", "Bal", "Bel", "Bor", "Bri", "Cor", "Dar", "El", "Eld", "Far", "Gal", "Gil", "Hal", "Is", "Kal", "Kil", "Lan", "Mor", "Nor", "Pal", "Quin", "Ral", "Sam", "Tal", "Thal", "Ul", "Val", "Wil", "Xan", "Yor", "Zan"],
      suffixes: ["dor", "mir", "ion", "gar", "mar", "nar", "rin", "thir", "wen", "wyn", "lor", "din", "dan", "bar", "nor", "lan", "dar", "ran", "reth", "las", "mas", "nir", "ril", "dis", "ric", "mond", "ton", "ley", "burg", "heim"]
    },
    scifi: {
      prefixes: ["Ax", "Cy", "Dex", "Echo", "Flux", "Geo", "Hex", "Ion", "Jax", "Kai", "Lex", "Max", "Nex", "Onyx", "Pax", "Quark", "Rex", "Sol", "Tech", "Ultra", "Vex", "Warp", "Xen", "Yotta", "Zero"],
      suffixes: ["oid", "ite", "ian", "ium", "ax", "ex", "ox", "ux", "on", "ar", "or", "us", "is", "os", "eon", "tron", "wave", "pulse", "beam", "core"]
    },
    norse: {
      prefixes: ["As", "Bjorn", "Egil", "Fen", "Gunn", "Hal", "Ing", "Jar", "Knut", "Leif", "Magn", "Njord", "Odd", "Ragn", "Sig", "Thor", "Ulf", "Val", "Yng", "Odin"],
      suffixes: ["ar", "ir", "ur", "olf", "bjorn", "stein", "vald", "mund", "mar", "rik", "ulf", "vard", "brand", "fast", "grim", "hild", "laug", "leif", "mod", "run"]
    }
  };

  const result = await app.prompt("Random Name Generator", {
    inputs: [
      {
        label: "Name Style",
        type: "select",
        options: [
          { label: "Fantasy", value: "fantasy" },
          { label: "Sci-Fi", value: "scifi" },
          { label: "Norse", value: "norse" },
          { label: "Mixed (Random Style)", value: "mixed" }
        ],
        value: "fantasy"
      },
      {
        label: "Number of Names to Generate",
        type: "string",
        value: "5"
      },
      {
        label: "Include Titles/Prefixes",
        type: "checkbox",
        value: false
      }
    ]
  });

  if (result) {
    const [style, countStr, includeTitles] = result;
    const count = Math.min(parseInt(countStr) || 5, 20); // Limit to 20

    const titles = ["Sir", "Lady", "Lord", "Captain", "Commander", "Archmage", "King", "Queen", "Prince", "Princess", "Master", "Doctor", "Professor", "Admiral", "Baron"];

    /**
     * Generates a random name based on a style.
     * @param {string} styleName - The style name (e.g., 'fantasy').
     * @returns {string} - The generated name.
     */
    function generateName(styleName) {
      let selectedStyle;
      if (styleName === "mixed") {
        const styles = Object.keys(nameStyles);
        selectedStyle = nameStyles[styles[Math.floor(Math.random() * styles.length)]];
      } else {
        selectedStyle = nameStyles[styleName];
      }

      const prefix = selectedStyle.prefixes[Math.floor(Math.random() * selectedStyle.prefixes.length)];
      const suffix = selectedStyle.suffixes[Math.floor(Math.random() * selectedStyle.suffixes.length)];
      const name = prefix + suffix;

      if (includeTitles) {
        const title = titles[Math.floor(Math.random() * titles.length)];
        return `${title} ${name}`;
      }
      return name;
    }

    let finalResult = `<mark>**Generated Names (${style})**</mark>\nNames: `;
    const names = [];

    for (let i = 0; i < count; i++) {
      const name = generateName(style);
      names.push(name);
    }
    finalResult += names.join(", ");

    const now = new Date();
    const YYMMDD = now.toISOString().slice(2, 10).replace(/-/g, "");
    const HHMMSS = now.toTimeString().slice(0, 8).replace(/:/g, "");
    const auditNoteName = `Dice Results Audit`;
    const auditTagName = ["-reports/-dice"];
    const auditnoteUUID = await getNoteUUID(app, auditNoteName, auditTagName);

    (async () => {
      try {
        const auditReport = `- <mark>Name Generator:</mark> ***When:** ${YYMMDD}_${HHMMSS}*; Style: ${style}, Count: ${count} | <mark>**Names:** ${names.join(", ")}</mark>`;
        await app.insertNoteContent({ uuid: auditnoteUUID }, auditReport);
        await app.navigate(`https://www.amplenote.com/notes/${auditnoteUUID}`);
        app.alert(finalResult);
      } catch (error) {
        console.error(error.message);
      }
    })();
  }
}
