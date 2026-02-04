# Amplenote Plugin Manager & Staging Envrionment

A robust development environment and staging area for building, testing, and bundling **Amplenote Plugins**. 
This repository provides a framework for managing multiple plugins (`anp-*`), code splitting, and automated packaging.

## Features

- **Modular Development**: Split your plugin code into multiple files (`lib/`, `helpers/`) and bundle them automatically.
- **Amplenote Bundler**: Custom `esbuild` configuration that outputs "Raw Object Literals" wrapped in an IIFE, required by Amplenote (`(() => { return { ... } })()`), ensuring scope isolation and compatibility.
- **Automation Skills**:
    - `anp_bundle`: Compiles plugins to `build/*.compiled.js`.
    - `anp_document`: Auto-generates documentation.
    - `anp_refactor_optimize`: Splits monolithic files into modular components (`lib/`).
    - `anp_release_prep`: Automates release notes and licensing.

## Installation

1. Clone this repo.
2. Run `npm install` to set up dependencies.
3. (Optional) Configure default plugin ID in `esbuild.js`, or pass it via CLI.

## Usage

### Developing a Plugin
1. Create a folder (e.g., `anp-01-myplugin`).
2. Write your code in `myplugin.js`. You can use `import`/`export` and standard ESM.
3. Use the bundler to compile:
   ```bash
   npm run build -- 01
   ```
   (Defaults to "01" if no argument provided). Or use the Agentic workflow: `/anp_bundle`.

### Output
The bundler produces a cleaner, minified file in `build/` that you can copy-paste directly into your Amplenote Plugin Note.

## Technologies
* [esbuild](https://esbuild.github.io/) (Custom Plugin Wrapper)
* [Jest](https://jestjs.io/) (Testing)

## License
GPL v3 - See [LICENSE](LICENSE) for details.
Copyright (C) 2026 Krishna Kanth B
