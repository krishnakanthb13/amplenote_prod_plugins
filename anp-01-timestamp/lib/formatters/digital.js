export function digital(app) {
    const d = new Date(), s = app.settings;
    const format = String(s["timestamp for digital - structure"] || "Y-m-d H:n:s");
    const map = {
        'Y': d.getFullYear(), 'y': String(d.getFullYear()).slice(-2),
        'm': String(d.getMonth() + 1).padStart(2, '0'),
        'd': String(d.getDate()).padStart(2, '0'),
        'H': String(d.getHours()).padStart(2, '0'),
        'n': String(d.getMinutes()).padStart(2, '0'),
        's': String(d.getSeconds()).padStart(2, '0'),
        'A': d.getHours() < 12 ? 'AM' : 'PM'
    };
    return format.replace(/Y|y|m|d|H|n|s|A/g, c => map[c]);
}
