const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Directories to process
const directories = [
  'urban-planning-portal/src',
  'admin/src',
  'shared/types'
];

// File extensions to process
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];

// Skip these directories
const skipDirs = ['node_modules', '.git', '.next', 'dist', 'build'];

// Function to check if a path should be skipped
function shouldSkipDir(dirPath) {
  return skipDirs.some(skipDir => dirPath.includes(skipDir));
}

// Function to process a file
async function processFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');

    // Skip if file doesn't contain 'filename'
    if (!content.includes('filename')) {
      return;
    }

    // Create backup
    const backupPath = `${filePath}.bak`;
    await writeFile(backupPath, content);

    // Replace 'filename' with 'fileName' in a safe way
    let newContent = content;

    // Handle property access (e.g., doc.filename -> doc.fileName)
    newContent = newContent.replace(/([^a-zA-Z0-9])filename([^a-zA-Z0-9])/g, '$1fileName$2');

    // Handle property declarations in interfaces/types
    newContent = newContent.replace(/filename\s*:/g, 'fileName:');

    // Handle destructuring
    newContent = newContent.replace(/\{([^}]*?)filename([^}]*?)\}/g, (match, before, after) => {
      return `{${before}fileName${after}}`;
    });

    // Write the changes
    await writeFile(filePath, newContent);
    console.log(`✅ Processed: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

// Function to recursively process directories
async function processDirectory(dir) {
  try {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (!shouldSkipDir(fullPath)) {
          await processDirectory(fullPath);
        }
      } else if (entry.isFile() && extensions.includes(path.extname(entry.name))) {
        await processFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error processing directory ${dir}:`, error);
  }
}

// Main function
async function main() {
  console.log('🚀 Starting filename to fileName refactoring...');

  for (const dir of directories) {
    console.log(`\n📁 Processing directory: ${dir}`);
    await processDirectory(dir);
  }

  console.log('\n✨ Refactoring complete!');
  console.log('⚠️  Please review the changes and test thoroughly.');
  console.log('📝 Backup files have been created with .bak extension');
}

// Run the script
main().catch(console.error);
