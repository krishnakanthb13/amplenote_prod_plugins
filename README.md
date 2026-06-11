# Amplenote Production Plugins

A collection of finished **Amplenote Plugins** plus the build tooling used to bundle them.
Each plugin is written as modular ESM (split across `lib/`), then compiled by a custom `esbuild` configuration into a single "Raw Object Literal" wrapped in an IIFE — the format Amplenote requires (`(() => { return { ... } })()`).

This is the production repository. Plugins are vendored here as plain directories (`anp-*`); their development history and per-plugin docs live in their own repositories.

## Features

- **Modular Development**: Split plugin code into multiple files (`lib/`, `helpers/`) and bundle them automatically.
- **Amplenote Bundler**: Custom `esbuild` configuration that outputs "Raw Object Literals" wrapped in an IIFE, required by Amplenote (`(() => { return { ... } })()`), ensuring scope isolation and compatibility. Output is **readable** (not minified or obfuscated).
- **Per-Plugin Isolation**: Each plugin is a self-contained directory with its own `lib/`, `build/`, and `Tests/`, preventing a change in one plugin from breaking another.

## Installation

1. Clone this repo.
2. Run `npm install` to set up dependencies.
3. (Optional) Configure the default plugin ID in `esbuild.js`, or pass it via CLI.

## Usage

### Building a Plugin
1. Each plugin folder follows the `anp-[ID]-[name]` pattern (e.g., `anp-01-timestamp`).
2. The plugin source uses `import`/`export` and standard ESM, split across `lib/`.
3. Use the bundler to compile (the argument is the plugin ID, or `lib` for the template):
   ```bash
   npm run build -- 01      # or: node esbuild.js 01
   ```
   Defaults to `01` if no argument is provided.

### Output
The bundler produces a clean, readable, single-file object expression in `[plugin]/build/[name].compiled.js` that you can copy-paste directly into your Amplenote Plugin Note.

### The Template
`lib/plugin.js` is a minimal starter plugin (with `noteOption`/`insertText`/`replaceText` stubs). Build it with `npm run build -- lib` to use it as a starting point for a new plugin.

## Plugins

| Plugin | Entry | Description |
| :--- | :--- | :--- |
| `anp-01-timestamp` | `timestamp.js` | Insert and convert timestamps with multiple formats (digital, analog, roman, unix, text). |
| `anp-02-metadata` | `metadata.js` | Generate, filter, and export comprehensive note metadata reports. |

## Technologies
* [esbuild](https://esbuild.github.io/) (custom Amplenote object-literal wrapper)
* [Day.js](https://day.js.org/) (date/time formatting, used by `anp-01-timestamp`)
* [Jest](https://jestjs.io/) (testing)
* [ESLint](https://eslint.org/) & [Prettier](https://prettier.io/) (linting & formatting)

## License
GPL v3 - See [LICENSE](LICENSE) for details.
Copyright (C) 2026 Krishna Kanth B
