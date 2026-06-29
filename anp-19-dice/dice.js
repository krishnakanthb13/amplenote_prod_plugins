/**
 * @file dice.js
 * @description Main entry point for the Dice Roller and Randomizer plugin. Exposes all App Options and Note Options.
 */
import basic from './lib/basic.js';
import advanced from './lib/advanced.js';
import specialized from './lib/specialized.js';
import eight_ball from './lib/8_ball.js';
import ask_sai_baba from './lib/ask_sai_baba.js';
import fudge_fate from './lib/fudge_fate.js';
import fantasy_age_stunt_single_roll from './lib/fantasy_age_stunt_single_roll.js';
import fantasy_age_stunt_roll_all_at_once from './lib/fantasy_age_stunt_roll_all_at_once.js';
import table_randomizer from './lib/table_randomizer.js';
import { clearAuditHistory, viewRollHistory } from './lib/history.js';

// New Features
import quick_presets from './lib/quick_presets.js';
import weighted_random from './lib/weighted_random.js';
import dice_pool from './lib/dice_pool.js';
import decision_matrix from './lib/decision_matrix.js';
import name_generator from './lib/name_generator.js';
import tarot from './lib/tarot.js';
import percentile from './lib/percentile.js';

// Wrapper function to add Error Boundaries and Usage Statistics
function wrapFeature(featureName, moduleFunc) {
  return async function (app, ...args) {
    try {
      // Track usage statistics
      const statsStr = await app.settings["Dice_Usage_Stats"];
      const stats = statsStr ? JSON.parse(statsStr) : {};
      stats[featureName] = (stats[featureName] || 0) + 1;
      await app.setSetting("Dice_Usage_Stats", JSON.stringify(stats));

      // Execute the module safely
      await moduleFunc(app, ...args);
    } catch (error) {
      console.error(`Plugin Error in [${featureName}]:`, error);
      app.alert(`An error occurred in ${featureName}:\n${error.message}`);
    }
  };
}

/**
 * Amplenote Dice Roller and Randomizer plugin manifest.
 *
 * Exposes app-level dice/randomizer commands and a note-level table randomizer.
 */
export default {
  appOption: {
    // General Dice
    "Basic": wrapFeature("Basic", basic),
    "Advanced": wrapFeature("Advanced", advanced),
    "Quick Roll Presets": wrapFeature("Quick Roll Presets", quick_presets),
    "Percentile (D100)": wrapFeature("Percentile (D100)", percentile),

    // Game Systems
    "Fudge/Fate": wrapFeature("Fudge/Fate", fudge_fate),
    "Fantasy AGE Stunt - Single Roll": wrapFeature("Fantasy AGE Stunt - Single Roll", fantasy_age_stunt_single_roll),
    "Fantasy AGE Stunt - Roll All At Once": wrapFeature("Fantasy AGE Stunt - Roll All At Once", fantasy_age_stunt_roll_all_at_once),
    "Dice Pool (Shadowrun/WoD)": wrapFeature("Dice Pool (Shadowrun/WoD)", dice_pool),

    // Oracles & Divination
    "Specialized": wrapFeature("Specialized", specialized),
    "8 Ball": wrapFeature("8 Ball", eight_ball),
    "Ask Sai Baba": wrapFeature("Ask Sai Baba", ask_sai_baba),
    "Tarot Cards": wrapFeature("Tarot Cards", tarot),

    // Generators & Tools
    "Weighted Random": wrapFeature("Weighted Random", weighted_random),
    "Decision Matrix": wrapFeature("Decision Matrix", decision_matrix),
    "Name Generator": wrapFeature("Name Generator", name_generator),

    // History
    "View Roll History": wrapFeature("View Roll History", viewRollHistory),
    "Clear Audit History": wrapFeature("Clear Audit History", clearAuditHistory)
  },
  noteOption: {
    "Table - Randomizer": wrapFeature("Table - Randomizer", table_randomizer)
  }
};
