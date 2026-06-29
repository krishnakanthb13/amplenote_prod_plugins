import { getNoteUUID } from "./utils.js";

/**
 * Handles the Tarot Card Draw command.
 * @param {Object} app - The Amplenote application instance.
 * @returns {Promise<void>}
 */
export default async function (app) {
  const majorArcana = [
    { name: "The Fool", number: 0, meaning: "New beginnings, innocence, spontaneity" },
    { name: "The Magician", number: 1, meaning: "Power, skill, concentration, action" },
    { name: "The High Priestess", number: 2, meaning: "Intuition, mystery, subconscious mind" },
    { name: "The Empress", number: 3, meaning: "Fertility, nature, abundance, sensuality" },
    { name: "The Emperor", number: 4, meaning: "Authority, structure, control, fatherhood" },
    { name: "The Hierophant", number: 5, meaning: "Tradition, conformity, morality, ethics" },
    { name: "The Lovers", number: 6, meaning: "Love, harmony, relationships, values alignment" },
    { name: "The Chariot", number: 7, meaning: "Control, willpower, success, determination" },
    { name: "Strength", number: 8, meaning: "Strength, courage, persuasion, compassion" },
    { name: "The Hermit", number: 9, meaning: "Soul-searching, introspection, being alone" },
    { name: "Wheel of Fortune", number: 10, meaning: "Good luck, karma, life cycles, destiny" },
    { name: "Justice", number: 11, meaning: "Justice, fairness, truth, cause and effect" },
    { name: "The Hanged Man", number: 12, meaning: "Pause, surrender, letting go, new perspectives" },
    { name: "Death", number: 13, meaning: "Endings, change, transformation, transition" },
    { name: "Temperance", number: 14, meaning: "Balance, moderation, patience, purpose" },
    { name: "The Devil", number: 15, meaning: "Shadow self, attachment, addiction, restriction" },
    { name: "The Tower", number: 16, meaning: "Disaster, upheaval, sudden change, revelation" },
    { name: "The Star", number: 17, meaning: "Hope, faith, purpose, renewal, spirituality" },
    { name: "The Moon", number: 18, meaning: "Illusion, fear, anxiety, subconscious, intuition" },
    { name: "The Sun", number: 19, meaning: "Positivity, fun, warmth, success, vitality" },
    { name: "Judgment", number: 20, meaning: "Judgment, rebirth, inner calling, absolution" },
    { name: "The World", number: 21, meaning: "Completion, integration, accomplishment, travel" }
  ];

  const result = await app.prompt("Tarot Card Draw", {
    inputs: [
      {
        label: "Question or Focus (optional)",
        type: "text",
        placeholder: "What do you seek guidance on?"
      },
      {
        label: "Spread Type",
        type: "select",
        options: [
          { label: "Single Card", value: "single" },
          { label: "Three Card (Past/Present/Future)", value: "three" },
          { label: "Celtic Cross (10 Cards)", value: "celtic" }
        ],
        value: "single"
      },
      {
        label: "Allow Reversed Cards",
        type: "checkbox",
        value: true
      }
    ]
  });

  if (result) {
    const [question, spreadType, allowReversed] = result;

    /**
     * Shuffles the Tarot deck.
     * @returns {Object[]} - The shuffled deck.
     */
    function shuffleDeck() {
      const deck = [...majorArcana];
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      return deck;
    }

    /**
     * Draws a specified number of cards from the deck.
     * @param {number} count - The number of cards to draw.
     * @param {boolean} reversed - Whether to allow reversed cards.
     * @returns {Object[]} - The drawn cards.
     */
    function drawCards(count, reversed) {
      const deck = shuffleDeck();
      const drawn = [];

      for (let i = 0; i < count; i++) {
        const card = deck[i];
        const isReversed = reversed ? Math.random() < 0.5 : false;
        drawn.push({
          ...card,
          reversed: isReversed,
          fullMeaning: isReversed ? `${card.meaning} (Reversed: opposite or blocked energy)` : card.meaning
        });
      }

      return drawn;
    }

    const cardCount = spreadType === "single" ? 1 : spreadType === "three" ? 3 : 10;
    const cards = drawCards(cardCount, allowReversed);

    let finalResult = `<mark>**Tarot Reading**</mark>\n`;
    if (question) finalResult += `**Question:** ${question}\n`;

    if (spreadType === "single") {
      const card = cards[0];
      finalResult += `**Card:** ${card.name} ${card.reversed ? "(Reversed)" : ""}\n`;
      finalResult += `**Meaning:** ${card.fullMeaning}\n`;
    } else if (spreadType === "three") {
      const positions = ["Past", "Present", "Future"];
      finalResult += `**Three Card Spread**\n`;
      cards.forEach((card, i) => {
        finalResult += `**${positions[i]}:** ${card.name} ${card.reversed ? "(Reversed)" : ""}\n`;
        finalResult += `*${card.fullMeaning}*\n`;
      });
    } else {
      const positions = [
        "Present Situation", "Challenge", "Past Foundation", "Recent Past",
        "Possible Outcome", "Near Future", "Your Approach", "External Influences",
        "Hopes/Fears", "Final Outcome"
      ];
      finalResult += `**Celtic Cross Spread**\n`;
      cards.forEach((card, i) => {
        finalResult += `**${positions[i]}:** ${card.name} ${card.reversed ? "(Reversed)" : ""}\n`;
        finalResult += `*${card.fullMeaning}*\n`;
      });
    }

    const now = new Date();
    const YYMMDD = now.toISOString().slice(2, 10).replace(/-/g, "");
    const HHMMSS = now.toTimeString().slice(0, 8).replace(/:/g, "");
    const auditNoteName = `Dice Results Audit`;
    const auditTagName = ["-reports/-dice"];
    const auditnoteUUID = await getNoteUUID(app, auditNoteName, auditTagName);

    (async () => {
      try {
        const cardNames = cards.map(c => c.name + (c.reversed ? " (R)" : "")).join(", ");
        const auditReport = `- <mark>Tarot:</mark> ***When:** ${YYMMDD}_${HHMMSS}*; Spread: ${spreadType} | <mark>**Cards:** ${cardNames}</mark> | Q: ${question || "N/A"}`;
        await app.insertNoteContent({ uuid: auditnoteUUID }, auditReport);
        await app.navigate(`https://www.amplenote.com/notes/${auditnoteUUID}`);
        app.alert(finalResult);
      } catch (error) {
        console.error(error.message);
      }
    })();
  }
}
