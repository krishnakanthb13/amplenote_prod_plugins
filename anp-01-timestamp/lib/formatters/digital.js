import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';

// Extend dayjs with advanced formatting capabilities
dayjs.extend(advancedFormat);
dayjs.extend(weekOfYear);
dayjs.extend(dayOfYear);
dayjs.extend(isoWeek);

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
    const formatStr = String(s["timestamp for digital - structure"] || "YYYY-MM-DD HH:mm:ss");

    const now = dayjs();

    if (formatStr.toUpperCase() === "ISO") {
        return now.format();
    }

    // --- FIX: Manual Day of Year Handling to prevent clashing with Day of Month (D, DD) tokens ---
    const startOfYear = now.startOf('year');
    const doy = now.diff(startOfYear, 'day') + 1;
    const doyPadded = String(doy).padStart(3, '0');

    const getOrdinal = (n) => {
        const suffixes = ["th", "st", "nd", "rd"], v = n % 100;
        return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
    };

    const doyTokens = {
        'DDDD': doyPadded,
        'DDDo': getOrdinal(doy),
        'DDD': String(doy)
    };

    // Pre-parse the format string to protect Day of Year tokens from Day.js core parser
    // We use [literals] to pass them through Day.js untouched
    const doyRegex = /\[([^\]]+)\]|DDDD|DDDo|DDD/g;
    const processedFormat = formatStr.replace(doyRegex, (match, escaped) => {
        if (escaped) return `[${escaped}]`;
        return `[${doyTokens[match]}]`;
    });

    return now.format(processedFormat);
}
