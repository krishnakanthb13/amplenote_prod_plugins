import basic from './lib/basic.js';
import advanced from './lib/advanced.js';
import specialized from './lib/specialized.js';
import eight_ball from './lib/8_ball.js';
import ask_sai_baba from './lib/ask_sai_baba.js';
import fudge_fate from './lib/fudge_fate.js';
import fantasy_age_stunt_single_roll from './lib/fantasy_age_stunt_single_roll.js';
import fantasy_age_stunt_roll_all_at_once from './lib/fantasy_age_stunt_roll_all_at_once.js';
import table_randomizer from './lib/table_randomizer.js';

/**
 * Amplenote Dice Roller and Randomizer plugin manifest.
 *
 * Exposes app-level dice/randomizer commands and a note-level table randomizer.
 */
export default {
  appOption: {
    "Basic": basic,
    "Advanced": advanced,
    "Specialized": specialized,
    "8 Ball": eight_ball,
    "Ask Sai Baba": ask_sai_baba,
    "Fudge/Fate": fudge_fate,
    "Fantasy AGE Stunt - Single Roll": fantasy_age_stunt_single_roll,
    "Fantasy AGE Stunt - Roll All At Once": fantasy_age_stunt_roll_all_at_once
  },
  noteOption: {
    "Table - Randomizer": table_randomizer
  }
};
