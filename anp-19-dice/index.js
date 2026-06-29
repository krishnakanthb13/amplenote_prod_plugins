import basic from './lib/basic.js';
import advanced from './lib/advanced.js';
import specialized from './lib/specialized.js';
import eight_ball from './lib/8_ball.js';
import ask_sai_baba from './lib/ask_sai_baba.js';
import fudge_fate from './lib/fudge_fate.js';
import fantasy_age_stunt_single_roll from './lib/fantasy_age_stunt_single_roll.js';
import fantasy_age_stunt_roll_all_at_once from './lib/fantasy_age_stunt_roll_all_at_once.js';
import table_randomizer from './lib/table_randomizer.js';

// New Features
import quick_presets from './lib/quick_presets.js';
import weighted_random from './lib/weighted_random.js';
import dice_pool from './lib/dice_pool.js';
import decision_matrix from './lib/decision_matrix.js';
import name_generator from './lib/name_generator.js';
import tarot from './lib/tarot.js';
import percentile from './lib/percentile.js';

/**
 * Amplenote Dice Roller and Randomizer plugin manifest.
 *
 * Exposes app-level dice/randomizer commands and a note-level table randomizer.
 */
export default {
  appOption: {
    // General Dice
    "Basic": basic,
    "Advanced": advanced,
    "Quick Roll Presets": quick_presets,
    "Percentile (D100)": percentile,

    // Game Systems
    "Fudge/Fate": fudge_fate,
    "Fantasy AGE Stunt - Single Roll": fantasy_age_stunt_single_roll,
    "Fantasy AGE Stunt - Roll All At Once": fantasy_age_stunt_roll_all_at_once,
    "Dice Pool (Shadowrun/WoD)": dice_pool,

    // Oracles & Divination
    "Specialized": specialized,
    "8 Ball": eight_ball,
    "Ask Sai Baba": ask_sai_baba,
    "Tarot Cards": tarot,

    // Generators & Tools
    "Weighted Random": weighted_random,
    "Decision Matrix": decision_matrix,
    "Name Generator": name_generator
  },
  noteOption: {
    "Table - Randomizer": table_randomizer
  }
};
