# Day.js Formatting Tokens Reference

[← Back to README](./README.md)

This plugin uses **Day.js** (with the `advancedFormat` plugin) to generate digital timestamps. Below are the available formatting tokens you can use in the `timestamp for digital - structure` setting.

### Table of Formatting Tokens

| Category | Token | Description | Example (Feb 05, 2026 14:05:01) |
| :--- | :--- | :--- | :--- |
| **Year** | `YYYY` | 4-digit year | `2026` |
| | `YY` | 2-digit year | `26` |
| **Quarter** | `Q` | Quarter of year | `1` |
| **Month** | `MMMM` | Full month name | `February` |
| | `MMM` | Short month name | `Feb` |
| | `MM` | Month, 2-digit | `02` |
| | `M` | Month, 1-digit | `2` |
| **Day of Month** | `DD` | Day of month (01-31) | `05` |
| | `D` | Day of month (1-31) | `5` |
| | `Do` | Day of month, ordinal | `5th` |
| **Day of Year** | `DDDD` | Day of year (001-366) | `036` |
| | `DDD` | Day of year (1-366) | `36` |
| | `DDDo` | Day of year, ordinal | `36th` |
| **Day of Week** | `dddd` | Full day name | `Monday` |
| | `ddd` | Short day name | `Mon` |
| | `dd` | Min day name | `Mo` |
| | `d` | Day of week (0-6) | `1` |
| | `E` | ISO Day of Week (1-7) | `1` |
| **Week of Year** | `ww` | Week of year, 2-digit | `02` |
| | `w` | Week of year | `2` |
| | `wo` | Week of year, ordinal | `2nd` |
| **ISO Week** | `WW` | ISO Week, 2-digit | `02` |
| | `W` | ISO Week | `2` |
| **Hour** | `HH` | 24-hour, 2-digit | `14` |
| | `H` | 24-hour, 1-digit | `14` |
| | `hh` | 12-hour, 2-digit | `02` |
| | `h` | 12-hour, 1-digit | `2` |
| | `kk` | 24-hour (1-24), 2-digit | `14` |
| | `k` | 24-hour (1-24), 1-digit | `14` |
| **Minute** | `mm` | Minute, 2-digit | `05` |
| | `m` | Minute, 1-digit | `5` |
| **Second** | `ss` | Second, 2-digit | `01` |
| | `s` | Second, 1-digit | `1` |
| **Sub-second** | `SSS` | Milliseconds, 3-digit | `000` |
| **AM / PM** | `A` | Uppercase | `PM` |
| | `a` | Lowercase | `pm` |
| **Timezone** | `Z` | Offset from UTC | `+05:30` |
| | `ZZ` | Offset from UTC (no colon) | `+0530` |
| **Unix** | `X` | Unix Timestamp (seconds) | `1738744501` |
| | ISO 8601 | `ISO` | Standard Format | `2026-02-05T14...` |

### Special Formatting Tips

*   **Escaping Characters**: To include literal text in your format string, wrap it in square brackets.
    *   Example: `[Year:] YYYY` → `Year: 2026`
*   **ISO8601 Shorthand**: Set your structure to exactly `ISO` to get the standard ISO8601 local timestamp.
*   **Day.js Documentation**: For more advanced options, visit the [Day.js Format Guide](https://day.js.org/docs/en/display/format).

### Examples

| Structure | Example (Output) | Description |
| :--- | :--- | :--- |
| `YYYY-MM-DD HH:mm:ss` | `2026-02-05 14:11:00` | Standard (24-hour) |
| `dddd, MMMM Do YYYY` | `Thursday, February 5th 2026` | Full Date (Friendly) |
| `MMM D, YYYY` | `Feb 5, 2026` | Short Date |
| `h:mm:ss A` | `2:11:00 PM` | 12-hour Time with AM/PM |
| `HH:mm [hrs]` | `14:11 hrs` | 24-hour Time with suffix |
| `MM/DD/YYYY` | `02/05/2026` | US Date Format |
| `DD/MM/YYYY` | `05/02/2026` | International Date Format |
| `[Today is] dddd` | `Today is Thursday` | Literal Text with Day |
| `Do [of] MMMM, YYYY` | `5th of February, 2026` | Ordinal Style |
| `DDDo [Day of Year]` | `36th Day of Year` | Day of Year Usage |
| `YYYYMMDD-HHmmss` | `20260205-141100` | Compact (File-safe) |
| `X` | `1738744860` | Unix Timestamp (Seconds) |
| `ISO` | `2026-02-05T14:11:00+05:30` | Standard ISO8601 |

---
