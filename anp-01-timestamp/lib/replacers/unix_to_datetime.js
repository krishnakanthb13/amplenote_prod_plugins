export function unixToDateTime(app, text) {
    const ts = parseInt(text.trim(), 10);
    return isNaN(ts) ? "Invalid Unix timestamp" : new Date(ts * 1000).toLocaleString();
}
