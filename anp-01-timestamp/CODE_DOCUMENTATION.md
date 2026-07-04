# Code Documentation - Timestamp Plugin

## Overview
This plugin provides multiple date and time formatting options for Amplenote. It is built as a set of modular formatters that are bundled into a single IIFE for injection into a plugin note.

## Core Modules

### 1. Digital Formatter (`lib/formatters/digital.js`)
The most complex formatter, responsible for flexible, token-based date strings.
- **Library**: Uses `dayjs` with `advancedFormat`, `weekOfYear`, `dayOfYear`, and `isoWeek`.
- **Custom Logic**: Implements a "Clash Mitigation" pre-pass. 
    - **Why?**: Standard Day.js parsers can mis-parse `DDD` (Day of Year) as `DD` (Day of Month) + `D`. 
    - **How?**: A regex pre-pass calculates the Day of Year manually and wraps the results in `[...]` literal brackets before passing the string to Day.js.
- **Escaping**: Supports square brackets `[...]` to preserve literal characters.
- **Performance**: Helper functions (`getOrdinal`, `getDoyTokens`) are hoisted outside the main format execution to prevent unnecessary object/function instantiation per invocation.

### 2. Analog Formatter (`lib/formatters/analog.js`)
Generates an SVG representation of a clock.
- **Process**: Calculates angles for hands -> Generates SVG string -> Converts to DataURL -> Draws to Canvas -> Generates PNG -> Uploads to Amplenote Media.
- **Dynamic Size**: Size dimensions are driven dynamically by the `app.settings["timestamp analog - size"]` property.
- **Encoding Safety**: Unicode characters within SVGs are safely escaped via `btoa(unescape(encodeURIComponent(svg)))` to prevent browser `InvalidCharacterError` crashes.
- **Insertion**: Inserts the generated clock image directly at the user's cursor position in the editor using `app.context.replaceSelection` instead of appending it to the end of the note.

### 3. Roman Formatter (`lib/formatters/roman.js`)
A recursive number burner that converts standard date components (Day, Month, Year, Time) into Roman Numeral strings (e.g., MMXXVI). Contains complete numerical mappings (including historically tricky cases like 700/DCC).

### 4. Natural Text Formatter (`lib/formatters/text.js`)
Converts time into "Human readable" strings like "Half past Twelve" or "Quarter to One".

---

## Build System
- **Bundler**: `esbuild`
- **Output**: `build/timestamp.compiled.js`
- **Logic**: Resolves dependencies and wraps the output in an IIFE that returns an object literal compatible with the Amplenote Plugin API.
