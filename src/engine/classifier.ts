import { DocSection, SectionType } from './types';

/**
 * 2. Context-Aware Section Classifier
 * Refinements:
 * - Relative position instead of absolute line numbers.
 * - Title-match boost is stronger than body matches.
 * - Tie-breaker prefers title hits.
 * - Negative bias for ultra-generic titles.
 * - security / testing now map cleanly into content sections.
 */
export const SEC_PATTERNS: Record<SectionType, RegExp> = {
  problem: /\b(problem|pain\s*point|challenge|why\s+(we|this)|motivation|gap|frustrat|struggle|issue|difficult|bottleneck)\b/i,
  solution: /\b(solution|approach|how\s+(we|it)\s+work|what\s+we\s+built|our\s+approach|resolution|fix|answer|product)\b/i,
  features: /\b(feature|capability|highlight|what\s+(it|you)\s+(does|can)|key\s+(capabilit|feature)|functionality|benefit|advantage|what\'s\s+included)\b/i,
  'tech-stack': /\b(tech\s*stack|built\s*with|dependencies|powered\s*by|technolog|under\s*the\s*hood|stack|requirement|prerequisite|system\s+requirement)\b/i,
  'getting-started': /\b(install|setup|quick\s*start|getting\s*started|prerequisite|how\s+to\s+(install|run|start)|build|compile|development)\b/i,
  architecture: /\b(architecture|design|structure|component\s*overview|system\s*design|diagram|how\s+it\s+works|overview|platform)\b/i,
  api: /\b(api|endpoint|route|request|response|http|graphql|rest|swagger|openapi|sdk|client)\b/i,
  usage: /\b(usage|example|how\s+to\s+use|basic|tutorial|guide|demo|sample|snippet|playground)\b/i,
  contributing: /\b(contribut|develop|guideline|pull\s+request|pr|code\s+of\s+conduct|commit|cla)\b/i,
  roadmap: /\b(roadmap|plan|future|next\s+step|coming|todo|upcoming|milestone|release|changelog|version)\b/i,
  metrics: /\b(benchmark|performance|metric|stat|by\s+the\s+number|result|speed|latency|throughput|efficiency|scale|kpi)\b/i,
  security: /\b(security|auth|authenticat|authoriz|encrypt|vulnerability|cve|safe|protect|oauth|jwt|ssl|tls|permission)\b/i,
  testing: /\b(test|spec|coverage|jest|cypress|playwright|vitest|unit|e2e|integration|qa)\b/i,
  license: /\b(license|licence|copyright|mit|apache|gpl|bsd|copying|legal)\b/i,
  generic: /(?!)/ // never matches directly
};

export function classifySec(
  s: DocSection | (Partial<DocSection> & { title: string })
): SectionType {
  const text = (s.title + ' ' + (s.rawText || '') + ' ' + (s.lists || []).join(' ')).toLowerCase();
  const scores: Partial<Record<SectionType, number>> = {};
  const titleHits: Partial<Record<SectionType, boolean>> = {};

  for (const typeKey in SEC_PATTERNS) {
    const type = typeKey as SectionType;
    if (type === 'generic') continue;
    const pat = SEC_PATTERNS[type];
    const m = text.match(pat);
    scores[type] = m ? m.length * 2 : 0;

    // Stronger weight if pattern hits the title itself
    if (pat.test(s.title || '')) {
      scores[type] = (scores[type] || 0) + 4;
      titleHits[type] = true;
    }
  }

  // Relative position (0–1)
  let rel = 0.5;
  if (s.totalLinesHint && s.lineIndex != null) {
    rel = s.lineIndex / Math.max(1, s.totalLinesHint);
  }
  if (rel < 0.15) scores.problem = (scores.problem || 0) + 1.8;
  if (rel > 0.75) scores.roadmap = (scores.roadmap || 0) + 2;
  if (rel > 0.85) scores.license = (scores.license || 0) + 3;

  // Structure signals
  const totalItems = (s.content || []).length + (s.lists || []).length;
  const listRatio = totalItems > 0 ? (s.lists || []).length / totalItems : 0;
  if (listRatio > 0.55) scores.features = (scores.features || 0) + 2;
  if (listRatio > 0.7) scores['getting-started'] = (scores['getting-started'] || 0) + 1.4;

  if (s.codeBlocks && s.codeBlocks.length) {
    scores['tech-stack'] = (scores['tech-stack'] || 0) + 1.6;
    scores['getting-started'] = (scores['getting-started'] || 0) + 1.4;
    scores.api = (scores.api || 0) + 1;
  }
  if (s.tables && s.tables.length) {
    scores.features = (scores.features || 0) + 1.5;
    scores.api = (scores.api || 0) + 1.2;
  }

  // Exact title boosts
  const tl = (s.title || '').toLowerCase();
  if (/^(install|setup|quick\s*start|getting\s*started)/.test(tl)) scores['getting-started'] = (scores['getting-started'] || 0) + 6;
  if (/^(api|endpoint|reference)/.test(tl)) scores.api = (scores.api || 0) + 6;
  if (/^(tech|stack|built\s*with|dependencies)/.test(tl)) scores['tech-stack'] = (scores['tech-stack'] || 0) + 6;
  if (/^(feature|highlight|what\s+it\s+does)/.test(tl)) scores.features = (scores.features || 0) + 6;
  if (/^(problem|why|motivation|challenge)/.test(tl)) scores.problem = (scores.problem || 0) + 6;
  if (/^(solution|how\s+it\s+works|product)/.test(tl)) scores.solution = (scores.solution || 0) + 6;
  if (/^(contrib|develop)/.test(tl)) scores.contributing = (scores.contributing || 0) + 5;
  if (/^(roadmap|future|plan|todo|changelog)/.test(tl)) scores.roadmap = (scores.roadmap || 0) + 5;
  if (/^(license|copyright|legal)/.test(tl)) scores.license = (scores.license || 0) + 7;

  // Mild penalty for ultra-generic titles
  if (/^(overview|introduction|about|summary|readme)$/i.test(tl)) {
    for (const k in scores) {
      const type = k as SectionType;
      if (scores[type]) scores[type]! *= 0.85;
    }
  }

  let best: SectionType = 'generic';
  let bestScore = 0.9;
  for (const k in scores) {
    const type = k as SectionType;
    let sc = scores[type] || 0;
    // Tie-breaker: prefer types that matched the title
    if (titleHits[type]) sc += 0.3;
    if (sc > bestScore) {
      bestScore = sc;
      best = type;
    }
  }
  return best;
}
