# Design Philosophy

## The "Modern Core, Legacy Shell" Approach
Amplenote's plugin architecture relies on `eval()`ing a single Javascript object. This is simple for small scripts but hostile to complex engineering (no imports, no types, no modules).

### Our Solution
We treat the `eval` context as a "compile target", not a "source format".
-   **Write**: Modern ESM, multiple files, classes, tests.
-   **Build**: `esbuild` bundles it all.
-   **Deploy**: The bundler wraps the final code in an IIFE to ensure **Scope Safety** and returns the "Legacy Shell" (the object) that Amplenote expects.

## Principles
1.  **Zero Runtime Dependencies**: The output must run in a constrained browser environment without `npm` modules. All deps are bundled in.
2.  **Developer Experience First**: You should be able to use your IDE's full power (Go to Definition, Refactor) which requires standard JS modules.
3.  **Transparency**: The bundler output is readable code, not obfuscated bytecode.
4.  **Scope Safety**: By wrapping code in an IIFE, we prevent global namespace pollution, ensuring that our helper functions (like `digital()`, `analog()`) don't collide with other plugins or the app itself.
5.  **Isolation by Default**:
    -   Each plugin is a universe (`anp-xx-name`).
    -   It has its own `lib/`, `build/`, and `Tests/`.
    -   **Why?** Prevents "Dependency Hell" where changing a shared utility for Plugin A breaks Plugin B.
    -   **Trade-off**: Some code duplication, but maximum stability per plugin.
