import { text } from '../../../lib/formatters/text.js';
import { jest } from '@jest/globals';

describe('Text Formatter', () => {
    let mockApp;

    beforeEach(() => {
        mockApp = {
            settings: {
                "timestamp text - prefix": "",
                "timestamp text - suffix": ""
            }
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // 1. Happy Path
    describe('Happy Path', () => {
        test('formats o\'clock correctly', () => {
            const mockDate = new Date(2026, 5, 29, 12, 0, 0); // 12:00
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

            expect(text(mockApp)).toBe("It's Twelve o'clock.");
        });

        test('formats half past correctly', () => {
            const mockDate = new Date(2026, 5, 29, 3, 30, 0); // 03:30
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

            expect(text(mockApp)).toBe("It's half past Three.");
        });

        test('formats relative past time correctly', () => {
            const mockDate = new Date(2026, 5, 29, 5, 15, 0); // 05:15
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

            expect(text(mockApp)).toBe("It's Quarter past Five.");
        });

        test('formats relative to time correctly', () => {
            const mockDate = new Date(2026, 5, 29, 8, 45, 0); // 08:45 -> Quarter to Nine
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

            expect(text(mockApp)).toBe("It's Quarter to Nine.");
        });
    });

    // 2. Edge Cases
    describe('Edge Cases', () => {
        test('handles midnight transition correctly (11:59 PM to 12:00 AM)', () => {
            const mockDate = new Date(2026, 5, 29, 23, 59, 0); // 23:59 -> One to Twelve
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

            expect(text(mockApp)).toBe("It's One to Twelve.");
        });

        test('handles noon transition correctly (11:59 AM to 12:00 PM)', () => {
            const mockDate = new Date(2026, 5, 29, 11, 59, 0); // 11:59 -> One to Twelve
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

            expect(text(mockApp)).toBe("It's One to Twelve.");
        });

        test('handles single digit minutes past correctly', () => {
            const mockDate = new Date(2026, 5, 29, 1, 5, 0); // 01:05 -> Five past One
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

            expect(text(mockApp)).toBe("It's Five past One.");
        });
    });

    // 3. Settings & Error Handling
    describe('Settings Configuration', () => {
        test('prepends pre-script settings if configured', () => {
            mockApp.settings["timestamp text - prefix"] = "Reminder:";
            const mockDate = new Date(2026, 5, 29, 10, 0, 0);
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

            expect(text(mockApp)).toBe("Reminder: It's Ten o'clock.");
        });

        test('appends post-script settings if configured', () => {
            mockApp.settings["timestamp text - suffix"] = "[Logged]";
            const mockDate = new Date(2026, 5, 29, 10, 0, 0);
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

            expect(text(mockApp)).toBe("It's Ten o'clock. [Logged]");
        });

        test('combines both pre and post script settings', () => {
            mockApp.settings["timestamp text - prefix"] = "Info:";
            mockApp.settings["timestamp text - suffix"] = "- Done";
            const mockDate = new Date(2026, 5, 29, 10, 0, 0);
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

            expect(text(mockApp)).toBe("Info: It's Ten o'clock. - Done");
        });
    });
});
