# Timestamp Plugin for Amplenote

A versatile timestamp generator for Amplenote, supporting Digital, Analog, Roman Numeral, and Natural Text formats.

![Timestamp Plugin](timestamp.png)

## Installation

1. Copy the code from `build/timestamp.compiled.js`.
2. Paste into an Amplenote Plugin Note.

## Settings

| Setting Name | Default | Description |
| :--- | :--- | :--- |
| `timestamp for digital - structure` | `Y-m-d H:n:s` | Format string for Digital timestamps. Keys: Y, y, m, d, H, n, s, A. |
| `timestamp analog - theme - dark / light / neon` | `dark` | Visual theme for the Analog clock. |
| `timestamp analog - post script` | *(empty)* | Text to append after the Analog clock image. |
| `timestamp text - pre script` | *(empty)* | Text to prepend to the Text timestamp. |
| `timestamp text - post script` | *(empty)* | Text to append to the Text timestamp. |

## Usage

### Insert Text Commands
- **Digital**: Inserts a formatted date string (e.g., `2026-02-05 01:30:00`).
- **Roman**: Inserts the date/time using Roman numerals (e.g., `V/II/MMXXVI`).
- **Analog**: Inserts a live-generated SVG analog clock image.
- **Text**: Inserts a verbose "human" time (e.g., "It's half past One").
- **Unix**: Inserts the current Unix timestamp.

### Replace Text Commands
- **UnixToDateTime**: Select a Unix timestamp and run this to convert it to a readable local date string.

## Technical Details

This plugin follows a modular structure:
- `lib/formatters/`: Contains logic for generating different timestamp formats.
- `lib/replacers/`: Contains logic for text replacement actions.

The project uses `esbuild` to bundle these modules into a single artifact compatible with Amplenote's environment.
