import { jest } from '@jest/globals';
import plugin from '../dice.js';

describe('anp-19-dice plugin', () => {
  let appMock;

  beforeEach(() => {
    // Scaffold an app mock
    appMock = {
      settings: {},
      prompt: jest.fn(),
      insertNoteContent: jest.fn(),
      navigate: jest.fn(),
      createNote: jest.fn(),
      filterNotes: jest.fn(),
      setSetting: jest.fn()
    };
  });

  describe('Happy Path', () => {
    test('Plugin exports appOption and noteOption correctly', () => {
      expect(plugin).toBeDefined();
      expect(plugin.appOption).toBeDefined();
      expect(plugin.noteOption).toBeDefined();
      
      // Check expected keys
      expect(typeof plugin.appOption["Basic"]).toBe('function');
      expect(typeof plugin.appOption["Advanced"]).toBe('function');
      expect(typeof plugin.appOption["8 Ball"]).toBe('function');
      expect(typeof plugin.noteOption["Table - Randomizer"]).toBe('function');
    });

    test('Basic dice roller can be invoked', async () => {
      // Mock the prompt return for basic dice roll
      appMock.prompt.mockResolvedValue([
        "2", // numDice
        "6", // faces
        null, // min
        null, // max
        false, // keepHighest
        "0", // keepCount
        false, // dropHighest
        "0", // dropCount
        false, // explode
        "6", // explodeTarget
        1, // sortOption
        false, // unique
        false, // navigateToNote
        5 // lookUp
      ]);
      
      appMock.settings["Dice_Audit_UUID [Do not Edit!]"] = "test-uuid";

      // Actually call it
      await plugin.appOption["Basic"](appMock);

      // Verify that the setting was saved
      expect(appMock.setSetting).toHaveBeenCalledWith("Previous_Roll", expect.any(Array));

      // Verify that audit report was inserted
      expect(appMock.insertNoteContent).toHaveBeenCalled();
      const insertArgs = appMock.insertNoteContent.mock.calls[0];
      expect(insertArgs[0]).toEqual({ uuid: "test-uuid" });
      expect(insertArgs[1]).toContain("**Dice rolled:**");

      // Verify navigation occurred
      expect(appMock.navigate).toHaveBeenCalledWith("https://www.amplenote.com/notes/test-uuid");
    });
  });

  describe('Edge Cases', () => {
    test('Missing audit note UUID should trigger creation', async () => {
      appMock.settings["Dice_Audit_UUID [Do not Edit!]"] = undefined;
      appMock.createNote.mockResolvedValue("new-audit-uuid");
      appMock.prompt.mockResolvedValue([1, 6, null, null, false, 0, false, 0, false, 0, 1, false, false, 5]);

      await plugin.appOption["Basic"](appMock);

      expect(appMock.createNote).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('Handles prompt cancellation gracefully', async () => {
      // If the user cancels the prompt, it returns undefined or null
      appMock.prompt.mockResolvedValue(null);
      
      // Should not throw, just exit
      await expect(plugin.appOption["Basic"](appMock)).resolves.not.toThrow();
    });
  });
});
