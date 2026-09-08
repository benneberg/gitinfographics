#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { parseMD } from '../src/engine/parser';
import { buildRuleSpec } from '../src/engine/specBuilder';
import { renderSVG } from '../src/engine/renderer';
import { InfographicSpec, GitHubMeta, VariantMap } from '../src/engine/types';

interface CLIConfig {
  theme?: string;
  layout?: 'desktop' | 'mobile';
  output?: string;
  format?: 'svg' | 'png' | 'pdf';
  showQR?: boolean;
  qrUrl?: string;
  variants?: VariantMap;
}

const DEFAULT_CONFIG_FILES = ['.gitinfographicsrc', '.gitinfographicsrc.json'];

function loadConfigFile(customPath?: string): CLIConfig {
  const candidates = customPath ? [customPath] : DEFAULT_CONFIG_FILES;
  for (const file of candidates) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        return JSON.parse(content);
      } catch (e) {
        console.warn(`[gitinfographics] Warning: Failed to parse config file ${file}:`, e);
      }
    }
  }
  return {};
}

function parseArgs(args: string[]): { command: string; flags: Record<string, string | boolean> } {
  const flags: Record<string, string | boolean> = {};
  let command = 'help';
  const positional: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--') continue;
    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      if (eqIdx !== -1) {
        const key = arg.slice(2, eqIdx);
        const val = arg.slice(eqIdx + 1);
        flags[key] = val;
      } else {
        const key = arg.slice(2);
        if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
          flags[key] = args[i + 1];
          i++;
        } else {
          flags[key] = true;
        }
      }
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1);
      flags[key] = true;
    } else {
      positional.push(arg);
    }
  }

  if (positional.length > 0) {
    command = positional[0];
  } else if (flags.h || flags.help) {
    command = 'help';
  } else if (flags.v || flags.version) {
    command = 'version';
  }

  return { command, flags };
}

function fetchUrl(url: string, headers: Record<string, string> = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'GET',
        headers: {
          'User-Agent': 'GitInfoGraphics-CLI',
          ...headers
        }
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchUrl(res.headers.location, headers).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode && res.statusCode >= 400) {
          return reject(new Error(`HTTP ${res.statusCode} fetching ${url}`));
        }
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve(data));
      }
    );
    req.on('error', reject);
    req.end();
  });
}

async function fetchGitHubData(repoUrl: string): Promise<{ markdown: string; meta: GitHubMeta }> {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    throw new Error(`Invalid GitHub repository URL: ${repoUrl}`);
  }
  const owner = match[1];
  const repo = match[2].replace(/\.git$/, '');

  const repoJsonStr = await fetchUrl(`https://api.github.com/repos/${owner}/${repo}`);
  const repoData = JSON.parse(repoJsonStr);

  const defaultBranch = repoData.default_branch || 'main';
  let markdown = '';
  try {
    markdown = await fetchUrl(`https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/README.md`);
  } catch {
    markdown = await fetchUrl(`https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`);
  }

  const meta: GitHubMeta = {
    owner,
    repo,
    description: repoData.description || '',
    url: repoData.html_url || `https://github.com/${owner}/${repo}`,
    stars: repoData.stargazers_count || 0,
    forks: repoData.forks_count || 0,
    openIssues: repoData.open_issues_count || 0,
    watchers: repoData.watchers_count || 0,
    license: repoData.license?.spdx_id || repoData.license?.name || undefined,
    language: repoData.language || undefined,
    topics: repoData.topics || [],
    pushedAt: repoData.pushed_at || undefined
  };

  return { markdown, meta };
}

