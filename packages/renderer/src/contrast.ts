import { ThemeConfig } from './types';

/**
 * Parses a hex color string into RGB components [0..255].
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(cleaned, 16);
  if (isNaN(num)) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

/**
 * Calculates sRGB relative luminance according to WCAG 2.1 specification.
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates the contrast ratio between two hex colors according to WCAG 2.1.
 * Returns a number between 1.0 and 21.0.
 */
export function getContrastRatio(hexForeground: string, hexBackground: string): number {
  const rgbFg = hexToRgb(hexForeground);
  const rgbBg = hexToRgb(hexBackground);
  const l1 = getRelativeLuminance(rgbFg.r, rgbFg.g, rgbFg.b);
  const l2 = getRelativeLuminance(rgbBg.r, rgbBg.g, rgbBg.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return Number(ratio.toFixed(2));
}

export interface ContrastAuditItem {
  name: string;
  fg: string;
  bg: string;
  ratio: number;
  normalTextPassed: boolean; // >= 4.5:1
  largeTextPassed: boolean;  // >= 3.0:1
  level: 'AAA' | 'AA' | 'AA Large' | 'Fail';
}

export interface ThemeContrastAudit {
  themeId: string;
  themeName: string;
  passedAllNormal: boolean;
  passedAllLarge: boolean;
  items: ContrastAuditItem[];
}

/**
 * Audits a ThemeConfig for WCAG AA compliance across its primary text/bg pairings.
 */
export function auditThemeContrast(theme: ThemeConfig): ThemeContrastAudit {
  const pairings: Array<{ name: string; fg: string; bg: string }> = [
    { name: 'Primary Text on Card Background', fg: theme.text, bg: theme.cardBg },
    { name: 'Primary Text on Main Canvas', fg: theme.text, bg: theme.bg },
    { name: 'Muted Text on Card Background', fg: theme.textMuted, bg: theme.cardBg },
    { name: 'Accent Color on Main Canvas', fg: theme.accent, bg: theme.bg },
    { name: 'Badge Text on Badge Background', fg: theme.badgeText, bg: theme.badgeBg }
  ];

  const items: ContrastAuditItem[] = pairings.map(({ name, fg, bg }) => {
    const ratio = getContrastRatio(fg, bg);
    const normalTextPassed = ratio >= 4.5;
    const largeTextPassed = ratio >= 3.0;
    let level: 'AAA' | 'AA' | 'AA Large' | 'Fail' = 'Fail';
    if (ratio >= 7.0) level = 'AAA';
    else if (ratio >= 4.5) level = 'AA';
    else if (ratio >= 3.0) level = 'AA Large';

    return {
      name,
      fg,
      bg,
      ratio,
      normalTextPassed,
      largeTextPassed,
      level
    };
  });

  const passedAllNormal = items.every((it) => it.normalTextPassed);
  const passedAllLarge = items.every((it) => it.largeTextPassed);

  return {
    themeId: theme.id,
    themeName: theme.name,
    passedAllNormal,
    passedAllLarge,
    items
  };
}

/**
 * Color blindness simulation filters (SVG feColorMatrix compatible)
 */
export type ColorBlindnessType = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export const COLOR_BLINDNESS_MATRICES: Record<ColorBlindnessType, string> = {
  normal: '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0',
  protanopia: '0.56667 0.43333 0 0 0  0.55833 0.44167 0 0 0  0 0.24167 0.75833 0 0  0 0 0 1 0',
  deuteranopia: '0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0',
  tritanopia: '0.95 0.05 0 0 0  0 0.43333 0.56667 0 0  0 0.475 0.525 0 0  0 0 0 1 0',
  achromatopsia: '0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0'
};
