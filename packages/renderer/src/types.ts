export type {
  ParsedDoc,
  DocSection,
  TableData,
  CodeBlock,
  BadgeItem,
  ImageItem,
  NestedListItem,
  SectionType
} from '@gitinfographics/parser';

export type {
  MetricItem,
  FeatureItem,
  StepItem,
  ContentListItem,
  TimelineItem,
  ComparisonRow,
  LogoConfig,
  SectionSource,
  SpecSection,
  SmartRecommendation,
  GroundingMetrics,
  InfographicSpec,
  GitHubMeta,
  VariantMap,
  VisualDensity
} from '@gitinfographics/analyzer';

import type { InfographicSpec, VisualDensity, LogoConfig } from '@gitinfographics/analyzer';

export interface ThemeConfig {
  id: string;
  name: string;
  isDark: boolean;
  bg: string;
  cardBg: string;
  cardBorder: string;
  cardBorderAccent?: string;
  text: string;
  textMuted: string;
  accent: string;
  accent2: string;
  success: string;
  warning?: string;
  badgeBg: string;
  badgeText: string;
  fontFamily: string;
  _font?: string;
}

export interface DensityConfig {
  showIcons: boolean;
  showBadges: boolean;
  showDataViz: boolean;
  showDecorations: boolean;
  description: string;
}

export const DENSITY_CONFIG: Record<VisualDensity, DensityConfig> = {
  minimal: {
    showIcons: false,
    showBadges: false,
    showDataViz: false,
    showDecorations: false,
    description: 'Clean, text-focused, maximum readability and compact sizing.'
  },
  medium: {
    showIcons: true,
    showBadges: true,
    showDataViz: false,
    showDecorations: true,
    description: 'Balanced. Adds semantic vector icons, status badges, and color-coded chips.'
  },
  dense: {
    showIcons: true,
    showBadges: true,
    showDataViz: true,
    showDecorations: true,
    description: 'Rich infographic. Progress bars, metric indicators, diff badges & micro-illustrations.'
  }
};

export interface RenderOptions {
  layout?: 'desktop' | 'mobile';
  width?: number;
  showQR?: boolean;
  qrUrl?: string;
  logo?: LogoConfig;
  animated?: boolean;
  compact?: boolean;
  density?: VisualDensity;
}
