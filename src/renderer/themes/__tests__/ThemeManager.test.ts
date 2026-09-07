import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeManager, BUILTIN_THEMES } from '../ThemeManager';

describe('ThemeManager', () => {
  let themeManager: ThemeManager;

  beforeEach(() => {
    themeManager = new ThemeManager();
  });

  it('loads all built-in themes by default', () => {
    const themes = themeManager.getAllThemes();
    expect(themes.length).toBeGreaterThanOrEqual(BUILTIN_THEMES.length);
    expect(themes.some((t) => t.id === 'scandinavian-light')).toBe(true);
    expect(themes.some((t) => t.id === 'midnight')).toBe(true);
    expect(themes.some((t) => t.id === 'daylight')).toBe(true);
    expect(themes.some((t) => t.id === 'ember')).toBe(true);
    expect(themes.some((t) => t.id === 'forest')).toBe(true);
  });

  it('retrieves current theme and switches themes correctly', () => {
    const current = themeManager.getCurrentTheme();
    expect(current.id).toBe('scandinavian-light');

    themeManager.setCurrentTheme('midnight');
    expect(themeManager.getCurrentTheme().id).toBe('midnight');
    expect(themeManager.getCurrentTheme().isDark).toBe(true);
  });

  it('throws error when setting non-existent theme', () => {
    expect(() => themeManager.setCurrentTheme('non-existent-theme')).toThrow();
  });

  it('generates valid CSS variables string from theme', () => {
    const theme = themeManager.getTheme('forest')!;
    expect(theme).toBeDefined();
    const css = themeManager.generateCSSVariables(theme);
    expect(css).toContain('--color-background: #022C22');
    expect(css).toContain('--color-accent: #34D399');
    expect(css).toContain('--font-heading:');
  });
});
