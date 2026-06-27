import { getNoteUUID } from "./utils.js";
/**
 * Runs the Magic 8-Ball command in Amplenote.
 * @param {Object} app - Amplenote plugin API object.
 * @returns {Promise<void>} - Resolves after the answer is generated and audited.
 */
export default async function (app) {

  // Prompt user with pre-filled inputs
  const result = await app.prompt("Shake the 8 Ball!", {
	inputs: [
	  { label: "Ask a Question", placeholder: ">>> Keep questions simple and direct, focus on a single issue, and use yes/no or should I/should I not formats. Eg: Will I find love this year? / Will I win the lottery? / Will it rain tomorrow?", type: "text" }
	],
  });
  
  let answer;

  if (result) {

	/**
	 * Selects one Magic 8-Ball response and stores it for the audit report.
	 * @returns {void}
	 */
	function magic8Ball() {
	  const answers = [
		"It is certain.",
		"It is decidedly so.",
		"Without a doubt.",
		"Yes - definitely.",
		"You may rely on it.",
		"As I see it, yes.",
		"Most likely.",
		"Outlook good.",
		"Yes.",
		"Signs point to yes.",
		"Reply hazy, try again.",
		"Ask again later.",
		"Better not tell you now.",
		"Cannot predict now.",
		"Concentrate and ask again.",
		"Don't count on it.",
		"My reply is no.",
		"My sources say no.",
		"Outlook not so good.",
		"Very doubtful."
	  ];

	  answer = answers[Math.floor(Math.random() * answers.length)];
	  // console.log(answer);
	}

	magic8Ball();

	// Generate the filename based on the current date and time
	const now = new Date();
	const YYMMDD = now.toISOString().slice(2, 10).replace(/-/g, '');
	const HHMMSS = now.toTimeString().slice(0, 8).replace(/:/g, '');

	// Audit Report
	const auditNoteName = `Dice Results Audit`;
	const auditTagName = ['-reports/-dice'];
	const auditnoteUUID = await getNoteUUID(app, auditNoteName, auditTagName);

  (async () => {
	try {
	  const auditReport = `- <mark>8 Ball:</mark> ***When:** ${YYMMDD}_${HHMMSS}*; **Question: ${result || "In Memory!"}**; <mark>**Answer:** ${answer}</mark>`;
	  await app.insertNoteContent({ uuid: auditnoteUUID }, auditReport);
	  await app.navigate(`https://www.amplenote.com/notes/${auditnoteUUID}`);
	} catch (error) {
	  console.error(error.message);
	}
  })();

  
}

}
