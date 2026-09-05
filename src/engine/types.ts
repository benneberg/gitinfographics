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

export type SpecSection =
  | {
      id: string;
      type: 'problem-solution';
      problem: string;
      solution: string;
      problemTitle: string;
      solutionTitle: string;
    }
  | {
      id: string;
      type: 'stats';
      items: MetricItem[];
    }
  | {
      id: string;
      type: 'features';
      title: string;
      columns: number;
      items: FeatureItem[];
    }
  | {
      id: string;
      type: 'tech-stack';
      title: string;
      items: string[];
    }
  | {
      id: string;
      type: 'steps';
      title: string;
      items: StepItem[];
    }
  | {
      id: string;
      type: 'content-list';
      title: string;
      items: ContentListItem[];
    }
  | {
      id: string;
      type: 'content-block';
      title: string;
      text: string;
    };

export interface InfographicSpec {
  title: string;
  subtitle: string;
  sections: SpecSection[];
}

export interface GitHubMeta {
  owner: string;
  repo: string;
  description?: string;
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

export interface RenderOptions {
  layout?: 'desktop' | 'mobile';
  width?: number;
}