export async function runCLI(argv: string[] = process.argv.slice(2)): Promise<void> {
  const { command, flags } = parseArgs(argv);

  if (command === 'version' || flags.version || flags.v) {
    console.log('gitinfographics v1.0.0');
    return;
  }

  if (command === 'help' || flags.help || flags.h) {
    console.log(`
GitInfoGraphics CLI - Deterministic SVG Infographics from READMEs

USAGE:
  gitinfographics <command> [options]

COMMANDS:
  init                     Initialize a .gitinfographicsrc configuration file
  generate [options]       Generate an SVG infographic from a README or GitHub repo
  export [options]         Export infographic into SVG or specified target format
  watch [options]          Watch a README.md file and auto-regenerate infographic
  batch [options]          Process multiple repositories in a single run
  help                     Display this help information

OPTIONS:
  --input, -i <path>       Input markdown file path (default: ./README.md)
  --repo, -r <url>         GitHub repository URL (e.g., https://github.com/owner/repo)
  --output, -o <path>      Output file path (default: ./infographic.svg)
  --theme, -t <theme>      Theme: scandi-minimal | midnight | daylight | ember | forest
  --layout, -l <layout>    Layout mode: desktop | mobile (default: desktop)
  --format, -f <fmt>       Output format: svg | png | pdf (default: svg)
  --config, -c <path>      Custom config file path
  --qr                     Include QR code pointing to repository (default: on)
  --no-qr                  Disable QR code
  --repos <list>           Comma-separated list of GitHub repos for batch mode
  --list <file>            Text file containing repository URLs for batch mode
  --output-dir <dir>       Target directory for batch output (default: ./infographics)
`);
    return;
  }

  const config = loadConfigFile(typeof flags.config === 'string' ? flags.config : undefined);

  if (command === 'init') {
    const targetFile = path.resolve(process.cwd(), '.gitinfographicsrc.json');
    if (fs.existsSync(targetFile) && !flags.force) {
      console.log(`Config file already exists at ${targetFile}. Use --force to overwrite.`);
      return;
    }
    const sampleConfig: CLIConfig = {
      theme: 'scandi-minimal',
      layout: 'desktop',
      output: 'infographic.svg',
      format: 'svg',
      showQR: true,
      variants: {
        'problem-solution': 0,
        features: 0,
        stats: 0
      }
    };
    fs.writeFileSync(targetFile, JSON.stringify(sampleConfig, null, 2) + '\n', 'utf8');
    console.log(`Created configuration file at ${targetFile}`);
    return;
  }

  if (command === 'generate' || command === 'export') {
    const theme = (flags.theme as string) || config.theme || 'scandi-minimal';
    const layout = ((flags.layout as string) || config.layout || 'desktop') as 'desktop' | 'mobile';
    const outPath = (flags.output as string) || (flags.o as string) || config.output || 'infographic.svg';
    const showQR = flags['no-qr'] ? false : (flags.qr !== undefined ? Boolean(flags.qr) : (config.showQR ?? true));
    const repoUrl = (flags.repo as string) || (flags.r as string);
    const inputPath = (flags.input as string) || (flags.i as string) || './README.md';

    let markdown = '';
    let meta: GitHubMeta | undefined;

    if (repoUrl) {
      console.log(`Fetching repository data from ${repoUrl}...`);
      const res = await fetchGitHubData(repoUrl);
      markdown = res.markdown;
      meta = res.meta;
    } else {
      const fullInput = path.resolve(process.cwd(), inputPath);
      if (!fs.existsSync(fullInput)) {
        console.error(`Input file not found: ${fullInput}`);
        process.exit(1);
      }
      markdown = fs.readFileSync(fullInput, 'utf8');
    }

    console.log(`Building infographic spec (Theme: ${theme}, Layout: ${layout})...`);
    const parsed = parseMD(markdown);
    const spec = buildRuleSpec(parsed, config.variants, meta);

    const svg = renderSVG(spec, theme, {
      layout,
      showQR,
      qrUrl: meta?.url || config.qrUrl
    });

    const targetOutput = path.resolve(process.cwd(), outPath);
    const targetDir = path.dirname(targetOutput);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(targetOutput, svg, 'utf8');
    console.log(`Successfully generated infographic at: ${targetOutput} (${Buffer.byteLength(svg, 'utf8')} bytes)`);
    return;
  }

  if (command === 'watch') {
    const inputPath = (flags.input as string) || (flags.i as string) || './README.md';
    const outPath = (flags.output as string) || (flags.o as string) || config.output || 'infographic.svg';
    const theme = (flags.theme as string) || config.theme || 'scandi-minimal';
    const layout = ((flags.layout as string) || config.layout || 'desktop') as 'desktop' | 'mobile';
    const fullInput = path.resolve(process.cwd(), inputPath);

    if (!fs.existsSync(fullInput)) {
      console.error(`Watch target not found: ${fullInput}`);
      process.exit(1);
    }

    const rebuild = () => {
      try {
        const md = fs.readFileSync(fullInput, 'utf8');
        const parsed = parseMD(md);
        const spec = buildRuleSpec(parsed, config.variants);
        const svg = renderSVG(spec, theme, { layout, showQR: config.showQR ?? true });
        const targetOutput = path.resolve(process.cwd(), outPath);
        fs.writeFileSync(targetOutput, svg, 'utf8');
        console.log(`[${new Date().toLocaleTimeString()}] Rebuilt infographic -> ${targetOutput}`);
      } catch (err) {
        console.error(`[${new Date().toLocaleTimeString()}] Error rebuilding:`, err);
      }
    };

    rebuild();
    console.log(`Watching ${fullInput} for changes... (Press Ctrl+C to stop)`);
    let debounceTimer: NodeJS.Timeout | null = null;
    fs.watch(fullInput, () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(rebuild, 250);
    });
    return;
  }

  if (command === 'batch') {
    const outDir = path.resolve(process.cwd(), (flags['output-dir'] as string) || './infographics');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    let repoList: string[] = [];
    if (flags.repos && typeof flags.repos === 'string') {
      repoList = flags.repos.split(',').map((r) => r.trim()).filter(Boolean);
    } else if (flags.list && typeof flags.list === 'string') {
      const listFile = path.resolve(process.cwd(), flags.list);
      if (fs.existsSync(listFile)) {
        repoList = fs.readFileSync(listFile, 'utf8').split('\n').map((r) => r.trim()).filter(Boolean);
      }
    }

    if (repoList.length === 0) {
      console.error('Batch error: No repositories specified. Use --repos="owner/repo,owner/repo2" or --list=file.txt');
      process.exit(1);
    }

    console.log(`Starting batch processing for ${repoList.length} repositories into ${outDir}...`);
    const theme = (flags.theme as string) || config.theme || 'scandi-minimal';
    const layout = ((flags.layout as string) || config.layout || 'desktop') as 'desktop' | 'mobile';

    for (let i = 0; i < repoList.length; i++) {
      const r = repoList[i];
      const repoUrl = r.startsWith('http') ? r : `https://github.com/${r}`;
      console.log(`[${i + 1}/${repoList.length}] Processing ${repoUrl}...`);
      try {
        const { markdown, meta } = await fetchGitHubData(repoUrl);
        const parsed = parseMD(markdown);
        const spec = buildRuleSpec(parsed, config.variants, meta);
        const svg = renderSVG(spec, theme, { layout, showQR: true, qrUrl: meta.url });
        const fileName = `${meta.owner}_${meta.repo}.svg`;
        const dest = path.join(outDir, fileName);
        fs.writeFileSync(dest, svg, 'utf8');
        console.log(`  ✓ Saved ${dest}`);
      } catch (err) {
        console.error(`  ✕ Failed ${r}:`, err instanceof Error ? err.message : err);
      }
    }

    console.log(`Batch processing complete.`);
    return;
  }

  console.error(`Unknown command: ${command}. Run "gitinfographics help" for available commands.`);
  process.exit(1);
}

if (process.argv[1] && process.argv[1].endsWith('cli.ts') || process.argv[1]?.endsWith('gitinfographics.js')) {
  runCLI().catch((err) => {
    console.error('Fatal CLI Error:', err);
    process.exit(1);
  });
}
