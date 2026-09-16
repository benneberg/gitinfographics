import { BadgeItem, FeatureItem, MetricItem, ParsedDoc } from './types';
import { cleanMarkdownText } from '@gitinfographics/parser';
export { cleanMarkdownText };
export declare function trunc(s: string, max: number): string;
/**
 * Advanced Metric Extraction:
 * - 14 regex metric miners (percentages, counts, latencies, multipliers, versions).
 * - Label normalization for deduplication.
 * - Rejection of false positives.
 */
export declare function extractMetrics(text: string): MetricItem[];
/**
 * Badge -> metric mining (shields.io, coverage badges, etc.)
 */
export declare function extractMetricsFromBadges(badges: BadgeItem[]): MetricItem[];
/**
 * Feature Extraction: Extracts clean title & description from bold, links, bullets, colons, checkboxes.
 */
export declare function splitFeat(text: string): FeatureItem;
export declare const TECH_KW: string[];
/**
 * Smarter Tech Extraction:
 * Looks for keywords, package.json dependencies, requirements.txt, Dockerfiles, and file extensions
 */
export declare function extractTechAdvanced(doc: ParsedDoc): string[];
//# sourceMappingURL=extractors.d.ts.map