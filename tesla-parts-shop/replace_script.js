const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  for (const [search, replace] of replacements) {
    if (content.includes(search)) {
      content = content.split(search).join(replace);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

function walk(dir, callback) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
        walk(fullPath, callback);
      }
    } else {
      callback(fullPath);
    }
  });
}

const replacements = [
  ['Tesla Parts Center', 'Auto Parts Store'],
  ['teslapartscenter', 'autopartsstore'],
  ['https://via.placeholder.com', 'https://placehold.co'],
  ['text-tesla-dark', 'text-slate-900'],
  // Fix specific cases where bg-tesla-dark (now white) has light text
  ['bg-tesla-dark text-gray-300', 'bg-white text-slate-600 border-b border-gray-100'],
  ['bg-tesla-dark text-gray-400', 'bg-white text-slate-500 border-t border-gray-100'],
  ['bg-tesla-dark text-white', 'bg-slate-900 text-white'], // Keep buttons dark if they were dark with white text
];

walk('.', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.json') || filePath.endsWith('.html') || filePath.endsWith('.txt')) {
    replaceInFile(filePath, replacements);
  }
});
