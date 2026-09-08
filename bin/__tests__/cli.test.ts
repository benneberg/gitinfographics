import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { runCLI } from '../cli';

describe('GitInfoGraphics CLI', () => {
  const testDir = path.resolve(process.cwd(), '.tmp-cli-test');
  const readmePath = path.join(testDir, 'README.md');
  const outPath = path.join(testDir, 'infographic.svg');
  const configPath = path.join(testDir, '.gitinfographicsrc.json');

  beforeEach(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    fs.writeFileSync(
      readmePath,
      `# SuperTool
High-velocity automated deployment pipeline.

## Features
- Zero config
- Blazing fast
- Built with TypeScript

## Stats
- 10k+ stars
- 99.9% uptime
`,
      'utf8'
    );
  });

  afterEach(() => {
    try {
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    } catch {}
  });

  it('prints version information', async () => {
    let output = '';
    const originalLog = console.log;
    console.log = (msg: string) => { output += msg; };
    try {
      await runCLI(['--version']);
      expect(output).toContain('gitinfographics v');
    } finally {
      console.log = originalLog;
    }
  });

  it('generates SVG infographic from markdown file', async () => {
    await runCLI([
      'generate',
      `--input=${readmePath}`,
      `--output=${outPath}`,
      '--theme=scandi-minimal',
      '--layout=desktop'
    ]);

    expect(fs.existsSync(outPath)).toBe(true);
    const content = fs.readFileSync(outPath, 'utf8');
    expect(content).toContain('<svg');
    expect(content).toContain('SuperTool');
    expect(content).toContain('Zero config');
    expect(content).toContain('</svg>');
  });

  it('initializes config file with init command', async () => {
    const origCwd = process.cwd();
    try {
      process.chdir(testDir);
      await runCLI(['init']);
      expect(fs.existsSync(configPath)).toBe(true);
      const conf = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      expect(conf.theme).toBe('scandi-minimal');
      expect(conf.layout).toBe('desktop');
    } finally {
      process.chdir(origCwd);
    }
  });
});
