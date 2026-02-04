export function text(app) {
    const d = new Date(), h = d.getHours(), m = d.getMinutes();
    const H = ["Twelve", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven"];
    const M = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Quarter", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const T = ["", "", "Twenty", "Thirty", "Forty", "Fifty"];

    const getM = min => {
        if (min < 20) return M[min];
        return T[Math.floor(min / 10)] + (min % 10 ? "-" + M[min % 10] : "");
    };

    let s;
    if (m === 0) s = `It's ${H[h % 12]} o'clock`;
    else if (m === 30) s = `It's half past ${H[h % 12]}`;
    else if (m < 30) s = `It's ${getM(m)} past ${H[h % 12]}`;
    else s = `It's ${getM(60 - m)} to ${H[(h + 1) % 12]}`;

    const pre = app.settings["timestamp text - pre script"] || "";
    const post = app.settings["timestamp text - post script"] || "";
    return (pre ? pre + " " : "") + s + (post ? ". " + post : ".");
}
