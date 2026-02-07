# Release Notes

## v0.0.15 (2026-02-07)
-   **Bug Fix**: Resolved Day of Year token clashing.
    -   Implemented a custom pre-pass mitigation layer to prevent `DDD` from being mis-parsed as `DD` + `D`.
-   **Feature**: Enhanced Week of Year and ISO Week support via Day.js plugins.
-   **Documentation**:
    -   Added **Design Philosophy** and **Code Documentation** for deeper technical insight.
    -   Refined **README.md** with professional power-user installation guide.
    -   Fixed `dayjs.md` examples for Day of Year ordinals.
-   **Quality**: Standardized JSDoc across all internal modules for better maintainability.

## v0.0.14 (2026-02-05)
-   **Feature Enhancement**: Advanced Digital Timestamp Formatting.
    -   Transitioned to **Day.js** for 100% standard compliance with Moment.js tokens.
    -   Full support for **Moment.js formatting tokens** (`YYYY`, `MMMM`, `Do`, `dddd`, `Z`, etc.).
    -   Implemented **Literal Escaping** using square brackets `[...]`.
    -   Added **ISO8601** support via the `ISO` shorthand setting.
    -   Updated default format to standard `YYYY-MM-DD HH:mm:ss`.
-   **Documentation**: Updated JSDoc and README with formatting guides and reference links.

## v0.0.9 (2026-02-05)
-   **Initial Release**: First public release of the Timestamp plugin.
-   **Features**:
    -   **Digital**: Custom format support (Y-m-d H:n:s).
    -   **Roman**: Display date/time as Roman Numerals.
    -   **Analog**: Generate and upload a real-time analog clock image.
    -   **Text**: Natural language time ("It's half past Ten").
    -   **Unix**: Epoch timestamps.
    -   **Replacer**: Convert Unix timestamps to local strings inline.
-   **Architecture**:
    -   Modular ESM structure (`lib/formatters`).
    -   bundled with `esbuild` for Amplenote compatibility.
    -   Scope-safe IIFE wrapping.
