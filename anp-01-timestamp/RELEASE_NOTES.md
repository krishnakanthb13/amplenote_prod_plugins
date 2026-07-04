# Release Notes: Timestamp Plugin

## v0.0.20 (2026-06-29)

**Initial Open-Source Release**

This release brings the highly requested Timestamp Plugin to the Amplenote community, designed to serve as the definitive "Swiss Army Knife" for date and time insertions.

### Features
- **Digital Formatter**: Insert standard Day.js token-based timestamps. Supports literal escaping and a dedicated "ISO" shortcut.
- **Timezone Support**: Native support for switching between `local` and `UTC` time for digital timestamps.
- **Roman Formatter**: Convert full dates and times into proper Roman numerals (e.g., MMXXIV).
- **Analog Formatter**: A beautiful SVG-based analog clock that is generated on the fly, converted to PNG, and inserted directly into your note as a media attachment. Complete with customizable themes (`dark`, `light`, `neon`) and size settings, plus visual tick marks!
- **Text Formatter**: Natural language time insertion (e.g., "It's half past Twelve").
- **Unix Formatter**: Quick Unix epoch time insertion.
- **Unix Replacer**: Select any Unix timestamp in your note and convert it directly to your local timezone string.

### Fixes & Optimizations
- **Robustness**: Advanced collision mitigation for Day of Year (DDD) parsing logic.
- **Safety**: Strict SVG Unicode bounds-checking using `unescape(encodeURIComponent())` to prevent browser rendering crashes.
- **Performance**: Extracted helper functions and minimized runtime object instantiation for optimal plugin speed.
- **Security**: Validated user settings and bounded dynamic sizes.

### Testing
- 100% test coverage passed across all 15 test suites ensuring regression-free formatting logic.
