# Code Documentation

## Project Structure
-   `esbuild.js`: The core build system (configured for Per-Plugin Isolation). Accepts a CLI arg for the plugin ID (e.g., `node esbuild.js 02`) or `lib` to build the template. Defaults to `01`.
-   `lib/`: The reusable plugin template (`plugin.js`), a sample importable module (`arbitrary-plugin-module.js`), and helpers (`test-helpers.js`). Used as the `lib` build target and starting point for new plugins.
-   `anp-xx-name/`: Self-contained plugin directory.
    -   `lib/`: Internal helper modules.
    -   `build/`: Compiled output (`.compiled.js`).
    -   `Tests/`: Unit tests and logs.

## Bundler Logic (`esbuild.js`)
The bundler is configured to solve a unique Amplenote constraint: plugins must be a **Single Object Expression**, but developers want to write **Modular ESM Code**.

### Entry-Point Resolution
Given a plugin ID, the bundler finds the `anp-{id}-*` directory and derives the entry file from the suffix (`anp-01-timestamp` → `timestamp.js`), falling back to the first non-test `.js` file. The `lib` ID maps directly to `lib/plugin.js`. Output is written to `[pluginDir]/build/[name].compiled.js`.

### The Wrapper Plugin (`ampleNoteRawResolver`)
A custom esbuild plugin intercepts files that look like raw objects (trimmed content starts with `{` and contains no `export default` / `module.exports`) and wraps them in `export default ...` so esbuild can process them.

### Post-Processing
After bundling (`write: false`), the build script parses the output string:
1.  Identifies the exported plugin object variable (`export { x as default }` or `export default x`) and strips the export statement.
2.  **Wraps the entire bundle in an IIFE** (`(() => { ... return plugin; })()`).
3.  This ensures no global variable pollution and allows valid block statements (functions, classes) to exist safely within the scope.
4.  Strips trailing semicolons/whitespace.
5.  **Result**: A clean, readable, scope-safe object expression ready for `eval()`. The output is **not** minified.

## Folders
-   **anp-xx-name**:
    -   Each folder is a fully isolated project.
    -   **Entry**: `[name].js`
    -   **Output**: `build/[name].compiled.js` (ready for copy-paste).
    -   **Tests**: `Tests/[name].test.js`.

## Configuration Files
-   `eslint.config.js`: Flat ESLint config with Amplenote/browser + Jest globals; ignores `**/build/**`.
-   `jest.config.js`: Jest config using the `ts-jest` preset with `testEnvironment: 'node'`; loads `.env` via `dotenv`.
-   `package.json`: `type: module`; `build` runs `node esbuild.js`, `test` runs Jest with `NODE_OPTIONS=--experimental-vm-modules` for ESM support.
-   `jsconfig.json`: ESNext module/target, scoped to `lib/`.
