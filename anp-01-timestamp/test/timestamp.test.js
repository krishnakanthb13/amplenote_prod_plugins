import { jest } from '@jest/globals';
import plugin from '../timestamp.js';

describe('timestamp.js Plugin Export', () => {
    let app;

    beforeEach(() => {
        app = {
            settings: {},
            context: {
                noteUUID: "test-note-uuid",
                replaceSelection: jest.fn().mockResolvedValue(true)
            },
            attachNoteMedia: jest.fn().mockResolvedValue("https://example.com/uploaded.png"),
            alert: jest.fn()
        };
    });

    describe('Happy Path - Export Structure', () => {
        test('should export an object with insertText and replaceText properties', () => {
            expect(plugin).toBeDefined();
            expect(plugin.insertText).toBeDefined();
            expect(plugin.replaceText).toBeDefined();
        });

        test('should map all insertText commands correctly', () => {
            expect(typeof plugin.insertText["Digital"]).toBe('function');
            expect(typeof plugin.insertText["Roman"]).toBe('function');
            expect(typeof plugin.insertText["Analog"]).toBe('function');
            expect(typeof plugin.insertText["Text"]).toBe('function');
            expect(typeof plugin.insertText["Unix"]).toBe('function');
        });

        test('should map replaceText commands correctly', () => {
            expect(typeof plugin.replaceText["UnixToDateTime"]).toBe('function');
        });
    });

    describe('Edge Cases', () => {
        test('should not throw if additional unknown methods are missing', () => {
            expect(plugin.noteOption).toBeUndefined();
        });
    });

    describe('Error Handling', () => {
        test('the exported modules should handle errors gracefully (testing Digital)', () => {
            // This is just to ensure the mapped function is executable without crashing
            const result = plugin.insertText["Digital"](app);
            expect(typeof result).toBe('string');
        });
    });
});
