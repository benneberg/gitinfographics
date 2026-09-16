// Auto-extracted TypeScript type definitions
// Generated: 2026-09-16 08:35 UTC
// Types annotated with 'used in:' show cross-file import relationships.


// -- .llm-context/types-extracted.ts --
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export type MobileTab = 'preview' | 'editor' | 'style' | 'export';

export interface FormatConfig {
  id: string;
  name: string;
  shortLabel: string;
  widthLabel: string;
  dimensions: string;
  aspectClass: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
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

export type ColorBlindnessType = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export interface IconOptions {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export interface QROptions {
  size?: number;
  color?: string;
  margin?: number;
}

export interface RenderResult {
  svg: string;
  height: number;
}

export interface SampleReadme {
  id: string;
  name: string;
  repo: string;
  description: string;
  markdown: string;
  mockMeta?: GitHubMeta;
}

export interface TableData {
  header: string[];
  rows: string[][];
}

export interface CodeBlock {
  lang: string;
  lines: string[];
}

export interface BadgeItem {
  alt: string;
  url: string;
}

export interface ImageItem {
  alt: string;
  url: string;
}

export interface NestedListItem {
  depth: number;
  content: string;
}

export interface DocSection {
  level: number;
  title: string;
  content: string[];
  lists: string[];
  nestedLists: NestedListItem[];
  rawText: string;
  codeBlocks: CodeBlock[];
  images: ImageItem[];
  tables: TableData[];
  lineIndex?: number;
  totalLinesHint?: number;
  type?: SectionType;
}

export interface ParsedDoc {
  title: string;
  subtitle: string;
  sections: DocSection[];
  badges: BadgeItem[];
  images: ImageItem[];
}

export type SectionType =
  | 'problem'
  | 'solution'
  | 'features'
  | 'tech-stack'
  | 'getting-started'
  | 'architecture'
  | 'api'
  | 'usage'
  | 'contributing'
  | 'roadmap'
  | 'metrics'
  | 'security'
  | 'testing'
  | 'license'
  | 'generic';

export interface MetricItem {
  value: string;
  label: string;
}

export interface FeatureItem {
  title: string;
  description: string;
}

export interface StepItem {
  step: number;
  title: string;
  description: string;
}

export interface ContentListItem {
  title: string;
  description: string;
}

export interface TimelineItem {
  versionOrDate: string;
  title: string;
  description: string;
}

export interface ComparisonRow {
  feature: string;
  us: string | boolean;
  others: string | boolean;
}

export interface LogoConfig {
  dataUrl: string;
  position: 'top-left' | 'top-right' | 'center';
  size: number;
}

export interface SectionSource {
  sectionTitle?: string;
  sourceType: string;
  lineIndex?: number;
  confidence: number; // 0 to 100
  signalReason: string;
}

export type SpecSection =
  | {
      id: string;

export interface SmartRecommendation {
  layoutType: 'balanced-studio' | 'feature-grid' | 'timeline' | 'compact-cli' | 'stats-metric';
  label: string;
  confidence: number;
  reason: string;
  suggestedDensity: VisualDensity;
  suggestedVariants: VariantMap;
}

export interface GroundingMetrics {
  coveragePercent: number;
  sourceDensity: 'compact' | 'balanced' | 'comprehensive';
  totalSourceLines: number;
  contributingSections: number;
  totalParsedSections: number;
  averageConfidence: number;
  recommendation: SmartRecommendation;
}

export interface InfographicSpec {
  title: string;
  subtitle: string;
  sections: SpecSection[];
  meta?: GitHubMeta;
  logo?: LogoConfig;
  grounding?: GroundingMetrics;
}

export interface GitHubMeta {
  owner: string;
  repo: string;
  description?: string;
  url?: string;
  stars: number;
  forks: number;
  openIssues?: number;
  watchers?: number;
  license?: string;
  language?: string;
  topics?: string[];
  pushedAt?: string;
}

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

export type VariantMap = Record<string, number>;

export type VisualDensity = 'minimal' | 'medium' | 'dense';

export interface DensityConfig {
  showIcons: boolean;
  showBadges: boolean;
  showDataViz: boolean;
  showDecorations: boolean;
  description: string;
}

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

export interface ExportFormat {
  name: string;
  width: number;
  height: number | 'auto';
  description: string;
}

export interface ExportOptions {
  format: ExportFormat;
  scale?: number; // For @2x exports
  theme?: string;
}

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

export interface GenerationRecord {
  id: string;
  timestamp: number;
  svgContent: string;
  format: ExportFormat;
  themeId: string;
  sourceHash: string;
  metadata: {
    duration: number;
    sectionsCount: number;
    metricsCount: number;
  };
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  source: {
    type: 'github' | 'url' | 'text';
    url?: string;
    content: string;
    metadata?: Record<string, any>;
  };
  settings: {
    format: ExportFormat;
    themeId: string;
    customSettings?: Record<string, any>;
  };
  generations: GenerationRecord[];
}

export interface Shortcut {
  keys: string;
  description: string;
  handler: () => void;
  category: 'general' | 'export' | 'navigation' | 'editing';
}

export interface MetricItem {
    value: string;
    label: string;
}

export interface FeatureItem {
    title: string;
    description: string;
}

export interface StepItem {
    step: number;
    title: string;
    description: string;
}

export interface ContentListItem {
    title: string;
    description: string;
}

export interface TimelineItem {
    versionOrDate: string;
    title: string;
    description: string;
}

export interface ComparisonRow {
    feature: string;
    us: string | boolean;
    others: string | boolean;
}

export interface LogoConfig {
    dataUrl: string;
    position: 'top-left' | 'top-right' | 'center';
    size: number;
}

export interface SectionSource {
    sectionTitle?: string;
    sourceType: string;
    lineIndex?: number;
    confidence: number;
    signalReason: string;
}

export type SpecSection = {
    id: string;

export type VisualDensity = 'minimal' | 'medium' | 'dense';

export type VariantMap = Record<string, number>;

export interface SmartRecommendation {
    layoutType: 'balanced-studio' | 'feature-grid' | 'timeline' | 'compact-cli' | 'stats-metric';
    label: string;
    confidence: number;
    reason: string;
    suggestedDensity: VisualDensity;
    suggestedVariants: VariantMap;
}

export interface GroundingMetrics {
    coveragePercent: number;
    sourceDensity: 'compact' | 'balanced' | 'comprehensive';
    totalSourceLines: number;
    contributingSections: number;
    totalParsedSections: number;
    averageConfidence: number;
    recommendation: SmartRecommendation;
}

export interface InfographicSpec {
    title: string;
    subtitle: string;
    sections: SpecSection[];
    meta?: GitHubMeta;
    logo?: LogoConfig;
    grounding?: GroundingMetrics;
}

export interface GitHubMeta {
    owner: string;
    repo: string;
    description?: string;
    url?: string;
    stars: number;
    forks: number;
    openIssues?: number;
    watchers?: number;
    license?: string;
    language?: string;
    topics?: string[];
    pushedAt?: string;
}

export interface MetricItem {
  value: string;
  label: string;
}

export interface FeatureItem {
  title: string;
  description: string;
}

export interface StepItem {
  step: number;
  title: string;
  description: string;
}

export interface ContentListItem {
  title: string;
  description: string;
}

export interface TimelineItem {
  versionOrDate: string;
  title: string;
  description: string;
}

export interface ComparisonRow {
  feature: string;
  us: string | boolean;
  others: string | boolean;
}

export interface LogoConfig {
  dataUrl: string;
  position: 'top-left' | 'top-right' | 'center';
  size: number;
}

export interface SectionSource {
  sectionTitle?: string;
  sourceType: string;
  lineIndex?: number;
  confidence: number; // 0 to 100
  signalReason: string;
}

export type SpecSection =
  | {
      id: string;

export type VisualDensity = 'minimal' | 'medium' | 'dense';

export type VariantMap = Record<string, number>;

export interface SmartRecommendation {
  layoutType: 'balanced-studio' | 'feature-grid' | 'timeline' | 'compact-cli' | 'stats-metric';
  label: string;
  confidence: number;
  reason: string;
  suggestedDensity: VisualDensity;
  suggestedVariants: VariantMap;
}

export interface GroundingMetrics {
  coveragePercent: number;
  sourceDensity: 'compact' | 'balanced' | 'comprehensive';
  totalSourceLines: number;
  contributingSections: number;
  totalParsedSections: number;
  averageConfidence: number;
  recommendation: SmartRecommendation;
}

export interface InfographicSpec {
  title: string;
  subtitle: string;
  sections: SpecSection[];
  meta?: GitHubMeta;
  logo?: LogoConfig;
  grounding?: GroundingMetrics;
}

export interface GitHubMeta {
  owner: string;
  repo: string;
  description?: string;
  url?: string;
  stars: number;
  forks: number;
  openIssues?: number;
  watchers?: number;
  license?: string;
  language?: string;
  topics?: string[];
  pushedAt?: string;
}

export interface TableData {
    header: string[];
    rows: string[][];
}

export interface CodeBlock {
    lang: string;
    lines: string[];
}

export interface BadgeItem {
    alt: string;
    url: string;
}

export interface ImageItem {
    alt: string;
    url: string;
}

export interface NestedListItem {
    depth: number;
    content: string;
}

export type SectionType = 'problem' | 'solution' | 'features' | 'tech-stack' | 'getting-started' | 'architecture' | 'api' | 'usage' | 'contributing' | 'roadmap' | 'metrics' | 'security' | 'testing' | 'license' | 'generic';

export interface DocSection {
    level: number;
    title: string;
    content: string[];
    lists: string[];
    nestedLists: NestedListItem[];
    rawText: string;
    codeBlocks: CodeBlock[];
    images: ImageItem[];
    tables: TableData[];
    lineIndex?: number;
    totalLinesHint?: number;
    type?: SectionType;
}

export interface ParsedDoc {
    title: string;
    subtitle: string;
    sections: DocSection[];
    badges: BadgeItem[];
    images: ImageItem[];
}

export interface TableData {
  header: string[];
  rows: string[][];
}

export interface CodeBlock {
  lang: string;
  lines: string[];
}

export interface BadgeItem {
  alt: string;
  url: string;
}

export interface ImageItem {
  alt: string;
  url: string;
}

export interface NestedListItem {
  depth: number;
  content: string;
}

export type SectionType =
  | 'problem'
  | 'solution'
  | 'features'
  | 'tech-stack'
  | 'getting-started'
  | 'architecture'
  | 'api'
  | 'usage'
  | 'contributing'
  | 'roadmap'
  | 'metrics'
  | 'security'
  | 'testing'
  | 'license'
  | 'generic';

export interface DocSection {
  level: number;
  title: string;
  content: string[];
  lists: string[];
  nestedLists: NestedListItem[];
  rawText: string;
  codeBlocks: CodeBlock[];
  images: ImageItem[];
  tables: TableData[];
  lineIndex?: number;
  totalLinesHint?: number;
  type?: SectionType;
}

export interface ParsedDoc {
  title: string;
  subtitle: string;
  sections: DocSection[];
  badges: BadgeItem[];
  images: ImageItem[];
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

export type ColorBlindnessType = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export interface IconOptions {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export interface QROptions {
  size?: number;
  color?: string;
  margin?: number;
}

export interface RenderResult {
  svg: string;
  height: number;
}

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

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export type MobileTab = 'preview' | 'editor' | 'style' | 'export';

export interface FormatConfig {
  id: string;
  name: string;
  shortLabel: string;
  widthLabel: string;
  dimensions: string;
  aspectClass: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
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

export type ColorBlindnessType = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export interface IconOptions {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export interface QROptions {
  size?: number;
  color?: string;
  margin?: number;
}

export interface RenderResult {
  svg: string;
  height: number;
}

export interface SampleReadme {
  id: string;
  name: string;
  repo: string;
  description: string;
  markdown: string;
  mockMeta?: GitHubMeta;
}

export interface TableData {
  header: string[];
  rows: string[][];
}

export interface CodeBlock {
  lang: string;
  lines: string[];
}

export interface BadgeItem {
  alt: string;
  url: string;
}

export interface ImageItem {
  alt: string;
  url: string;
}

export interface NestedListItem {
  depth: number;
  content: string;
}

export interface DocSection {
  level: number;
  title: string;
  content: string[];
  lists: string[];
  nestedLists: NestedListItem[];
  rawText: string;
  codeBlocks: CodeBlock[];
  images: ImageItem[];
  tables: TableData[];
  lineIndex?: number;
  totalLinesHint?: number;
  type?: SectionType;
}

export interface ParsedDoc {
  title: string;
  subtitle: string;
  sections: DocSection[];
  badges: BadgeItem[];
  images: ImageItem[];
}

export type SectionType =
  | 'problem'
  | 'solution'
  | 'features'
  | 'tech-stack'
  | 'getting-started'
  | 'architecture'
  | 'api'
  | 'usage'
  | 'contributing'
  | 'roadmap'
  | 'metrics'
  | 'security'
  | 'testing'
  | 'license'
  | 'generic';

export interface MetricItem {
  value: string;
  label: string;
}

export interface FeatureItem {
  title: string;
  description: string;
}

export interface StepItem {
  step: number;
  title: string;
  description: string;
}

export interface ContentListItem {
  title: string;
  description: string;
}

export interface TimelineItem {
  versionOrDate: string;
  title: string;
  description: string;
}

export interface ComparisonRow {
  feature: string;
  us: string | boolean;
  others: string | boolean;
}

export interface LogoConfig {
  dataUrl: string;
  position: 'top-left' | 'top-right' | 'center';
  size: number;
}

export interface SectionSource {
  sectionTitle?: string;
  sourceType: string;
  lineIndex?: number;
  confidence: number; // 0 to 100
  signalReason: string;
}

export type SpecSection =
  | {
      id: string;

export interface SmartRecommendation {
  layoutType: 'balanced-studio' | 'feature-grid' | 'timeline' | 'compact-cli' | 'stats-metric';
  label: string;
  confidence: number;
  reason: string;
  suggestedDensity: VisualDensity;
  suggestedVariants: VariantMap;
}

export interface GroundingMetrics {
  coveragePercent: number;
  sourceDensity: 'compact' | 'balanced' | 'comprehensive';
  totalSourceLines: number;
  contributingSections: number;
  totalParsedSections: number;
  averageConfidence: number;
  recommendation: SmartRecommendation;
}

export interface InfographicSpec {
  title: string;
  subtitle: string;
  sections: SpecSection[];
  meta?: GitHubMeta;
  logo?: LogoConfig;
  grounding?: GroundingMetrics;
}

export interface GitHubMeta {
  owner: string;
  repo: string;
  description?: string;
  url?: string;
  stars: number;
  forks: number;
  openIssues?: number;
  watchers?: number;
  license?: string;
  language?: string;
  topics?: string[];
  pushedAt?: string;
}

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

export type VariantMap = Record<string, number>;

export type VisualDensity = 'minimal' | 'medium' | 'dense';

export interface DensityConfig {
  showIcons: boolean;
  showBadges: boolean;
  showDataViz: boolean;
  showDecorations: boolean;
  description: string;
}

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

export interface ExportFormat {
  name: string;
  width: number;
  height: number | 'auto';
  description: string;
}

export interface ExportOptions {
  format: ExportFormat;
  scale?: number; // For @2x exports
  theme?: string;
}

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

export interface GenerationRecord {
  id: string;
  timestamp: number;
  svgContent: string;
  format: ExportFormat;
  themeId: string;
  sourceHash: string;
  metadata: {
    duration: number;
    sectionsCount: number;
    metricsCount: number;
  };
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  source: {
    type: 'github' | 'url' | 'text';
    url?: string;
    content: string;
    metadata?: Record<string, any>;
  };
  settings: {
    format: ExportFormat;
    themeId: string;
    customSettings?: Record<string, any>;
  };
  generations: GenerationRecord[];
}

export interface Shortcut {
  keys: string;
  description: string;
  handler: () => void;
  category: 'general' | 'export' | 'navigation' | 'editing';
}

export interface MetricItem {
    value: string;
    label: string;
}

export interface FeatureItem {
    title: string;
    description: string;
}

export interface StepItem {
    step: number;
    title: string;
    description: string;
}

export interface ContentListItem {
    title: string;
    description: string;
}

export interface TimelineItem {
    versionOrDate: string;
    title: string;
    description: string;
}

export interface ComparisonRow {
    feature: string;
    us: string | boolean;
    others: string | boolean;
}

export interface LogoConfig {
    dataUrl: string;
    position: 'top-left' | 'top-right' | 'center';
    size: number;
}

export interface SectionSource {
    sectionTitle?: string;
    sourceType: string;
    lineIndex?: number;
    confidence: number;
    signalReason: string;
}

export type SpecSection = {
    id: string;

export type VisualDensity = 'minimal' | 'medium' | 'dense';

export type VariantMap = Record<string, number>;

export interface SmartRecommendation {
    layoutType: 'balanced-studio' | 'feature-grid' | 'timeline' | 'compact-cli' | 'stats-metric';
    label: string;
    confidence: number;
    reason: string;
    suggestedDensity: VisualDensity;
    suggestedVariants: VariantMap;
}

export interface GroundingMetrics {
    coveragePercent: number;
    sourceDensity: 'compact' | 'balanced' | 'comprehensive';
    totalSourceLines: number;
    contributingSections: number;
    totalParsedSections: number;
    averageConfidence: number;
    recommendation: SmartRecommendation;
}

export interface InfographicSpec {
    title: string;
    subtitle: string;
    sections: SpecSection[];
    meta?: GitHubMeta;
    logo?: LogoConfig;
    grounding?: GroundingMetrics;
}

export interface GitHubMeta {
    owner: string;
    repo: string;
    description?: string;
    url?: string;
    stars: number;
    forks: number;
    openIssues?: number;
    watchers?: number;
    license?: string;
    language?: string;
    topics?: string[];
    pushedAt?: string;
}

export interface MetricItem {
  value: string;
  label: string;
}

export interface FeatureItem {
  title: string;
  description: string;
}

export interface StepItem {
  step: number;
  title: string;
  description: string;
}

export interface ContentListItem {
  title: string;
  description: string;
}

export interface TimelineItem {
  versionOrDate: string;
  title: string;
  description: string;
}

export interface ComparisonRow {
  feature: string;
  us: string | boolean;
  others: string | boolean;
}

export interface LogoConfig {
  dataUrl: string;
  position: 'top-left' | 'top-right' | 'center';
  size: number;
}

export interface SectionSource {
  sectionTitle?: string;
  sourceType: string;
  lineIndex?: number;
  confidence: number; // 0 to 100
  signalReason: string;
}

export type SpecSection =
  | {
      id: string;

export type VisualDensity = 'minimal' | 'medium' | 'dense';

export type VariantMap = Record<string, number>;

export interface SmartRecommendation {
  layoutType: 'balanced-studio' | 'feature-grid' | 'timeline' | 'compact-cli' | 'stats-metric';
  label: string;
  confidence: number;
  reason: string;
  suggestedDensity: VisualDensity;
  suggestedVariants: VariantMap;
}

export interface GroundingMetrics {
  coveragePercent: number;
  sourceDensity: 'compact' | 'balanced' | 'comprehensive';
  totalSourceLines: number;
  contributingSections: number;
  totalParsedSections: number;
  averageConfidence: number;
  recommendation: SmartRecommendation;
}

export interface InfographicSpec {
  title: string;
  subtitle: string;
  sections: SpecSection[];
  meta?: GitHubMeta;
  logo?: LogoConfig;
  grounding?: GroundingMetrics;
}

export interface GitHubMeta {
  owner: string;
  repo: string;
  description?: string;
  url?: string;
  stars: number;
  forks: number;
  openIssues?: number;
  watchers?: number;
  license?: string;
  language?: string;
  topics?: string[];
  pushedAt?: string;
}

export interface TableData {
    header: string[];
    rows: string[][];
}

export interface CodeBlock {
    lang: string;
    lines: string[];
}

export interface BadgeItem {
    alt: string;
    url: string;
}

export interface ImageItem {
    alt: string;
    url: string;
}

export interface NestedListItem {
    depth: number;
    content: string;
}

export type SectionType = 'problem' | 'solution' | 'features' | 'tech-stack' | 'getting-started' | 'architecture' | 'api' | 'usage' | 'contributing' | 'roadmap' | 'metrics' | 'security' | 'testing' | 'license' | 'generic';

export interface DocSection {
    level: number;
    title: string;
    content: string[];
    lists: string[];
    nestedLists: NestedListItem[];
    rawText: string;
    codeBlocks: CodeBlock[];
    images: ImageItem[];
    tables: TableData[];
    lineIndex?: number;
    totalLinesHint?: number;
    type?: SectionType;
}

export interface ParsedDoc {
    title: string;
    subtitle: string;
    sections: DocSection[];
    badges: BadgeItem[];
    images: ImageItem[];
}

export interface TableData {
  header: string[];
  rows: string[][];
}

export interface CodeBlock {
  lang: string;
  lines: string[];
}

export interface BadgeItem {
  alt: string;
  url: string;
}

export interface ImageItem {
  alt: string;
  url: string;
}

export interface NestedListItem {
  depth: number;
  content: string;
}

export type SectionType =
  | 'problem'
  | 'solution'
  | 'features'
  | 'tech-stack'
  | 'getting-started'
  | 'architecture'
  | 'api'
  | 'usage'
  | 'contributing'
  | 'roadmap'
  | 'metrics'
  | 'security'
  | 'testing'
  | 'license'
  | 'generic';

export interface DocSection {
  level: number;
  title: string;
  content: string[];
  lists: string[];
  nestedLists: NestedListItem[];
  rawText: string;
  codeBlocks: CodeBlock[];
  images: ImageItem[];
  tables: TableData[];
  lineIndex?: number;
  totalLinesHint?: number;
  type?: SectionType;
}

export interface ParsedDoc {
  title: string;
  subtitle: string;
  sections: DocSection[];
  badges: BadgeItem[];
  images: ImageItem[];
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

export type ColorBlindnessType = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export interface IconOptions {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export interface QROptions {
  size?: number;
  color?: string;
  margin?: number;
}

export interface RenderResult {
  svg: string;
  height: number;
}

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

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export type MobileTab = 'preview' | 'editor' | 'style' | 'export';

export interface FormatConfig {
  id: string;
  name: string;
  shortLabel: string;
  widthLabel: string;
  dimensions: string;
  aspectClass: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
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

export type ColorBlindnessType = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export interface IconOptions {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export interface QROptions {
  size?: number;
  color?: string;
  margin?: number;
}

export interface RenderResult {
  svg: string;
  height: number;
}

export interface SampleReadme {
  id: string;
  name: string;
  repo: string;
  description: string;
  markdown: string;
  mockMeta?: GitHubMeta;
}

export interface TableData {
  header: string[];
  rows: string[][];
}

export interface CodeBlock {
  lang: string;
  lines: string[];
}

export interface BadgeItem {
  alt: string;
  url: string;
}

export interface ImageItem {
  alt: string;
  url: string;
}

export interface NestedListItem {
  depth: number;
  content: string;
}

export interface DocSection {
  level: number;
  title: string;
  content: string[];
  lists: string[];
  nestedLists: NestedListItem[];
  rawText: string;
  codeBlocks: CodeBlock[];
  images: ImageItem[];
  tables: TableData[];
  lineIndex?: number;
  totalLinesHint?: number;
  type?: SectionType;
}

export interface ParsedDoc {
  title: string;
  subtitle: string;
  sections: DocSection[];
  badges: BadgeItem[];
  images: ImageItem[];
}

export type SectionType =
  | 'problem'
  | 'solution'
  | 'features'
  | 'tech-stack'
  | 'getting-started'
  | 'architecture'
  | 'api'
  | 'usage'
  | 'contributing'
  | 'roadmap'
  | 'metrics'
  | 'security'
  | 'testing'
  | 'license'
  | 'generic';

export interface MetricItem {
  value: string;
  label: string;
}

export interface FeatureItem {
  title: string;
  description: string;
}

export interface StepItem {
  step: number;
  title: string;
  description: string;
}

export interface ContentListItem {
  title: string;
  description: string;
}

export interface TimelineItem {
  versionOrDate: string;
  title: string;
  description: string;
}

export interface ComparisonRow {
  feature: string;
  us: string | boolean;
  others: string | boolean;
}

export interface LogoConfig {
  dataUrl: string;
  position: 'top-left' | 'top-right' | 'center';
  size: number;
}

export interface SectionSource {
  sectionTitle?: string;
  sourceType: string;
  lineIndex?: number;
  confidence: number; // 0 to 100
  signalReason: string;
}

export type SpecSection =
  | {
      id: string;

export interface SmartRecommendation {
  layoutType: 'balanced-studio' | 'feature-grid' | 'timeline' | 'compact-cli' | 'stats-metric';
  label: string;
  confidence: number;
  reason: string;
  suggestedDensity: VisualDensity;
  suggestedVariants: VariantMap;
}

export interface GroundingMetrics {
  coveragePercent: number;
  sourceDensity: 'compact' | 'balanced' | 'comprehensive';
  totalSourceLines: number;
  contributingSections: number;
  totalParsedSections: number;
  averageConfidence: number;
  recommendation: SmartRecommendation;
}

export interface InfographicSpec {
  title: string;
  subtitle: string;
  sections: SpecSection[];
  meta?: GitHubMeta;
  logo?: LogoConfig;
  grounding?: GroundingMetrics;
}

export interface GitHubMeta {
  owner: string;
  repo: string;
  description?: string;
  url?: string;
  stars: number;
  forks: number;
  openIssues?: number;
  watchers?: number;
  license?: string;
  language?: string;
  topics?: string[];
  pushedAt?: string;
}

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

export type VariantMap = Record<string, number>;

export type VisualDensity = 'minimal' | 'medium' | 'dense';

export interface DensityConfig {
  showIcons: boolean;
  showBadges: boolean;
  showDataViz: boolean;
  showDecorations: boolean;
  description: string;
}

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

export interface ExportFormat {
  name: string;
  width: number;
  height: number | 'auto';
  description: string;
}

export interface ExportOptions {
  format: ExportFormat;
  scale?: number; // For @2x exports
  theme?: string;
}

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

export interface GenerationRecord {
  id: string;
  timestamp: number;
  svgContent: string;
  format: ExportFormat;
  themeId: string;
  sourceHash: string;
  metadata: {
    duration: number;
    sectionsCount: number;
    metricsCount: number;
  };
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  source: {
    type: 'github' | 'url' | 'text';
    url?: string;
    content: string;
    metadata?: Record<string, any>;
  };
  settings: {
    format: ExportFormat;
    themeId: string;
    customSettings?: Record<string, any>;
  };
  generations: GenerationRecord[];
}

export interface Shortcut {
  keys: string;
  description: string;
  handler: () => void;
  category: 'general' | 'export' | 'navigation' | 'editing';
}


// -- packages/analyzer/src/types.d.ts --
export interface MetricItem {
    value: string;
    label: string;
}

export interface FeatureItem {
    title: string;
    description: string;
}

export interface StepItem {
    step: number;
    title: string;
    description: string;
}

export interface ContentListItem {
    title: string;
    description: string;
}

export interface TimelineItem {
    versionOrDate: string;
    title: string;
    description: string;
}

export interface ComparisonRow {
    feature: string;
    us: string | boolean;
    others: string | boolean;
}

export interface LogoConfig {
    dataUrl: string;
    position: 'top-left' | 'top-right' | 'center';
    size: number;
}

export interface SectionSource {
    sectionTitle?: string;
    sourceType: string;
    lineIndex?: number;
    confidence: number;
    signalReason: string;
}

export type SpecSection = {
    id: string;

export type VisualDensity = 'minimal' | 'medium' | 'dense';

export type VariantMap = Record<string, number>;

export interface SmartRecommendation {
    layoutType: 'balanced-studio' | 'feature-grid' | 'timeline' | 'compact-cli' | 'stats-metric';
    label: string;
    confidence: number;
    reason: string;
    suggestedDensity: VisualDensity;
    suggestedVariants: VariantMap;
}

export interface GroundingMetrics {
    coveragePercent: number;
    sourceDensity: 'compact' | 'balanced' | 'comprehensive';
    totalSourceLines: number;
    contributingSections: number;
    totalParsedSections: number;
    averageConfidence: number;
    recommendation: SmartRecommendation;
}

export interface InfographicSpec {
    title: string;
    subtitle: string;
    sections: SpecSection[];
    meta?: GitHubMeta;
    logo?: LogoConfig;
    grounding?: GroundingMetrics;
}

export interface GitHubMeta {
    owner: string;
    repo: string;
    description?: string;
    url?: string;
    stars: number;
    forks: number;
    openIssues?: number;
    watchers?: number;
    license?: string;
    language?: string;
    topics?: string[];
    pushedAt?: string;
}


// -- packages/analyzer/src/types.ts --
export interface MetricItem {
  value: string;
  label: string;
}
// used in: packages/analyzer/src/extractors.d.ts, packages/analyzer/src/extractors.ts, packages/analyzer/src/specBuilder.ts

export interface FeatureItem {
  title: string;
  description: string;
}
// used in: packages/analyzer/src/extractors.d.ts, packages/analyzer/src/extractors.ts

export interface StepItem {
  step: number;
  title: string;
  description: string;
}

export interface ContentListItem {
  title: string;
  description: string;
}

export interface TimelineItem {
  versionOrDate: string;
  title: string;
  description: string;
}
// used in: packages/analyzer/src/specBuilder.ts

export interface ComparisonRow {
  feature: string;
  us: string | boolean;
  others: string | boolean;
}
// used in: packages/analyzer/src/specBuilder.ts

export interface LogoConfig {
  dataUrl: string;
  position: 'top-left' | 'top-right' | 'center';
  size: number;
}

export interface SectionSource {
  sectionTitle?: string;
  sourceType: string;
  lineIndex?: number;
  confidence: number; // 0 to 100
  signalReason: string;
}
// used in: packages/analyzer/src/specBuilder.ts

export type SpecSection =
  | {
      id: string;
// used in: packages/analyzer/src/specBuilder.d.ts, packages/analyzer/src/specBuilder.ts

export type VisualDensity = 'minimal' | 'medium' | 'dense';

export type VariantMap = Record<string, number>;
// used in: packages/analyzer/src/specBuilder.d.ts, packages/analyzer/src/specBuilder.ts

export interface SmartRecommendation {
  layoutType: 'balanced-studio' | 'feature-grid' | 'timeline' | 'compact-cli' | 'stats-metric';
  label: string;
  confidence: number;
  reason: string;
  suggestedDensity: VisualDensity;
  suggestedVariants: VariantMap;
}
// used in: packages/analyzer/src/specBuilder.d.ts, packages/analyzer/src/specBuilder.ts

export interface GroundingMetrics {
  coveragePercent: number;
  sourceDensity: 'compact' | 'balanced' | 'comprehensive';
  totalSourceLines: number;
  contributingSections: number;
  totalParsedSections: number;
  averageConfidence: number;
  recommendation: SmartRecommendation;
}

export interface InfographicSpec {
  title: string;
  subtitle: string;
  sections: SpecSection[];
  meta?: GitHubMeta;
  logo?: LogoConfig;
  grounding?: GroundingMetrics;
}
// used in: packages/analyzer/src/specBuilder.d.ts, packages/analyzer/src/specBuilder.ts

export interface GitHubMeta {
  owner: string;
  repo: string;
  description?: string;
  url?: string;
  stars: number;
  forks: number;
  openIssues?: number;
  watchers?: number;
  license?: string;
  language?: string;
  topics?: string[];
  pushedAt?: string;
}
// used in: packages/analyzer/src/specBuilder.d.ts, packages/analyzer/src/specBuilder.ts


// -- packages/parser/src/types.d.ts --
export interface TableData {
    header: string[];
    rows: string[][];
}

export interface CodeBlock {
    lang: string;
    lines: string[];
}

export interface BadgeItem {
    alt: string;
    url: string;
}

export interface ImageItem {
    alt: string;
    url: string;
}

export interface NestedListItem {
    depth: number;
    content: string;
}

export type SectionType = 'problem' | 'solution' | 'features' | 'tech-stack' | 'getting-started' | 'architecture' | 'api' | 'usage' | 'contributing' | 'roadmap' | 'metrics' | 'security' | 'testing' | 'license' | 'generic';

export interface DocSection {
    level: number;
    title: string;
    content: string[];
    lists: string[];
    nestedLists: NestedListItem[];
    rawText: string;
    codeBlocks: CodeBlock[];
    images: ImageItem[];
    tables: TableData[];
    lineIndex?: number;
    totalLinesHint?: number;
    type?: SectionType;
}

export interface ParsedDoc {
    title: string;
    subtitle: string;
    sections: DocSection[];
    badges: BadgeItem[];
    images: ImageItem[];
}


// -- packages/parser/src/types.ts --
export interface TableData {
  header: string[];
  rows: string[][];
}
// used in: packages/parser/src/parser.d.ts, packages/parser/src/parser.ts

export interface CodeBlock {
  lang: string;
  lines: string[];
}

export interface BadgeItem {
  alt: string;
  url: string;
}

export interface ImageItem {
  alt: string;
  url: string;
}

export interface NestedListItem {
  depth: number;
  content: string;
}

export type SectionType =
  | 'problem'
  | 'solution'
  | 'features'
  | 'tech-stack'
  | 'getting-started'
  | 'architecture'
  | 'api'
  | 'usage'
  | 'contributing'
  | 'roadmap'
  | 'metrics'
  | 'security'
  | 'testing'
  | 'license'
  | 'generic';
// used in: packages/parser/src/parser.d.ts, packages/parser/src/parser.ts

export interface DocSection {
  level: number;
  title: string;
  content: string[];
  lists: string[];
  nestedLists: NestedListItem[];
  rawText: string;
  codeBlocks: CodeBlock[];
  images: ImageItem[];
  tables: TableData[];
  lineIndex?: number;
  totalLinesHint?: number;
  type?: SectionType;
}
// used in: packages/parser/src/parser.ts

export interface ParsedDoc {
  title: string;
  subtitle: string;
  sections: DocSection[];
  badges: BadgeItem[];
  images: ImageItem[];
}
// used in: packages/parser/src/parser.d.ts, packages/parser/src/parser.ts


// -- packages/renderer/src/contrast.ts --
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

export type ColorBlindnessType = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';


// -- packages/renderer/src/icons.ts --
export interface IconOptions {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}


// -- packages/renderer/src/qr.ts --
export interface QROptions {
  size?: number;
  color?: string;
  margin?: number;
}


// -- packages/renderer/src/renderer.ts --
export interface RenderResult {
  svg: string;
  height: number;
}


// -- packages/renderer/src/types.ts --
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
// used in: packages/renderer/src/contrast.ts, packages/renderer/src/renderer.ts, packages/renderer/src/themes.ts

export interface DensityConfig {
  showIcons: boolean;
  showBadges: boolean;
  showDataViz: boolean;
  showDecorations: boolean;
  description: string;
}

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
// used in: packages/renderer/src/renderer.ts


// -- src/components/Toast.tsx --
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
// used in: src/App.tsx


// -- src/components/mobile/BottomNavigation.tsx --
export type MobileTab = 'preview' | 'editor' | 'style' | 'export';
// used in: src/App.tsx


// -- src/components/mobile/VisualFormatPicker.tsx --
export interface FormatConfig {
  id: string;
  name: string;
  shortLabel: string;
  widthLabel: string;
  dimensions: string;
  aspectClass: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}


// -- src/engine/contrast.ts --
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

export type ColorBlindnessType = 'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';
// used in: src/App.tsx


// -- src/engine/icons.ts --
export interface IconOptions {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}


// -- src/engine/qr.ts --
export interface QROptions {
  size?: number;
  color?: string;
  margin?: number;
}


// -- src/engine/renderer.ts --
export interface RenderResult {
  svg: string;
  height: number;
}


// -- src/engine/samples.ts --
export interface SampleReadme {
  id: string;
  name: string;
  repo: string;
  description: string;
  markdown: string;
  mockMeta?: GitHubMeta;
}


// -- src/engine/types.ts --
export interface TableData {
  header: string[];
  rows: string[][];
}
// used in: src/engine/parser.ts

export interface CodeBlock {
  lang: string;
  lines: string[];
}

export interface BadgeItem {
  alt: string;
  url: string;
}
// used in: src/engine/extractors.ts

export interface ImageItem {
  alt: string;
  url: string;
}

export interface NestedListItem {
  depth: number;
  content: string;
}

export interface DocSection {
  level: number;
  title: string;
  content: string[];
  lists: string[];
  nestedLists: NestedListItem[];
  rawText: string;
  codeBlocks: CodeBlock[];
  images: ImageItem[];
  tables: TableData[];
  lineIndex?: number;
  totalLinesHint?: number;
  type?: SectionType;
}
// used in: src/engine/classifier.ts, src/engine/parser.ts, src/engine/specBuilder.ts

export interface ParsedDoc {
  title: string;
  subtitle: string;
  sections: DocSection[];
  badges: BadgeItem[];
  images: ImageItem[];
}
// used in: src/engine/extractors.ts, src/engine/parser.ts, src/engine/specBuilder.ts

export type SectionType =
  | 'problem'
  | 'solution'
  | 'features'
  | 'tech-stack'
  | 'getting-started'
  | 'architecture'
  | 'api'
  | 'usage'
  | 'contributing'
  | 'roadmap'
  | 'metrics'
  | 'security'
  | 'testing'
  | 'license'
  | 'generic';
// used in: src/engine/classifier.ts, src/engine/parser.ts, src/engine/specBuilder.ts

export interface MetricItem {
  value: string;
  label: string;
}
// used in: src/engine/extractors.ts, src/engine/specBuilder.ts

export interface FeatureItem {
  title: string;
  description: string;
}
// used in: src/engine/extractors.ts

export interface StepItem {
  step: number;
  title: string;
  description: string;
}

export interface ContentListItem {
  title: string;
  description: string;
}

export interface TimelineItem {
  versionOrDate: string;
  title: string;
  description: string;
}
// used in: src/engine/specBuilder.ts

export interface ComparisonRow {
  feature: string;
  us: string | boolean;
  others: string | boolean;
}
// used in: src/engine/specBuilder.ts

export interface LogoConfig {
  dataUrl: string;
  position: 'top-left' | 'top-right' | 'center';
  size: number;
}

export interface SectionSource {
  sectionTitle?: string;
  sourceType: string;
  lineIndex?: number;
  confidence: number; // 0 to 100
  signalReason: string;
}
// used in: src/engine/specBuilder.ts

export type SpecSection =
  | {
      id: string;
// used in: src/engine/renderer.ts, src/engine/specBuilder.ts

export interface SmartRecommendation {
  layoutType: 'balanced-studio' | 'feature-grid' | 'timeline' | 'compact-cli' | 'stats-metric';
  label: string;
  confidence: number;
  reason: string;
  suggestedDensity: VisualDensity;
  suggestedVariants: VariantMap;
}
// used in: src/engine/specBuilder.ts

export interface GroundingMetrics {
  coveragePercent: number;
  sourceDensity: 'compact' | 'balanced' | 'comprehensive';
  totalSourceLines: number;
  contributingSections: number;
  totalParsedSections: number;
  averageConfidence: number;
  recommendation: SmartRecommendation;
}
// used in: src/engine/specBuilder.ts

export interface InfographicSpec {
  title: string;
  subtitle: string;
  sections: SpecSection[];
  meta?: GitHubMeta;
  logo?: LogoConfig;
  grounding?: GroundingMetrics;
}
// used in: src/engine/renderer.ts, src/engine/specBuilder.ts

export interface GitHubMeta {
  owner: string;
  repo: string;
  description?: string;
  url?: string;
  stars: number;
  forks: number;
  openIssues?: number;
  watchers?: number;
  license?: string;
  language?: string;
  topics?: string[];
  pushedAt?: string;
}
// used in: src/engine/github.ts, src/engine/samples.ts, src/engine/specBuilder.ts

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
// used in: src/engine/contrast.ts, src/engine/renderer.ts, src/engine/themes.ts

export type VariantMap = Record<string, number>;
// used in: src/engine/specBuilder.ts

export type VisualDensity = 'minimal' | 'medium' | 'dense';
// used in: src/engine/renderer.ts

export interface DensityConfig {
  showIcons: boolean;
  showBadges: boolean;
  showDataViz: boolean;
  showDecorations: boolean;
  description: string;
}

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
// used in: src/engine/renderer.ts


// -- src/export/CanvasExporter.ts --
export interface ExportFormat {
  name: string;
  width: number;
  height: number | 'auto';
  description: string;
}

export interface ExportOptions {
  format: ExportFormat;
  scale?: number; // For @2x exports
  theme?: string;
}


// -- src/renderer/themes/ThemeManager.ts --
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


// -- src/renderer/themes/contrast.ts --
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


// -- src/storage/ProjectStorage.ts --
export interface GenerationRecord {
  id: string;
  timestamp: number;
  svgContent: string;
  format: ExportFormat;
  themeId: string;
  sourceHash: string;
  metadata: {
    duration: number;
    sectionsCount: number;
    metricsCount: number;
  };
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  source: {
    type: 'github' | 'url' | 'text';
    url?: string;
    content: string;
    metadata?: Record<string, any>;
  };
  settings: {
    format: ExportFormat;
    themeId: string;
    customSettings?: Record<string, any>;
  };
  generations: GenerationRecord[];
}
// used in: src/App.tsx


// -- src/ui/KeyboardShortcuts.ts --
export interface Shortcut {
  keys: string;
  description: string;
  handler: () => void;
  category: 'general' | 'export' | 'navigation' | 'editing';
}
