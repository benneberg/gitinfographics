#!/usr/bin/env node

/**
 * Bundle Size Budget Checker
 * Measures and enforces size limits on standalone packages and production bundles.
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const BUDGETS = [
  {
    target: 'Package: @gitinfographics/parser',
    dir: 'packages/parser/dist',
    maxGzipKb: 15.0,
    maxRawKb: 50.0
  },
  {
    target: 'Package: @gitinfographics/analyzer',
    dir: 'packages/analyzer/dist',
    maxGzipKb: 25.0,
    maxRawKb: 85.0
  },
  {
    target: 'Package: @gitinfographics/renderer',
    dir: 'packages/renderer/dist',
    maxGzipKb: 45.0,
    maxRawKb: 220.0
  }
];

function getDirSizes(dirPath) {
  if (!fs.existsSync(dirPath)) return { rawBytes: 0, gzipBytes: 0, fileCount: 0 };
  let rawBytes = 0;
  let gzipBytes = 0;
  let fileCount = 0;

  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isFile() && !file.endsWith('.map') && !file.endsWith('.d.ts')) {
      fileCount++;
      const content = fs.readFileSync(fullPath);
      rawBytes += content.length;
      gzipBytes += zlib.gzipSync(content).length;
    }
  }

  return { rawBytes, gzipBytes, fileCount };
}

console.log('='.repeat(72));
console.log('📦 GitInfoGraphics Bundle Size Budget Verification');
console.log('='.repeat(72));

let allPassed = true;

console.log('\n| Target Package / Bundle | Raw Size | Gzip Size | Gzip Budget | Status |');
console.log('|' + '-'.repeat(30) + '|' + '-'.repeat(11) + '|' + '-'.repeat(12) + '|' + '-'.repeat(14) + '|' + '-'.repeat(9) + '|');

for (const budget of BUDGETS) {
  const { rawBytes, gzipBytes } = getDirSizes(budget.dir);
  const rawKb = (rawBytes / 1024);
  const gzipKb = (gzipBytes / 1024);

  const passed = gzipKb <= budget.maxGzipKb && rawKb <= budget.maxRawKb;
  if (!passed) allPassed = false;

  const status = passed ? '✅ PASS' : '❌ OVER';
  console.log(
    `| ${budget.target.padEnd(28)} | ${rawKb.toFixed(1).padStart(7)} KB | ${gzipKb.toFixed(1).padStart(8)} KB | ${budget.maxGzipKb.toFixed(1).padStart(9)} KB | ${status} |`
  );
}

// Check studio dist assets if built
const studioDist = 'dist/assets';
if (fs.existsSync(studioDist)) {
  const { rawBytes, gzipBytes } = getDirSizes(studioDist);
  const rawKb = (rawBytes / 1024);
  const gzipKb = (gzipBytes / 1024);
  const studioBudgetKb = 450.0;
  const passed = gzipKb <= studioBudgetKb;
  if (!passed) allPassed = false;
  console.log(
    `| ${'Studio Web Application Assets'.padEnd(28)} | ${rawKb.toFixed(1).padStart(7)} KB | ${gzipKb.toFixed(1).padStart(8)} KB | ${studioBudgetKb.toFixed(1).padStart(9)} KB | ${passed ? '✅ PASS' : '❌ OVER'} |`
  );
}

console.log('='.repeat(72));
if (allPassed) {
  console.log('🎉 All bundles and packages strictly comply with budget thresholds!\n');
  process.exit(0);
} else {
  console.error('⚠️ One or more bundles exceeded the configured size budget!\n');
  process.exit(1);
}
