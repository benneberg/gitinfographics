/**
 * Deterministic Semantic Icons for GitInfoGraphics Vector Engine
 * Pure SVG path definitions for Zero-DOM, Headless, and Browser execution.
 */

export interface IconOptions {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export const SVG_PATHS: Record<string, string> = {
  // Problems, alerts, warnings
  'alert-circle': 'M12 8v4m0 4h.01M22 12A10 10 0 1 1 2 12a10 10 0 0 1 20 0z',
  'alert-triangle': 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01',

  // Solutions, magic, highlights
  'sparkles': 'M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z',
  'sun': 'M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
  'lightbulb': 'M9 18h6m-5 4h4m-7-9a7 7 0 1 1 10 0c-.8 1.1-1.3 2-1.5 3H9.5c-.2-1-.7-1.9-1.5-3z',

  // Performance, metrics, analytics
  'zap': 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  'trending-up': 'M23 6l-9.5 9.5-5-5L1 18m22-12h-6m6 0v6',
  'activity': 'M22 12h-4l-3 9L9 3l-3 9H2',
  'bar-chart-3': 'M18 20V10M12 20V4M6 20v-6',
  'shield': 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  'layers': 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  'flask': 'M10 2v7.31M14 2v7.31m1.4 4.09l4.58 6.3A2 2 0 0 1 18.36 23H5.64a2 2 0 0 1-1.62-3.3l4.58-6.3a4 4 0 0 0 .8-2.39V2h5.2v7.31c0 .88.29 1.73.8 2.39z',

  // Core engine, classification, heuristics
  'cpu': 'M4 4h16v16H4zM9 9h6v6H9zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3',
  'search': 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm10 2l-4.35-4.35',

  // Workflows, CI/CD, GitHub Actions
  'refresh-cw': 'M23 4v6h-6M1 20v-6h6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15',
  'git-branch': 'M6 3v12M18 9a3 3 0 1 0-2.83-2H8.83A3 3 0 0 0 6 9v3a3 3 0 1 0 2 2.83V9h4.17A3 3 0 0 0 18 9z',

  // Dynamic layout, responsive
  'maximize-2': 'M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7',
  'palette': 'M12 2a10 10 0 1 0 10 10c0-1.1-.9-2-2-2h-2.5c-.8 0-1.5-.7-1.5-1.5 0-.4.2-.8.5-1.1.3-.3.5-.7.5-1.1 0-2.2-2.2-4.3-5-4.3z',

  // Terminal, code, CLI
  'terminal': 'M4 17l6-6-6-6M12 19h8',
  'code-2': 'M16 18l6-6-6-6M8 6l-6 6 6 6',

