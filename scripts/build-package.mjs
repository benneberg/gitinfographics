import { build } from 'esbuild';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const pkgName = process.argv[2];
if (!pkgName) {
  console.error('Please specify package: parser | analyzer | renderer');
  process.exit(1);
}

const pkgDir = path.resolve(rootDir, 'packages', pkgName);
if (!fs.existsSync(pkgDir)) {
  console.error(`Package directory not found: ${pkgDir}`);
  process.exit(1);
}

console.log(`[build] Building @gitinfographics/${pkgName}...`);

const distDir = path.join(pkgDir, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 1. Copy LICENSE
const rootLicense = path.join(rootDir, 'LICENSE');
if (fs.existsSync(rootLicense)) {
  fs.copyFileSync(rootLicense, path.join(pkgDir, 'LICENSE'));
}

// 2. Determine external packages
const externals = ['@gitinfographics/parser', '@gitinfographics/analyzer', '@gitinfographics/renderer', 'qrcode'];

// 3. Build ESM
await build({
  entryPoints: [path.join(pkgDir, 'src', 'index.ts')],
  outfile: path.join(distDir, 'index.js'),
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  sourcemap: true,
  external: externals
});

// 4. Build CJS
await build({
  entryPoints: [path.join(pkgDir, 'src', 'index.ts')],
  outfile: path.join(distDir, 'index.cjs'),
  bundle: true,
  format: 'cjs',
  platform: 'node',
  target: 'es2022',
  sourcemap: true,
  external: externals
});

// 5. Generate TypeScript declarations
try {
  execSync(`npx tsc --project "${path.join(pkgDir, 'tsconfig.json')}" --emitDeclarationOnly`, {
    cwd: rootDir,
    stdio: 'inherit'
  });
} catch (err) {
  console.warn(`[warn] tsc declaration emit notice for ${pkgName}`);
}

console.log(`[build] Successfully built @gitinfographics/${pkgName}`);
