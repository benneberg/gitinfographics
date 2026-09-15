import { InfographicSpec, SpecSection, ThemeConfig, RenderOptions, VisualDensity, DENSITY_CONFIG } from './types';
import { getTheme, DEFAULT_FF } from './themes';
import { trunc } from './extractors';
import { generateQRCodeSVG } from './qr';
import { getMetricIcon, getFeatureIcon, getTechColor, SVG_PATHS } from './icons';

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

export function generateAccessibleSummary(spec: InfographicSpec): string {
  const parts: string[] = [];
  if (spec.title) parts.push(`Project: ${spec.title}.`);
  if (spec.subtitle) parts.push(`Overview: ${spec.subtitle}.`);
  for (const s of spec.sections) {
    if (s.type === 'stats') {
      parts.push(`Key metrics: ${s.items.map((i) => `${i.label} ${i.value}`).join(', ')}.`);
    } else if (s.type === 'problem-solution') {
      parts.push(`Problem: ${s.problem}. Solution: ${s.solution}.`);
    } else if (s.type === 'features') {
      parts.push(`Features: ${s.items.map((i) => `${i.title}: ${i.description}`).join('; ')}.`);
    } else if (s.type === 'tech-stack') {
      parts.push(`Tech stack: ${s.items.join(', ')}.`);
    } else if (s.type === 'steps') {
      parts.push(`Steps: ${s.items.map((i) => `Step ${i.step} ${i.title}: ${i.description}`).join('; ')}.`);
    } else if (s.type === 'timeline') {
      parts.push(`Timeline (${s.title}): ${s.items.map((i) => `${i.versionOrDate} ${i.title}: ${i.description}`).join('; ')}.`);
    } else if (s.type === 'comparison') {
      parts.push(`Comparison (${s.title}): ${s.rows.map((r) => `${r.feature} (Project: ${r.us}, Others: ${r.others})`).join('; ')}.`);
    } else if (s.type === 'callout') {
      parts.push(`Highlight: "${s.text}"${s.author ? ` — ${s.author}` : ''}.`);
    } else if (s.type === 'content-block') {
      parts.push(`${s.title}: ${s.text}.`);
    } else if (s.type === 'content-list') {
      parts.push(`${s.title}: ${s.items.map((i) => `${i.title} ${i.description}`).join('; ')}.`);
    }
  }
  return esc(parts.join(' '));
}

/**
 * 6. Dynamic SVG Layout Engine
 * Calculates heights dynamically, renders scalable, beautiful vector graphic.
 * Supports both Desktop multi-column layout and genuine Mobile responsive layout.
 */
export function renderSVG(spec: InfographicSpec, tn?: string, options?: RenderOptions): string {
  if (options?.layout === 'mobile') {
    return renderMobileSVG(spec, tn, options);
  }
  return renderDesktopSVG(spec, tn, options);
}

export function getSvgAnimationStyles(t: ThemeConfig): string {
  return `
      @media (prefers-reduced-motion: no-preference) {
        @keyframes gigFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .gig-animated .gig-hero {
          animation: gigFadeIn 0.35s ease-out both;
          will-change: opacity;
        }
        .gig-animated .gig-sec {
          animation: gigFadeIn 0.35s ease-out both;
          will-change: opacity;
        }
        .gig-animated .gig-sec:nth-of-type(1) { animation-delay: 0.03s; }
        .gig-animated .gig-sec:nth-of-type(2) { animation-delay: 0.06s; }
        .gig-animated .gig-sec:nth-of-type(3) { animation-delay: 0.09s; }
        .gig-animated .gig-sec:nth-of-type(4) { animation-delay: 0.12s; }
        .gig-animated .gig-sec:nth-of-type(5) { animation-delay: 0.15s; }
        .gig-animated .gig-sec:nth-of-type(6) { animation-delay: 0.18s; }
        .gig-animated .gig-sec:nth-of-type(n+7) { animation-delay: 0.21s; }
      }
      .gig-interactive {
        transition: opacity 0.2s ease;
        cursor: default;
      }
      .gig-interactive:hover {
        opacity: 0.92;
      }
      .gig-sec {
        outline: none;
        cursor: default;
      }
      .gig-sec:focus-visible, .gig-sec:focus {
        outline: 2px solid ${t.accent};
        outline-offset: 4px;
      }
      @media print {
        svg { background-color: #FFFFFF !important; }
        .gig-interactive:hover { opacity: 1 !important; }
      }
  `;
}

