import { describe, it, expect } from 'vitest';
import { getContrastRatio, evaluateContrast, auditTheme } from '../contrast';
import { BUILTIN_THEMES } from '../ThemeManager';

describe('WCAG AA Color Contrast Auditor', () => {
  it('calculates correct contrast ratio for pure black and white', () => {
    const ratio = getContrastRatio('#000000', '#FFFFFF');
    expect(ratio).toBeCloseTo(21.0, 1);
  });

  it('evaluates normal and large text thresholds correctly', () => {
    const res = evaluateContrast('#000000', '#FFFFFF');
    expect(res.normalTextAA).toBe(true);
    expect(res.normalTextAAA).toBe(true);
    expect(res.largeTextAA).toBe(true);
    expect(res.largeTextAAA).toBe(true);
  });

  it('fails low contrast combinations like light gray on white', () => {
    const res = evaluateContrast('#CCCCCC', '#FFFFFF');
    expect(res.normalTextAA).toBe(false);
  });

  it('audits Scandinavian Light and Midnight built-in themes for AA compliance', () => {
    const scandi = BUILTIN_THEMES.find((t) => t.id === 'scandinavian-light');
    expect(scandi).toBeDefined();
    if (scandi) {
      const audit = auditTheme(scandi);
      expect(audit.textOnBackground.normalTextAA).toBe(true);
      expect(audit.textOnCard.normalTextAA).toBe(true);
    }

    const midnight = BUILTIN_THEMES.find((t) => t.id === 'midnight');
    expect(midnight).toBeDefined();
    if (midnight) {
      const audit = auditTheme(midnight);
      expect(audit.textOnBackground.normalTextAA).toBe(true);
      expect(audit.textOnCard.normalTextAA).toBe(true);
    }
  });
});
