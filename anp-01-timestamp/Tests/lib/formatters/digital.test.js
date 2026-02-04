import { digital } from '../../../lib/formatters/digital.js';

describe('digital', () => {
    let app;

    beforeEach(() => {
        app = {
            settings: {}
        };
    });

    test('should format default date (Y-m-d H:n:s)', () => {
        const result = digital(app);
        // We can't easily mock Date directly without a library or DI,
        // but we can check the format structure.
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    test('should respect custom format from settings', () => {
        app.settings["timestamp for digital - structure"] = "Y/m/d";
        const result = digital(app);
        expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
    });

    test('should handle AM/PM', () => {
        app.settings["timestamp for digital - structure"] = "H:n A";
        const result = digital(app);
        expect(result).toMatch(/^\d{2}:\d{2} (AM|PM)$/);
    });
});