export function renderDesktopSVG(spec: InfographicSpec, tn?: string, options?: RenderOptions): string {
  const t = getTheme(tn);
  const ff = t._font || t.fontFamily || DEFAULT_FF;
  const isCompact = Boolean(options?.compact);
  const isAnimated = Boolean(options?.animated);
  const density: VisualDensity = options?.density || 'dense';
  const densityConfig = DENSITY_CONFIG[density] || DENSITY_CONFIG.dense;
  const gap = isCompact ? 16 : (spec.sections.length > 5 ? 24 : spec.sections.length > 3 ? 30 : BASE_GAP);
  let y = PAD;
  const parts: string[] = [];

  const defs = `
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=Fira+Code:wght@400;500;600&amp;display=swap');
      .font-sans { font-family: ${ff}; }
      .font-mono { font-family: 'Fira Code', monospace; }
      ${getSvgAnimationStyles(t)}
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
    ${densityConfig.showDecorations ? `
    <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="${t.isDark ? '#FFFFFF' : '#000000'}" opacity="${t.isDark ? '0.045' : '0.035'}"/>
    </pattern>
    ` : ''}
  </defs>`;

  // 1. Hero
  const hero = rHero(spec, t, y, options);
  parts.push(`<g class="gig-hero">${hero.svg}</g>`);
  y += hero.height;

  // 2. Sections
  for (let si = 0; si < spec.sections.length; si++) {
    const sec = spec.sections[si];
    y += gap;
    let rendered: RenderResult;
    switch (sec.type) {
      case 'stats':
        rendered = rStats(sec, t, y, options);
        break;
      case 'problem-solution':
        rendered = rPS(sec, t, y, options);
        break;
      case 'features':
        rendered = rFeats(sec, t, y, options);
        break;
      case 'tech-stack':
        rendered = rTech(sec, t, y, options);
        break;
      case 'steps':
        rendered = rSteps(sec, t, y, options);
        break;
      case 'content-list':
        rendered = rCL(sec, t, y);
        break;
      case 'content-block':
        rendered = rCB(sec, t, y);
        break;
      case 'timeline':
        rendered = rTimeline(sec, t, y);
        break;
      case 'comparison':
        rendered = rComparison(sec, t, y);
        break;
      case 'callout':
        rendered = rCallout(sec, t, y);
        break;
      default:
        rendered = { svg: '', height: 0 };
    }
    const secTitle = 'title' in sec ? sec.title : sec.type;
    parts.push(`<g class="gig-sec" role="region" aria-label="${esc(secTitle)}" tabindex="0">${rendered.svg}</g>`);
    y += rendered.height;
  }

  // 3. Footer
  y += gap;
  const foot = rFoot(t, y, options, spec);
  parts.push(foot.svg);
  y += foot.height;

  const totalHeight = y + PAD;
  const accessibleSummary = generateAccessibleSummary(spec);

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" aria-labelledby="svg-desktop-title" aria-describedby="svg-desktop-desc" viewBox="0 0 ${WIDTH} ${totalHeight}" width="100%" height="auto" preserveAspectRatio="xMidYMid meet" class="${isAnimated ? 'gig-animated' : ''}" style="max-width: 100%; height: auto; display: block; background-color:${t.bg}; border-radius: 16px;">
  <title id="svg-desktop-title">${esc(spec.title)} - Infographic</title>
  <desc id="svg-desktop-desc">${accessibleSummary}</desc>
  ${defs}
  <!-- Background rect with clean hairline border -->
  <rect width="${WIDTH}" height="${totalHeight}" rx="16" fill="${t.bg}"/>
  ${densityConfig.showDecorations ? `<rect width="${WIDTH}" height="${totalHeight}" rx="16" fill="url(#dotGrid)"/>` : ''}
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
export function renderMobileSVG(spec: InfographicSpec, tn?: string, options?: RenderOptions): string {
  const t = getTheme(tn);
  const ff = t._font || t.fontFamily || DEFAULT_FF;
  const isCompact = Boolean(options?.compact);
  const isAnimated = Boolean(options?.animated);
  const density: VisualDensity = options?.density || 'dense';
  const densityConfig = DENSITY_CONFIG[density] || DENSITY_CONFIG.dense;
  const gap = isCompact ? 10 : (spec.sections.length > 5 ? 16 : MOBILE_BASE_GAP);
  let y = isCompact ? 12 : MOBILE_PAD;
  const parts: string[] = [];

  const defs = `
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=Fira+Code:wght@400;500;600&amp;display=swap');
      .font-sans { font-family: ${ff}; }
      .font-mono { font-family: 'Fira Code', monospace; }
      ${getSvgAnimationStyles(t)}
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
    ${densityConfig.showDecorations ? `
    <pattern id="dotGridM" width="16" height="16" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="${t.isDark ? '#FFFFFF' : '#000000'}" opacity="${t.isDark ? '0.045' : '0.035'}"/>
    </pattern>
    ` : ''}
  </defs>`;

  // 1. Hero
  const hero = rHeroMobile(spec, t, y, options);
  parts.push(`<g class="gig-hero">${hero.svg}</g>`);
  y += hero.height;

  // 2. Sections
  for (let si = 0; si < spec.sections.length; si++) {
    const sec = spec.sections[si];
    y += gap;
    let rendered: RenderResult;
    switch (sec.type) {
      case 'stats':
        rendered = rStatsMobile(sec, t, y, options);
        break;
      case 'problem-solution':
        rendered = rPSMobile(sec, t, y, options);
        break;
      case 'features':
        rendered = rFeatsMobile(sec, t, y, options);
        break;
      case 'tech-stack':
        rendered = rTechMobile(sec, t, y, options);
        break;
      case 'steps':
        rendered = rStepsMobile(sec, t, y, options);
        break;
      case 'content-list':
        rendered = rCLMobile(sec, t, y);
        break;
      case 'content-block':
        rendered = rCBMobile(sec, t, y);
        break;
      case 'timeline':
        rendered = rTimelineMobile(sec, t, y);
        break;
      case 'comparison':
        rendered = rComparisonMobile(sec, t, y);
        break;
      case 'callout':
        rendered = rCalloutMobile(sec, t, y);
        break;
      default:
        rendered = { svg: '', height: 0 };
    }
    const secTitle = 'title' in sec ? sec.title : sec.type;
    parts.push(`<g class="gig-sec" role="region" aria-label="${esc(secTitle)}" tabindex="0">${rendered.svg}</g>`);
    y += rendered.height;
  }

  // 3. Footer
  y += gap;
  const foot = rFootMobile(t, y, options, spec);
  parts.push(foot.svg);
  y += foot.height;

  const totalHeight = y + (isCompact ? 12 : MOBILE_PAD);
  const accessibleSummary = generateAccessibleSummary(spec);

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" aria-labelledby="svg-mobile-title" aria-describedby="svg-mobile-desc" viewBox="0 0 ${MOBILE_WIDTH} ${totalHeight}" width="100%" height="auto" preserveAspectRatio="xMidYMid meet" class="${isAnimated ? 'gig-animated' : ''}" style="max-width: 100%; height: auto; display: block; background-color:${t.bg}; border-radius: 16px;">
  <title id="svg-mobile-title">${esc(spec.title)} - Mobile Infographic</title>
  <desc id="svg-mobile-desc">${accessibleSummary}</desc>
  ${defs}
  <!-- Background rect with clean hairline border -->
  <rect width="${MOBILE_WIDTH}" height="${totalHeight}" rx="16" fill="${t.bg}"/>
  ${densityConfig.showDecorations ? `<rect width="${MOBILE_WIDTH}" height="${totalHeight}" rx="16" fill="url(#dotGridM)"/>` : ''}
  <rect width="${MOBILE_WIDTH - 2}" height="${totalHeight - 2}" x="1" y="1" rx="15" fill="none" stroke="${t.cardBorder}" stroke-width="1"/>
  ${parts.join('\n')}
</svg>`;
}


export function rHero(spec: InfographicSpec, t: ThemeConfig, y: number, options?: RenderOptions): RenderResult {
  const density = options?.density || 'dense';
  const densityConfig = DENSITY_CONFIG[density] || DENSITY_CONFIG.dense;
  const title = spec.title || 'Repository Overview';
  const titleLines = wrapT(title, 44);
  const titleLineH = 34;
  const titleHeight = titleLines.length * titleLineH;

  const subLines = spec.subtitle ? wrapT(spec.subtitle, 72).slice(0, 4) : [];
  const lineH = 22;
  const subHeight = subLines.length * lineH;
  const topBarH = densityConfig.showDecorations ? 32 : 24;
  const extraBottom = densityConfig.showDecorations && subLines.length ? 22 : 0;
  const h = topBarH + 18 + titleHeight + (subLines.length ? subHeight + 14 : 0) + extraBottom + 16;

  // Custom Logo / Image rendering
  const logo = options?.logo || spec.logo;
  let logoSvg = '';
  if (logo && logo.dataUrl) {
    const lSize = logo.size || 48;
    let lx = PAD + CW - lSize;
    let ly = y;
    if (logo.position === 'top-left') {
      lx = PAD;
      ly = y;
    } else if (logo.position === 'center') {
      lx = PAD + CW / 2 - lSize / 2;
      ly = y;
    }
    logoSvg = `<image href="${esc(logo.dataUrl)}" x="${lx}" y="${ly}" width="${lSize}" height="${lSize}" preserveAspectRatio="xMidYMid meet" />`;
  }

  let svg = `<g id="sec-hero" class="font-sans">
    ${logoSvg}
  `;

  if (densityConfig.showDecorations) {
    // Top pill bar
    svg += `
    <g class="gig-badge-anim gig-interactive">
      <rect x="${PAD}" y="${y}" width="${CW}" height="28" rx="14" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1"/>
      <circle cx="${PAD + 14}" cy="${y + 14}" r="3" fill="#3B82F6"/>
      <text x="${PAD + 24}" y="${y + 18}" font-family="'Fira Code', monospace" font-size="10.5" font-weight="700" fill="${t.textMuted}" letter-spacing="1.5">&gt;_ GITINFOGRAPHICS • v3.2</text>
      <circle cx="${PAD + CW - 120}" cy="${y + 14}" r="3.5" fill="#10B981"/>
      <text x="${PAD + CW - 108}" y="${y + 18}" font-family="'Fira Code', monospace" font-size="10" font-weight="700" fill="${t.text}" letter-spacing="1">DETERMINISTIC</text>
    </g>
    `;
  } else {
    // Minimal standard badge
    svg += `
    <g class="gig-badge-anim gig-interactive">
      <rect x="${PAD}" y="${y}" width="160" height="24" rx="6" fill="${t.badgeBg}" stroke="${t.cardBorder}" stroke-width="1"/>
      <text x="${PAD + 12}" y="${y + 16}" font-size="10.5" font-weight="700" fill="${t.badgeText}" letter-spacing="1.2">GITINFOGRAPHICS</text>
      <circle cx="${PAD + 146}" cy="${y + 12}" r="2.5" fill="${t.accent}"/>
    </g>
    `;
  }

  // Main Title
  const titleStartY = y + topBarH + 26;
  for (let i = 0; i < titleLines.length; i++) {
    svg += `<text x="${PAD}" y="${titleStartY + i * titleLineH}" font-size="28" font-weight="800" fill="${t.text}" letter-spacing="-0.5">${esc(titleLines[i])}</text>`;
  }

  // Subtitle
  const subStartY = titleStartY + titleHeight + 4;
  if (subLines.length) {
    for (let i = 0; i < subLines.length; i++) {
      svg += `<text x="${PAD}" y="${subStartY + i * lineH}" font-size="14.5" font-weight="400" fill="${t.textMuted}">${esc(subLines[i])}</text>`;
    }
  }

  // System tag indicator in dense mode
  if (densityConfig.showDecorations && subLines.length) {
    const sysTagY = subStartY + subHeight + 10;
    svg += `
    <rect x="${PAD}" y="${sysTagY}" width="286" height="20" rx="4" fill="${t.badgeBg}" stroke="${t.cardBorder}" stroke-width="0.75"/>
    <circle cx="${PAD + 10}" cy="${sysTagY + 10}" r="2.5" fill="${t.accent}"/>
    <text x="${PAD + 18}" y="${sysTagY + 14}" font-family="'Fira Code', monospace" font-size="9" font-weight="600" fill="${t.textMuted}">● SYS: 100% DETERMINISTIC • ZERO TELEMETRY</text>
    `;
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
  y: number,
  options?: RenderOptions
): RenderResult {
  const density = options?.density || 'dense';
  const densityConfig = DENSITY_CONFIG[density] || DENSITY_CONFIG.dense;
  const n = Math.min(s.items.length, 4);
  if (n === 0) return { svg: '', height: 0 };

  const g = 14;
  const cw = (CW - g * (n - 1)) / n;
  const cardH = densityConfig.showDataViz ? 108 : 88;
  const h = 28 + cardH;

  const metricColors = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6'];
  const subtexts = ['Sub-frame render', 'Visitor retention', 'Coverage audit pass', 'Production ready'];

  let svg = `<g id="sec-stats" class="font-sans">
    <text x="${PAD}" y="${y + 16}" font-family="'Fira Code', monospace" font-size="10.5" font-weight="700" fill="${t.textMuted}" letter-spacing="1.5">ENGINE PERFORMANCE</text>
    <text x="${PAD + CW}" y="${y + 16}" text-anchor="end" font-family="'Fira Code', monospace" font-size="10.5" font-weight="700" fill="#10B981" letter-spacing="1.5">100% DETERMINISTIC</text>
  `;

  for (let i = 0; i < n; i++) {
    const it = s.items[i];
    const x = PAD + i * (cw + g);
    const cardY = y + 26;
    const iconName = getMetricIcon(it.label, i);
    const accentColor = metricColors[i % metricColors.length];

    svg += `
    <g class="gig-card-anim gig-interactive" transform="translate(${x}, ${cardY})">
      <rect width="${cw}" height="${cardH}" rx="12" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1" filter="url(#softShadow)"/>
      
      <!-- Top row: Label & Semantic Icon -->
      <text x="18" y="24" font-size="12" font-weight="600" fill="${t.textMuted}" letter-spacing="0.3">${esc(it.label)}</text>
      ${densityConfig.showIcons ? `
      <g transform="translate(${cw - 32}, 12) scale(0.65)" stroke="${accentColor}" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="${SVG_PATHS[iconName] || SVG_PATHS['zap']}"/>
      </g>
      ` : ''}

      <!-- Value -->
      <text x="18" y="58" font-size="26" font-weight="800" fill="${t.text}">${esc(it.value)}</text>
    `;

    if (densityConfig.showDataViz) {
      const progressRatio = i === 0 ? 0.65 : i === 1 ? 0.8 : i === 2 ? 0.98 : 0.85;
      const barW = (cw - 36) * progressRatio;
      svg += `
      <!-- Progress underline bar -->
      <rect x="18" y="70" width="${cw - 36}" height="3" rx="1.5" fill="${t.isDark ? '#334155' : '#E2E8F0'}"/>
      <rect x="18" y="70" width="${barW}" height="3" rx="1.5" fill="${accentColor}"/>
      <!-- Context subtitle -->
      <text x="18" y="92" font-size="10.5" font-weight="500" fill="${t.textMuted}">${subtexts[i] || 'Verified metric'}</text>
      `;
    }

    svg += `</g>`;
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
  y: number,
  options?: RenderOptions
): RenderResult {
  const density = options?.density || 'dense';
  const densityConfig = DENSITY_CONFIG[density] || DENSITY_CONFIG.dense;
  const aw = 48; // Arrow width
  const bw = (CW - aw) / 2;
  const pl = wrapT(s.problem, 44);
  const sl = wrapT(s.solution, 44);
  const maxLines = Math.max(pl.length, sl.length, 3);
  const bh = Math.max(116, 70 + maxLines * 20);
  const by = y + 26;
  const h = bh + 30;

  const showDecorations = densityConfig.showDecorations;
  const showBadges = densityConfig.showBadges;
  const showIcons = densityConfig.showIcons;

  const probStroke = showDecorations ? (t.isDark ? 'rgba(244,63,94,0.35)' : 'rgba(244,63,94,0.25)') : t.cardBorder;
  const probFill = showDecorations ? (t.isDark ? 'rgba(244,63,94,0.06)' : 'rgba(255,241,242,0.6)') : t.cardBg;

  const solStroke = showDecorations ? (t.isDark ? 'rgba(16,185,129,0.35)' : 'rgba(16,185,129,0.25)') : t.cardBorder;
  const solFill = showDecorations ? (t.isDark ? 'rgba(16,185,129,0.06)' : 'rgba(240,253,244,0.6)') : t.cardBg;

  let svg = `<g id="sec-problem-solution" class="font-sans">
    <text x="${PAD}" y="${y + 16}" font-family="'Fira Code', monospace" font-size="11" font-weight="700" fill="${t.textMuted}" letter-spacing="1.5">TRANSFORMATION MATRIX</text>
    <text x="${PAD + CW}" y="${y + 16}" text-anchor="end" font-family="'Fira Code', monospace" font-size="11" font-weight="700" fill="${t.accent}" letter-spacing="1.5">PROBLEM → SOLUTION</text>

    <!-- Problem Box -->
    <g class="gig-card-anim gig-interactive" transform="translate(${PAD}, ${by})">
      <rect width="${bw}" height="${bh}" rx="12" fill="${probFill}" stroke="${probStroke}" stroke-width="1" filter="url(#softShadow)"/>
      
      <!-- Top header line -->
      ${showIcons ? `
      <circle cx="28" cy="24" r="10" fill="rgba(244,63,94,0.15)"/>
      <g transform="translate(21, 17) scale(0.58)" stroke="#F43F5E" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="${SVG_PATHS['alert-circle']}"/>
      </g>
      ` : ''}
      <text x="${showIcons ? 46 : 20}" y="28" font-family="'Fira Code', monospace" font-size="10" font-weight="700" fill="#F43F5E" letter-spacing="1">— BEFORE • THE PROBLEM</text>
      ${showBadges ? `
      <rect x="${bw - 100}" y="14" width="84" height="20" rx="4" fill="rgba(244,63,94,0.12)" stroke="rgba(244,63,94,0.25)" stroke-width="0.75"/>
      <text x="${bw - 58}" y="28" text-anchor="middle" font-family="'Fira Code', monospace" font-size="9.5" font-weight="700" fill="#F43F5E">- High Dropoff</text>
      ` : ''}

      <text x="20" y="58" font-size="15" font-weight="700" fill="${t.text}">${esc(s.problemTitle || 'The Challenge')}</text>
  `;

  for (let i = 0; i < pl.length; i++) {
    svg += `<text x="20" y="${82 + i * 20}" font-size="13" font-weight="400" fill="${t.textMuted}">${esc(pl[i])}</text>`;
  }
  svg += `</g>`;

  // Middle Arrow indicator
  const ax = PAD + bw + (aw - 26) / 2;
  const ay = by + bh / 2;
  svg += `
    <g transform="translate(${ax}, ${ay - 13})">
      <circle cx="13" cy="13" r="14" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1" filter="url(#softShadow)"/>
      <path d="M8 13h10m-4-4l4 4-4 4" stroke="${t.accent}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </g>`;

  // Solution Box
  const sx = PAD + bw + aw;
  svg += `
    <g class="gig-card-anim gig-interactive" transform="translate(${sx}, ${by})">
      <rect width="${bw}" height="${bh}" rx="12" fill="${solFill}" stroke="${solStroke}" stroke-width="1" filter="url(#softShadow)"/>
      
      <!-- Top header line -->
      ${showIcons ? `
      <circle cx="28" cy="24" r="10" fill="rgba(16,185,129,0.15)"/>
      <g transform="translate(21, 17) scale(0.58)" stroke="#10B981" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="${SVG_PATHS['sparkles']}"/>
      </g>
      ` : ''}
      <text x="${showIcons ? 46 : 20}" y="28" font-family="'Fira Code', monospace" font-size="10" font-weight="700" fill="#10B981" letter-spacing="1">— AFTER • THE SOLUTION</text>
      ${showBadges ? `
      <rect x="${bw - 110}" y="14" width="94" height="20" rx="4" fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.25)" stroke-width="0.75"/>
      <text x="${bw - 63}" y="28" text-anchor="middle" font-family="'Fira Code', monospace" font-size="9.5" font-weight="700" fill="#10B981">+ Instant Visuals</text>
      ` : ''}

      <text x="20" y="58" font-size="15" font-weight="700" fill="${t.text}">${esc(s.solutionTitle || 'The Solution')}</text>
  `;

  for (let i = 0; i < sl.length; i++) {
    svg += `<text x="20" y="${82 + i * 20}" font-size="13" font-weight="400" fill="${t.text}">${esc(sl[i])}</text>`;
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
  y: number,
  options?: RenderOptions
): RenderResult {
  const density = options?.density || 'dense';
  const densityConfig = DENSITY_CONFIG[density] || DENSITY_CONFIG.dense;
  const cols = s.columns || (s.items.length <= 4 ? 2 : 3);
  const g = cols === 4 ? 10 : 14;
  const cw = (CW - g * (cols - 1)) / cols;
  const isMatrix = cols >= 4;
  const baseCardH = isMatrix ? 86 : 92;
  const rows = Math.ceil(s.items.length / cols);

  const wrapWidth = cols === 4 ? 22 : cols === 2 ? 42 : 30;
  let maxDescLines = 2;
  s.items.forEach((it) => {
    if (it.description) {
      maxDescLines = Math.max(maxDescLines, wrapT(it.description, wrapWidth).length);
    }
  });

  const lineH = isMatrix ? 15 : 18;
  const ch = baseCardH + Math.max(0, (maxDescLines - 2) * lineH);
  const h = 34 + rows * ch + (rows - 1) * g;

  let svg = `<g id="sec-features" class="font-sans">
    <text x="${PAD}" y="${y + 16}" font-family="'Fira Code', monospace" font-size="11" font-weight="700" fill="${t.textMuted}" letter-spacing="1.5">${isMatrix ? 'GRID MATRIX CAPABILITIES' : 'CORE CAPABILITIES'}</text>
    <text x="${PAD + CW}" y="${y + 16}" text-anchor="end" font-family="'Fira Code', monospace" font-size="11" font-weight="700" fill="${t.accent}" letter-spacing="1.5">${s.items.length} MODULES</text>
  `;

  for (let i = 0; i < s.items.length; i++) {
    const it = s.items[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = PAD + col * (cw + g);
    const cy = y + 28 + row * (ch + g);
    const iconName = getFeatureIcon(it.title, i);

    svg += `
    <g class="gig-card-anim gig-interactive" transform="translate(${cx}, ${cy})">
      <rect width="${cw}" height="${ch}" rx="${isMatrix ? 9 : 12}" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1" filter="url(#softShadow)"/>
    `;

    if (densityConfig.showIcons) {
      const iconBoxSize = isMatrix ? 26 : 36;
      const iconBoxPad = isMatrix ? 10 : 16;
      const textX = isMatrix ? 44 : 62;
      const textY = isMatrix ? 23 : 28;
      const titleFont = isMatrix ? 12 : 14;
      const descFont = isMatrix ? 10.5 : 12;
      const descStartY = isMatrix ? 38 : 48;
      const descLineSpacing = isMatrix ? 14 : 17;

      svg += `
      <!-- Left icon container box -->
      <rect x="${iconBoxPad}" y="${iconBoxPad}" width="${iconBoxSize}" height="${iconBoxSize}" rx="${isMatrix ? 6 : 8}" fill="${t.badgeBg}" stroke="${t.cardBorder}" stroke-width="1"/>
      <g transform="translate(${iconBoxPad + (isMatrix ? 5 : 7)}, ${iconBoxPad + (isMatrix ? 5 : 7)}) scale(${isMatrix ? 0.65 : 0.9})" stroke="${t.accent}" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="${SVG_PATHS[iconName] || SVG_PATHS['check-circle']}"/>
      </g>
      <text x="${textX}" y="${textY}" font-size="${titleFont}" font-weight="700" fill="${t.text}">${esc(trunc(it.title, cols === 4 ? 18 : cols === 2 ? 40 : 26))}</text>
      `;

      if (it.description) {
        const dl = wrapT(it.description, wrapWidth).slice(0, 4);
        for (let li = 0; li < dl.length; li++) {
          svg += `<text x="${textX}" y="${descStartY + li * descLineSpacing}" font-size="${descFont}" font-weight="400" fill="${t.textMuted}">${esc(dl[li])}</text>`;
        }
      }
    } else {
      const dotX = isMatrix ? 12 : 18;
      const textX = isMatrix ? 22 : 30;
      const textY = isMatrix ? 22 : 26;
      const titleFont = isMatrix ? 12 : 13.5;
      const descFont = isMatrix ? 10.5 : 12;
      const descStartY = isMatrix ? 38 : 46;
      const descLineSpacing = isMatrix ? 14 : 17;

      svg += `
      <circle cx="${dotX}" cy="${textY - 4}" r="${isMatrix ? 2.5 : 3}" fill="${t.accent}"/>
      <text x="${textX}" y="${textY}" font-size="${titleFont}" font-weight="700" fill="${t.text}">${esc(trunc(it.title, cols === 4 ? 22 : cols === 2 ? 46 : 32))}</text>
      `;

      if (it.description) {
        const dl = wrapT(it.description, cols === 4 ? 24 : cols === 2 ? 48 : 36).slice(0, 4);
        for (let li = 0; li < dl.length; li++) {
          svg += `<text x="${textX}" y="${descStartY + li * descLineSpacing}" font-size="${descFont}" font-weight="400" fill="${t.textMuted}">${esc(dl[li])}</text>`;
        }
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
  y: number,
  options?: RenderOptions
): RenderResult {
  const density = options?.density || 'dense';
  const densityConfig = DENSITY_CONFIG[density] || DENSITY_CONFIG.dense;
  const cols = 4;
  const g = 10;
  const bw = (CW - g * (cols - 1)) / cols;
  const bh = 36;
  const rows = Math.ceil(s.items.length / cols);
  const h = 34 + rows * bh + (rows - 1) * g;

  let svg = `<g id="sec-tech-stack" class="font-sans">
    <text x="${PAD}" y="${y + 16}" font-family="'Fira Code', monospace" font-size="11" font-weight="700" fill="${t.textMuted}" letter-spacing="1.5">TECHNOLOGY STACK</text>
    <text x="${PAD + CW}" y="${y + 16}" text-anchor="end" font-family="'Fira Code', monospace" font-size="11" font-weight="700" fill="${t.textMuted}" letter-spacing="1.5">MODERN ESM</text>
  `;

  for (let i = 0; i < s.items.length; i++) {
    const tech = s.items[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const bx = PAD + col * (bw + g);
    const by = y + 28 + row * (bh + g);
    const dotColor = densityConfig.showBadges ? getTechColor(tech, t.accent) : t.accent2;

    svg += `
    <g class="gig-card-anim gig-interactive" transform="translate(${bx}, ${by})">
      <rect width="${bw}" height="${bh}" rx="10" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1"/>
      <circle cx="16" cy="18" r="3.5" fill="${dotColor}"/>
      <text x="28" y="22" font-size="12" font-weight="600" fill="${t.text}">${esc(tech)}</text>
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
  y: number,
  options?: RenderOptions
): RenderResult {
  const density = options?.density || 'dense';
  const densityConfig = DENSITY_CONFIG[density] || DENSITY_CONFIG.dense;
  const g = 12;
  let curY = y + 28;

  let svg = `<g id="sec-steps" class="font-sans">
    <text x="${PAD}" y="${y + 16}" font-family="'Fira Code', monospace" font-size="11" font-weight="700" fill="${t.textMuted}" letter-spacing="1.5">QUICK START PIPELINE</text>
    <text x="${PAD + CW}" y="${y + 16}" text-anchor="end" font-family="'Fira Code', monospace" font-size="11" font-weight="700" fill="${t.textMuted}" letter-spacing="1.5">CLI FLOW</text>
  `;

  for (let i = 0; i < s.items.length; i++) {
    const it = s.items[i];
    const isCmd = it.description && (it.description.includes('npm') || it.description.includes('git') || it.description.includes('node') || it.description.includes('cargo') || it.description.includes('python') || it.description.startsWith('$'));
    const sh = isCmd && densityConfig.showDataViz ? 74 : 64;

    svg += `
    <g class="gig-card-anim gig-interactive" transform="translate(${PAD}, ${curY})">
      <rect width="${CW}" height="${sh}" rx="12" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1"/>
      <!-- Step circle indicator -->
      <circle cx="24" cy="${isCmd && densityConfig.showDataViz ? 24 : sh / 2}" r="12" fill="${t.badgeBg}" stroke="${t.accent}" stroke-width="1.5"/>
      <text x="24" y="${(isCmd && densityConfig.showDataViz ? 24 : sh / 2) + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="${t.accent}">${it.step || (i + 1)}</text>

      <text x="48" y="27" font-size="14" font-weight="700" fill="${t.text}">${esc(trunc(it.title, 68))}</text>
    `;

    if (isCmd && densityConfig.showDataViz) {
      const cmdText = it.description.startsWith('$') ? it.description : `$ ${it.description}`;
      svg += `
      <!-- Code box with copy icon -->
      <rect x="48" y="36" width="${CW - 72}" height="28" rx="6" fill="${t.isDark ? '#0F172A' : '#F8FAFC'}" stroke="${t.cardBorder}" stroke-width="0.75"/>
      <text x="60" y="54" font-family="'Fira Code', monospace" font-size="12" fill="${t.isDark ? '#E2E8F0' : '#334155'}">${esc(trunc(cmdText, 70))}</text>
      <g transform="translate(${CW - 46}, 42) scale(0.65)" stroke="${t.textMuted}" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="${SVG_PATHS['copy']}"/>
      </g>
      `;
    } else if (it.description) {
      const dl = wrapT(it.description, 78).slice(0, 2);
      for (let li = 0; li < dl.length; li++) {
        svg += `<text x="48" y="${45 + li * 16}" font-size="12" font-weight="400" fill="${t.textMuted}">${esc(dl[li])}</text>`;
      }
    }

    svg += `</g>`;
    curY += sh + g;
  }

  svg += `</g>`;
  const totalH = curY - y - g;
  return { svg, height: totalH };
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
    <g class="gig-card-anim gig-interactive" transform="translate(${PAD}, ${y + 28})">
      <rect width="${CW}" height="${h - 28}" rx="12" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1" filter="url(#softShadow)"/>
  `;

  for (let i = 0; i < lines.length; i++) {
    svg += `<text x="20" y="${28 + i * lineH}" font-size="12.5" font-weight="400" fill="${t.textMuted}">${esc(lines[i])}</text>`;
  }

  svg += `</g></g>`;
  return { svg, height: h };
}

export function rTimeline(
  s: { id: string; type: 'timeline'; title: string; items: { versionOrDate: string; title: string; description: string }[] },
  t: ThemeConfig,
  y: number
): RenderResult {
  const spineX = PAD + 32;
  const cardX = spineX + 24;
  const cardW = CW - 56;
  const padTop = 32;
  let curY = y + padTop;
  let svg = `<g id="sec-timeline-${esc(s.id)}" class="font-sans">
    <text x="${PAD}" y="${y + 16}" font-size="11" font-weight="700" fill="${t.accent}" letter-spacing="1.5">${esc((s.title || 'ROADMAP & MILESTONES').toUpperCase())}</text>
  `;

  for (let i = 0; i < s.items.length; i++) {
    const item = s.items[i];
    const descLines = wrapT(item.description || '', 68).slice(0, 3);
    const itemH = Math.max(60, 36 + descLines.length * 18);

    const nodeY = curY + 20;
    const badgeW = Math.max(54, item.versionOrDate.length * 8 + 14);
    svg += `
      ${i < s.items.length - 1 ? `<line x1="${spineX}" y1="${nodeY}" x2="${spineX}" y2="${curY + itemH + 14}" stroke="${t.cardBorder}" stroke-width="2"/>` : ''}
      <circle cx="${spineX}" cy="${nodeY}" r="7" fill="${t.cardBg}" stroke="${t.accent}" stroke-width="3"/>
      <circle cx="${spineX}" cy="${nodeY}" r="3" fill="${t.accent}"/>

      <g class="gig-card-anim gig-interactive" transform="translate(${cardX}, ${curY})">
        <rect width="${cardW}" height="${itemH}" rx="10" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1" filter="url(#softShadow)"/>
        <rect x="14" y="10" width="${badgeW}" height="20" rx="5" fill="${t.badgeBg}" stroke="${t.cardBorder}" stroke-width="1"/>
        <text x="${14 + badgeW / 2}" y="24" text-anchor="middle" font-size="10" font-weight="700" fill="${t.badgeText}">${esc(item.versionOrDate)}</text>
        <text x="${14 + badgeW + 12}" y="25" font-size="13" font-weight="700" fill="${t.text}">${esc(item.title)}</text>
    `;

    for (let li = 0; li < descLines.length; li++) {
      svg += `<text x="14" y="${44 + li * 18}" font-size="12" font-weight="400" fill="${t.textMuted}">${esc(descLines[li])}</text>`;
    }
    svg += `</g>`;

    curY += itemH + 12;
  }

  svg += `</g>`;
  return { svg, height: curY - y };
}

export function rComparison(
  s: { id: string; type: 'comparison'; title: string; headers: [string, string, string]; rows: { feature: string; us: string | boolean; others: string | boolean }[] },
  t: ThemeConfig,
  y: number
): RenderResult {
  const padTop = 32;
  const col1W = Math.floor(CW * 0.44);
  const col2W = Math.floor(CW * 0.28);
  const rowH = 34;
  const totalH = padTop + 36 + s.rows.length * rowH + 8;

  let svg = `<g id="sec-comparison-${esc(s.id)}" class="font-sans">
    <text x="${PAD}" y="${y + 16}" font-size="11" font-weight="700" fill="${t.accent}" letter-spacing="1.5">${esc((s.title || 'FEATURE COMPARISON').toUpperCase())}</text>
    <g transform="translate(${PAD}, ${y + 26})">
      <rect width="${CW}" height="${totalH - 26}" rx="12" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1" filter="url(#softShadow)"/>
      
      <!-- Table Header -->
      <rect width="${CW}" height="36" rx="12" fill="${t.isDark ? '#292524' : '#F5F5F4'}"/>
      <rect x="0" y="24" width="${CW}" height="12" fill="${t.isDark ? '#292524' : '#F5F5F4'}"/>
      <text x="20" y="23" font-size="11.5" font-weight="700" fill="${t.text}">${esc(s.headers[0] || 'Feature')}</text>
      <text x="${col1W + 16}" y="23" font-size="11.5" font-weight="700" fill="${t.accent}">${esc(s.headers[1] || 'This Project')}</text>
      <text x="${col1W + col2W + 16}" y="23" font-size="11.5" font-weight="700" fill="${t.textMuted}">${esc(s.headers[2] || 'Alternatives')}</text>
      <line x1="0" y1="36" x2="${CW}" y2="36" stroke="${t.cardBorder}" stroke-width="1"/>
  `;

  for (let i = 0; i < s.rows.length; i++) {
    const row = s.rows[i];
    const ry = 36 + i * rowH;
    if (i % 2 === 1) {
      svg += `<rect x="0" y="${ry}" width="${CW}" height="${rowH}" fill="${t.isDark ? '#1C1917' : '#FAFAF9'}" opacity="0.5"/>`;
    }
    svg += `<line x1="0" y1="${ry + rowH}" x2="${CW}" y2="${ry + rowH}" stroke="${t.cardBorder}" stroke-width="0.75" stroke-dasharray="2,2"/>`;

    svg += `<text x="20" y="${ry + 22}" font-size="12" font-weight="600" fill="${t.text}">${esc(row.feature)}</text>`;

    if (typeof row.us === 'boolean') {
      if (row.us) {
        svg += `
          <g transform="translate(${col1W + 16}, ${ry + 8})">
            <rect width="48" height="18" rx="4" fill="${t.accent}" opacity="0.15"/>
            <text x="24" y="13" text-anchor="middle" font-size="10" font-weight="700" fill="${t.accent}">YES ✓</text>
          </g>`;
      } else {
        svg += `<text x="${col1W + 16}" y="${ry + 22}" font-size="11.5" font-weight="500" fill="${t.textMuted}">No</text>`;
      }
    } else {
      svg += `<text x="${col1W + 16}" y="${ry + 22}" font-size="11.5" font-weight="600" fill="${t.accent}">${esc(row.us)}</text>`;
    }

    if (typeof row.others === 'boolean') {
      if (row.others) {
        svg += `<text x="${col1W + col2W + 16}" y="${ry + 22}" font-size="11" font-weight="500" fill="${t.text}">Yes</text>`;
      } else {
        svg += `
          <g transform="translate(${col1W + col2W + 16}, ${ry + 8})">
            <rect width="42" height="18" rx="4" fill="${t.badgeBg}"/>
            <text x="21" y="13" text-anchor="middle" font-size="10" font-weight="600" fill="${t.badgeText}">No ✕</text>
          </g>`;
      }
    } else {
      svg += `<text x="${col1W + col2W + 16}" y="${ry + 22}" font-size="11.5" font-weight="400" fill="${t.textMuted}">${esc(row.others)}</text>`;
    }
  }

  svg += `</g></g>`;
  return { svg, height: totalH };
}

export function rCallout(
  s: { id: string; type: 'callout'; title?: string; text: string; author?: string; calloutType?: 'quote' | 'tip' | 'warning' | 'info' },
  t: ThemeConfig,
  y: number
): RenderResult {
  const lines = wrapT(s.text || '', 72);
  const lineH = 20;
  const padTop = 32;
  const h = Math.max(88, padTop + lines.length * lineH + (s.author ? 28 : 16));
  const borderAccentColor = s.calloutType === 'warning' ? (t.warning || '#EAB308') : s.calloutType === 'tip' ? t.success : t.accent;

  let svg = `<g id="sec-callout-${esc(s.id)}" class="font-sans">
    ${s.title ? `<text x="${PAD}" y="${y + 16}" font-size="11" font-weight="700" fill="${borderAccentColor}" letter-spacing="1.5">${esc(s.title.toUpperCase())}</text>` : ''}
    <g transform="translate(${PAD}, ${y + (s.title ? 26 : 8)})">
      <rect width="${CW}" height="${h - (s.title ? 26 : 8)}" rx="12" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1" filter="url(#softShadow)"/>
      <rect x="0" y="0" width="5" height="${h - (s.title ? 26 : 8)}" rx="2" fill="${borderAccentColor}"/>
      <text x="22" y="30" font-size="28" font-family="serif" font-weight="bold" fill="${borderAccentColor}" opacity="0.3">“</text>
  `;

  for (let i = 0; i < lines.length; i++) {
    svg += `<text x="44" y="${28 + i * lineH}" font-size="13" font-style="italic" font-weight="500" fill="${t.text}">${esc(lines[i])}</text>`;
  }

  if (s.author) {
    const authorY = 28 + lines.length * lineH + 12;
    svg += `<text x="${CW - 24}" y="${authorY}" text-anchor="end" font-size="11" font-weight="600" fill="${t.accent}">— ${esc(s.author)}</text>`;
  }

  svg += `</g></g>`;
  return { svg, height: h };
}

export function rFoot(t: ThemeConfig, y: number, options?: RenderOptions, spec?: InfographicSpec): RenderResult {
  const density = options?.density || 'dense';
  const densityConfig = DENSITY_CONFIG[density] || DENSITY_CONFIG.dense;
  const repoUrl = options?.qrUrl || spec?.meta?.url || (spec?.meta?.owner && spec?.meta?.repo ? `https://github.com/${spec.meta.owner}/${spec.meta.repo}` : '');
  const showQR = options?.showQR && repoUrl;

  const gitInfoGraphicsUrl = 'https://github.com/benneberg/gitinfographics';

  if (showQR) {
    const h = 76;
    const qrSize = 54;
    const qrX = PAD + CW - qrSize - 4;
    const qrY = y + 12;
    const qrSvg = generateQRCodeSVG(repoUrl, qrX, qrY, { size: qrSize, color: t.accent });

    const svg = `<g id="sec-footer" class="font-sans">
    <line x1="${PAD}" y1="${y}" x2="${PAD + CW}" y2="${y}" stroke="${t.cardBorder}" stroke-width="1"/>
    <a href="${gitInfoGraphicsUrl}" xlink:href="${gitInfoGraphicsUrl}" target="_blank" rel="noopener noreferrer" style="cursor: pointer;">
      <text x="${PAD}" y="${y + 26}" font-size="11" font-weight="600" fill="${t.text}">Generated with GitInfoGraphics</text>
    </a>
    <text x="${PAD}" y="${y + 44}" font-size="11" font-weight="500" fill="${t.textMuted}">${esc(repoUrl)}</text>
    <text x="${PAD}" y="${y + 60}" font-size="10" font-weight="500" fill="${t.accent}">Scan QR to inspect repository on GitHub</text>
    ${qrSvg}
  </g>`;
    return { svg, height: h };
  }

  const h = densityConfig.showBadges ? 56 : 48;
  const displayUrl = repoUrl ? repoUrl.replace(/^https?:\/\//, '') : 'github.com/benneberg/gitinfographics';
  const targetRepoUrl = repoUrl || gitInfoGraphicsUrl;

  let svg = `<g id="sec-footer" class="font-sans">
    <line x1="${PAD}" y1="${y}" x2="${PAD + CW}" y2="${y}" stroke="${t.cardBorder}" stroke-width="1"/>
    <a href="${gitInfoGraphicsUrl}" xlink:href="${gitInfoGraphicsUrl}" target="_blank" rel="noopener noreferrer" style="cursor: pointer;">
      <text x="${PAD}" y="${y + 32}" font-size="11" font-weight="500" fill="${t.textMuted}">Generated with GitInfoGraphics</text>
    </a>
  `;

  if (densityConfig.showBadges) {
    const pillW = 280;
    const pillX = PAD + CW - pillW;
    svg += `
    <a href="${targetRepoUrl}" xlink:href="${targetRepoUrl}" target="_blank" rel="noopener noreferrer" style="cursor: pointer;">
      <g transform="translate(${pillX}, ${y + 16})">
        <rect width="${pillW}" height="30" rx="15" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1" filter="url(#softShadow)"/>
        <g transform="translate(14, 7) scale(0.68)" fill="${t.text}">
          <path d="${SVG_PATHS['github']}"/>
        </g>
        <text x="${pillW / 2}" y="19" text-anchor="middle" font-family="'Fira Code', monospace" font-size="10.5" font-weight="600" fill="${t.accent}">${esc(trunc(displayUrl, 28))}</text>
        <g transform="translate(${pillW - 24}, 8) scale(0.6)" fill="#F59E0B">
          <path d="${SVG_PATHS['star']}"/>
        </g>
      </g>
    </a>
    `;
  } else {
    svg += `<a href="${targetRepoUrl}" xlink:href="${targetRepoUrl}" target="_blank" rel="noopener noreferrer" style="cursor: pointer;"><text x="${PAD + CW}" y="${y + 32}" text-anchor="end" font-size="11" font-weight="600" fill="${t.accent}">${esc(displayUrl)}</text></a>`;
  }

  svg += `</g>`;
  return { svg, height: h };
}

/* =========================================================================
   MOBILE RESPONSIVE SECTION RENDERERS (400px width, touch-legible typography)
   ========================================================================= */

export function rHeroMobile(spec: InfographicSpec, t: ThemeConfig, y: number, options?: RenderOptions): RenderResult {
  const density = options?.density || 'dense';
  const densityConfig = DENSITY_CONFIG[density] || DENSITY_CONFIG.dense;
  const title = spec.title || 'Repository Overview';
  const titleLines = wrapT(title, 26);
  const titleLineH = 26;
  const titleHeight = titleLines.length * titleLineH;

  const subLines = spec.subtitle ? wrapT(spec.subtitle, 42).slice(0, 5) : [];
  const subLineH = 18;
  const subHeight = subLines.length * subLineH;
  const topBarH = densityConfig.showDecorations ? 28 : 22;
  const extraBottom = densityConfig.showDecorations && subLines.length ? 18 : 0;
  const h = topBarH + 14 + titleHeight + (subLines.length ? subHeight + 12 : 0) + extraBottom + 16;

  // Custom Logo / Image rendering for mobile
  const logo = options?.logo || spec.logo;
  let logoSvg = '';
  if (logo && logo.dataUrl) {
    const lSize = Math.min(logo.size || 36, 44);
    let lx = MOBILE_PAD + MOBILE_CW - lSize;
    if (logo.position === 'top-left') {
      lx = MOBILE_PAD;
    } else if (logo.position === 'center') {
      lx = MOBILE_PAD + MOBILE_CW / 2 - lSize / 2;
    }
    const ly = y;
    logoSvg = `<image href="${esc(logo.dataUrl)}" x="${lx}" y="${ly}" width="${lSize}" height="${lSize}" preserveAspectRatio="xMidYMid meet" />`;
  }

  let svg = `<g id="sec-hero-mobile" class="font-sans">
    ${logoSvg}
  `;

  if (densityConfig.showDecorations) {
    svg += `
    <!-- Top badge bar -->
    <g class="gig-badge-anim gig-interactive">
      <rect x="${MOBILE_PAD}" y="${y}" width="${MOBILE_CW}" height="24" rx="12" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1"/>
      <circle cx="${MOBILE_PAD + 12}" cy="${y + 12}" r="2.5" fill="#3B82F6"/>
      <text x="${MOBILE_PAD + 20}" y="${y + 15.5}" font-family="'Fira Code', monospace" font-size="9" font-weight="700" fill="${t.textMuted}" letter-spacing="1">&gt;_ GITINFOGRAPHICS • v3.2</text>
      <circle cx="${MOBILE_PAD + MOBILE_CW - 14}" cy="${y + 12}" r="2.5" fill="#10B981"/>
    </g>
    `;
  } else {
    svg += `
    <g class="gig-badge-anim gig-interactive">
      <rect x="${MOBILE_PAD}" y="${y}" width="144" height="22" rx="5" fill="${t.badgeBg}" stroke="${t.cardBorder}" stroke-width="1"/>
      <text x="${MOBILE_PAD + 10}" y="${y + 15}" font-size="9.5" font-weight="700" fill="${t.badgeText}" letter-spacing="1.2">GITINFOGRAPHICS</text>
      <circle cx="${MOBILE_PAD + 130}" cy="${y + 11}" r="2" fill="${t.accent}"/>
    </g>
    `;
  }

  // Title (dynamically wrapped for mobile, high legibility)
  const titleStartY = y + topBarH + 20;
  for (let i = 0; i < titleLines.length; i++) {
    svg += `<text x="${MOBILE_PAD}" y="${titleStartY + i * titleLineH}" font-size="20" font-weight="800" fill="${t.text}" letter-spacing="-0.4">${esc(titleLines[i])}</text>`;
  }

  // Subtitle
  const subStartY = titleStartY + titleHeight + 2;
  if (subLines.length) {
    for (let i = 0; i < subLines.length; i++) {
      svg += `<text x="${MOBILE_PAD}" y="${subStartY + i * subLineH}" font-size="12.5" font-weight="400" fill="${t.textMuted}">${esc(subLines[i])}</text>`;
    }
  }

  // Monospace tag in dense mode
  if (densityConfig.showDecorations && subLines.length) {
    const sysTagY = subStartY + subHeight + 8;
    svg += `
    <rect x="${MOBILE_PAD}" y="${sysTagY}" width="220" height="18" rx="4" fill="${t.badgeBg}" stroke="${t.cardBorder}" stroke-width="0.75"/>
    <circle cx="${MOBILE_PAD + 8}" cy="${sysTagY + 9}" r="2" fill="${t.accent}"/>
    <text x="${MOBILE_PAD + 14}" y="${sysTagY + 12.5}" font-family="'Fira Code', monospace" font-size="8.5" font-weight="600" fill="${t.textMuted}">● SYS: DETERMINISTIC SVG 1.1</text>
    `;
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
  y: number,
  options?: RenderOptions
): RenderResult {
  const density = options?.density || 'dense';
  const densityConfig = DENSITY_CONFIG[density] || DENSITY_CONFIG.dense;
  const n = Math.min(s.items.length, 4);
  if (n === 0) return { svg: '', height: 0 };

  const cols = n === 1 ? 1 : 2;
  const g = 10;
  const cw = (MOBILE_CW - g * (cols - 1)) / cols;
  const cardH = densityConfig.showDataViz ? 82 : 68;
  const rows = Math.ceil(n / cols);
  const h = 26 + rows * cardH + (rows - 1) * g;
  const metricColors = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6'];

  let svg = `<g id="sec-stats-mobile" class="font-sans">
    <text x="${MOBILE_PAD}" y="${y + 14}" font-family="'Fira Code', monospace" font-size="10.5" font-weight="700" fill="${t.textMuted}" letter-spacing="1.5">KEY METRICS</text>
    <text x="${MOBILE_PAD + MOBILE_CW}" y="${y + 14}" text-anchor="end" font-family="'Fira Code', monospace" font-size="10" font-weight="700" fill="#10B981">100% DETERMINISTIC</text>
  `;

  for (let i = 0; i < n; i++) {
    const it = s.items[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = MOBILE_PAD + col * (cw + g);
    const cardY = y + 24 + row * (cardH + g);
    const iconName = getMetricIcon(it.label, i);
    const accentColor = metricColors[i % metricColors.length];

    svg += `
    <g class="gig-card-anim gig-interactive" transform="translate(${x}, ${cardY})">
      <rect width="${cw}" height="${cardH}" rx="10" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1" filter="url(#softShadowM)"/>
      <text x="14" y="20" font-size="11" font-weight="600" fill="${t.textMuted}">${esc(trunc(it.label, 14))}</text>
      ${densityConfig.showIcons ? `
      <g transform="translate(${cw - 26}, 9) scale(0.55)" stroke="${accentColor}" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="${SVG_PATHS[iconName] || SVG_PATHS['zap']}"/>
      </g>
      ` : ''}
      <text x="14" y="46" font-size="20" font-weight="800" fill="${t.text}">${esc(it.value)}</text>
    `;

    if (densityConfig.showDataViz) {
      const progressRatio = i === 0 ? 0.65 : i === 1 ? 0.8 : i === 2 ? 0.98 : 0.85;
      const barW = (cw - 28) * progressRatio;
      svg += `
      <rect x="14" y="56" width="${cw - 28}" height="2.5" rx="1.25" fill="${t.isDark ? '#334155' : '#E2E8F0'}"/>
      <rect x="14" y="56" width="${barW}" height="2.5" rx="1.25" fill="${accentColor}"/>
      <text x="14" y="72" font-size="9.5" font-weight="500" fill="${t.textMuted}">${i % 2 === 0 ? 'Verified metric' : 'Tested'}</text>
      `;
    }

    svg += `</g>`;
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
  y: number,
  options?: RenderOptions
): RenderResult {
  const density = options?.density || 'dense';
  const densityConfig = DENSITY_CONFIG[density] || DENSITY_CONFIG.dense;
  const pl = wrapT(s.problem, 42);
  const sl = wrapT(s.solution, 42);
  const probH = Math.max(84, 58 + pl.length * 18);
  const solH = Math.max(84, 58 + sl.length * 18);
  const arrowH = 26;
  const h = 26 + probH + arrowH + solH;

  const showDecorations = densityConfig.showDecorations;
  const showIcons = densityConfig.showIcons;
  const showBadges = densityConfig.showBadges;

  const probStroke = showDecorations ? (t.isDark ? 'rgba(244,63,94,0.35)' : 'rgba(244,63,94,0.25)') : t.cardBorder;
  const probFill = showDecorations ? (t.isDark ? 'rgba(244,63,94,0.06)' : 'rgba(255,241,242,0.6)') : t.cardBg;

  const solStroke = showDecorations ? (t.isDark ? 'rgba(16,185,129,0.35)' : 'rgba(16,185,129,0.25)') : t.cardBorder;
  const solFill = showDecorations ? (t.isDark ? 'rgba(16,185,129,0.06)' : 'rgba(240,253,244,0.6)') : t.cardBg;

  let svg = `<g id="sec-ps-mobile" class="font-sans">
    <text x="${MOBILE_PAD}" y="${y + 14}" font-family="'Fira Code', monospace" font-size="10.5" font-weight="700" fill="${t.textMuted}" letter-spacing="1.5">PROBLEM ↓ SOLUTION</text>

    <!-- Problem Box (Full width) -->
    <g transform="translate(${MOBILE_PAD}, ${y + 24})">
      <rect width="${MOBILE_CW}" height="${probH}" rx="10" fill="${probFill}" stroke="${probStroke}" stroke-width="1" filter="url(#softShadowM)"/>
      ${showIcons ? `
      <circle cx="24" cy="20" r="8" fill="rgba(244,63,94,0.15)"/>
      <g transform="translate(19, 15) scale(0.45)" stroke="#F43F5E" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="${SVG_PATHS['alert-circle']}"/>
      </g>
      ` : ''}
      <text x="${showIcons ? 38 : 16}" y="24" font-family="'Fira Code', monospace" font-size="9" font-weight="700" fill="#F43F5E" letter-spacing="0.8">PROBLEM</text>
      ${showBadges ? `
      <text x="${MOBILE_CW - 14}" y="24" text-anchor="end" font-family="'Fira Code', monospace" font-size="9" font-weight="700" fill="#F43F5E">- Dropoff</text>
      ` : ''}
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
      <circle cx="12" cy="12" r="11" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1"/>
      <path d="M12 8v8m-3-3l3 3 3-3" stroke="${t.accent}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </g>`;

  // Solution Box (Full width)
  const solY = y + 24 + probH + arrowH;
  svg += `
    <g transform="translate(${MOBILE_PAD}, ${solY})">
      <rect width="${MOBILE_CW}" height="${solH}" rx="10" fill="${solFill}" stroke="${solStroke}" stroke-width="1" filter="url(#softShadowM)"/>
      ${showIcons ? `
      <circle cx="24" cy="20" r="8" fill="rgba(16,185,129,0.15)"/>
      <g transform="translate(19, 15) scale(0.45)" stroke="#10B981" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="${SVG_PATHS['sparkles']}"/>
      </g>
      ` : ''}
      <text x="${showIcons ? 38 : 16}" y="24" font-family="'Fira Code', monospace" font-size="9" font-weight="700" fill="#10B981" letter-spacing="0.8">SOLUTION</text>
      ${showBadges ? `
      <text x="${MOBILE_CW - 14}" y="24" text-anchor="end" font-family="'Fira Code', monospace" font-size="9" font-weight="700" fill="#10B981">+ Visuals</text>
      ` : ''}
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
  y: number,
  options?: RenderOptions
): RenderResult {
  const density = options?.density || 'dense';
  const densityConfig = DENSITY_CONFIG[density] || DENSITY_CONFIG.dense;
  const g = 10;
  let curY = y + 24;
  let svg = `<g id="sec-feats-mobile" class="font-sans">
    <text x="${MOBILE_PAD}" y="${y + 14}" font-family="'Fira Code', monospace" font-size="10.5" font-weight="700" fill="${t.textMuted}" letter-spacing="1.5">CAPABILITIES</text>
    <text x="${MOBILE_PAD + MOBILE_CW}" y="${y + 14}" text-anchor="end" font-family="'Fira Code', monospace" font-size="10" font-weight="700" fill="${t.accent}">${s.items.length} MODULES</text>
  `;

  for (let i = 0; i < s.items.length; i++) {
    const it = s.items[i];
    const dl = it.description ? wrapT(it.description, densityConfig.showIcons ? 38 : 44).slice(0, 4) : [];
    const cardH = Math.max(densityConfig.showIcons ? 64 : 54, 38 + dl.length * 17);
    const iconName = getFeatureIcon(it.title, i);

    svg += `
    <g transform="translate(${MOBILE_PAD}, ${curY})">
      <rect width="${MOBILE_CW}" height="${cardH}" rx="10" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1" filter="url(#softShadowM)"/>
    `;

    if (densityConfig.showIcons) {
      svg += `
      <!-- Icon box -->
      <rect x="12" y="14" width="30" height="30" rx="6" fill="${t.badgeBg}" stroke="${t.cardBorder}" stroke-width="0.75"/>
      <g transform="translate(18, 20) scale(0.75)" stroke="${t.accent}" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="${SVG_PATHS[iconName] || SVG_PATHS['check-circle']}"/>
      </g>
      <text x="50" y="24" font-size="13" font-weight="700" fill="${t.text}">${esc(trunc(it.title, 32))}</text>
      `;

      if (dl.length) {
        for (let li = 0; li < dl.length; li++) {
          svg += `<text x="50" y="${42 + li * 16}" font-size="11.5" font-weight="400" fill="${t.textMuted}">${esc(dl[li])}</text>`;
        }
      }
    } else {
      svg += `
      <circle cx="16" cy="20" r="3" fill="${t.accent}"/>
      <text x="28" y="24" font-size="13" font-weight="700" fill="${t.text}">${esc(trunc(it.title, 40))}</text>
      `;

      if (dl.length) {
        for (let li = 0; li < dl.length; li++) {
          svg += `<text x="28" y="${42 + li * 17}" font-size="11.5" font-weight="400" fill="${t.textMuted}">${esc(dl[li])}</text>`;
        }
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
  y: number,
  options?: RenderOptions
): RenderResult {
  const density = options?.density || 'dense';
  const densityConfig = DENSITY_CONFIG[density] || DENSITY_CONFIG.dense;
  const cols = 2;
  const g = 8;
  const bw = (MOBILE_CW - g) / 2;
  const bh = 34;
  const rows = Math.ceil(s.items.length / 2);
  const h = 24 + rows * bh + (rows - 1) * g;

  let svg = `<g id="sec-tech-mobile" class="font-sans">
    <text x="${MOBILE_PAD}" y="${y + 14}" font-family="'Fira Code', monospace" font-size="10.5" font-weight="700" fill="${t.textMuted}" letter-spacing="1.5">TECH STACK</text>
    <text x="${MOBILE_PAD + MOBILE_CW}" y="${y + 14}" text-anchor="end" font-family="'Fira Code', monospace" font-size="10" font-weight="700" fill="${t.textMuted}">ESM</text>
  `;

  for (let i = 0; i < s.items.length; i++) {
    const tech = s.items[i];
    const col = i % 2;
    const row = Math.floor(i / 2);
    const bx = MOBILE_PAD + col * (bw + g);
    const by = y + 24 + row * (bh + g);
    const dotColor = densityConfig.showBadges ? getTechColor(tech, t.accent) : t.accent2;

    svg += `
    <g transform="translate(${bx}, ${by})">
      <rect width="${bw}" height="${bh}" rx="8" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1"/>
      <circle cx="14" cy="17" r="3" fill="${dotColor}"/>
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
  y: number,
  options?: RenderOptions
): RenderResult {
  const density = options?.density || 'dense';
  const densityConfig = DENSITY_CONFIG[density] || DENSITY_CONFIG.dense;
  const g = 10;
  let curY = y + 24;
  let svg = `<g id="sec-steps-mobile" class="font-sans">
    <text x="${MOBILE_PAD}" y="${y + 14}" font-family="'Fira Code', monospace" font-size="10.5" font-weight="700" fill="${t.textMuted}" letter-spacing="1.5">QUICK START</text>
    <text x="${MOBILE_PAD + MOBILE_CW}" y="${y + 14}" text-anchor="end" font-family="'Fira Code', monospace" font-size="10" font-weight="700" fill="${t.textMuted}">CLI</text>
  `;

  for (let i = 0; i < s.items.length; i++) {
    const it = s.items[i];
    const isCmd = it.description && (it.description.includes('npm') || it.description.includes('git') || it.description.includes('node') || it.description.includes('cargo') || it.description.includes('python') || it.description.startsWith('$'));
    const dl = it.description ? wrapT(it.description, 40).slice(0, 2) : [];
    const sh = isCmd && densityConfig.showDataViz ? 74 : Math.max(54, 34 + dl.length * 16);

    svg += `
    <g transform="translate(${MOBILE_PAD}, ${curY})">
      <rect width="${MOBILE_CW}" height="${sh}" rx="10" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1"/>
      <circle cx="18" cy="${isCmd && densityConfig.showDataViz ? 22 : sh / 2}" r="11" fill="${t.badgeBg}" stroke="${t.accent}" stroke-width="1.5"/>
      <text x="18" y="${(isCmd && densityConfig.showDataViz ? 22 : sh / 2) + 3.5}" text-anchor="middle" font-size="10" font-weight="700" fill="${t.accent}">${it.step || (i + 1)}</text>
      <text x="38" y="22" font-size="12.5" font-weight="700" fill="${t.text}">${esc(trunc(it.title, 34))}</text>
    `;

    if (isCmd && densityConfig.showDataViz) {
      const cmdText = it.description.startsWith('$') ? it.description : `$ ${it.description}`;
      svg += `
      <rect x="38" y="32" width="${MOBILE_CW - 52}" height="26" rx="5" fill="${t.isDark ? '#0F172A' : '#F8FAFC'}" stroke="${t.cardBorder}" stroke-width="0.75"/>
      <text x="46" y="48" font-family="'Fira Code', monospace" font-size="11" fill="${t.isDark ? '#E2E8F0' : '#334155'}">${esc(trunc(cmdText, 32))}</text>
      <g transform="translate(${MOBILE_CW - 32}, 38) scale(0.55)" stroke="${t.textMuted}" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="${SVG_PATHS['copy']}"/>
      </g>
      `;
    } else if (dl.length) {
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

export function rTimelineMobile(
  s: { id: string; type: 'timeline'; title: string; items: { versionOrDate: string; title: string; description: string }[] },
  t: ThemeConfig,
  y: number
): RenderResult {
  const spineX = MOBILE_PAD + 16;
  const cardX = spineX + 16;
  const cardW = MOBILE_CW - 32;
  const padTop = 30;
  let curY = y + padTop;
  let svg = `<g id="sec-timeline-${esc(s.id)}-mobile" class="font-sans">
    <text x="${MOBILE_PAD}" y="${y + 14}" font-size="10.5" font-weight="700" fill="${t.accent}" letter-spacing="1.5">${esc((s.title || 'ROADMAP & MILESTONES').toUpperCase())}</text>
  `;

  for (let i = 0; i < s.items.length; i++) {
    const item = s.items[i];
    const descLines = wrapT(item.description || '', 36).slice(0, 3);
    const itemH = Math.max(56, 32 + descLines.length * 16);
    const nodeY = curY + 18;
    const badgeW = Math.max(48, item.versionOrDate.length * 7 + 12);

    svg += `
      ${i < s.items.length - 1 ? `<line x1="${spineX}" y1="${nodeY}" x2="${spineX}" y2="${curY + itemH + 12}" stroke="${t.cardBorder}" stroke-width="2"/>` : ''}
      <circle cx="${spineX}" cy="${nodeY}" r="5" fill="${t.cardBg}" stroke="${t.accent}" stroke-width="2.5"/>
      <circle cx="${spineX}" cy="${nodeY}" r="2" fill="${t.accent}"/>

      <g transform="translate(${cardX}, ${curY})">
        <rect width="${cardW}" height="${itemH}" rx="8" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1" filter="url(#softShadowM)"/>
        <rect x="10" y="8" width="${badgeW}" height="18" rx="4" fill="${t.badgeBg}" stroke="${t.cardBorder}" stroke-width="1"/>
        <text x="${10 + badgeW / 2}" y="20" text-anchor="middle" font-size="9.5" font-weight="700" fill="${t.badgeText}">${esc(item.versionOrDate)}</text>
        <text x="${10 + badgeW + 8}" y="21" font-size="11.5" font-weight="700" fill="${t.text}">${esc(trunc(item.title, 24))}</text>
    `;

    for (let li = 0; li < descLines.length; li++) {
      svg += `<text x="10" y="${38 + li * 16}" font-size="11" font-weight="400" fill="${t.textMuted}">${esc(descLines[li])}</text>`;
    }
    svg += `</g>`;

    curY += itemH + 10;
  }

  svg += `</g>`;
  return { svg, height: curY - y };
}

export function rComparisonMobile(
  s: { id: string; type: 'comparison'; title: string; headers: [string, string, string]; rows: { feature: string; us: string | boolean; others: string | boolean }[] },
  t: ThemeConfig,
  y: number
): RenderResult {
  const padTop = 30;
  const cardW = MOBILE_CW;
  const rowH = 32;
  const totalH = padTop + 32 + s.rows.length * rowH + 6;
  const col1W = Math.floor(cardW * 0.46);
  const col2W = Math.floor(cardW * 0.28);

  let svg = `<g id="sec-comparison-${esc(s.id)}-mobile" class="font-sans">
    <text x="${MOBILE_PAD}" y="${y + 14}" font-size="10.5" font-weight="700" fill="${t.accent}" letter-spacing="1.5">${esc((s.title || 'FEATURE COMPARISON').toUpperCase())}</text>
    <g transform="translate(${MOBILE_PAD}, ${y + 24})">
      <rect width="${cardW}" height="${totalH - 24}" rx="10" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1" filter="url(#softShadowM)"/>
      <rect width="${cardW}" height="32" rx="10" fill="${t.isDark ? '#292524' : '#F5F5F4'}"/>
      <rect x="0" y="20" width="${cardW}" height="12" fill="${t.isDark ? '#292524' : '#F5F5F4'}"/>
      <text x="12" y="20" font-size="10" font-weight="700" fill="${t.text}">${esc(s.headers[0] || 'Feature')}</text>
      <text x="${col1W + 8}" y="20" font-size="10" font-weight="700" fill="${t.accent}">US</text>
      <text x="${col1W + col2W + 8}" y="20" font-size="10" font-weight="700" fill="${t.textMuted}">OTHERS</text>
      <line x1="0" y1="32" x2="${cardW}" y2="32" stroke="${t.cardBorder}" stroke-width="1"/>
  `;

  for (let i = 0; i < s.rows.length; i++) {
    const row = s.rows[i];
    const ry = 32 + i * rowH;
    if (i % 2 === 1) {
      svg += `<rect x="0" y="${ry}" width="${cardW}" height="${rowH}" fill="${t.isDark ? '#1C1917' : '#FAFAF9'}" opacity="0.5"/>`;
    }
    svg += `<line x1="0" y1="${ry + rowH}" x2="${cardW}" y2="${ry + rowH}" stroke="${t.cardBorder}" stroke-width="0.75" stroke-dasharray="2,2"/>`;
    svg += `<text x="12" y="${ry + 20}" font-size="11" font-weight="600" fill="${t.text}">${esc(trunc(row.feature, 18))}</text>`;

    if (typeof row.us === 'boolean') {
      svg += `<text x="${col1W + 8}" y="${ry + 20}" font-size="10.5" font-weight="700" fill="${row.us ? t.accent : t.textMuted}">${row.us ? '✓ Yes' : '✕ No'}</text>`;
    } else {
      svg += `<text x="${col1W + 8}" y="${ry + 20}" font-size="10.5" font-weight="600" fill="${t.accent}">${esc(trunc(row.us, 10))}</text>`;
    }

    if (typeof row.others === 'boolean') {
      svg += `<text x="${col1W + col2W + 8}" y="${ry + 20}" font-size="10.5" font-weight="500" fill="${row.others ? t.text : t.textMuted}">${row.others ? 'Yes' : 'No'}</text>`;
    } else {
      svg += `<text x="${col1W + col2W + 8}" y="${ry + 20}" font-size="10.5" font-weight="400" fill="${t.textMuted}">${esc(trunc(row.others, 10))}</text>`;
    }
  }

  svg += `</g></g>`;
  return { svg, height: totalH };
}

export function rCalloutMobile(
  s: { id: string; type: 'callout'; title?: string; text: string; author?: string; calloutType?: 'quote' | 'tip' | 'warning' | 'info' },
  t: ThemeConfig,
  y: number
): RenderResult {
  const lines = wrapT(s.text || '', 40);
  const lineH = 18;
  const padTop = 30;
  const h = Math.max(76, padTop + lines.length * lineH + (s.author ? 24 : 14));
  const borderAccentColor = s.calloutType === 'warning' ? (t.warning || '#EAB308') : s.calloutType === 'tip' ? t.success : t.accent;

  let svg = `<g id="sec-callout-${esc(s.id)}-mobile" class="font-sans">
    ${s.title ? `<text x="${MOBILE_PAD}" y="${y + 14}" font-size="10.5" font-weight="700" fill="${borderAccentColor}" letter-spacing="1.5">${esc(s.title.toUpperCase())}</text>` : ''}
    <g transform="translate(${MOBILE_PAD}, ${y + (s.title ? 24 : 6)})">
      <rect width="${MOBILE_CW}" height="${h - (s.title ? 24 : 6)}" rx="10" fill="${t.cardBg}" stroke="${t.cardBorder}" stroke-width="1" filter="url(#softShadowM)"/>
      <rect x="0" y="0" width="4" height="${h - (s.title ? 24 : 6)}" rx="2" fill="${borderAccentColor}"/>
      <text x="16" y="24" font-size="22" font-family="serif" font-weight="bold" fill="${borderAccentColor}" opacity="0.3">“</text>
  `;

  for (let i = 0; i < lines.length; i++) {
    svg += `<text x="32" y="${22 + i * lineH}" font-size="11.5" font-style="italic" font-weight="500" fill="${t.text}">${esc(lines[i])}</text>`;
  }

  if (s.author) {
    const authorY = 22 + lines.length * lineH + 10;
    svg += `<text x="${MOBILE_CW - 16}" y="${authorY}" text-anchor="end" font-size="10" font-weight="600" fill="${t.accent}">— ${esc(s.author)}</text>`;
  }

  svg += `</g></g>`;
  return { svg, height: h };
}

export function rFootMobile(t: ThemeConfig, y: number, options?: RenderOptions, spec?: InfographicSpec): RenderResult {
  const repoUrl = options?.qrUrl || spec?.meta?.url || (spec?.meta?.owner && spec?.meta?.repo ? `https://github.com/${spec.meta.owner}/${spec.meta.repo}` : '');
  const showQR = options?.showQR && repoUrl;
  const midX = MOBILE_PAD + MOBILE_CW / 2;
  const gitInfoGraphicsUrl = 'https://github.com/benneberg/gitinfographics';

  if (showQR) {
    const h = 110;
    const qrSize = 52;
    const qrX = midX - qrSize / 2;
    const qrY = y + 10;
    const qrSvg = generateQRCodeSVG(repoUrl, qrX, qrY, { size: qrSize, color: t.accent });

    const svg = `<g id="sec-footer-mobile" class="font-sans">
    <line x1="${MOBILE_PAD}" y1="${y}" x2="${MOBILE_PAD + MOBILE_CW}" y2="${y}" stroke="${t.cardBorder}" stroke-width="1"/>
    ${qrSvg}
    <a href="${gitInfoGraphicsUrl}" xlink:href="${gitInfoGraphicsUrl}" target="_blank" rel="noopener noreferrer" style="cursor: pointer;">
      <text x="${midX}" y="${y + 78}" text-anchor="middle" font-size="10" font-weight="500" fill="${t.textMuted}">Generated with GitInfoGraphics</text>
    </a>
    <a href="${repoUrl}" xlink:href="${repoUrl}" target="_blank" rel="noopener noreferrer" style="cursor: pointer;">
      <text x="${midX}" y="${y + 96}" text-anchor="middle" font-size="10.5" font-weight="600" fill="${t.accent}">${esc(repoUrl.replace(/^https?:\/\//, ''))}</text>
    </a>
  </g>`;
    return { svg, height: h };
  }

  const h = 54;
  const displayUrl = repoUrl ? repoUrl.replace(/^https?:\/\//, '') : 'github.com/benneberg/gitinfographics';
  const targetRepoUrl = repoUrl || gitInfoGraphicsUrl;
  const svg = `<g id="sec-footer-mobile" class="font-sans">
    <line x1="${MOBILE_PAD}" y1="${y}" x2="${MOBILE_PAD + MOBILE_CW}" y2="${y}" stroke="${t.cardBorder}" stroke-width="1"/>
    <a href="${gitInfoGraphicsUrl}" xlink:href="${gitInfoGraphicsUrl}" target="_blank" rel="noopener noreferrer" style="cursor: pointer;">
      <text x="${midX}" y="${y + 22}" text-anchor="middle" font-size="10" font-weight="500" fill="${t.textMuted}">Generated with GitInfoGraphics</text>
    </a>
    <a href="${targetRepoUrl}" xlink:href="${targetRepoUrl}" target="_blank" rel="noopener noreferrer" style="cursor: pointer;">
      <text x="${midX}" y="${y + 38}" text-anchor="middle" font-size="10.5" font-weight="600" fill="${t.accent}">${esc(displayUrl)}</text>
    </a>
  </g>`;

  return { svg, height: h };
}

