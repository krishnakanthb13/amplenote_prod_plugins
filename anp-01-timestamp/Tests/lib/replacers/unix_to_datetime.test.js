import { unixToDateTime } from '../../../lib/replacers/unix_to_datetime.js';

describe('unixToDateTime', () => {
    let app;

    beforeEach(() => {
        app = {};
    });

    test('should convert valid unix timestamp to locale string', () => {
        const ts = 1672531200; // 2023-01-01 00:00:00 UTC
        const result = unixToDateTime(app, String(ts));
        expect(result).not.toBe("Invalid Unix timestamp");
        expect(result).toContain("2023"); // Basic check
    });

    test('should handle invalid input', () => {
        const result = unixToDateTime(app, "invalid");
        expect(result).toBe("Invalid Unix timestamp");
    });

    test('should handle whitespace', () => {
        const ts = 1672531200;
        const result = unixToDateTime(app, `  ${ts}  `);
        expect(result).not.toBe("Invalid Unix timestamp");
    });
});
