# Release Notes

## [v0.0.10] - Initial Release
The first official release of the Dice Roller plugin! This release brings a comprehensive suite of dice rolling, randomizing, and oracle tools directly into Amplenote.

### Features Included:
- **Basic Dice Roller**: Roll a configurable number of dice with custom faces, min/max limits, keep/drop highest, exploding dice, sorting, and uniqueness. Includes optional note lookup based on roll results.
- **Advanced Dice Expressions**: Evaluate complex mathematical dice expressions (e.g., `3d4 + 3d4 - (3d4*1d4) - 2^1d7`).
- **Specialized Dice**: Simulate Sicherman dice, intransitive dice, and poker dice with optional probability output.
- **Fudge/Fate Dice**: Roll Fate/Fudge dice (using `+`, ` `, and `-` faces) and total the result.
- **Fantasy AGE Stunt Rolls**: Single and batch stunt rolling, calculating stunt points and doubles.
- **Table Randomizer**: Pick random row/column combinations from markdown tables within the current note.
- **Oracles**: Classic Magic 8-Ball responses and Ask Sai Baba spiritual guidance.

### Utilities & Management:
- **Audit Trail**: Every roll and result is logged to a centralized `Dice Results Audit` note.
- **Persistent Settings**: Remembers your last used dice configurations and targets.
- **History Management**: Commands to quickly `View Roll History` (navigates to audit note) or `Clear Audit History` (requires explicit confirmation).
- **Offline Resilience**: Robust handling of Amplenote's `local-` UUIDs, ensuring the plugin works reliably even before notes have synced to the cloud.
- **Safety**: Input validation on basic rolls prevents invalid parameters, and history viewing guards against empty notes.
