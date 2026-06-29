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

## [v0.0.13] - Comprehensive Oracles & Utilities Update
This release significantly expands the plugin's capabilities with 7 new robust modules and improved internal architecture for error handling and analytics.

### New Features:
- **Quick Roll Presets**: Save and quickly access your favorite or most frequently used dice configurations.
- **Percentile Dice**: A dedicated roller for d100 percentile systems, displaying both the tens and units digit alongside the total.
- **Decision Matrix**: Evaluate options against multiple weighted criteria to make data-driven decisions.
- **Name Generator**: Generate thematic names (fantasy, sci-fi, cyberpunk, etc.) with customizable counts and optional titles.
- **Weighted Random Selector**: Pick from a list of options where some outcomes are statistically more likely than others.
- **Dice Pool System**: Roll multiple dice, counting "hits" against a target number, with optional exploding dice mechanics (great for Shadowrun).
- **Tarot Card Draw**: Draw from the Major Arcana using Single, Three-Card, or Celtic Cross spreads, with optional reversed meanings.

### Under the Hood:
- **Error Boundaries**: All modules are now wrapped in a centralized error handler that gracefully catches and logs exceptions without crashing the plugin.
- **Usage Statistics**: The plugin now tracks which modules you use most frequently, saving the analytics to `Dice_Usage_Stats` in your Amplenote settings.
