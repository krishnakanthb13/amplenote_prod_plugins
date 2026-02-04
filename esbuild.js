import esbuild from "esbuild";
import fs from "fs/promises";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

// CONFIGURATION -----------------------------------------
// Set this to "lib" or the number of the plugin (e.g. "01", "02")
const PLUGIN_ID = "01";
// -------------------------------------------------------

const findEntryPoint = async (id) => {
  if (id === "lib") {
    return { path: "lib/plugin.js", name: "lib" };
  }

  // Find folder starting with anp-{id}-
  const items = await fs.readdir(".");
  const puginDir = items.find(item => item.startsWith(`anp-${id}-`));

  if (!puginDir) {
    throw new Error(`Could not find directory for Plugin ID: ${id}`);
  }

  // Find entry file inside that dir
  // Heuristic: Look for {suffix}.js, e.g. anp-01-timestamp -> timestamp.js
  const suffix = puginDir.split("-").slice(2).join("-"); // 01-timestamp -> timestamp
  const files = await fs.readdir(puginDir);

  // Try exact match first
  let entryFile = files.find(f => f === `${suffix}.js`);

  // Fallback: any .js file that isn't index.js or test
  if (!entryFile) {
    entryFile = files.find(f => f.endsWith(".js") && !f.includes(".test.") && !f.includes("spec."));
  }

  if (!entryFile) {
    throw new Error(`Could not find entry JS file in ${puginDir}`);
  }

  return { path: path.join(puginDir, entryFile), name: suffix };
};

// Plugin to wrap raw object literals (Amplenote style) in export default
const ampleNoteRawResolver = {
  name: 'amplenote-raw-resolver',
  setup(build) {
    build.onLoad({ filter: /\.js$/ }, async (args) => {
      // Only apply to the entry point or files that look like raw objects
      const contents = await fs.readFile(args.path, "utf8");
      const trimmed = contents.trim();

      // Heuristic: If it starts with { and doesn't contain "export default" or "module.exports"
      // We assume it's a raw Amplenote plugin object.
      if (trimmed.startsWith("{") && !trimmed.includes("export default") && !trimmed.includes("module.exports")) {
        return {
          contents: `export default ${contents}`,
          loader: 'js'
        };
      }
      return null; // logic defaulting to standard behavior
    });
  },
};

const build = async () => {
  console.log(`[Bundler] Target Plugin ID: ${PLUGIN_ID}`);

  try {
    const entry = await findEntryPoint(PLUGIN_ID);
    console.log(`[Bundler] Entry point: ${entry.path}`);

    // Determine output path: [PluginDir]/build/[Name].compiled.js
    const pluginDir = path.dirname(entry.path);
    const outputDir = path.join(pluginDir, "build");
    const outputFile = path.join(outputDir, `${entry.name}.compiled.js`);

    const result = await esbuild.build({
      entryPoints: [entry.path],
      bundle: true,
      format: "esm",
      outfile: outputFile,
      platform: "neutral",
      write: false,
      plugins: [ampleNoteRawResolver],
      mainFields: ['module', 'main'],
    });

    if (result.outputFiles && result.outputFiles.length > 0) {
      let code = result.outputFiles[0].text;

      // 1. Find the export default variable name
      const exportMatch = code.match(/export\s*{\s*(\w+)\s*as\s*default\s*};/);
      const exportDefaultMatch = code.match(/export\s*default\s*(\w+);/);

      let finalVariable;

      if (exportMatch) {
        finalVariable = exportMatch[1];
        code = code.replace(exportMatch[0], ""); // Remove export line
      } else if (exportDefaultMatch) {
        finalVariable = exportDefaultMatch[1];
        code = code.replace(exportDefaultMatch[0], ""); // Remove export line
      }

      if (finalVariable) {
        // 2. Remove the variable declaration "var name = "
        const varDeclarationRegex = new RegExp(`var\\s+${finalVariable}\\s*=\\s*`);
        code = code.replace(varDeclarationRegex, "");

        // 3. We do NOT append "; variable;" at the end because the user wants PURE object structure.
        // If the code was just "{ ... };", removing "var x =" makes it "{ ... };"
        // We should also ensure we don't end with a trailing semicolon if it was part of the var decl?
        // Actually esbuild puts semicolon after value.
        // "var x = { ... };" -> "{ ... };"
      }

      // Cleanup: Remove trailing semicolon and whitespace
      code = code.trim();
      while (code.endsWith(";")) {
        code = code.slice(0, -1).trim();
      }

      await fs.mkdir(outputDir, { recursive: true });
      await fs.writeFile(outputFile, code);
      console.log(`[Bundler] Success! Output: ${outputFile}`);
    }
  } catch (e) {
    console.error(`[Bundler] Error: ${e.message}`);
    process.exit(1);
  }
};

build();
