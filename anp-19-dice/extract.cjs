const fs = require('fs');

const content = fs.readFileSync('dice.js', 'utf8');

const libDir = './lib';
if (!fs.existsSync(libDir)) fs.mkdirSync(libDir);

const parts = content.split('/* ----------------------------------- */');
const actionFiles = [];

for (let i = 1; i < parts.length; i++) {
  let part = parts[i].trim();
  if (part.startsWith('/*')) continue; // Skip commented sections

  let isNoteOption = false;
  if (part.includes('noteOption: {')) {
    part = part.split('noteOption: {')[1].trim();
    isNoteOption = true;
  }

  // Extract action name
  const match = part.match(/"([^"]+)":\s*async\s*function/);
  if (!match) continue;
  const actionName = match[1];
  const safeName = actionName.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').toLowerCase();

  // Remove the trailing `},` or `}`
  let code = part.replace(/},\s*$/, '').replace(/}\s*$/, '');
  // Extract function body. Wait, `part` is `"Basic": async function (app) { ... }`
  // We want to export default async function(app) { ... }
  
  let newCode = code.replace(/"[^"]+":\s*(async\s*function)/, 'export default $1');
  
  fs.writeFileSync(`${libDir}/${safeName}.js`, newCode);
  actionFiles.push({ name: actionName, file: safeName, isNoteOption });
}

// Generate index.js
let indexCode = `// Main entry point\n`;
actionFiles.forEach(a => {
  indexCode += `import ${a.file} from './lib/${a.file}.js';\n`;
});

indexCode += `\nexport default {\n  appOption: {\n`;
actionFiles.filter(a => !a.isNoteOption).forEach(a => {
  indexCode += `    "${a.name}": ${a.file},\n`;
});
indexCode += `  },\n  noteOption: {\n`;
actionFiles.filter(a => a.isNoteOption).forEach(a => {
  indexCode += `    "${a.name}": ${a.file},\n`;
});
indexCode += `  }\n};\n`;

fs.writeFileSync('index.js', indexCode);
console.log('Extraction complete. Check index.js and lib/ folder.');
