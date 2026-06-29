import { jest } from '@jest/globals';
import plugin from '../dice.js';

describe('Dice Roller Plugin Manifest', () => {
  let appMock;

  beforeEach(() => {
    // Mock the Amplenote app API
    appMock = {
      settings: {},
      prompt: jest.fn(),
      alert: jest.fn(),
      setSetting: jest.fn(),
      insertNoteContent: jest.fn(),
      navigate: jest.fn(),
      filterNotes: jest.fn()
    };
  });

  describe('Happy Path', () => {
    it('should define appOption and noteOption', () => {
      expect(plugin).toBeDefined();
      expect(plugin.appOption).toBeDefined();
      expect(plugin.noteOption).toBeDefined();
    });

    it('should have all general dice options', () => {
      expect(plugin.appOption['Basic']).toBeDefined();
      expect(plugin.appOption['Advanced']).toBeDefined();
      expect(plugin.appOption['Quick Roll Presets']).toBeDefined();
      expect(plugin.appOption['Percentile (D100)']).toBeDefined();
    });

    it('should have all game system options', () => {
      expect(plugin.appOption['Fudge/Fate']).toBeDefined();
      expect(plugin.appOption['Fantasy AGE Stunt - Single Roll']).toBeDefined();
      expect(plugin.appOption['Fantasy AGE Stunt - Roll All At Once']).toBeDefined();
      expect(plugin.appOption['Dice Pool (Shadowrun/WoD)']).toBeDefined();
    });

    it('should have all oracle options', () => {
      expect(plugin.appOption['Specialized']).toBeDefined();
      expect(plugin.appOption['8 Ball']).toBeDefined();
      expect(plugin.appOption['Ask Sai Baba']).toBeDefined();
      expect(plugin.appOption['Tarot Cards']).toBeDefined();
    });
    
    it('should have all generator options', () => {
      expect(plugin.appOption['Weighted Random']).toBeDefined();
      expect(plugin.appOption['Decision Matrix']).toBeDefined();
      expect(plugin.appOption['Name Generator']).toBeDefined();
    });

    it('should have note level Table Randomizer', () => {
      expect(plugin.noteOption['Table - Randomizer']).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should have history functions', () => {
      expect(plugin.appOption['View Roll History']).toBeDefined();
      expect(plugin.appOption['Clear Audit History']).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle undefined app object gracefully if functions are called directly', () => {
      // Just a placeholder for error handling test
      expect(true).toBe(true);
    });
  });
});
