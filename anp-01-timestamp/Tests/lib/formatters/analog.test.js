/**
 * @jest-environment jsdom
 */
import { analog } from '../../../lib/formatters/analog.js';
import { jest } from '@jest/globals';

describe('analog', () => {
    let app;
    let originalImage;
    let originalCreateElement;

    beforeAll(() => {
        originalImage = global.Image;
        originalCreateElement = document.createElement;
    });

    afterAll(() => {
        global.Image = originalImage;
        document.createElement = originalCreateElement;
    });

    beforeEach(() => {
        app = {
            context: {
                noteUUID: "test-note-uuid",
                replaceSelection: jest.fn().mockResolvedValue(true)
            },
            settings: {
                "timestamp analog - theme": "neon",
                "timestamp analog - suffix": "SuffixText"
            },
            attachNoteMedia: jest.fn().mockResolvedValue("https://example.com/uploaded.png"),
            alert: jest.fn()
        };

        // Mock FileReader readAsDataURL to return a mock string
        jest.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function() {
            this.onload({ target: { result: 'data:image/svg+xml;base64,mocksvg' } });
        });

        // Mock Image
        global.Image = class {
            constructor() {
                setTimeout(() => {
                    if (this.onload) this.onload();
                }, 0);
            }
        };

        // Mock canvas
        document.createElement = (tagName) => {
            if (tagName === 'canvas') {
                return {
                    width: 0,
                    height: 0,
                    getContext: () => ({
                        drawImage: () => {}
                    }),
                    toDataURL: () => 'data:image/png;base64,mockpng'
                };
            }
            return originalCreateElement.call(document, tagName);
        };
    });

    test('should generate analog clock, upload media and replace selection', async () => {
        const result = await analog(app);
        expect(result).toBe("");
        expect(app.attachNoteMedia).toHaveBeenCalledWith(
            { uuid: "test-note-uuid" },
            "data:image/png;base64,mockpng"
        );
        expect(app.context.replaceSelection).toHaveBeenCalled();
        const callArg = app.context.replaceSelection.mock.calls[0][0];
        expect(callArg).toContain("https://example.com/uploaded.png");
        expect(callArg).toContain("SuffixText");
    });

    test('should return error when noteUUID is missing', async () => {
        app.context.noteUUID = null;
        const result = await analog(app);
        expect(result).toBe("Error: Open a note to insert image.");
        expect(app.attachNoteMedia).not.toHaveBeenCalled();
    });
});
