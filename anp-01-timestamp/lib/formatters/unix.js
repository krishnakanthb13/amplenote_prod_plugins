/**
 * Returns the current Unix timestamp.
 * @param {object} app - The Amplenote app object.
 * @returns {string} - The current Unix timestamp as a string.
 */
export function unix(app) {
    return Math.floor(Date.now() / 1000).toString();
}
