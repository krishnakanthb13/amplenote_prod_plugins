# Timestamp Plugin for Amplenote

A versatile timestamp generator for Amplenote, supporting Digital, Analog, Roman Numeral, and Natural Text formats.

![Timestamp Plugin](timestamp.png)

## Installation

1. **Create a Plugin Note**: Create a new note in Amplenote (e.g., named "Timestamp Plugin").
2. **Setup Metadata Table**: At the very top of the note, create a table with the following structure:

| Field | Value |
| :--- | :--- |
| name | Timestamp |
| description | Different types of Timestamps. Every possibility that you can think of. You can modify them based on your needs using the info given in the below details using the different details in the below (View note Link). |
| icon | update |
| settings | timestamp for digital - structure |
| settings | timestamp analog - theme - dark / light / neon |
| settings | timestamp analog - post script |
| settings | timestamp text - pre script |
| settings | timestamp text - post script |

3. **Insert Code Block**: Below the table, create a single Javascript code block.
4. **Paste Compiled Code**: Copy the content from `build/timestamp.compiled.js` and paste it inside the code block.
5. **Activate**: Go to **Account Settings** -> **Plugins**, and select the note you just created.

## Settings Explained

| Setting Name | Default | Description |
| :--- | :--- | :--- |
| `timestamp for digital - structure` | `YYYY-MM-DD HH:mm:ss` | Format string for Digital timestamps. Powered by [Day.js](https://day.js.org/docs/en/display/format). [See Local Token Guide](./dayjs.md). |
| `timestamp analog - theme` | `dark` | Visual theme for the Analog clock (`dark`, `light`, or `neon`). |
| `timestamp analog - post script` | *(empty)* | Text to append immediately after the Analog clock image. |
| `timestamp text - pre/post script` | *(empty)* | Custom text to wrap around the natural language timestamp. |

---

## Technical Architecture

This plugin is built with a modular ESM (ECMAScript Module) architecture:
- **Formatters** (`lib/formatters/`): Independent logic for each time display type.
- **Replacers** (`lib/replacers/`): Selection-based transformation logic.
- **Bundling**: Uses `esbuild` to compile dependencies (like Day.js) into a single, optimized browser-compatible artifact.

For deep dives into the implementation and design decisions, see:
- [Code Documentation](./CODE_DOCUMENTATION.md)
- [Design Philosophy](./DESIGN_PHILOSOPHY.md)
- [Day.js Token Reference](./dayjs.md)
