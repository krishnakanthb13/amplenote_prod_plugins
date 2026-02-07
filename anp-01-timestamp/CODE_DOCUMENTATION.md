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

### 2. Analog Formatter (`lib/formatters/analog.js`)
Generates an SVG representation of a clock.
- **Process**: Calculates angles for hands -> Generates SVG string -> Converts to DataURL -> Draws to Canvas -> Generates PNG -> Uploads to Amplenote Media.
- **SVG Metadata**: B64 encodes the original SVG into the image URL query params to preserve the vector definition for future reference.

### 3. Roman Formatter (`lib/formatters/roman.js`)
A recursive number burner that converts standard date components (Day, Month, Year, Time) into Roman Numeral strings (e.g., MMXXVI).

### 4. Natural Text Formatter (`lib/formatters/text.js`)
Converts time into "Human readable" strings like "Half past Twelve" or "Quarter to One".

---

## Build System
- **Bundler**: `esbuild`
- **Output**: `build/timestamp.compiled.js`
- **Logic**: Resolves dependencies and wraps the output in an IIFE that returns an object literal compatible with the Amplenote Plugin API.
