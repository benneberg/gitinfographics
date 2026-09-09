// src/renderer/themes/ThemeManager.ts

export interface ThemeColors {
  background: string;
  card: string;
  border: string;
  text: string;
  textSecondary: string;
  accent: string;
  accentSecondary: string;
  success: string;
  warning: string;
  error: string;
}

export interface ThemeTypography {
  heading: string;
  body: string;
  mono: string;
  sizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };
  weights: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  isDark: boolean;
  isCustom?: boolean;
}

export const BUILTIN_THEMES: Theme[] = [
  {
    id: 'scandinavian-light',
    name: 'Scandinavian Light',
    description: 'Warm stone canvas with architectural minimalism',
    isDark: false,
    colors: {
      background: '#FAFAF9',
      card: '#FFFFFF',
      border: '#E7E5E4',
      text: '#1C1917',
      textSecondary: '#78716C',
      accent: '#059669',
      accentSecondary: '#10B981',
      success: '#059669',
      warning: '#D97706',
      error: '#DC2626',
    },
    typography: {
      heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
      sizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
      },
      weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Dark dashboard aesthetic',
    isDark: true,
    colors: {
      background: '#0F172A',
      card: '#1E293B',
      border: '#334155',
      text: '#F1F5F9',
      textSecondary: '#94A3B8',
      accent: '#F59E0B',
      accentSecondary: '#FBBF24',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    typography: {
      heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
      sizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
      },
      weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
  },
  {
    id: 'daylight',
    name: 'Daylight',
    description: 'Bright and airy',
    isDark: false,
    colors: {
      background: '#FFFFFF',
      card: '#F8FAFC',
      border: '#E2E8F0',
      text: '#0F172A',
      textSecondary: '#64748B',
      accent: '#3B82F6',
      accentSecondary: '#60A5FA',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    typography: {
      heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
      sizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
      },
      weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
  },
  {
    id: 'ember',
    name: 'Ember',
    description: 'Warm orange tones',
    isDark: true,
    colors: {
      background: '#1C1917',
      card: '#292524',
      border: '#44403C',
      text: '#F5F5F4',
      textSecondary: '#A8A29E',
      accent: '#EA580C',
      accentSecondary: '#FB923C',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    typography: {
      heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
      sizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
      },
      weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Deep green tones',
    isDark: true,
    colors: {
      background: '#022C22',
      card: '#064E3B',
      border: '#047857',
      text: '#ECFDF5',
      textSecondary: '#6EE7B7',
      accent: '#34D399',
      accentSecondary: '#6EE7B7',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    typography: {
      heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
      sizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
      },
      weights: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
  },
];

export class ThemeManager {
  private themes: Map<string, Theme> = new Map();
  private currentThemeId: string = 'scandinavian-light';

  constructor() {
    // Register built-in themes
    BUILTIN_THEMES.forEach((theme) => this.registerTheme(theme));
    this.loadCustomThemes();
  }

  /**
   * Register a theme
   */
  registerTheme(theme: Theme): void {
    this.themes.set(theme.id, theme);
  }

  /**
   * Get a theme by ID
   */
  getTheme(themeId: string): Theme | undefined {
    return this.themes.get(themeId);
  }

  /**
   * Set current theme
   */
  setCurrentTheme(themeId: string): void {
    if (!this.themes.has(themeId)) {
      throw new Error(`Theme "${themeId}" not found`);
    }
    this.currentThemeId = themeId;
    this.savePreference(themeId);
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): Theme {
    const theme = this.themes.get(this.currentThemeId);
    if (!theme) {
      return BUILTIN_THEMES[0];
    }
    return theme;
  }

  /**
   * Get all themes
   */
  getAllThemes(): Theme[] {
    return Array.from(this.themes.values());
  }

  /**
   * Save theme preference to localStorage
   */
  private savePreference(themeId: string): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('gitinfographics-theme', themeId);
      }
    } catch {}
  }

  /**
   * Load theme preference from localStorage
   */
  loadPreference(): string | null {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('gitinfographics-theme');
      }
    } catch {}
    return null;
  }

  /**
   * Load custom themes from localStorage
   */
  private loadCustomThemes(): void {
    try {
      if (typeof window === 'undefined') return;

      const customThemes = localStorage.getItem('gitinfographics-custom-themes');
      if (customThemes) {
        const parsed = JSON.parse(customThemes);
        parsed.forEach((theme: Theme) => {
          theme.isCustom = true;
          this.themes.set(theme.id, theme);
        });
      }
    } catch (error) {
      // Ignored if storage is blocked or corrupt
    }
  }

  /**
   * Save custom theme
   */
  saveCustomTheme(theme: Theme): void {
    theme.isCustom = true;
    this.themes.set(theme.id, theme);

    try {
      if (typeof window !== 'undefined') {
        const customThemes = this.getAllThemes()
          .filter((t) => t.isCustom)
          .map((t) => ({ ...t }));
        localStorage.setItem('gitinfographics-custom-themes', JSON.stringify(customThemes));
      }
    } catch {}
  }

  /**
   * Delete custom theme
   */
  deleteCustomTheme(themeId: string): void {
    const theme = this.themes.get(themeId);
    if (!theme?.isCustom) {
      throw new Error('Can only delete custom themes');
    }

    this.themes.delete(themeId);

    try {
      if (typeof window !== 'undefined') {
        const customThemes = this.getAllThemes()
          .filter((t) => t.isCustom)
          .map((t) => ({ ...t }));
        localStorage.setItem('gitinfographics-custom-themes', JSON.stringify(customThemes));
      }
    } catch {}
  }

  /**
   * Generate CSS variables from theme
   */
  generateCSSVariables(theme: Theme): string {
    return `
      :root {
        --color-background: ${theme.colors.background};
        --color-card: ${theme.colors.card};
        --color-border: ${theme.colors.border};
        --color-text: ${theme.colors.text};
        --color-text-secondary: ${theme.colors.textSecondary};
        --color-accent: ${theme.colors.accent};
        --color-accent-secondary: ${theme.colors.accentSecondary};
        --color-success: ${theme.colors.success};
        --color-warning: ${theme.colors.warning};
        --color-error: ${theme.colors.error};
        
        --font-heading: ${theme.typography.heading};
        --font-body: ${theme.typography.body};
        --font-mono: ${theme.typography.mono};
        
        --font-size-xs: ${theme.typography.sizes.xs};
        --font-size-sm: ${theme.typography.sizes.sm};
        --font-size-base: ${theme.typography.sizes.base};
        --font-size-lg: ${theme.typography.sizes.lg};
        --font-size-xl: ${theme.typography.sizes.xl};
        --font-size-2xl: ${theme.typography.sizes['2xl']};
        --font-size-3xl: ${theme.typography.sizes['3xl']};
        
        --font-weight-normal: ${theme.typography.weights.normal};
        --font-weight-medium: ${theme.typography.weights.medium};
        --font-weight-semibold: ${theme.typography.weights.semibold};
        --font-weight-bold: ${theme.typography.weights.bold};
      }
    `;
  }
}

export default ThemeManager;
