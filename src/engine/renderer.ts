import { InfographicSpec, SpecSection, ThemeConfig, RenderOptions } from './types';
import { getTheme, DEFAULT_FF } from './themes';
import { trunc } from './extractors';

export const WIDTH = 880;
export const PAD = 40;
export const CW = WIDTH - PAD * 2; // 800
export const BASE_GAP = 28;

export const MOBILE_WIDTH = 400;
export const MOBILE_PAD = 16;
export const MOBILE_CW = MOBILE_WIDTH - MOBILE_PAD * 2; // 368
export const MOBILE_BASE_GAP = 18;

export function esc(s: string | number | null | undefined): string {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function wrapT(text: string, maxChars: number): string[] {
  if (!text) return [];
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let cur = '';

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (!cur) {
      cur = w;
    } else if ((cur + ' ' + w).length <= maxChars) {
      cur += ' ' + w;
    } else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

export interface RenderResult {
  svg: string;
  height: number;
}

/**
 * 6. Dynamic SVG Layout Engine
 * Calculates heights dynamically, renders scalable, beautiful vector graphic.
 * Supports both Desktop multi-column layout and genuine Mobile responsive layout.
 */
export function renderSVG(spec: InfographicSpec, tn?: string, options?: RenderOptions): string {
  if (options?.layout === 'mobile') {
    return renderMobileSVG(spec, tn);
  }
  return renderDesktopSVG(spec, tn);
}

export function renderDesktopSVG(spec: InfographicSpec, tn?: string): string {
  const t = getTheme(tn);
  const ff = t._font || t.fontFamily || DEFAULT_FF;
  const gap = spec.sections.length > 5 ? 24 : spec.sections.length > 3 ? 30 : BASE_GAP;
  let y = PAD;
  const parts: string[] = [];

  const defs = `
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=Fira+Code:wght@400;500;600&amp;display=swap');
      .font-sans { font-family: ${ff}; }
      .font-mono { font-family: 'Fira Code', monospace; }
    </style>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${t.accent}" />
      <stop offset="100%" stop-color="${t.accent2}" />
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${t.cardBg}" />
      <stop offset="100%" stop-color="${t.cardBg}" stop-opacity="0.95" />
    </linearGradient>
    <filter id="softShadow" x="-2%" y="-2%" width="104%" height="106%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000000" flood-opacity="${t.isDark ? '0.22' : '0.04'}" />
    </filter>
    <clipPath id="cardClip">
      <rect rx="12" ry="12" width="${CW}" height="500" />
    </clipPath>
  </defs>`;

  // 1. Hero
  const hero = rHero(spec, t, y);
  parts.push(hero.svg);
  y += hero.height;

  // 2. Sections
  for (let si = 0; si < spec.sections.length; si++) {
    const sec = spec.sections[si];
    y += gap;
    let rendered: RenderResult;
    switch (sec.type) {
      case 'stats':
        rendered = rStats(sec, t, y);
        break;
      case 'problem-solution':
        rendered = rPS(sec, t, y);
        break;
      case 'features':
        rendered = rFeats(sec, t, y);
        break;
      case 'tech-stack':
        rendered = rTech(sec, t, y);
        break;
      case 'steps':
        rendered = rSteps(sec, t, y);
        break;
      case 'content-list':
        rendered = rCL(sec, t, y);
        break;
      case 'content-block':
        rendered = rCB(sec, t, y);
        break;
      default:
        rendered = { svg: '', height: 0 };
    }
    parts.push(rendered.svg);
    y += rendered.height;
  }

  // 3. Footer
  y += gap;
  const foot = rFoot(t, y);
  parts.push(foot.svg);
  y += foot.height;

  const totalHeight = y + PAD;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${totalHeight}" width="100%" height="auto" preserveAspectRatio="xMidYMid meet" style="max-width: 100%; height: auto; display: block; background-color:${t.bg}; border-radius: 16px;">
  <title>${esc(spec.title)} - Infographic</title>
  <desc>${esc(spec.subtitle || 'Auto-generated repository infographic by GitInfoGraphics')}</desc>
  ${defs}
  <!-- Background rect with clean hairline border -->
  <rect width="${WIDTH}" height="${totalHeight}" rx="16" fill="${t.bg}"/>
  <rect width="${WIDTH - 2}" height="${totalHeight - 2}" x="1" y="1" rx="15" fill="none" stroke="${t.cardBorder}" stroke-width="1"/>
  ${parts.join('\n')}
</svg>`;
}

/**
 * Genuine Mobile Layout Engine (400px width)
 * Not desktop minimized:
 * - 2x2 grid for stats with large readable numbers
 * - Vertically stacked Problem -> Solution cards (full-width 368px)
 * - Single-column feature cards with comfortable padding and legible typography
 * - 2-column tech stack pills
 * - Single-column installation steps along timeline
 */
export function renderMobileSVG(spec: InfographicSpec, tn?: string): string {
  const t = getTheme(tn);
  const ff = t._font || t.fontFamily || DEFAULT_FF;
  const gap = spec.sections.length > 5 ? 16 : MOBILE_BASE_GAP;
  let y = MOBILE_PAD;
  const parts: string[] = [];

  const defs = `
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=Fira+Code:wght@400;500;600&amp;display=swap');
      .font-sans { font-family: ${ff}; }
      .font-mono { font-family: 'Fira Code', monospace; }
    </style>
    <linearGradient id="accentGradM" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${t.accent}" />
      <stop offset="100%" stop-color="${t.accent2}" />
    </linearGradient>
    <linearGradient id="cardGradM" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${t.cardBg}" />
      <stop offset="100%" stop-color="${t.cardBg}" stop-opacity="0.95" />
    </linearGradient>
    <filter id="softShadowM" x="-3%" y="-3%" width="106%" height="108%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000000" flood-opacity="${t.isDark ? '0.22' : '0.04'}" />
    </filter>
  </defs>`;

  // 1. Hero
  const hero = rHeroMobile(spec, t, y);
  parts.push(hero.svg);
  y += hero.height;

  // 2. Sections
  for (let si = 0; si < spec.sections.length; si++) {
    const sec = spec.sections[si];
    y += gap;
    let rendered: RenderResult;
    switch (sec.type) {
      case 'stats':
        rendered = rStatsMobile(sec, t, y);
        break;
      case 'problem-solution':
        rendered = rPSMobile(sec, t, y);
        break;
      case 'features':
        rendered = rFeatsMobile(sec, t, y);
        break;
      case 'tech-stack':
        rendered = rTechMobile(sec, t, y);
        break;
      case 'steps':
        rendered = rStepsMobile(sec, t, y);
        break;
      case 'content-list':
        rendered = rCLMobile(sec, t, y);
        break;
      case 'content-block':
        rendered = rCBMobile(sec, t, y);
        break;
      default:
        rendered = { svg: '', height: 0 };
    }
    parts.push(rendered.svg);
    y += rendered.height;
  }

  // 3. Footer
  y += gap;
  const foot = rFootMobile(t, y);
  parts.push(foot.svg);
  y += foot.height;

  const totalHeight = y + MOBILE_PAD;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MOBILE_WIDTH} ${totalHeight}" width="100%" height="auto" preserveAspectRatio="xMidYMid meet" style="max-width: 100%; height: auto; display: block; background-color:${t.bg}; border-radius: 16px;">
  <title>${esc(spec.title)} - Mobile Infographic</title>
  <desc>${esc(spec.subtitle || 'Auto-generated mobile repository infographic by GitInfoGraphics')}</desc>
  ${defs}
  <!-- Background rect with clean hairline border -->
  <rect width="${MOBILE_WIDTH}" height="${totalHeight}" rx="16" fill="${t.bg}"/>
  <rect width="${MOBILE_WIDTH - 2}" height="${totalHeight - 2}" x="1" y="1" rx="15" fill="none" stroke="${t.cardBorder}" stroke-width="1"/>
  ${parts.join('\n')}
</svg>`;
}


export function rHero(spec: InfographicSpec, t: ThemeConfig, y: number): RenderResult {
  const title = spec.title || 'Repository Overview';
  const titleLines = wrapT(title, 44);
  const titleLineH = 34;
  const titleHeight = titleLines.length * titleLineH;

  const subLines = spec.subtitle ? wrapT(spec.subtitle, 72).slice(0, 4) : [];
  const lineH = 22;
  const subHeight = subLines.length * lineH;
  const h = 42 + titleHeight + (subLines.length ? subHeight + 14 : 0) + 16;

  let svg = `<g id="sec-hero" class="font-sans">
    <!-- Top badge -->
    <rect x="${PAD}" y="${y}" width="160" height="24" rx="6" fill="${t.badgeBg}" stroke="${t.cardBorder}" stroke-width="1"/>
    <text x="${PAD + 12}" y="${y + 16}" font-size="10.5" font-weight="700" fill="${t.badgeText}" letter-spacing="1.2">GITINFOGRAPHICS</text>
    <circle cx="${PAD + 146}" cy="${y + 12}" r="2.5" fill="${t.accent}"/>
  `;

  // Main Title (dynamic multi-line wrapping so long titles never overflow)
  for (let i = 0; i < titleLines.length; i++) {
    svg += `<text x="${PAD}" y="${y + 54 + i * titleLineH}" font-size="28" font-weight="800" fill="${t.text}" letter-spacing="-0.5">${esc(titleLines[i])}</text>`;
  }

  // Subtitle
  const subStartY = y + 54 + titleHeight + 4;
  if (subLines.length) {
    for (let i = 0; i < subLines.length; i++) {
      svg += `<text x="${PAD}" y="${subStartY + i * lineH}" font-size="14.5" font-weight="400" fill="${t.textMuted}">${esc(subLines[i])}</text>`;
    }
  }

  // Scandinavian hairline rule divider
  const lineY = y + h - 6;
  svg += `
    <line x1="${PAD}" y1="${lineY}" x2="${PAD + CW}" y2="${lineY}" stroke="${t.cardBorder}" stroke-width="1"/>
  </g>`;

  return { svg, height: h };
}

export function rStats(
  s: { id: string; type: 'stats'; items: { value: string; label: string }[] },
  t: ThemeConfig,
  y: number
): RenderResult {
  const n = Math.min(s.items.length, 4);
  if (n === 0) return { svg: '', height: 0 };

  const g = 14;
  const cw = (CW - g * (n - 1)) / n;
  const h = 104;

  let svg = `<g id="sec-stats" class="font-sans">
    <text x="${PAD}" y="${y + 16}" font-size="10.5" font-weight="700" fill="${t.accent}" letter-spacing="1.5">KEY METRICS</text>
  `;

  for (let i = 0; i < n; i++) {
    const it = s.items[i];
    const x = PAD + i * (cw + g);
    const cardY = y + 26;
    const cardH = h - 26;

    svg += `
    <g transform="translate(${x}, ${cardY})">
      <rect width="${cw}" height="${cardH}" rx="10" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1" filter="url(#softShadow)"/>
      <text x="${cw / 2}" y="36" text-anchor="middle" font-size="24" font-weight="800" fill="${t.text}">${esc(it.value)}</text>
      <text x="${cw / 2}" y="56" text-anchor="middle" font-size="12" font-weight="600" fill="${t.textMuted}" letter-spacing="0.3">${esc(it.label)}</text>
    </g>`;
  }

  svg += `</g>`;
  return { svg, height: h };
}

export function rPS(
  s: {
    id: string;
    type: 'problem-solution';
    problem: string;
    solution: string;
    problemTitle: string;
    solutionTitle: string;
  },
  t: ThemeConfig,
  y: number
): RenderResult {
  const aw = 44; // Arrow width
  const bw = (CW - aw) / 2;
  const pl = wrapT(s.problem, 44);
  const sl = wrapT(s.solution, 44);
  const maxLines = Math.max(pl.length, sl.length, 3);
  const bh = Math.max(104, 60 + maxLines * 20);
  const by = y + 26;
  const h = bh + 30;

  let svg = `<g id="sec-problem-solution" class="font-sans">
    <text x="${PAD}" y="${y + 16}" font-size="10.5" font-weight="700" fill="${t.accent}" letter-spacing="1.5">PROBLEM → SOLUTION</text>

    <!-- Problem Box -->
    <g transform="translate(${PAD}, ${by})">
      <rect width="${bw}" height="${bh}" rx="10" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1" filter="url(#softShadow)"/>
      <rect x="20" y="16" width="68" height="18" rx="4" fill="${t.badgeBg}" stroke="${t.cardBorder}" stroke-width="1"/>
      <text x="54" y="29" text-anchor="middle" font-size="9.5" font-weight="700" fill="${t.textMuted}" letter-spacing="1">PROBLEM</text>
      <text x="20" y="52" font-size="14" font-weight="700" fill="${t.text}">${esc(s.problemTitle || 'The Challenge')}</text>
  `;

  for (let i = 0; i < pl.length; i++) {
    svg += `<text x="20" y="${74 + i * 20}" font-size="13" font-weight="400" fill="${t.textMuted}">${esc(pl[i])}</text>`;
  }
  svg += `</g>`;

  // Middle Arrow indicator
  const ax = PAD + bw + (aw - 24) / 2;
  const ay = by + bh / 2;
  svg += `
    <g transform="translate(${ax}, ${ay - 12})">
      <circle cx="12" cy="12" r="13" fill="${t.badgeBg}" stroke="${t.cardBorder}" stroke-width="1"/>
      <path d="M8 12h8m-3-3l3 3-3 3" stroke="${t.accent}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </g>`;

  // Solution Box
  const sx = PAD + bw + aw;
  svg += `
    <g transform="translate(${sx}, ${by})">
      <rect width="${bw}" height="${bh}" rx="10" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1" filter="url(#softShadow)"/>
      <rect x="20" y="16" width="70" height="18" rx="4" fill="${t.badgeBg}" stroke="${t.cardBorder}" stroke-width="1"/>
      <text x="55" y="29" text-anchor="middle" font-size="9.5" font-weight="700" fill="${t.text}" letter-spacing="1">SOLUTION</text>
      <text x="20" y="52" font-size="14" font-weight="700" fill="${t.text}">${esc(s.solutionTitle || 'The Solution')}</text>
  `;

  for (let i = 0; i < sl.length; i++) {
    svg += `<text x="20" y="${74 + i * 20}" font-size="13" font-weight="400" fill="${t.text}">${esc(sl[i])}</text>`;
  }
  svg += `</g></g>`;

  return { svg, height: h };
}

export function rFeats(
  s: {
    id: string;
    type: 'features';
    title: string;
    columns?: number;
    items: { title: string; description: string }[];
  },
  t: ThemeConfig,
  y: number
): RenderResult {
  const cols = s.columns || (s.items.length <= 4 ? 2 : 3);
  const g = 14;
  const cw = (CW - g * (cols - 1)) / cols;
  const baseCardH = 88;
  const rows = Math.ceil(s.items.length / cols);

  let maxDescLines = 2;
  s.items.forEach((it) => {
    if (it.description) {
      maxDescLines = Math.max(maxDescLines, wrapT(it.description, cols === 2 ? 46 : 34).length);
    }
  });

  const ch = baseCardH + Math.max(0, (maxDescLines - 2) * 18);
  const h = 34 + rows * ch + (rows - 1) * g;

  let svg = `<g id="sec-features" class="font-sans">
    <text x="${PAD}" y="${y + 16}" font-size="10.5" font-weight="700" fill="${t.accent}" letter-spacing="1.5">${esc(s.title.toUpperCase())}</text>
  `;

  for (let i = 0; i < s.items.length; i++) {
    const it = s.items[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = PAD + col * (cw + g);
    const cy = y + 28 + row * (ch + g);

    svg += `
    <g transform="translate(${cx}, ${cy})">
      <rect width="${cw}" height="${ch}" rx="10" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1" filter="url(#softShadow)"/>
      <circle cx="18" cy="22" r="3" fill="${t.accent}"/>
      <text x="30" y="26" font-size="13.5" font-weight="700" fill="${t.text}">${esc(trunc(it.title, cols === 2 ? 46 : 32))}</text>
    `;

    if (it.description) {
      const dl = wrapT(it.description, cols === 2 ? 48 : 36).slice(0, 4);
      for (let li = 0; li < dl.length; li++) {
        svg += `<text x="30" y="${46 + li * 17}" font-size="12" font-weight="400" fill="${t.textMuted}">${esc(dl[li])}</text>`;
      }
    }
    svg += `</g>`;
  }

  svg += `</g>`;
  return { svg, height: h };
}

export function rTech(
  s: { id: string; type: 'tech-stack'; title: string; items: string[] },
  t: ThemeConfig,
  y: number
): RenderResult {
  const cols = 4;
  const g = 10;
  const bw = (CW - g * (cols - 1)) / cols;
  const bh = 36;
  const rows = Math.ceil(s.items.length / cols);
  const h = 34 + rows * bh + (rows - 1) * g;

  let svg = `<g id="sec-tech-stack" class="font-sans">
    <text x="${PAD}" y="${y + 16}" font-size="11" font-weight="700" fill="${t.accent}" letter-spacing="1.5">${esc(s.title.toUpperCase())}</text>
  `;

  for (let i = 0; i < s.items.length; i++) {
    const tech = s.items[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const bx = PAD + col * (bw + g);
    const by = y + 28 + row * (bh + g);

    svg += `
    <g transform="translate(${bx}, ${by})">
      <rect width="${bw}" height="${bh}" rx="8" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1"/>
      <circle cx="14" cy="18" r="3.5" fill="${t.accent2}"/>
      <text x="26" y="22" font-size="12" font-weight="600" fill="${t.text}">${esc(tech)}</text>
    </g>`;
  }

  svg += `</g>`;
  return { svg, height: h };
}

export function rSteps(
  s: {
    id: string;
    type: 'steps';
    title: string;
    items: { step: number; title: string; description: string }[];
  },
  t: ThemeConfig,
  y: number
): RenderResult {
  const sh = 62;
  const g = 12;
  const h = 34 + s.items.length * sh + (s.items.length - 1) * g;

  let svg = `<g id="sec-steps" class="font-sans">
    <text x="${PAD}" y="${y + 16}" font-size="11" font-weight="700" fill="${t.accent}" letter-spacing="1.5">${esc(s.title.toUpperCase())}</text>
  `;

  // Connecting vertical timeline line
  if (s.items.length > 1) {
    const ls = y + 28 + sh / 2;
    const le = y + 28 + (s.items.length - 1) * (sh + g) + sh / 2;
    svg += `<line x1="${PAD + 20}" y1="${ls}" x2="${PAD + 20}" y2="${le}" stroke="${t.cardBorder}" stroke-width="2" stroke-dasharray="4 3"/>`;
  }

  for (let i = 0; i < s.items.length; i++) {
    const it = s.items[i];
    const sy = y + 28 + i * (sh + g);

    svg += `
    <g transform="translate(${PAD}, ${sy})">
      <rect width="${CW}" height="${sh}" rx="10" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1"/>
      <!-- Step circle indicator -->
      <circle cx="20" cy="${sh / 2}" r="12" fill="${t.badgeBg}" stroke="${t.accent}" stroke-width="1.5"/>
      <text x="20" y="${sh / 2 + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="${t.accent}">${it.step}</text>

      <text x="44" y="25" font-size="13.5" font-weight="700" fill="${t.text}">${esc(trunc(it.title, 68))}</text>
    `;

    if (it.description) {
      const dl = wrapT(it.description, 78).slice(0, 2);
      for (let li = 0; li < dl.length; li++) {
        svg += `<text x="44" y="${42 + li * 16}" font-size="11.5" font-weight="400" fill="${t.textMuted}">${esc(dl[li])}</text>`;
      }
    }
    svg += `</g>`;
  }

  svg += `</g>`;
  return { svg, height: h };
}

export function rCL(
  s: {
    id: string;
    type: 'content-list';
    title: string;
    items: { title: string; description: string }[];
  },
  t: ThemeConfig,
  y: number
): RenderResult {
  const g = 12;
  const cw = (CW - g) / 2;
  const baseCh = 76;
  let maxDesc = 2;
  s.items.forEach((it) => {
    if (it.description) maxDesc = Math.max(maxDesc, wrapT(it.description, 48).length);
  });
  const ch = baseCh + Math.max(0, (maxDesc - 2) * 15);
  const rows = Math.ceil(s.items.length / 2);
  const h = 34 + rows * ch + (rows - 1) * g;

  let svg = `<g id="sec-content-list" class="font-sans">
    <text x="${PAD}" y="${y + 16}" font-size="11" font-weight="700" fill="${t.accent}" letter-spacing="1.5">${esc(s.title.toUpperCase())}</text>
  `;

  for (let i = 0; i < s.items.length; i++) {
    const it = s.items[i];
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = PAD + col * (cw + g);
    const cy = y + 28 + row * (ch + g);

    svg += `
    <g transform="translate(${cx}, ${cy})">
      <rect width="${cw}" height="${ch}" rx="10" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1"/>
      <circle cx="16" cy="20" r="3.5" fill="${t.accent}"/>
      <text x="28" y="24" font-size="13" font-weight="700" fill="${t.text}">${esc(trunc(it.title, 42))}</text>
    `;

    if (it.description) {
      const dl = wrapT(it.description, 48).slice(0, 3);
      for (let li = 0; li < dl.length; li++) {
        svg += `<text x="28" y="${42 + li * 16}" font-size="11.5" font-weight="400" fill="${t.textMuted}">${esc(dl[li])}</text>`;
      }
    }
    svg += `</g>`;
  }

  svg += `</g>`;
  return { svg, height: h };
}

export function rCB(
  s: { id: string; type: 'content-block'; title: string; text: string },
  t: ThemeConfig,
  y: number
): RenderResult {
  const lines = wrapT(s.text || '', 78);
  const lineH = 20;
  const padTop = 44;
  const h = Math.max(90, padTop + lines.length * lineH + 16);

  let svg = `<g id="sec-${esc(s.id)}" class="font-sans">
    <text x="${PAD}" y="${y + 16}" font-size="11" font-weight="700" fill="${t.accent}" letter-spacing="1.5">${esc(s.title.toUpperCase())}</text>
    <g transform="translate(${PAD}, ${y + 28})">
      <rect width="${CW}" height="${h - 28}" rx="12" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1" filter="url(#softShadow)"/>
  `;

  for (let i = 0; i < lines.length; i++) {
    svg += `<text x="20" y="${28 + i * lineH}" font-size="12.5" font-weight="400" fill="${t.textMuted}">${esc(lines[i])}</text>`;
  }

  svg += `</g></g>`;
  return { svg, height: h };
}

export function rFoot(t: ThemeConfig, y: number): RenderResult {
  const h = 48;
  const svg = `<g id="sec-footer" class="font-sans">
    <line x1="${PAD}" y1="${y}" x2="${PAD + CW}" y2="${y}" stroke="${t.cardBorder}" stroke-width="1"/>
    <text x="${PAD}" y="${y + 28}" font-size="11" font-weight="500" fill="${t.textMuted}">Generated with GitInfoGraphics • Rule-Based Infographic Studio</text>
    <text x="${PAD + CW}" y="${y + 28}" text-anchor="end" font-size="11" font-weight="600" fill="${t.accent}">github.com/benneberg/infographic-studio</text>
  </g>`;

  return { svg, height: h };
}

/* =========================================================================
   MOBILE RESPONSIVE SECTION RENDERERS (400px width, touch-legible typography)
   ========================================================================= */

export function rHeroMobile(spec: InfographicSpec, t: ThemeConfig, y: number): RenderResult {
  const title = spec.title || 'Repository Overview';
  const titleLines = wrapT(title, 26);
  const titleLineH = 26;
  const titleHeight = titleLines.length * titleLineH;

  const subLines = spec.subtitle ? wrapT(spec.subtitle, 42).slice(0, 5) : [];
  const subLineH = 18;
  const subHeight = subLines.length * subLineH;
  const h = 34 + titleHeight + (subLines.length ? subHeight + 12 : 0) + 16;

  let svg = `<g id="sec-hero-mobile" class="font-sans">
    <!-- Top badge -->
    <rect x="${MOBILE_PAD}" y="${y}" width="144" height="22" rx="5" fill="${t.badgeBg}" stroke="${t.cardBorder}" stroke-width="1"/>
    <text x="${MOBILE_PAD + 10}" y="${y + 15}" font-size="9.5" font-weight="700" fill="${t.badgeText}" letter-spacing="1.2">GITINFOGRAPHICS</text>
    <circle cx="${MOBILE_PAD + 130}" cy="${y + 11}" r="2" fill="${t.accent}"/>
  `;

  // Title (dynamically wrapped for mobile, high legibility)
  for (let i = 0; i < titleLines.length; i++) {
    svg += `<text x="${MOBILE_PAD}" y="${y + 44 + i * titleLineH}" font-size="20" font-weight="800" fill="${t.text}" letter-spacing="-0.4">${esc(titleLines[i])}</text>`;
  }

  // Subtitle
  const subStartY = y + 46 + titleHeight;
  if (subLines.length) {
    for (let i = 0; i < subLines.length; i++) {
      svg += `<text x="${MOBILE_PAD}" y="${subStartY + i * subLineH}" font-size="12.5" font-weight="400" fill="${t.textMuted}">${esc(subLines[i])}</text>`;
    }
  }

  // Scandinavian hairline rule divider
  const lineY = y + h - 6;
  svg += `
    <line x1="${MOBILE_PAD}" y1="${lineY}" x2="${MOBILE_PAD + MOBILE_CW}" y2="${lineY}" stroke="${t.cardBorder}" stroke-width="1"/>
  </g>`;

  return { svg, height: h };
}

export function rStatsMobile(
  s: { id: string; type: 'stats'; items: { value: string; label: string }[] },
  t: ThemeConfig,
  y: number
): RenderResult {
  const n = Math.min(s.items.length, 4);
  if (n === 0) return { svg: '', height: 0 };

  const cols = n === 1 ? 1 : 2;
  const g = 10;
  const cw = (MOBILE_CW - g * (cols - 1)) / cols;
  const cardH = 70;
  const rows = Math.ceil(n / cols);
  const h = 26 + rows * cardH + (rows - 1) * g;

  let svg = `<g id="sec-stats-mobile" class="font-sans">
    <text x="${MOBILE_PAD}" y="${y + 14}" font-size="10.5" font-weight="700" fill="${t.accent}" letter-spacing="1.5">KEY METRICS</text>
  `;

  for (let i = 0; i < n; i++) {
    const it = s.items[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = MOBILE_PAD + col * (cw + g);
    const cardY = y + 24 + row * (cardH + g);

    svg += `
    <g transform="translate(${x}, ${cardY})">
      <rect width="${cw}" height="${cardH}" rx="10" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1" filter="url(#softShadowM)"/>
      <text x="${cw / 2}" y="34" text-anchor="middle" font-size="20" font-weight="800" fill="${t.text}">${esc(it.value)}</text>
      <text x="${cw / 2}" y="52" text-anchor="middle" font-size="11" font-weight="600" fill="${t.textMuted}" letter-spacing="0.2">${esc(trunc(it.label, 20))}</text>
    </g>`;
  }

  svg += `</g>`;
  return { svg, height: h };
}

export function rPSMobile(
  s: {
    id: string;
    type: 'problem-solution';
    problem: string;
    solution: string;
    problemTitle: string;
    solutionTitle: string;
  },
  t: ThemeConfig,
  y: number
): RenderResult {
  const pl = wrapT(s.problem, 42);
  const sl = wrapT(s.solution, 42);
  const probH = Math.max(76, 52 + pl.length * 18);
  const solH = Math.max(76, 52 + sl.length * 18);
  const arrowH = 26;
  const h = 26 + probH + arrowH + solH;

  let svg = `<g id="sec-ps-mobile" class="font-sans">
    <text x="${MOBILE_PAD}" y="${y + 14}" font-size="10.5" font-weight="700" fill="${t.accent}" letter-spacing="1.5">PROBLEM ↓ SOLUTION</text>

    <!-- Problem Box (Full width) -->
    <g transform="translate(${MOBILE_PAD}, ${y + 24})">
      <rect width="${MOBILE_CW}" height="${probH}" rx="10" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1" filter="url(#softShadowM)"/>
      <rect x="16" y="14" width="62" height="18" rx="4" fill="${t.badgeBg}" stroke="${t.cardBorder}" stroke-width="1"/>
      <text x="47" y="27" text-anchor="middle" font-size="9" font-weight="700" fill="${t.textMuted}" letter-spacing="1">PROBLEM</text>
      <text x="16" y="46" font-size="13" font-weight="700" fill="${t.text}">${esc(s.problemTitle || 'The Challenge')}</text>
  `;

  for (let i = 0; i < pl.length; i++) {
    svg += `<text x="16" y="${66 + i * 18}" font-size="12" font-weight="400" fill="${t.textMuted}">${esc(pl[i])}</text>`;
  }
  svg += `</g>`;

  // Downward Connector Arrow
  const arrowY = y + 24 + probH + 1;
  const arrowX = MOBILE_PAD + MOBILE_CW / 2 - 12;
  svg += `
    <g transform="translate(${arrowX}, ${arrowY})">
      <circle cx="12" cy="12" r="11" fill="${t.badgeBg}" stroke="${t.cardBorder}" stroke-width="1"/>
      <path d="M12 8v8m-3-3l3 3 3-3" stroke="${t.accent}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </g>`;

  // Solution Box (Full width)
  const solY = y + 24 + probH + arrowH;
  svg += `
    <g transform="translate(${MOBILE_PAD}, ${solY})">
      <rect width="${MOBILE_CW}" height="${solH}" rx="10" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1" filter="url(#softShadowM)"/>
      <rect x="16" y="14" width="66" height="18" rx="4" fill="${t.badgeBg}" stroke="${t.cardBorder}" stroke-width="1"/>
      <text x="49" y="27" text-anchor="middle" font-size="9" font-weight="700" fill="${t.text}" letter-spacing="1">SOLUTION</text>
      <text x="16" y="46" font-size="13" font-weight="700" fill="${t.text}">${esc(s.solutionTitle || 'The Solution')}</text>
  `;

  for (let i = 0; i < sl.length; i++) {
    svg += `<text x="16" y="${66 + i * 18}" font-size="12" font-weight="400" fill="${t.text}">${esc(sl[i])}</text>`;
  }
  svg += `</g></g>`;

  return { svg, height: h };
}

export function rFeatsMobile(
  s: {
    id: string;
    type: 'features';
    title: string;
    items: { title: string; description: string }[];
  },
  t: ThemeConfig,
  y: number
): RenderResult {
  const g = 10;
  let curY = y + 24;
  let svg = `<g id="sec-feats-mobile" class="font-sans">
    <text x="${MOBILE_PAD}" y="${y + 14}" font-size="10.5" font-weight="700" fill="${t.accent}" letter-spacing="1.5">${esc(s.title.toUpperCase())}</text>
  `;

  for (let i = 0; i < s.items.length; i++) {
    const it = s.items[i];
    const dl = it.description ? wrapT(it.description, 44).slice(0, 4) : [];
    const cardH = Math.max(54, 36 + dl.length * 17);

    svg += `
    <g transform="translate(${MOBILE_PAD}, ${curY})">
      <rect width="${MOBILE_CW}" height="${cardH}" rx="10" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1" filter="url(#softShadowM)"/>
      <circle cx="16" cy="20" r="3" fill="${t.accent}"/>
      <text x="28" y="24" font-size="13" font-weight="700" fill="${t.text}">${esc(trunc(it.title, 40))}</text>
    `;

    if (dl.length) {
      for (let li = 0; li < dl.length; li++) {
        svg += `<text x="28" y="${42 + li * 17}" font-size="11.5" font-weight="400" fill="${t.textMuted}">${esc(dl[li])}</text>`;
      }
    }
    svg += `</g>`;

    curY += cardH + g;
  }

  svg += `</g>`;
  const totalH = curY - y - g;
  return { svg, height: totalH };
}

export function rTechMobile(
  s: { id: string; type: 'tech-stack'; title: string; items: string[] },
  t: ThemeConfig,
  y: number
): RenderResult {
  const cols = 2;
  const g = 8;
  const bw = (MOBILE_CW - g) / 2;
  const bh = 34;
  const rows = Math.ceil(s.items.length / 2);
  const h = 24 + rows * bh + (rows - 1) * g;

  let svg = `<g id="sec-tech-mobile" class="font-sans">
    <text x="${MOBILE_PAD}" y="${y + 14}" font-size="10.5" font-weight="700" fill="${t.accent}" letter-spacing="1.5">${esc(s.title.toUpperCase())}</text>
  `;

  for (let i = 0; i < s.items.length; i++) {
    const tech = s.items[i];
    const col = i % 2;
    const row = Math.floor(i / 2);
    const bx = MOBILE_PAD + col * (bw + g);
    const by = y + 24 + row * (bh + g);

    svg += `
    <g transform="translate(${bx}, ${by})">
      <rect width="${bw}" height="${bh}" rx="8" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1"/>
      <circle cx="14" cy="17" r="3" fill="${t.accent2}"/>
      <text x="25" y="21" font-size="11.5" font-weight="600" fill="${t.text}">${esc(trunc(tech, 18))}</text>
    </g>`;
  }

  svg += `</g>`;
  return { svg, height: h };
}

export function rStepsMobile(
  s: {
    id: string;
    type: 'steps';
    title: string;
    items: { step: number; title: string; description: string }[];
  },
  t: ThemeConfig,
  y: number
): RenderResult {
  const g = 10;
  let curY = y + 24;
  let svg = `<g id="sec-steps-mobile" class="font-sans">
    <text x="${MOBILE_PAD}" y="${y + 14}" font-size="10.5" font-weight="700" fill="${t.accent}" letter-spacing="1.5">${esc(s.title.toUpperCase())}</text>
  `;

  // Connecting timeline line
  if (s.items.length > 1) {
    const lineX = MOBILE_PAD + 18;
    const startY = y + 24 + 20;
    const endY = y + 24 + (s.items.length - 1) * 64 + 20;
    svg += `<line x1="${lineX}" y1="${startY}" x2="${lineX}" y2="${endY}" stroke="${t.cardBorder}" stroke-width="2" stroke-dasharray="3 3"/>`;
  }

  for (let i = 0; i < s.items.length; i++) {
    const it = s.items[i];
    const dl = it.description ? wrapT(it.description, 40).slice(0, 2) : [];
    const sh = Math.max(54, 34 + dl.length * 16);

    svg += `
    <g transform="translate(${MOBILE_PAD}, ${curY})">
      <rect width="${MOBILE_CW}" height="${sh}" rx="10" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1"/>
      <circle cx="18" cy="${sh / 2}" r="11" fill="${t.badgeBg}" stroke="${t.accent}" stroke-width="1.5"/>
      <text x="18" y="${sh / 2 + 3.5}" text-anchor="middle" font-size="10" font-weight="700" fill="${t.accent}">${it.step}</text>
      <text x="38" y="22" font-size="12.5" font-weight="700" fill="${t.text}">${esc(trunc(it.title, 34))}</text>
    `;

    if (dl.length) {
      for (let li = 0; li < dl.length; li++) {
        svg += `<text x="38" y="${37 + li * 15}" font-size="11" font-weight="400" fill="${t.textMuted}">${esc(dl[li])}</text>`;
      }
    }

    svg += `</g>`;
    curY += sh + g;
  }

  svg += `</g>`;
  const totalH = curY - y - g;
  return { svg, height: totalH };
}

export function rCLMobile(
  s: {
    id: string;
    type: 'content-list';
    title: string;
    items: { title: string; description: string }[];
  },
  t: ThemeConfig,
  y: number
): RenderResult {
  const g = 8;
  let curY = y + 24;
  let svg = `<g id="sec-cl-mobile" class="font-sans">
    <text x="${MOBILE_PAD}" y="${y + 14}" font-size="10.5" font-weight="700" fill="${t.accent}" letter-spacing="1.5">${esc(s.title.toUpperCase())}</text>
  `;

  for (let i = 0; i < s.items.length; i++) {
    const it = s.items[i];
    const dl = it.description ? wrapT(it.description, 42).slice(0, 2) : [];
    const cardH = Math.max(48, 30 + dl.length * 15);

    svg += `
    <g transform="translate(${MOBILE_PAD}, ${curY})">
      <rect width="${MOBILE_CW}" height="${cardH}" rx="8" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1"/>
      <circle cx="14" cy="18" r="3" fill="${t.accent}"/>
      <text x="25" y="21" font-size="12" font-weight="700" fill="${t.text}">${esc(trunc(it.title, 36))}</text>
    `;

    if (dl.length) {
      for (let li = 0; li < dl.length; li++) {
        svg += `<text x="25" y="${35 + li * 14}" font-size="10.5" font-weight="400" fill="${t.textMuted}">${esc(dl[li])}</text>`;
      }
    }
    svg += `</g>`;
    curY += cardH + g;
  }

  svg += `</g>`;
  return { svg, height: curY - y - g };
}

export function rCBMobile(
  s: { id: string; type: 'content-block'; title: string; text: string },
  t: ThemeConfig,
  y: number
): RenderResult {
  const lines = wrapT(s.text || '', 42);
  const lineH = 18;
  const padTop = 38;
  const h = Math.max(76, padTop + lines.length * lineH + 14);

  let svg = `<g id="sec-cb-${esc(s.id)}-mobile" class="font-sans">
    <text x="${MOBILE_PAD}" y="${y + 14}" font-size="10.5" font-weight="700" fill="${t.accent}" letter-spacing="1.5">${esc(s.title.toUpperCase())}</text>
    <g transform="translate(${MOBILE_PAD}, ${y + 24})">
      <rect width="${MOBILE_CW}" height="${h - 24}" rx="10" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1" filter="url(#softShadowM)"/>
  `;

  for (let i = 0; i < lines.length; i++) {
    svg += `<text x="16" y="${24 + i * lineH}" font-size="12" font-weight="400" fill="${t.textMuted}">${esc(lines[i])}</text>`;
  }

  svg += `</g></g>`;
  return { svg, height: h };
}

export function rFootMobile(t: ThemeConfig, y: number): RenderResult {
  const h = 54;
  const midX = MOBILE_PAD + MOBILE_CW / 2;
  const svg = `<g id="sec-footer-mobile" class="font-sans">
    <line x1="${MOBILE_PAD}" y1="${y}" x2="${MOBILE_PAD + MOBILE_CW}" y2="${y}" stroke="${t.cardBorder}" stroke-width="1"/>
    <text x="${midX}" y="${y + 22}" text-anchor="middle" font-size="10" font-weight="500" fill="${t.textMuted}">Generated with GitInfoGraphics • Mobile Edition</text>
    <text x="${midX}" y="${y + 38}" text-anchor="middle" font-size="10.5" font-weight="600" fill="${t.accent}">github.com/benneberg/infographic-studio</text>
  </g>`;

  return { svg, height: h };
}

