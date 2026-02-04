/**
 * Replaces a Unix timestamp with a human-readable locale date string.
 * @param {object} app - The Amplenote app object.
 * @param {string} text - The selection text containing the unix timestamp.
 * @returns {string} - The locale date string or an error message.
 */
export function unixToDateTime(app, text) {
    const ts = parseInt(text.trim(), 10);
    return isNaN(ts) ? "Invalid Unix timestamp" : new Date(ts * 1000).toLocaleString();
}
