const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

async function updateImports(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');

    // Replace relative imports in shared components
    let updatedContent = content.replace(
      /from ['"]\.\.\/components\/ui\/(.*?)['"]/g,
      'from "@shared/components/ui/$1"'
    );

    // Replace @/components/ui imports with @shared/components/ui
    updatedContent = updatedContent.replace(
      /from ['"]@\/components\/ui\/(.*?)['"]/g,
      'from "@shared/components/ui/$1"'
    );

    if (content !== updatedContent) {
      await writeFile(filePath, updatedContent);
      console.log(`Updated imports in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

async function walkDir(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      await walkDir(filePath);
    } else if (
      stat.isFile() &&
      (filePath.endsWith('.ts') || filePath.endsWith('.tsx'))
    ) {
      await updateImports(filePath);
    }
  }
}

// Start the update process
console.log('Starting import updates...');
Promise.all([
  walkDir(path.join(__dirname, '../shared')),
  walkDir(path.join(__dirname, '../admin')),
  walkDir(path.join(__dirname, '../urban-planning-portal/src'))
])
  .then(() => console.log('Import updates completed!'))
  .catch(console.error);
