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
  problem: /\b(problems?|pain\s*points?|challenges?|why\s+(we|this)|motivation|gaps?|frustrat\w*|struggles?|issues?|difficult\w*|bottlenecks?)\b/i,
  solution: /\b(solutions?|approaches|approach|how\s+(we|it)\s+works?|what\s+we\s+built|our\s+approach|resolutions?|fixes|fix|answers?|products?)\b/i,
  features: /\b(features?|capabilities|capability|highlights?|what\s+(it|you)\s+(does|can)|key\s+(capabilities|capability|features?)|functionalities|functionality|benefits?|advantages?|what\'s\s+included)\b/i,
  'tech-stack': /\b(tech\s*stack|built\s*with|dependencies|powered\s*by|technolog\w*|under\s*the\s*hood|stack|requirements?|prerequisites?|system\s+requirements?)\b/i,
  'getting-started': /\b(install\w*|setup|quick\s*start|getting\s*started|prerequisites?|how\s+to\s+(install|run|start)|build|compile|development)\b/i,
  architecture: /\b(architecture|design|structure|component\s*overview|system\s*design|diagram|how\s+it\s+works|overview|platform)\b/i,
  api: /\b(api|apis|endpoint|endpoints|routes?|requests?|responses?|http|graphql|rest|swagger|openapi|sdk|sdks|client|clients)\b/i,
  usage: /\b(usage|examples?|how\s+to\s+use|basic|tutorials?|guides?|demos?|samples?|snippets?|playground)\b/i,
  contributing: /\b(contribut\w*|develop\w*|guidelines?|pull\s+requests?|pr|prs|code\s+of\s+conduct|commits?|cla)\b/i,
  roadmap: /\b(roadmaps?|plans?|future|next\s+steps?|coming|todo|upcoming|milestones?|releases?|changelogs?|versions?)\b/i,
  metrics: /\b(benchmarks?|performance|metrics?|stats?|by\s+the\s+numbers?|results?|speed|latency|throughput|efficiency|scale|kpis?)\b/i,
  security: /\b(security|auth|authenticat\w*|authoriz\w*|encrypt\w*|vulnerabilit\w*|cve|safe|protect\w*|oauth|jwt|ssl|tls|permissions?)\b/i,
  testing: /\b(tests?|testing|specs?|coverage|jest|cypress|playwright|vitest|unit|e2e|integration|qa)\b/i,
  license: /\b(license|licenses|licence|licences|copyright|mit|apache|gpl|bsd|copying|legal)\b/i,
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
