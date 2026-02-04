# Amplenote Plugin Manager & Staging Envrionment

A robust development environment and staging area for building, testing, and bundling **Amplenote Plugins**. 
This repository provides a framework for managing multiple plugins (`anp-*`), code splitting, and automated packaging.

## Features

- **Modular Development**: Split your plugin code into multiple files (`lib/`, `helpers/`) and bundle them automatically.
- **Amplenote Bundler**: Custom `esbuild` configuration that outputs "Raw Object Literals" required by Amplenote (`{ insertText: ... }`), supporting ES Modules syntax during development.
- **Automation Skills**:
    - `anp_bundle`: Compiles plugins to `build/*.compiled.js`.
    - `anp_document`: Auto-generates documentation.
    - `anp_refactor_optimize`: Splits monolithic files into modular components.
    - `anp_release_prep`: Automates release notes and licensing.

## Installation

1. Clone this repo.
2. Run `npm install` to set up dependencies.
3. Configure your plugin ID in `esbuild.js` (e.g., `PLUGIN_ID = "01"`).

## Usage

### Developing a Plugin
1. Create a folder (e.g., `anp-01-myplugin`).
2. Write your code in `myplugin.js`. You can use `import`/`export` and standard ESM.
3. Use the bundler to compile:
   ```bash
   npm run build
   ```
   Or use the Agentic workflow: `/anp_bundle`.

### Output
The bundler produces a cleaner, minified file in `build/` that you can copy-paste directly into your Amplenote Plugin Note.

## Technologies
* [esbuild](https://esbuild.github.io/) (Custom Plugin Wrapper)
* [Jest](https://jestjs.io/) (Testing)

## License
GPL v3 - See [LICENSE](LICENSE) for details.
Copyright (C) 2026 Krishna Kanth B
