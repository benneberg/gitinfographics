import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const packages = ['parser', 'analyzer', 'renderer'];

console.log('=== Building all GitInfoGraphics standalone packages ===');

for (const pkg of packages) {
  console.log(`\n--- Building ${pkg} ---`);
  execSync(`node "${path.join(__dirname, 'build-package.mjs')}" ${pkg}`, {
    cwd: rootDir,
    stdio: 'inherit'
  });
}

console.log('\n=== All standalone packages built successfully ===');
