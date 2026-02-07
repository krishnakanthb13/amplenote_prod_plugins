import { digital } from '../../../lib/formatters/digital.js';

describe('digital', () => {
    let app;

    beforeEach(() => {
        app = {
            settings: {}
        };
    });

    test('should format default date (YYYY-MM-DD HH:mm:ss)', () => {
        const result = digital(app);
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    test('should support all tokens in documentation table', () => {
        const testCases = [
            { format: "YYYY YY", regex: /^\d{4} \d{2}$/ },
            { format: "MMMM MMM MM M", regex: /^[A-Za-z]+ [A-Za-z]{3} \d{2} \d{1,2}$/ },
            { format: "DD D Do", regex: /^\d{2} \d{1,2} \d+(st|nd|rd|th)$/ },
            { format: "dddd ddd dd d", regex: /^[A-Za-z]+ [A-Za-z]{3} [A-Za-z]{2} \d$/ },
            { format: "HH H hh h kk k", regex: /^\d{2} \d{1,2} \d{2} \d{1,2} \d{2} \d{1,2}$/ },
            { format: "mm m ss s SSS", regex: /^\d{2} \d{1,2} \d{2} \d{1,2} \d{3}$/ },
            { format: "A a", regex: /^(AM|PM) (am|pm)$/ },
            { format: "Z ZZ", regex: /^[+-]\d{2}:\d{2} [+-]\d{4}$/ },
            { format: "X x", regex: /^\d{10} \d{13}$/ },
            { format: "Q", regex: /^[1-4]$/ },
            { format: "w ww wo", regex: /^\d{1,2} \d{2} \d+(st|nd|rd|th)$/ },
            { format: "DDD DDDo", regex: /^\d{1,3} \d+(st|nd|rd|th)$/ },
            { format: "W WW", regex: /^\d{1,2} \d{2}$/ }
        ];

        testCases.forEach(({ format, regex }) => {
            app.settings["timestamp for digital - structure"] = format;
            const result = digital(app);
            expect(result).toMatch(regex);
        });
    });

    test('should match exact Moment.js examples from docs', () => {
        // dddd, MMMM Do YYYY, h:mm:ss a
        app.settings["timestamp for digital - structure"] = "dddd, MMMM Do YYYY, h:mm:ss a";
        expect(digital(app)).toMatch(/^[A-Za-z]+, [A-Za-z]+ \d+(st|nd|rd|th) \d{4}, \d{1,2}:\d{2}:\d{2} (am|pm)$/i);

        // ddd, hA
        app.settings["timestamp for digital - structure"] = "ddd, hA";
        expect(digital(app)).toMatch(/^[A-Za-z]{3}, \d{1,2}(AM|PM)$/);

        // [Today is] dddd
        app.settings["timestamp for digital - structure"] = "[Today is] dddd";
        expect(digital(app)).toMatch(/^Today is [A-Za-z]+$/);
    });

    test('should support ISO shorthand', () => {
        app.settings["timestamp for digital - structure"] = "ISO";
        expect(digital(app)).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
    });

    test('should handle multiple literal escaping blocks', () => {
        app.settings["timestamp for digital - structure"] = "[The year is] YYYY [and it is] dddd";
        expect(digital(app)).toMatch(/^The year is \d{4} and it is [A-Za-z]+$/);
    });

    test('should handle nested-like brackets (non-recursive)', () => {
        app.settings["timestamp for digital - structure"] = "[Date [is]] YYYY";
        expect(digital(app)).toBe("Date [is] " + new Date().getFullYear());
    });
});
