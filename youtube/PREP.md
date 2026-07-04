# YouTube Preparation: Code Structure Walkthrough

This document prepares the video assets and script for explaining the modular codebase structure of Amplenote Plugins (`anp` folders).

---

## 1. Packaging

### Title Options
- **Option A (Clear & Direct):** Understanding the Code Structure of Amplenote Plugins
- **Option B (Benefit-driven):** How to Build and Organize Modular Amplenote Plugins

### Thumbnail Plan
- **Background:** Use Amplenote's dark mode color (#1E1E1E) as the solid background color.
- **Text Formatting:**
  - **"AMPLENOTE PLUGINS:"** must be uppercase, using a vibrant Amplenote blue (#007AFF) or bold accent color, aligned to the center.
  - The sub-headline **"Code Structure Guide"** should be placed immediately below it in stark white, extra-large, bold typography.
- **Visual/Icon:** Place the official Amplenote logo/icon in the bottom right corner of the thumbnail.

### Description

A comprehensive, step-by-step breakdown of the directory layout and build system used to develop modular Amplenote plugins.

📂 COMPLETE GUIDE TO THE AMPLENOTE PLUGIN CODE STRUCTURE

Learn how to organize your Amplenote plugin projects using modern, modular ECMAScript Modules (ESM), and compile them seamlessly into a single object expression compatible with Amplenote's plugin environment.

🔗 ESSENTIAL LINKS & RESOURCES
* **Amplenote GitHub Repo**: https://github.com/krishnakanthb13/amplenote_prod_plugins

* **Try Amplenote (Sign Up)**: https://www.amplenote.com/signup?ref=7JGSMI4H0
* **Explore My Amplenote Plugins**: https://krishnakanthb13.github.io/A/
* **Alternative Plugins Page**: https://public.amplenote.com/Y3dy91/krishna-plugins
* **Browse Official Amplenote Plugins**: https://www.amplenote.com/plugins
* Support My Work & Development: https://krishnakanthb13.github.io/S/

⏳ VIDEO TIMESTAMPS
0:00 - Introduction to Modular Plugin Setup
0:40 - High-Level Directory Overview
1:39 - Detailed Plugin Directory Structure
2:17 - Inside the Entry Point File
2:50 - Understanding the lib/ Folder & Modules
3:13 - The Build System & IIFE Bundler Logic
3:50 - How to Write and Run Jest Tests
4:11 - Local Commands and Development Workflow

🛠️ STRUCTURE BREAKDOWN
[ENTRY POINT FILE]
* Main Javascript file mapping user-facing actions to modular functions.
[LIB DIRECTORY]
* Internal logic files, categorizing functions (e.g. formatters, parsers).
[BUILD OUTPUT]
* Compiled single-file distribution code ready to be pasted into Amplenote.

#Amplenote #Productivity #TypeScript #WebDevelopment #DeveloperGuide

---

## 2. Script (Simple Walkthrough Style)

### Introduction
Hello and welcome. In this video, we are going to look at the standard code structure used to develop Amplenote plugins. 

Amplenote plugins must ultimately be loaded as a single JavaScript Object Expression containing specific lifecycle methods or command configurations. However, writing your entire plugin in a single, monolithic file makes it hard to maintain, test, and reuse code. 

To solve this, this repository uses a modular structure, separating the development code into clean, testable ES modules, and then bundling them using a post-processing pipeline. Let's walk through how this is laid out.

---

### High-Level Directory Overview
Looking at the root of the project, we see several important configuration files and directories:

1. **`esbuild.js`**: This is the heart of the build system. It takes our modular ES code and compiles it into a single-file object expression.
2. **`lib/`**: This contains shared templates, utility functions, and mock frameworks that can be leveraged across all plugins.
3. **`anp-xx-name/`**: Each plugin has its own folder, prefixed with `anp-` and a number (e.g., `anp-01-timestamp`). This directory is self-contained and isolates the specific business logic, documentation, and tests of that plugin.
4. **`package.json` & Configuration**: Files like `eslint.config.js`, `jest.config.js`, and `jsconfig.json` configure linting, testing, and editor auto-completion consistently across the entire project.

---

### The Plugin Directory Structure
Inside any typical `anp-` directory, you will find:
- **`[plugin-name].js`**: The main entry point file.
- **`lib/`**: Subfolders detailing specific categories of functionality (such as formatting utilities, regex replacers, or external API callers).
- **`Tests/` or `test/`**: A dedicated testing directory containing unit tests (usually with the suffix `.test.js`).
- **`build/`**: The directory where the compiled outputs are generated.
- **Documentation**: Standard files including `README.md`, `CODE_DOCUMENTATION.md`, and `DESIGN_PHILOSOPHY.md`.

---

### The Entry Point File
Let's look at the main entry point file at the root of the plugin folder. 

Its primary role is to configure and export a default object conforming to the Amplenote Plugin API. Instead of implementing helper functions directly in this file, it imports them from the internal `lib/` directory.

The export typically exposes Amplenote plugin interfaces such as:
- `insertText`: For inserting text at the user's cursor.
- `replaceText`: For replacing selected text.
- `noteOption`: For running commands from the note's action menu.

By keeping this file limited to imports and exports, the entry point remains highly readable and clean.

---

### The lib/ Folder and Modular Helpers
Under the plugin's `lib/` folder, helpers are grouped logically. For example:
- **`formatters/`**: Houses modules that format dates, times, or custom text styles.
- **`replacers/`**: Houses modules for parsing text and replacing substrings.

Each utility is exported as a standard ES module. This modularity means we can write small, isolated functions that do exactly one thing, making them easy to unit test.

---

### The Build System and Bundler Logic
Since Amplenote requires a single object expression, how does our modular ES module code get transformed?

When you run the build system:
1. **Esbuild** parses the entry-point file. It follows all the local imports inside `lib/` and bundles them.
2. A custom resolver wraps raw object expressions in standard exports so esbuild can process them cleanly.
3. The build script performs post-processing: it wraps the entire bundled output inside an **IIFE** (Immediately Invoked Function Expression) that returns the main plugin object. This encapsulates all code, preventing global variable collision and allowing complex functions and helper classes to exist safely inside the scope.
4. The output is written to the plugin's `build/` folder as a compiled JavaScript file, ready for distribution.

---

### Testing Setup
Testing is managed using **Jest** with support for ESM.
Inside the `Tests/` folder, you will find files matching the pattern `[plugin-name].test.js`.
These test files import functions directly from the source code and run assertions. Since the logic is modularly separated into helper files, we can test individual functions thoroughly without needing to mock the entire Amplenote editor runtime.

---

### Local Development Workflow
To run builds and tests locally, we use simple terminal scripts defined in the root `package.json`.
- Running the build command packages the code.
- Running the test command executes the Jest test suite, showing you code coverage and test status immediately.

This developer experience ensures that plugins remain stable and easy to maintain over time.

---

### Conclusion
That covers the standard structure of the `anp` folders in this workspace. By isolating each plugin, structuring features as modular ES imports, and utilizing a post-processing bundler, we achieve a modern developer experience while complying fully with Amplenote's runtime constraints.

If you have any questions, feel free to leave a comment below. Don't forget to like and subscribe for more developer guides!
