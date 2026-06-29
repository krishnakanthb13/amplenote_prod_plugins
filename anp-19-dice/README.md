# 🎲 Dice Roller and Randomizer

> **A comprehensive plugin for Amplenote to run general dice rolls, advanced mathematical formulas, RPG-specific systems, divination-style randomizers, and table-based selections.**

---

## ✨ Features

- **Basic & Advanced Rolls**: Standard dice with modifiers (keep, drop, explode, unique) and complex mathematical expressions (`3d4 + 2d6 * 5`).
- **RPG Systems built-in**: First-class support for *Fudge/Fate* dice, *Fantasy AGE* stunt rolls, and *Shadowrun/WoD* Dice Pools.
- **Table Randomizer**: Pick random row/column combinations directly from your Amplenote markdown tables.
- **Divination & Oracles**: Includes classic *Magic 8-Ball*, *Ask Sai Baba*, *Tarot Cards*, and specialized dice (Poker, Sicherman, Intransitive).
- **Generators & Tools**: Use the *Name Generator*, *Weighted Random*, and *Decision Matrix* to spark creativity or make unbiased choices.
- **Persistent History**: Automatically logs every roll into a centralized `Dice Results Audit` note so you never lose track of your campaign results.

---

## 🛠️ Installation

1. Create a new note in Amplenote and title it **`Dice Roller and Randomizer Plugin`**.
2. Add the following Settings table to the note:

| Field | Value |
| :--- | :--- |
| `name` | Dice Roller and Randomizer |
| `icon` | casino |
| `description` | Comprehensive dice rolling, game systems, and random generators for Amplenote. |
| `setting` | `Previous_Roll` |
| `setting` | `Previous_Roll_ADV1` (Not in use) |
| `setting` | `Previous_Roll_ADV2` (Not in use) |
| `setting` | `Previous_Roll_Spc` |
| `setting` | `Previous_Roll_FF` |
| `setting` | `Previous_Roll_AGE` |
| `setting` | `Previous_Roll_Ran` |
| `setting` | `Previous_Weighted` |
| `setting` | `Previous_DicePool` |
| `setting` | `Dice_Usage_Stats` |
| `setting` | `Dice_Audit_UUID [Do not Edit!]` |

*(Note: Leave the setting values blank during first installation. The plugin will manage them automatically.)*

3. Below the table, insert a **JavaScript code block** and paste the compiled plugin code from `build/dice.compiled.js` into it.
4. Go to **Account Settings > Plugins** in Amplenote and select your newly created plugin note to activate it.

---

## 🚀 Usage Guide

Once activated, the plugin registers several app-level commands and one note-level command:

### 🎲 General Dice
- **`Basic`**: Rolls standard dice with configurable modifiers (faces, min/max limits, keep/drop, exploding, unique).
- **`Advanced`**: Evaluates mathematical dice expressions (e.g., `3d4 + 3` or `1d12 + 1d10 + 5`).
- **`Quick Roll Presets`**: Easily pick standard RPG rolls (e.g. D20, 2d6, D&D Ability Score) and add modifiers.
- **`Percentile (D100)`**: Roll 00-99 or 1-100, and even supports "flip to succeed" mechanics.

### ⚔️ Game Systems
- **`Fudge/Fate`**: Rolls standard Fate dice (`+`, ` `, `-`) and calculates the total.
- **`Fantasy AGE Stunt - Single Roll`**: Rolls a stunt check, detecting doubles and stunt points.
- **`Fantasy AGE Stunt - Roll All At Once`**: Run stunt checks for an entire party in one go.
- **`Dice Pool (Shadowrun/WoD)`**: Roll a pool of d6s against a Target Number, counting hits and handling exploding 6s.

### 🔮 Oracles & Divination
- **`Specialized`**: Simulates Sicherman, Intransitive, or Poker dice with optional probability outputs.
- **`8 Ball`**: Answers your yes/no questions with classic Magic 8-Ball responses.
- **`Ask Sai Baba`**: Pulls one of 720 spiritual guidance responses.
- **`Tarot Cards`**: Draw single cards, 3-card spreads, or full Celtic Cross layouts, complete with meanings.

### 🛠️ Generators & Tools
- **`Weighted Random`**: Select from a custom list of items where some items are more likely to be picked than others.
- **`Decision Matrix`**: Rank options against weighted criteria to find the optimal choice.
- **`Name Generator`**: Generate random names in Fantasy, Sci-Fi, or Norse styles, optionally with titles.
- **`Table - Randomizer`** *(Note Action)*: Run this from inside a note to pick random row/column combinations directly from tables.

### 📜 History & Management
- **`View Roll History`**: Jump instantly to your `Dice Results Audit` note.
- **`Clear Audit History`**: Erase your roll history (requires confirmation).

---

## 💻 Technical & Development

The source code is modularly structured inside the `lib/` directory and bundled for Amplenote execution using `esbuild`. 

- **Entry Point:** `dice.js`
- **Build Process:** Run the repository's build pipeline to compile source files into `build/dice.compiled.js`.
- For deeper technical context, see [CODE_DOCUMENTATION.md](CODE_DOCUMENTATION.md) and [DESIGN_PHILOSOPHY.md](DESIGN_PHILOSOPHY.md).
