/**
 * Formats the current date/time using Roman numerals.
 * @param {object} app - The Amplenote app object.
 * @returns {string} - The date formatted with Roman numerals.
 */
export function roman(app) {
    const d = new Date();
    const r = n => {
        if (!+n) return '';
        const k = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCCC", "CM", "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC", "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"], g = String(+n).split("");
        let s = "", i = 3;
        while (i--) { let v = g.pop(); if (v) s = (k[+v + (i * 10)] || "") + s; }
        return "M".repeat(+g.join("") || 0) + s;
    };
    return `${r(d.getDate())}/${r(d.getMonth() + 1)}/${r(d.getFullYear())}, ${r(d.getHours())}:${r(d.getMinutes())}:${r(d.getSeconds())}`;
}
