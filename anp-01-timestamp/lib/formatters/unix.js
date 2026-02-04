export function unix(app) {
    return Math.floor(Date.now() / 1000).toString();
}
