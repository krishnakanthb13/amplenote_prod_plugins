import { roman } from '../../../lib/formatters/roman.js';

describe('roman', () => {
    let app;

    beforeEach(() => {
        app = {};
    });

    test('should return a string', () => {
        const result = roman(app);
        expect(typeof result).toBe('string');
    });

    test('should contain valid roman numeral characters', () => {
        const result = roman(app);
        // Format is D/M/Y, H:M:S
        // Roman numerals use I, V, X, L, C, D, M.
        // The format includes / , : and space.
        expect(result).toMatch(/^([IVXLCDM]*)\/([IVXLCDM]*)\/([IVXLCDM]*), ([IVXLCDM]*):([IVXLCDM]*):([IVXLCDM]*)$/);
    });
});
