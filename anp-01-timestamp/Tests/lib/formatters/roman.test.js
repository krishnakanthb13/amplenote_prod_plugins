import { jest } from '@jest/globals';
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
        expect(result).toMatch(/^([0IVXLCDM]*)\/([0IVXLCDM]*)\/([0IVXLCDM]*), ([0IVXLCDM]*):([0IVXLCDM]*):([0IVXLCDM]*)$/);
    });

    test('should correctly format specific date and time including DCC and LXX (e.g. year 2777)', () => {
        jest.useFakeTimers();
        // Month is 0-indexed, so 6 is July.
        jest.setSystemTime(new Date(2777, 6, 27, 17, 27, 37));
        const result = roman(app);
        // 27 -> XXVII
        // 7 -> VII
        // 2777 -> MMDCCLXXVII
        // 17 -> XVII
        // 27 -> XXVII
        // 37 -> XXXVII
        expect(result).toBe('XXVII/VII/MMDCCLXXVII, XVII:XXVII:XXXVII');
        jest.useRealTimers();
    });
});
