import { BadgeItem, FeatureItem, MetricItem, ParsedDoc } from './types';

export function trunc(s: string, max: number): string {
  if (!s) return '';
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

/**
 * Strips markdown links, bold, italics, code fences, blockquotes, bullets, and URLs
 */
export function cleanMarkdownText(s: string): string {
  if (!s) return '';
  return s
    // Strip leading blockquotes
    .replace(/^>+\s*/, '')
    // Strip markdown links [label](url) -> label
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Strip bare angle links <https://...>
    .replace(/<https?:\/\/[^>]+>/g, '')
    // Strip bold & italic markers
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Strip inline code `code` -> code
    .replace(/`([^`]+)`/g, '$1')
    // Strip leading list bullet chars or checkboxes (requires space so **bold is preserved)
    .replace(/^(\s*[-*+•]|\s*\d+\.)\s+/, '')
    .replace(/^\[[ xX]\]\s*/, '')
    // Clean any stray asterisks
    .replace(/\*+/g, '')
    // Clean redundant spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 3. Advanced Metric Extraction
 * Refinements:
 * - Cleaner canonical labels.
 * - Better number normalization.
 * - Range / “X per Y” / multiplier support.
 * - Label normalization for deduplication.
 * - Strict rejection of false positives (e.g. "0 Increase", bare numbers).
 */
export function extractMetrics(text: string): MetricItem[] {
  if (!text) return [];
  const metrics: MetricItem[] = [];

  interface MetricPattern {
    re: RegExp;
    label?: string;
    labelFn?: (m: RegExpExecArray) => string;
  }

  const patterns: MetricPattern[] = [
    { re: /(\d{1,3}(?:\.\d+)?)\s*%?\s*(?:uptime|availability|reliability)/gi, label: 'Uptime' },
    { re: /(\d{1,3}(?:\.\d+)?)\s*%?\s*(?:coverage|test\s*coverage|code\s*coverage|covered)/gi, label: 'Coverage' },
    { re: /(\d{1,3}(?:\.\d+)?)\s*%?\s*(?:accuracy|pass\s*rate)/gi, label: 'Accuracy' },
    {
      re: /(\d+(?:\.\d+)?[kKmMbB]?)\+?\s*(users?|customers?|downloads?|stars?|installs?|developers?|teams?|subscribers?|repos?|contributors?|members?)/gi,
      labelFn: (m) => m[2].charAt(0).toUpperCase() + m[2].slice(1)
    },
    {
      re: /(\d+(?:\.\d+)?[kKmMbB]?)\+?\s*(deployments?|transactions?|requests?|calls?|events?|messages?|builds?|releases?|integrations?|plugins?|components?|templates?|languages?|providers?|endpoints?|visitors?|views?|clones?)/gi,
      labelFn: (m) => m[2].charAt(0).toUpperCase() + m[2].slice(1)
    },
    { re: /(\d+(?:\.\d+)?)\s*(ms|seconds?|sec|milliseconds?|minutes?|hrs?|hours?)\b(?!\s*(old|ago|since|before))/gi, label: 'Latency' },
    {
      re: /(\d+(?:\.\d+)?)\s*%?\s*(reduction|improvement|increase|faster|savings?|cheaper|growth|boost|cut|drop|decrease)/gi,
      labelFn: (m) => m[2].charAt(0).toUpperCase() + m[2].slice(1)
    },
    {
      re: /(?:under|less\s+than|within|in)\s*(\d+(?:\.\d+)?)\s*(minutes?|hours?|seconds?|days?|weeks?|months?)/gi,
      labelFn: (m) => '< ' + m[1] + ' ' + m[2]
    },
    { re: /(?:version|v)\s*(\d+\.\d+(?:\.\d+)?)/gi, label: 'Version' },
    { re: /\$?(\d+(?:\.\d+)?)[kKmM]?\s*(?:funding|raised|grant|budget|revenue|mrr|arr)/gi, label: 'Raised' },
    {
      re: /(\d+(?:\.\d+)?)\s*(GB|TB|MB|PB|lines?|files?|modules?|packages?|dependencies?)/gi,
      labelFn: (m) => m[2]
    },
    {
      re: /(\d+)\s*(?:commits?|pull\s*requests?|prs?|issues?|bugs?|releases?|versions?)/gi,
      labelFn: (m) => m[2].charAt(0).toUpperCase() + m[2].slice(1)
    },
    // Ranges & multipliers
    { re: /(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*(ms|s|sec|seconds?)/gi, label: 'Latency Range' },
    { re: /(\d+(?:\.\d+)?)\s*[x×]\s*(faster|speedup|improvement)/gi, label: 'Speedup' }
  ];

  patterns.forEach((p) => {
    const rx = new RegExp(p.re.source, p.re.flags);
    let m: RegExpExecArray | null;
    while ((m = rx.exec(text)) !== null) {
      let value = m[1];
      const label = p.label || (p.labelFn ? p.labelFn(m) : 'Metric');

      // Simple number cleanup
      if (/[kKmMbB]$/.test(value)) {
        // keep as-is for display
      } else if (!isNaN(parseFloat(value))) {
        value = String(parseFloat(value));
      }
      metrics.push({ value, label });
    }
  });

  // Deduplicate with normalized labels
  const seen: Record<string, boolean> = {};
  return metrics.filter((m) => {
    const key = (m.label || '').toLowerCase().replace(/s$/, '');
    if (seen[key]) return false;
    seen[key] = true;
    return true;
  });
}

/**
 * 9. Badge -> metric mining
 */
export function extractMetricsFromBadges(badges: BadgeItem[]): MetricItem[] {
  const metrics: MetricItem[] = [];
  (badges || []).forEach((b) => {
    const alt = (b.alt || '') + ' ' + (b.url || '');
    // Supports "95% coverage" OR "coverage-95%" / "Coverage: 95%"
    const m1 = alt.match(/(\d+(?:\.\d+)?[kKmM%+]?)\s*(stars?|forks?|issues?|coverage|version|license|build|downloads?)/i);
    const m2 = alt.match(/(stars?|forks?|issues?|coverage|version|license|build|downloads?)[-:\s/_]+(\d+(?:\.\d+)?[kKmM%+]?)/i);

    const m = m1 ? { val: m1[1], lbl: m1[2] } : m2 ? { val: m2[2], lbl: m2[1] } : null;
    if (m) {
      const val = m.val;
      if (val === '0' && !/build|issues/i.test(m.lbl)) return;
      metrics.push({
        value: val,
        label: m.lbl.charAt(0).toUpperCase() + m.lbl.slice(1).toLowerCase()
      });
    }
  });
  return metrics;
}

/**
 * 4. Smarter Feature Extraction
 * Extracts clean title & description from bold, links, bullets, colons, checkboxes
 * Strips all markdown syntax so titles like `[PURPOSE.md](./PURPOSE.md)` become clean `PURPOSE.md`.
 */
export function splitFeat(text: string): FeatureItem {
  if (!text) return { title: '', description: '' };

  // Strip leading bullets, numbers, checkboxes, and emojis
  let clean = text.replace(/^[\s•\-*+]+/, '').trim();

  // Checkbox: [x] or [ ]
  const check = clean.match(/^\[(?:x|X| )?\]\s*(.+)$/);
  if (check) return splitFeat(check[1]);

  // Strip leading emojis
  clean = clean.replace(/^[\p{Extended_Pictographic}\s\u2600-\u27BF\uD83C-\uDBFF\uDC00-\uDFFF]+/u, '').trim();

  // Markdown link as title: [PURPOSE.md](./PURPOSE.md): Description
  const linkWithDesc = clean.match(/^\[([^\]]+)\]\([^)]+\)\s*(?:[—–:-]\s*)?(.*)$/);
  if (linkWithDesc) {
    const title = cleanMarkdownText(linkWithDesc[1]);
    const desc = cleanMarkdownText(linkWithDesc[2]);
    return { title: trunc(title, 42), description: desc };
  }

  // Bold title
  const bold = clean.match(/^\*\*([^*]+)\*\*\s*[—–:-]\s*(.+)$/);
  if (bold) {
    return {
      title: trunc(cleanMarkdownText(bold[1]), 42),
      description: cleanMarkdownText(bold[2])
    };
  }

  // Dash / em-dash / colon
  const sep = clean.match(/^(.+?)\s*[—–:-]\s*(.+)$/);
  if (sep) {
    const t = cleanMarkdownText(sep[1]);
    const d = cleanMarkdownText(sep[2]);
    if (t.length > 2 && d.length > 5 && !/^https?:/i.test(t)) {
      return { title: trunc(t, 42), description: d };
    }
  }

  const col = clean.match(/^([^:]+)\s*:\s*(.+)$/);
  if (col) {
    const ct = cleanMarkdownText(col[1]);
    const cd = cleanMarkdownText(col[2]);
    if (ct.length > 2 && cd.length > 5 && !/^https?:/i.test(ct)) {
      return { title: trunc(ct, 42), description: cd };
    }
  }

  const c = cleanMarkdownText(clean.replace(/\*+/g, '').trim());
  if (c.length > 70) return { title: trunc(c, 65), description: '' };
  return { title: c, description: '' };
}

export const TECH_KW: string[] = [
  'TypeScript', 'JavaScript', 'Python', 'Rust', 'Go', 'Golang', 'Node.js', 'React',
  'Next.js', 'Vue.js', 'Svelte', 'TailwindCSS', 'PostgreSQL', 'MySQL', 'SQLite',
  'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'FastAPI', 'Flask', 'Django',
  'Express', 'Vite', 'GraphQL', 'REST API', 'WebAssembly', 'OpenAI', 'Gemini',
  'PyTorch', 'TensorFlow', 'Apache Kafka', 'RabbitMQ', 'AWS', 'GCP', 'Azure',
  'Cloudflare', 'Prisma', 'Drizzle', 'Webpack', 'Rollup', 'esbuild', 'Bun', 'Deno'
];

/**
 * 4. Smarter Tech Extraction
 * Looks for keywords, package.json dependencies, requirements.txt, Dockerfiles, and file extensions
 */
export function extractTechAdvanced(doc: ParsedDoc): string[] {
  const found: string[] = [];
  const seen: Record<string, boolean> = {};

  function add(name: string) {
    if (!name) return;
    const key = name.toLowerCase();
    if (seen[key] || name.length < 2) return;
    // Light filtering of noise
    if (/^(name|version|description|main|scripts|dependencies|devdependencies|private|license)$/i.test(name)) return;
    seen[key] = true;
    found.push(name);
  }

  const allText = (doc.title || '') + ' ' + (doc.subtitle || '') + ' ' +
    (doc.sections || []).map((s) => {
      return (s.title || '') + ' ' + (s.rawText || '') + ' ' + (s.lists || []).join(' ');
    }).join(' ');
  const low = allText.toLowerCase();

  // Keyword list
  TECH_KW.forEach((t) => {
    const esc = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp('\\b' + esc + '\\b', 'i').test(low)) add(t);
  });

  // Code blocks – dependency manifests
  (doc.sections || []).forEach((sec) => {
    (sec.codeBlocks || []).forEach((block) => {
      const content = (block.lines || []).join('\n');
      const lang = (block.lang || '').toLowerCase();

      // package.json style
      if (lang === 'json' || /"dependencies"\s*:|"devDependencies"\s*:/.test(content)) {
        const depBlock = content.match(/"(?:dev)?[Dd]ependencies"\s*:\s*\{([^}]+)\}/g);
        if (depBlock) {
          depBlock.forEach((blockStr) => {
            const pkgs = blockStr.match(/"([^"]+)"\s*:\s*"[^"]+"/g) || [];
            pkgs.forEach((p) => {
              const name = (p.match(/"([^"]+)"/) || [])[1];
              if (name && !name.startsWith('@types/')) {
                add(name.replace(/^@[^/]+\//, '') || name);
              }
            });
          });
        }
      }

      // requirements.txt / Pipfile style
      if (/^[a-z0-9_.-]+(?:==|>=|<=|~=|!=)/mi.test(content)) {
        (block.lines || []).forEach((line) => {
          const pkg = line.trim().split(/[=<>!~#;]/)[0].trim();
          if (pkg && pkg.length > 1) add(pkg);
        });
      }

      // Dockerfile
      const froms = content.match(/FROM\s+([a-z0-9_./-]+(?::[a-z0-9_.-]+)?)/gi) || [];
      froms.forEach((m) => {
        const img = m.replace(/FROM\s+/i, '').split(':')[0];
        if (img && !/^(scratch|alpine|ubuntu|debian|node|python|golang)$/i.test(img)) add(img);
      });
    });
  });

  // File extensions
  const extMap: Record<string, string> = {
    js: 'JavaScript', ts: 'TypeScript', jsx: 'React', tsx: 'React',
    py: 'Python', go: 'Go', rs: 'Rust', java: 'Java', kt: 'Kotlin',
    swift: 'Swift', cpp: 'C++', rb: 'Ruby', php: 'PHP', ex: 'Elixir',
    hs: 'Haskell', zig: 'Zig', sql: 'SQL', yml: 'YAML', yaml: 'YAML',
    toml: 'TOML', dockerfile: 'Docker'
  };
  const extMatches = allText.match(/`[^`]*\.(js|ts|jsx|tsx|py|go|rs|java|kt|swift|cpp|c|h|rb|php|ex|hs|zig|sql|yml|yaml|toml|dockerfile)`/gi) || [];
  extMatches.forEach((m) => {
    const ext = (m.match(/\.(\w+)`/) || [])[1];
    if (ext && extMap[ext]) add(extMap[ext]);
  });

  return found.slice(0, 16);
}
