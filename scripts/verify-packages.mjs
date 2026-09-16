import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const packages = ['parser', 'analyzer', 'renderer'];

console.log('=== Verifying GitInfoGraphics standalone packages for NPM Publishing ===\n');

let failed = false;

for (const pkg of packages) {
  const pkgDir = path.join(rootDir, 'packages', pkg);
  console.log(`[verify] Checking @gitinfographics/${pkg}...`);

  // 1. Check package.json
  const pkgJsonPath = path.join(pkgDir, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) {
    console.error(`  FAIL: Missing package.json in ${pkgDir}`);
    failed = true;
    continue;
  }

  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  const requiredFields = ['name', 'version', 'description', 'main', 'module', 'types', 'exports', 'files', 'license'];
  for (const field of requiredFields) {
    if (!pkgJson[field]) {
      console.error(`  FAIL: Missing required field "${field}" in package.json`);
      failed = true;
    }
  }

  // 2. Check built files
  const distFiles = ['index.js', 'index.cjs', 'index.d.ts'];
  for (const f of distFiles) {
    const filePath = path.join(pkgDir, 'dist', f);
    if (!fs.existsSync(filePath)) {
      console.error(`  FAIL: Missing build artifact dist/${f} in @gitinfographics/${pkg}`);
      failed = true;
    } else {
      const size = fs.statSync(filePath).size;
      console.log(`  ✓ dist/${f} (${size} bytes)`);
    }
  }

  // 3. Check README and LICENSE
  if (!fs.existsSync(path.join(pkgDir, 'README.md'))) {
    console.error(`  FAIL: Missing README.md in @gitinfographics/${pkg}`);
    failed = true;
  }
  if (!fs.existsSync(path.join(pkgDir, 'LICENSE'))) {
    console.error(`  FAIL: Missing LICENSE in @gitinfographics/${pkg}`);
    failed = true;
  }

  // 4. Run npm pack --dry-run
  try {
    const packOut = execSync('npm pack --dry-run', { cwd: pkgDir, encoding: 'utf8' });
    console.log(`  ✓ npm pack --dry-run passed:`);
    const tarballMatch = packOut.match(/filename:\s+(.+)/);
    if (tarballMatch) {
      console.log(`    Tarball: ${tarballMatch[1]}`);
    }
  } catch (err) {
    console.error(`  FAIL: npm pack --dry-run failed in @gitinfographics/${pkg}`, err);
    failed = true;
  }

  console.log(`  [OK] @gitinfographics/${pkg} is publish-ready!\n`);
}

if (failed) {
  console.error('=== Verification FAILED ===');
  process.exit(1);
} else {
  console.log('=== ALL PACKAGES VERIFIED & READY FOR NPM PUBLISHING ===');
}
