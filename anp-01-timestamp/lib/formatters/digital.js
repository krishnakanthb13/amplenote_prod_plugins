import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import utc from 'dayjs/plugin/utc';

// Extend dayjs with advanced formatting capabilities
dayjs.extend(advancedFormat);
dayjs.extend(weekOfYear);
dayjs.extend(dayOfYear);
dayjs.extend(isoWeek);
dayjs.extend(utc);

/**
 * Returns the ordinal suffix for a given number.
 * @param {number} n - The number to get the ordinal suffix for.
 * @returns {string} - The number with its ordinal suffix (e.g. 1st, 2nd, 3rd).
 */
const getOrdinal = (n) => {
    const suffixes = ["th", "st", "nd", "rd"], v = n % 100;
    return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
};

/**
 * Returns a mapping of Day of Year (DOY) tokens to their string representations.
 * @param {number} doy - The current day of the year.
 * @param {string} doyPadded - The padded string representation of the day of the year.
 * @returns {object} - An object mapping DOY tokens to their formatted values.
 */
const getDoyTokens = (doy, doyPadded) => ({
    'DDDD': doyPadded,
    'DDDo': getOrdinal(doy),
    'DDD': String(doy)
});

/**
 * Formats the current date/time digitally based on user settings using Day.js.
 * Supports Moment.js style tokens and literal escaping with square brackets.
 * Also supports a special "ISO" keyword for standard ISO8601 local formatting.
 * @reference https://day.js.org/docs/en/display/format
 * @param {object} app - The Amplenote app object.
 * @returns {string} - The formatted date string.
 */
export function digital(app) {
    const s = app.settings;
    const formatStr = String(s["timestamp digital - format"] || "YYYY-MM-DD HH:mm:ss");

    const timezone = String(s["timestamp digital - timezone"] || "local").trim().toUpperCase();
    const now = timezone === "UTC" ? dayjs.utc() : dayjs();

    if (formatStr.toUpperCase() === "ISO") {
        return now.format();
    }

    // --- FIX: Manual Day of Year Handling to prevent clashing with Day of Month (D, DD) tokens ---
    const startOfYear = now.startOf('year');
    const doy = now.diff(startOfYear, 'day') + 1;
    const doyPadded = String(doy).padStart(3, '0');

    const tokens = getDoyTokens(doy, doyPadded);

    // Pre-parse the format string to protect Day of Year tokens from Day.js core parser
    // We use [literals] to pass them through Day.js untouched
    const doyRegex = /\[([^\]]+)\]|DDDD|DDDo|DDD/g;
    const processedFormat = formatStr.replace(doyRegex, (match, escaped) => {
        if (escaped) return `[${escaped}]`;
        return `[${tokens[match]}]`;
    });

    return now.format(processedFormat);
}
