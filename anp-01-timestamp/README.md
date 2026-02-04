# Timestamp Plugin for Amplenote

A versatile timestamp generator for Amplenote, supporting Digital, Analog, Roman Numeral, and Natural Text formats.

![Timestamp Plugin](timestamp.png)

## Installation

1.  Open the file `build/timestamp.compiled.js` in this repository.
2.  Copy the entire content (it starts with `(() => { ...` and ends with `})()`).
3.  In Amplenote, create a new note (or open an existing plugin note).
4.  Paste the code into a code block (triple backticks).
5.  Tag the note with `plugin`.

## Settings

| Setting Name | Default | Description |
| :--- | :--- | :--- |
| `timestamp for digital - structure` | `Y-m-d H:n:s` | Format string for Digital timestamps. <br>Legend: `Y`=Year, `y`=YY, `m`=Month, `d`=Day, `H`=Hour, `n`=Min, `s`=Sec, `A`=AM/PM |
| `timestamp analog - theme - dark / light / neon` | `dark` | Visual theme for the Analog clock image. Options: `dark`, `light`, `neon`. |
| `timestamp analog - post script` | `""` | Text to append after the Analog clock image (e.g., "Meeting Start"). |
| `timestamp text - pre script` | `""` | Text to prepend to the Text timestamp (e.g., "Current time:"). |
| `timestamp text - post script` | `""` | Text to append to the Text timestamp. |

## Usage

### Insert Text Commands
| Command | Description |
| :--- | :--- |
| `Digital` | Inserts a formatted digital timestamp (e.g., `2026-02-05 10:30:00`). |
| `Roman` | Inserts the date and time using Roman Numerals (e.g., `V/II/MMXXVI`). |
| `Analog` | Generates and uploads a real-time Analog Clock image to the note. |
| `Text` | Inserts the time in natural language (e.g., `It's half past Ten.`). |
| `Unix` | Inserts the current Unix Epoch timestamp. |

### Replace Text Triggers
| Trigger | Description |
| :--- | :--- |
| `UnixToDateTime` | Select a Unix timestamp (e.g., `1672531200`) and run this to convert it to a readable local string. |

## Technical Details

This plugin is built using a **Modular Architecture**:
-   **Structure**: Logic is split into `lib/formatters/` for easier maintenance.
-   **Building**: It uses a custom `esbuild` process to bundle these modules into a single, scope-safe IIFE that Amplenote can execute.
-   **Security**: No external runtime dependencies; all matching uses standard Javascript APIs.
