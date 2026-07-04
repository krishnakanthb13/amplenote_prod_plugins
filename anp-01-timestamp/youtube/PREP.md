# YouTube Video Preparation (PREP.md)

This document contains packaging metadata and a walkthrough script to assist in producing a video for the **Timestamp Plugin** (v0.0.20) in Amplenote.

---

## 1. Packaging Metadata

### Title Options
*   **Option A (Clear & Direct):** How to Use the Timestamp Plugin in Amplenote
*   **Option B (Benefit-driven):** Ultimate Time & Date Formatting in Amplenote: Custom Digital, Analog Clocks, and Roman Numerals!

### Thumbnail Plan
- **Background:** Use Amplenote's dark mode color (#1E1E1E) as the solid background color.
- **Text Formatting:**
  - **"AMPLENOTE PLUGIN:"** must be uppercase, using a vibrant Amplenote blue (#007AFF) or bold accent color, aligned to the center.
  - The **TIMESTAMP** plugin name should be placed immediately below it in stark white, extra-large, bold typography.
- **Visual/Icon:** Place the official Amplenote logo/icon in the bottom right corner of the thumbnail.

### Description

⏰ COMPLETE GUIDE TO THE TIMESTAMP & DATE FORMATTING PLUGIN FOR AMPLENOTE

A straightforward, fact-based walkthrough of the Timestamp plugin for Amplenote. In this video, we cover every single feature this powerful utility provides—from custom digital formats and time-zone handling to live analog clocks, Roman numerals, natural text descriptions, and Unix epoch conversions.

Whether you are log-keeping, timestamping meeting notes, or working across global team time-zones, this plugin acts as the ultimate "Swiss Army Knife" for date and time.

🔗 Github Repository: https://github.com/krishnakanthb13/anp-01-timestamp

🔗 Try Amplenote (Sign Up): https://www.amplenote.com/signup?ref=7JGSMI4H0
🔗 Explore My Amplenote Plugins: https://krishnakanthb13.github.io/A/
🔗 Alternative Plugins Page: https://public.amplenote.com/Y3dy91/krishna-plugins
🔗 Browse Official Amplenote Plugins: https://www.amplenote.com/plugins
🔗 Support My Work & Development: https://krishnakanthb13.github.io/S/

🕒 VIDEO TIMESTAMPS

0:00 - Introduction & Setup
0:58 - Digital Formatter (Custom Structure & Time-zone Offset)
1:43 - Roman Formatter (Zero-Midnight Conversion Safety)
2:07 - Analog Formatter (Live SVG Rendering, Themes & Sizes)
2:43 - Text Formatter (Spoken Natural Conversational Output)
3:04 - Unix Time Formatter & Selection Replacer

📋 FEATURE BREAKDOWN

DIGITAL FORMATTER
* Custom Layouts: Set custom patterns in your settings using standard Day.js / Moment.js tokens.
* ISO Shorthand: Simply type "ISO" as the structure setting to output standard ISO-8601 formatting.
* Time-zone Switch: Force the digital clock output to UTC by updating the time-zone setting.

ROMAN FORMATTER
* Roman translation: Convert days, months, years, hours, minutes, and seconds entirely to Roman numerals (e.g., MMDCCLXXVII).
* Midnight Safety: Automatically outputs "0" for hours/minutes when no Roman equivalent exists, preventing broken strings.

ANALOG FORMATTER
* SVG Rendering: Generates a visual SVG clock on the fly representing the current system time and attaches it as an image.
* Face Tick Marks: Features 12 mathematically positioned hour markers on the clock face.
* Custom styling: Switch between Dark, Light, and Neon clock themes and safely scale sizes between 50px and 500px.

TEXT FORMATTER
* Spoken Natural Conversational Output: Outputs natural language conversational text such as "It's half past Twelve" or "It's quarter to Two".
* Pre/Post Scripting: Automatically prepends/appends custom label scripts.

UNIX FORMATTER & REPLACER
* Unix Timestamp: Inserts standard Unix epoch time (seconds since 1970).
* Unix to Local Date Time: Select any Unix string in your note, run the replacement command, and instantly convert it to local time formatting.

#Amplenote #PKM #ProductivityTools #TimeManagement #LogKeeping #UnixTimestamp #NoteTaking

---

## 2. Walkthrough Script (Fact-Based)

### **Introduction**
> **Speaker**: "Hello everyone! In this video, we're doing a complete walkthrough of the Timestamp Plugin for Amplenote. If you log daily notes, track tasks, or work across multiple timezones, this plugin serves as a highly customizable date and time utility. Once installed, it gives you five different formatting options and a selection-based text converter. Let's look at how to set it up and how each feature works."

---

### **Section 1: Installation & Setup**
> **Speaker**: "To get started, install the Timestamp Plugin from the Amplenote Plugin Marketplace. Once installed, click on the plugin icon on the top right of the installed Plugin note. You'll see a list of all the settings related to the plugin. The settings you'll want to declare are:
> - `timestamp digital - format`
> - `timestamp digital - timezone`
> - `timestamp analog - theme`
> - `timestamp analog - size`
> - `timestamp analog - suffix`
> - `timestamp text - prefix`
> - `timestamp text - suffix`

---

### **Section 2: Digital Formatter (`digital.js`)**
> **Speaker**: "First, let's explore the **Digital Formatter**. You trigger it by typing `{ Digital }` or using the slash command. 
> 
> By default, it prints out the local date and time in `YYYY-MM-DD HH:mm:ss` format. 
> 
> **TL;DR Options:**
> - **Structure setting**: You can customize this layout in the settings using standard Day.js tokens (like `YYYY` for year, `MM` for month, or `DDDo` for ordinal day of the year).
> - **ISO shortcut**: If you type `ISO` as the structure setting, it will insert the standard ISO-8601 local format.
> - **Timezone setting**: Set `timestamp digital - timezone` to `UTC` to output the timezone in UTC instead of your system's local time."

---

### **Section 3: Roman Formatter (`roman.js`)**
> **Speaker**: "If you prefer classical formatting, you can insert the date and time in Roman numerals using the `{ Roman }` command. 
> 
> It translates day, month, year, hours, minutes, and seconds entirely to Roman numeral strings.
> 
> **TL;DR Feature**:
> - It includes built-in safety checks for midnight transitions, outputting a zero `0` for hours or minutes where no Roman numeral exists, preventing blank outputs."

---

### **Section 4: Analog Formatter (`analog.js`)**
> **Speaker**: "Next is the **Analog Formatter**, triggered by typing `{ Analog }`. This is a visual feature that generates an SVG clock on the fly representing the current system hour, minute, and second, converts it into a PNG, and attaches it directly into your note as a media file.
> 
> **TL;DR Options:**
> - **Tick Marks**: The clock face contains 12 mathematical ticks marking the hours for quick readability.
> - **Themes**: You can configure this with the `timestamp analog - theme` setting using `dark`, `light`, or `neon` themes.
> - **Size Clamping**: Modify the size using the `timestamp analog - size` setting. It's safely constrained between 50 pixels and 500 pixels to keep your note layout clean."

---

### **Section 5: Text Formatter (`text.js`)**
> **Speaker**: "The **Text Formatter** inserts a conversational description of the current time. When you type `{ Text }`, it prints time phrases like 'It's half past Twelve' or 'It's quarter to Two'.
> 
> **TL;DR Options**:
> - **Pre & Post scripts**: You can prefix or suffix text to this description. For example, setting the pre-script to 'Journal entry:' turns the output into 'Journal entry: It's half past Twelve.'"

---

### **Section 6: Unix Formatter (`unix.js`) & UnixToDateTime Replacer (`unix_to_datetime.js`)**
> **Speaker**: "Finally, we have the Unix utilities:
> - `{ Unix }` inserts the standard Unix epoch timestamp (seconds since January 1, 1970).
> - **UnixToDateTime**: If you have a raw Unix timestamp in your note, highlight it, and trigger the replacement command. The plugin automatically converts that timestamp into your local formatted date and time. It is highly robust and displays an error alert if the selected text isn't a valid number."

---

### **Conclusion**
> **Speaker**: "That covers all the capabilities of the Timestamp Plugin. It gives you extreme format customization while maintaining safe boundaries for files and visual elements. The link to download the code is in the description below. Thanks for watching!"