  // UI helpers & indicators
  'check': 'M20 6L9 17l-5-5',
  'check-circle': 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3',
  'copy': 'M8 4v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.242a2 2 0 0 0-.602-1.43L16.083 2.57A2 2 0 0 0 14.668 2H10a2 2 0 0 0-2 2zM4 8H2v12a2 2 0 0 0 2 2h12v-2',
  'arrow-down': 'M12 5v14M19 12l-7 7-7-7',
  'arrow-right': 'M5 12h14M12 5l7 7-7 7',
  'star': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  'github': 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22',
};

/**
 * Returns an inline SVG element or `<path>` element
 */
export function renderSvgIcon(
  name: string,
  options: IconOptions = {}
): string {
  const path = SVG_PATHS[name] || SVG_PATHS['sparkles'];
  const size = options.size || 16;
  const color = options.color || 'currentColor';
  const sw = options.strokeWidth || 2;
  const cls = options.className ? ` class="${options.className}"` : '';

  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"${cls} aria-hidden="true"><path d="${path}"/></svg>`;
}

/**
 * Returns `<g>` element with transform and path for direct inclusion in SVG without nested SVG
 */
export function renderIconPathGroup(
  name: string,
  x: number,
  y: number,
  options: IconOptions = {}
): string {
  const path = SVG_PATHS[name] || SVG_PATHS['sparkles'];
  const size = options.size || 16;
  const color = options.color || 'currentColor';
  const sw = options.strokeWidth || 2;
  const scale = size / 24;

  return `<g transform="translate(${x}, ${y}) scale(${scale})" stroke="${color}" stroke-width="${sw / scale}" stroke-linecap="round" stroke-linejoin="round" fill="none" aria-hidden="true"><path d="${path}"/></g>`;
}

/**
 * Semantic icon mapper based on section type
 */
export function getSectionIcon(secType: string): string {
  switch (secType) {
    case 'problem-solution':
      return 'alert-circle';
    case 'stats':
      return 'bar-chart-3';
    case 'features':
      return 'zap';
    case 'tech-stack':
      return 'code-2';
    case 'steps':
      return 'terminal';
    case 'timeline':
      return 'git-branch';
    case 'comparison':
      return 'layers';
    case 'callout':
      return 'sparkles';
    default:
      return 'sparkles';
  }
}

/**
 * Semantic icon mapper for individual feature items based on title keywords
 */
export function getFeatureIcon(title: string, index: number = 0): string {
  const t = title.toLowerCase();
  if (t.includes('client') || t.includes('fast') || t.includes('speed') || t.includes('latency') || t.includes('instant') || t.includes('real-time') || t.includes('perform')) {
    return 'zap';
  }
  if (t.includes('heuristic') || t.includes('rule') || t.includes('classif') || t.includes('engine') || t.includes('core') || t.includes('ast') || t.includes('parse')) {
    return 'cpu';
  }
  if (t.includes('metric') || t.includes('mine') || t.includes('extract') || t.includes('stat') || t.includes('analytic') || t.includes('search')) {
    return 'search';
  }
  if (t.includes('action') || t.includes('workflow') || t.includes('ci') || t.includes('git') || t.includes('pipeline') || t.includes('deploy') || t.includes('sync')) {
    return 'refresh-cw';
  }
  if (t.includes('height') || t.includes('dynamic') || t.includes('layout') || t.includes('responsive') || t.includes('mobile') || t.includes('reflow') || t.includes('adapt')) {
    return 'maximize-2';
  }
  if (t.includes('theme') || t.includes('design') || t.includes('style') || t.includes('color') || t.includes('dark') || t.includes('minimal') || t.includes('scandi')) {
    return 'palette';
  }
  if (t.includes('security') || t.includes('safe') || t.includes('guard') || t.includes('test') || t.includes('coverage') || t.includes('zero-telemetry')) {
    return 'shield';
  }
  if (t.includes('install') || t.includes('quick') || t.includes('cli') || t.includes('terminal') || t.includes('setup') || t.includes('command')) {
    return 'terminal';
  }

  // Fallback cyclic selection
  const cyclic = ['check-circle', 'cpu', 'search', 'refresh-cw', 'maximize-2', 'palette'];
  return cyclic[index % cyclic.length];
}

/**
 * Semantic icon mapper for metric items
 */
export function getMetricIcon(label: string, index: number = 0): string {
  const l = label.toLowerCase();
  if (l.includes('latency') || l.includes('time') || l.includes('speed') || l.includes('ms') || l.includes('fast')) {
    return 'zap';
  }
  if (l.includes('retention') || l.includes('growth') || l.includes('star') || l.includes('engagement') || l.includes('user') || l.includes('improv')) {
    return 'trending-up';
  }
  if (l.includes('coverage') || l.includes('test') || l.includes('security') || l.includes('audit') || l.includes('pass')) {
    return 'shield';
  }
  if (l.includes('engine') || l.includes('version') || l.includes('core') || l.includes('ast') || l.includes('build')) {
    return 'layers';
  }
  if (l.includes('uptime') || l.includes('load') || l.includes('rate')) {
    return 'activity';
  }

  const cyclic = ['zap', 'trending-up', 'shield', 'layers'];
  return cyclic[index % cyclic.length];
}

/**
 * Technology stack dot colors
 */
export const TECH_COLORS: Record<string, string> = {
  'typescript': '#3178C6',
  'javascript': '#F7DF1E',
  'react': '#61DAFB',
  'node.js': '#339933',
  'node': '#339933',
  'tailwindcss': '#38BDF8',
  'tailwind': '#38BDF8',
  'vite': '#646CFF',
  'python': '#3776AB',
  'rust': '#DEA584',
  'go': '#00ADD8',
  'golang': '#00ADD8',
  'docker': '#2496ED',
  'graphql': '#E10098',
  'vue': '#42B883',
  'next.js': '#000000',
  'vitest': '#FCC72B',
  'html': '#E34F26',
  'css': '#1572B6',
  'c++': '#00599C',
  'ruby': '#CC342D',
  'java': '#ED8B00',
};

export function getTechColor(techName: string, fallbackColor: string = '#10B981'): string {
  const key = techName.trim().toLowerCase();
  return TECH_COLORS[key] || fallbackColor;
}
