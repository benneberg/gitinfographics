// src/renderer/themes/contrast.ts

export interface ContrastResult {
  ratio: number;
  normalTextAA: boolean; // >= 4.5
  largeTextAA: boolean;  // >= 3.0
  normalTextAAA: boolean; // >= 7.0
  largeTextAAA: boolean;  // >= 4.5
}

export interface ThemeContrastAudit {
  themeId: string;
  themeName: string;
  isCompliant: boolean;
  textOnBackground: ContrastResult;
  textOnCard: ContrastResult;
  textSecondaryOnBackground: ContrastResult;
  textSecondaryOnCard: ContrastResult;
  accentOnBackground: ContrastResult;
  accentOnCard: ContrastResult;
  warnings: string[];
}

/**
 * Parse hex color to RGB [0-255, 0-255, 0-255]
 */
export function hexToRgb(hex: string): [number, number, number] {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Calculate relative luminance following WCAG 2.1 specs
 */
export function getRelativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Compute contrast ratio between two hex colors (e.g. 4.5:1 -> 4.5)
 */
export function getContrastRatio(colorA: string, colorB: string): number {
  try {
    const lumA = getRelativeLuminance(hexToRgb(colorA));
    const lumB = getRelativeLuminance(hexToRgb(colorB));
    const lighter = Math.max(lumA, lumB);
    const darker = Math.min(lumA, lumB);
    const ratio = (lighter + 0.05) / (darker + 0.05);
    return Math.round(ratio * 100) / 100;
  } catch {
    return 1.0;
  }
}

/**
 * Check WCAG AA/AAA thresholds
 */
export function evaluateContrast(fg: string, bg: string): ContrastResult {
  const ratio = getContrastRatio(fg, bg);
  return {
    ratio,
    normalTextAA: ratio >= 4.5,
    largeTextAA: ratio >= 3.0,
    normalTextAAA: ratio >= 7.0,
    largeTextAAA: ratio >= 4.5
  };
}

/**
 * Audit all color combinations in a theme for WCAG AA compliance
 */
export function auditTheme(theme: {
  id: string;
  name: string;
  colors: {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    accent: string;
  };
}): ThemeContrastAudit {
  const textOnBg = evaluateContrast(theme.colors.text, theme.colors.background);
  const textOnCard = evaluateContrast(theme.colors.text, theme.colors.card);
  const textSecOnBg = evaluateContrast(theme.colors.textSecondary, theme.colors.background);
  const textSecOnCard = evaluateContrast(theme.colors.textSecondary, theme.colors.card);
  const accentOnBg = evaluateContrast(theme.colors.accent, theme.colors.background);
  const accentOnCard = evaluateContrast(theme.colors.accent, theme.colors.card);

  const warnings: string[] = [];

  if (!textOnBg.normalTextAA) {
    warnings.push(`Primary text contrast on background (${textOnBg.ratio}:1) fails WCAG AA 4.5:1`);
  }
  if (!textOnCard.normalTextAA) {
    warnings.push(`Primary text contrast on card (${textOnCard.ratio}:1) fails WCAG AA 4.5:1`);
  }
  if (!textSecOnBg.largeTextAA) {
    warnings.push(`Secondary text contrast on background (${textSecOnBg.ratio}:1) fails WCAG AA minimum 3:1`);
  }
  if (!textSecOnCard.largeTextAA) {
    warnings.push(`Secondary text contrast on card (${textSecOnCard.ratio}:1) fails WCAG AA minimum 3:1`);
  }

  const isCompliant = textOnBg.normalTextAA && textOnCard.normalTextAA && textSecOnBg.largeTextAA && textSecOnCard.largeTextAA;

  return {
    themeId: theme.id,
    themeName: theme.name,
    isCompliant,
    textOnBackground: textOnBg,
    textOnCard: textOnCard,
    textSecondaryOnBackground: textSecOnBg,
    textSecondaryOnCard: textSecOnCard,
    accentOnBackground: accentOnBg,
    accentOnCard: accentOnCard,
    warnings
  };
}
