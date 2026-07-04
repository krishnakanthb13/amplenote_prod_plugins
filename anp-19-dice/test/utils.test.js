import { jest } from '@jest/globals';
import { rollDice, sortNotesByLookUp, getNoteUUID, createAuditReport } from '../lib/utils.js';

describe('utils.js', () => {
  let appMock;

  beforeEach(() => {
    appMock = {
      settings: {},
      filterNotes: jest.fn(),
      getNote: jest.fn(),
      setSetting: jest.fn(),
      createNote: jest.fn(),
      insertNoteContent: jest.fn(),
      navigate: jest.fn()
    };
  });

  describe('rollDice()', () => {
    describe('Happy Path', () => {
      it('should roll basic dice correctly', () => {
        // Mock random to be predictable (always max value)
        jest.spyOn(Math, 'random').mockReturnValue(0.999);
        const result = rollDice({ numDice: 2, faces: 6 });
        expect(result.rolls).toEqual([6, 6]);
        expect(result.total).toBe(12);
        Math.random.mockRestore();
      });

      it('should apply keep modifier', () => {
        jest.spyOn(Math, 'random').mockReturnValueOnce(0.1).mockReturnValueOnce(0.9); // Rolls 1, 6
        const result = rollDice({ numDice: 2, faces: 6, keep: { highest: true, count: 1 } });
        expect(result.rolls).toEqual([6]);
        expect(result.total).toBe(6);
        Math.random.mockRestore();
      });
      
      it('should apply explode modifier', () => {
        // Mock random: first roll 6 (explodes), second roll 3
        jest.spyOn(Math, 'random').mockReturnValueOnce(0.999).mockReturnValueOnce(0.499);
        const result = rollDice({ numDice: 1, faces: 6, explode: { target: 6, reroll: true } });
        expect(result.rolls).toEqual([6, 3]);
        expect(result.total).toBe(9);
        Math.random.mockRestore();
      });
    });

    describe('Edge Cases', () => {
      it('should handle zero dice', () => {
        const result = rollDice({ numDice: 0, faces: 6 });
        expect(result.rolls).toEqual([]);
        expect(result.total).toBe(0);
      });

      it('should handle negative faces safely (returns NaN/empty values in JS Math.random)', () => {
        const result = rollDice({ numDice: 1, faces: 0 });
        expect(result.total).toBe(1); // Math.floor(random * 0) + 1 = 1
      });
    });

    describe('Error Handling', () => {
      it('should default options gracefully', () => {
        const result = rollDice();
        expect(result.rolls).toBeDefined();
        expect(result.total).toBeDefined();
      });
    });
  });

  describe('sortNotesByLookUp()', () => {
    const mockNotes = [
      { uuid: '1', name: 'Zebra', created: '2023-01-01', updated: '2023-01-02' },
      { uuid: '2', name: 'Apple', created: '2023-01-03', updated: '2023-01-01' }
    ];

    describe('Happy Path', () => {
      it('should sort notes by Name (lookUp=1)', async () => {
        appMock.filterNotes.mockResolvedValue(mockNotes);
        const uuid = await sortNotesByLookUp(appMock, 1, 0); // Pick 1st after sort
        // Apple comes before Zebra
        expect(uuid).toBe('2'); 
      });
    });

    describe('Edge Cases', () => {
      it('should handle negative pickNote via modulo', async () => {
        appMock.filterNotes.mockResolvedValue(mockNotes);
        const uuid = await sortNotesByLookUp(appMock, 1, -1);
        // Apple (0), Zebra (1) -> -1 modulo 2 is 1 -> Zebra
        expect(uuid).toBe('1');
      });
    });

    describe('Error Handling', () => {
      it('should handle filterNotes returning null', async () => {
        appMock.filterNotes.mockResolvedValue(null);
        const uuid = await sortNotesByLookUp(appMock, 1, 0);
        expect(uuid).toBeNull();
      });

      it('should handle filterNotes throwing error', async () => {
        appMock.filterNotes.mockRejectedValue(new Error('Network error'));
        const uuid = await sortNotesByLookUp(appMock, 1, 0);
        expect(uuid).toBeNull();
      });
    });
  });

  describe('getNoteUUID()', () => {
    describe('Happy Path', () => {
      it('should return new UUID when none exists', async () => {
        appMock.createNote.mockResolvedValue('new-uuid');
        const uuid = await getNoteUUID(appMock, 'TestNote', ['-test']);
        expect(uuid).toBe('new-uuid');
        expect(appMock.createNote).toHaveBeenCalledWith('TestNote', ['-test']);
      });
    });

    describe('Edge Cases', () => {
      it('should handle local- UUID mapping', async () => {
        appMock.settings["Dice_Audit_UUID [Do not Edit!]"] = "local-123";
        appMock.filterNotes.mockResolvedValue([{ uuid: 'online-123', name: 'TestNote', tags: ['-test'] }]);
        
        const uuid = await getNoteUUID(appMock, 'TestNote', ['-test']);
        expect(uuid).toBe('online-123');
      });
    });

    describe('Error Handling', () => {
      it('should handle createNote throwing error', async () => {
        appMock.createNote.mockRejectedValue(new Error('Failed to create'));
        await expect(getNoteUUID(appMock, 'TestNote', ['-test'])).rejects.toThrow('Failed to create');
      });
    });
  });

  describe('createAuditReport()', () => {
    describe('Happy Path', () => {
      it('should insert note content and navigate', async () => {
        appMock.createNote.mockResolvedValue('audit-uuid');
        await createAuditReport(appMock, 'Test Roll', 'You rolled 20');
        expect(appMock.insertNoteContent).toHaveBeenCalled();
        expect(appMock.navigate).toHaveBeenCalledWith('https://www.amplenote.com/notes/audit-uuid');
      });
    });
  });
});
