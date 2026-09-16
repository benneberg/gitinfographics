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
