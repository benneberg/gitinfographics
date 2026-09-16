import { ParsedDoc, VariantMap, GitHubMeta, InfographicSpec, SpecSection, SmartRecommendation } from './types';
/**
 * Heuristic detector choosing the ideal visual layout based on repository characteristics.
 */
export declare function detectSmartLayout(doc: ParsedDoc, ghMeta?: GitHubMeta | null, sections?: SpecSection[]): SmartRecommendation;
/**
 * Intelligent Spec Builder:
 * Assembles rule-based specification from parsed document, variants, and GitHub metadata.
 */
export declare function buildRuleSpec(doc: ParsedDoc, vmapOrGhMeta?: VariantMap | GitHubMeta | null, ghMetaOrVmap?: GitHubMeta | VariantMap | null): InfographicSpec;
/**
 * GitHub Metadata Enrichment:
 * Merges repo statistics (stars, forks, open issues, license, etc.)
 */
export declare function mergeGHMeta(spec: InfographicSpec, ghMeta: GitHubMeta): InfographicSpec;
//# sourceMappingURL=specBuilder.d.ts.map