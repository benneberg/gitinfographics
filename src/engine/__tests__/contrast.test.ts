import { describe, it, expect } from 'vitest';
import { hexToRgb, getRelativeLuminance, getContrastRatio, auditThemeContrast } from '../contrast';
import { THEMES } from '../themes';

describe('WCAG AA Contrast & Accessibility Engine', () => {
  it('correctly parses 6-digit and 3-digit hex colors', () => {
    expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb('#FFF')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#1C1917')).toEqual({ r: 28, g: 25, b: 23 });
  });

  it('calculates relative luminance for pure black and pure white', () => {
    expect(getRelativeLuminance(255, 255, 255)).toBeCloseTo(1.0, 4);
    expect(getRelativeLuminance(0, 0, 0)).toBeCloseTo(0.0, 4);
  });

  it('calculates maximum contrast ratio for black on white', () => {
    const ratio = getContrastRatio('#000000', '#FFFFFF');
    expect(ratio).toBe(21);
  });

  it('calculates 1.0 contrast ratio for identical colors', () => {
    const ratio = getContrastRatio('#1C1917', '#1C1917');
    expect(ratio).toBe(1);
  });

  it('audits scandi-minimal theme for WCAG AA compliance on main text', () => {
    const scandi = THEMES['scandi-minimal'];
    const audit = auditThemeContrast(scandi);
    const mainTextItem = audit.items.find((i) => i.name.includes('Primary Text on Card Background'));
    expect(mainTextItem).toBeDefined();
    expect(mainTextItem?.ratio).toBeGreaterThanOrEqual(10);
    expect(mainTextItem?.normalTextPassed).toBe(true);
    expect(mainTextItem?.level).toBe('AAA');
  });

  it('audits all built-in themes and confirms primary body text passes WCAG AA (>= 4.5:1)', () => {
    for (const theme of Object.values(THEMES)) {
      const audit = auditThemeContrast(theme);
      const cardText = audit.items.find((i) => i.name === 'Primary Text on Card Background');
      expect(cardText?.normalTextPassed).toBe(true);
      expect(cardText?.ratio).toBeGreaterThanOrEqual(4.5);
    }
  });
});
