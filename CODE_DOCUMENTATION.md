# Code Documentation

## Project Structure
-   `esbuild.js`: The core build system (configured for Per-Plugin Isolation).
-   `anp-xx-name/`: Self-contained plugin directory.
    -   `lib/`: Internal helper modules.
    -   `build/`: Compiled output (`.compiled.js`).
    -   `Tests/`: Unit tests and logs.
-   `.agent/`: AI skills and workflows.

## Bundler Logic (`esbuild.js`)
The bundler is configured to solve a unique Amplenote constraint: plugins must be a **Single Object Expression**, but developers want to write **Modular ESM Code**.

### The Wrapper Plugin (`ampleNoteRawResolver`)
We use a custom esbuild plugin to intercept files that look like raw objects (start with `{`) and wrap them in `export default ...` so esbuild can process them.

### Post-Processing
After linking, the build script parses the output string:
1.  Removes the `export default varname;` statement.
2.  Removes the `var varname = ` declaration.
3.  Trims trailing semicolons.
4.  **Result**: A clean object literal.

## Folders
-   **anp-xx-name**:
    -   Each folder is a fully isolated project.
    -   **Entry**: `[name].js`
    -   **Output**: `build/[name].compiled.js` (Ready for Copy-Paste).
    -   **Tests**: `Tests/[name].test.js`.
