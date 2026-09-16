export type { TableData, CodeBlock, BadgeItem, ImageItem, NestedListItem, DocSection, ParsedDoc, SectionType } from '@gitinfographics/parser';
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
    type: 'problem-solution';
    problem: string;
    solution: string;
    problemTitle: string;
    solutionTitle: string;
    source?: SectionSource;
} | {
    id: string;
    type: 'stats';
    items: MetricItem[];
    source?: SectionSource;
} | {
    id: string;
    type: 'features';
    title: string;
    columns: number;
    items: FeatureItem[];
    source?: SectionSource;
} | {
    id: string;
    type: 'tech-stack';
    title: string;
    items: string[];
    source?: SectionSource;
} | {
    id: string;
    type: 'steps';
    title: string;
    items: StepItem[];
    source?: SectionSource;
} | {
    id: string;
    type: 'content-list';
    title: string;
    items: ContentListItem[];
    source?: SectionSource;
} | {
    id: string;
    type: 'content-block';
    title: string;
    text: string;
    source?: SectionSource;
} | {
    id: string;
    type: 'timeline';
    title: string;
    items: TimelineItem[];
    source?: SectionSource;
} | {
    id: string;
    type: 'comparison';
    title: string;
    headers: [string, string, string];
    rows: ComparisonRow[];
    source?: SectionSource;
} | {
    id: string;
    type: 'callout';
    title?: string;
    text: string;
    author?: string;
    calloutType?: 'quote' | 'tip' | 'warning' | 'info';
    source?: SectionSource;
};
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
//# sourceMappingURL=types.d.ts.map