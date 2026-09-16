import { ParsedDoc, TableData, SectionType } from './types';
/**
 * Strips markdown links, bold, italics, code fences, blockquotes, bullets, and URLs.
 * Zero DOM dependencies, works in Node, browser, and edge workers.
 */
export declare function cleanMarkdownText(s: string): string;
/**
 * Zero-DOM Markdown Parser for technical repositories and READMEs.
 * - Defensive HTML tag filtering.
 * - Early & inline badge/image extraction.
 * - Code-block parsing with language normalization and line capping.
 * - Lightweight nested-list tracking.
 * - Defensive table parser.
 */
export declare function parseMD(text: string): ParsedDoc;
export declare function parseTable(rows: string[]): TableData | null;
/**
 * Smart Truncation: Prioritizes high-value sections (problem, solution, features, tech-stack)
 * when README exceeds maximum length.
 */
export declare function smartTrunc(text: string, max: number, classifier?: (s: {
    title: string;
    content?: string[];
    lists?: string[];
    rawText?: string;
}) => SectionType): string;
//# sourceMappingURL=parser.d.ts.map