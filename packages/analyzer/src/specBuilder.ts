import {
  ParsedDoc,
  VariantMap,
  GitHubMeta,
  InfographicSpec,
  DocSection,
  SectionType,
  MetricItem,
  TimelineItem,
  ComparisonRow,
  SpecSection,
  SectionSource,
  SmartRecommendation
} from './types';
import { classifySec } from './classifier';
import {
  extractMetrics,
  extractMetricsFromBadges,
  splitFeat,
  extractTechAdvanced,
  trunc
} from './extractors';

/**
 * Heuristic detector choosing the ideal visual layout based on repository characteristics.
 */
export function detectSmartLayout(
  doc: ParsedDoc,
  ghMeta?: GitHubMeta | null,
  sections?: SpecSection[]
): SmartRecommendation {
  const secList = sections || [];
  const hasTimeline = secList.some((s) => s.type === 'timeline');
  const hasComparison = secList.some((s) => s.type === 'comparison');
  const featureSec = secList.find((s) => s.type === 'features');
  const featureCount = featureSec && 'items' in featureSec ? featureSec.items.length : 0;
  const statsSec = secList.find((s) => s.type === 'stats');
  const statsCount = statsSec && 'items' in statsSec ? statsSec.items.length : 0;
  const stepsSec = secList.find((s) => s.type === 'steps');
  const stepsCount = stepsSec && 'items' in stepsSec ? stepsSec.items.length : 0;

  if (featureCount >= 6 || (hasComparison && featureCount >= 4)) {
    return {
      layoutType: 'feature-grid',
      label: 'Grid Matrix Layout',
      confidence: 95,
      reason: `Dense feature set detected (${featureCount} capabilities). 4-column matrix grid maximizes scan density without vertical scrolling.`,
      suggestedDensity: 'dense',
      suggestedVariants: { features: 2 }
    };
  }

  if (hasTimeline) {
    return {
      layoutType: 'timeline',
      label: 'Roadmap Timeline Layout',
      confidence: 92,
      reason: 'Structured release chronology and milestones detected. Timeline layout provides clear progression visibility.',
      suggestedDensity: 'medium',
      suggestedVariants: { timeline: 0 }
    };
  }

  if (statsCount >= 4 || (ghMeta && (ghMeta.stars > 1000 || ghMeta.forks > 100))) {
    return {
      layoutType: 'stats-metric',
      label: 'Performance Metric Focus',
      confidence: 90,
      reason: 'Rich quantitative telemetry and repository benchmarks detected. Highlights KPI stats for immediate social proof.',
      suggestedDensity: 'dense',
      suggestedVariants: { stats: 0 }
    };
  }

  if (stepsCount >= 3 && secList.length <= 4) {
    return {
      layoutType: 'compact-cli',
      label: 'Workflow Quick-Start Focus',
      confidence: 88,
      reason: 'Streamlined developer workflow with sequential terminal setup commands.',
      suggestedDensity: 'medium',
      suggestedVariants: { features: 1, 'problem-solution': 1 }
    };
  }

  return {
    layoutType: 'balanced-studio',
    label: 'Balanced Studio Layout',
    confidence: 86,
    reason: 'Harmonious multi-tier layout distributing value proposition, architecture, and technology stack.',
    suggestedDensity: 'medium',
    suggestedVariants: { features: 0, stats: 0 }
  };
}

/**
 * Intelligent Spec Builder:
 * Assembles rule-based specification from parsed document, variants, and GitHub metadata.
 */
export function buildRuleSpec(
  doc: ParsedDoc,
  vmapOrGhMeta?: VariantMap | GitHubMeta | null,
  ghMetaOrVmap?: GitHubMeta | VariantMap | null
): InfographicSpec {
  let vmap: VariantMap | undefined;
  let ghMeta: GitHubMeta | null = null;

  if (vmapOrGhMeta && ('stars' in vmapOrGhMeta || 'owner' in vmapOrGhMeta || 'repo' in vmapOrGhMeta)) {
    ghMeta = vmapOrGhMeta as GitHubMeta;
    vmap = (ghMetaOrVmap as VariantMap | undefined) || undefined;
  } else {
    vmap = (vmapOrGhMeta as VariantMap | undefined) || undefined;
    ghMeta = (ghMetaOrVmap as GitHubMeta | null) || null;
  }

  const spec: InfographicSpec = {
    title: doc.title || (ghMeta ? `${ghMeta.owner}/${ghMeta.repo}` : 'Untitled Project'),
    subtitle: doc.subtitle || (ghMeta?.description || ''),
    sections: [],
    meta: ghMeta || undefined
  };

  const cls: (DocSection & { type: SectionType })[] = (doc.sections || []).map((s) => ({
    ...s,
    type: classifySec(s)
  }));

  function find(type: SectionType) {
    for (let i = 0; i < cls.length; i++) {
      if (cls[i].type === type) return cls[i];
    }
    return null;
  }

  const hasGH = !!ghMeta;
  const minStats = hasGH ? 1 : 2;
  const minFeats = hasGH ? 2 : 3;
  const minTech = hasGH ? 2 : 3;

  // Problem / Solution
  const prob = find('problem');
  const sol = find('solution');
  const probText = prob ? (prob.rawText || '').trim() : '';
  const solText = sol ? (sol.rawText || '').trim() : '';

  if ((probText.length > 25 && solText.length > 25) || (probText.length > 50 || solText.length > 50)) {
    const v = ((vmap && vmap['problem-solution']) || 0) % 3;
    spec.sections.push({
      id: 'problem-solution',
      type: 'problem-solution',
      problem: trunc(probText || 'A common challenge in this domain...', v === 0 ? 180 : v === 1 ? 120 : 200),
      solution: trunc(solText || 'This project provides a modern solution.', v === 0 ? 180 : v === 1 ? 120 : 200),
      problemTitle: prob ? prob.title : 'The Problem',
      solutionTitle: sol ? sol.title : 'The Solution',
      source: {
        sectionTitle: prob?.title || sol?.title || 'Problem / Solution',
        sourceType: 'Semantic Classifier',
        lineIndex: prob?.lineIndex ?? sol?.lineIndex,
        confidence: prob && sol ? 94 : 85,
        signalReason: `Matched problem and solution statements (${probText.length + solText.length} characters analyzed)`
      }
    });
  } else if (probText.length > 60) {
    spec.sections.push({
      id: 'content-block',
      type: 'content-block',
      title: prob ? prob.title : 'Challenge',
      text: trunc(probText, 300),
      source: {
        sectionTitle: prob?.title || 'Challenge',
        sourceType: 'Semantic Classifier',
        lineIndex: prob?.lineIndex,
        confidence: 84,
        signalReason: 'Single problem statement block extracted'
      }
    });
  } else if (solText.length > 60) {
    spec.sections.push({
      id: 'content-block',
      type: 'content-block',
      title: sol ? sol.title : 'Solution',
      text: trunc(solText, 300),
      source: {
        sectionTitle: sol?.title || 'Solution',
        sourceType: 'Semantic Classifier',
        lineIndex: sol?.lineIndex,
        confidence: 84,
        signalReason: 'Single solution statement block extracted'
      }
    });
  }

  // Metrics
  let metrics: MetricItem[] = [];
  const mSec = find('metrics');
  if (mSec) {
    metrics = extractMetrics((mSec.rawText || '') + ' ' + (mSec.lists || []).join(' '));
  }
  if (metrics.length < 4) {
    cls.forEach((s) => {
      metrics = metrics.concat(extractMetrics((s.rawText || '') + ' ' + (s.lists || []).join(' ')));
    });
  }
  // Badge mining
  if (doc.badges && doc.badges.length) {
    metrics = metrics.concat(extractMetricsFromBadges(doc.badges));
  }
  // Deduplicate
  const mSeen: Record<string, boolean> = {};
  metrics = metrics.filter((m) => {
    if (!m.value || m.value === '0' || m.value === '0.0' || m.value === '0%') return false;
    const key = (m.label || '').toLowerCase().replace(/s$/, '');
    if (mSeen[key]) return false;
    mSeen[key] = true;
    return true;
  });

  if (metrics.length >= minStats) {
    const v = ((vmap && vmap['stats']) || 0) % 2;
    spec.sections.push({
      id: 'stats',
      type: 'stats',
      items: metrics.slice(0, v === 0 ? 4 : 3),
      source: {
        sectionTitle: mSec?.title || (doc.badges?.length ? 'Badges & Benchmark Metrics' : 'Quantitative Metrics'),
        sourceType: 'Quantitative Telemetry Miner',
        lineIndex: mSec?.lineIndex,
        confidence: doc.badges?.length || mSec ? 95 : 86,
        signalReason: `Extracted ${metrics.length} numeric benchmark indicators with units`
      }
    });
  }

  // Features
  let featSrc = find('features');
  if (!featSrc || (featSrc.lists || []).length < minFeats) {
    for (let i = 0; i < cls.length; i++) {
      const s = cls[i];
      if (['getting-started', 'tech-stack', 'metrics', 'problem', 'solution', 'license'].indexOf(s.type) >= 0) continue;
      if ((s.lists || []).length >= minFeats) {
        const rich = (s.lists || []).filter((l) => l.length > 15).length;
        if (rich >= 2) {
          featSrc = s;
          break;
        }
      }
    }
  }
  // Tables → features
  if (featSrc && featSrc.tables && featSrc.tables.length) {
    featSrc.tables.forEach((tbl) => {
      if (!tbl || !tbl.rows) return;
      tbl.rows.forEach((row) => {
        if (row[0]) featSrc!.lists.push(row[0] + (row[1] ? ' — ' + row[1] : ''));
      });
    });
  }

  if (featSrc && (featSrc.lists || []).length >= minFeats) {
    const v = ((vmap && vmap['features']) || 0) % 3;
    const cnt = v === 0 ? 6 : v === 1 ? 4 : 8;
    const cols = v === 1 ? 2 : v === 2 ? 4 : 3;
    spec.sections.push({
      id: 'features',
      type: 'features',
      title: featSrc.title,
      columns: cols,
      items: featSrc.lists.slice(0, cnt).map((f) => splitFeat(f)),
      source: {
        sectionTitle: featSrc.title,
        sourceType: v === 2 ? 'Grid Matrix Capability Parser' : 'Capability List Parser',
        lineIndex: featSrc.lineIndex,
        confidence: Math.min(98, 82 + featSrc.lists.length * 2),
        signalReason: `Extracted ${featSrc.lists.length} bullet capability points into ${cols}-column layout`
      }
    });
  }

  // Tech stack
  const techs = extractTechAdvanced(doc);
  if (techs.length >= minTech) {
    const tSec = find('tech-stack');
    spec.sections.push({
      id: 'tech-stack',
      type: 'tech-stack',
      title: 'Tech Stack',
      items: techs.slice(0, 12),
      source: {
        sectionTitle: tSec?.title || 'Built With / Tech Stack',
        sourceType: 'Ecosystem Technology Profiler',
        lineIndex: tSec?.lineIndex,
        confidence: 93,
        signalReason: `Identified ${techs.length} curated framework tokens and runtime tools`
      }
    });
  }

  // Steps
  let stepsSec = find('getting-started') || find('usage');
  if (!stepsSec) {
    for (let i = 0; i < cls.length; i++) {
      if ((cls[i].lists || []).length >= 2 && /^\d+\./.test(cls[i].lists[0] || '')) {
        stepsSec = cls[i];
        break;
      }
    }
  }
  if (stepsSec && (stepsSec.lists || []).length >= 2) {
    spec.sections.push({
      id: 'steps',
      type: 'steps',
      title: stepsSec.title,
      items: stepsSec.lists.slice(0, 5).map((s, idx) => {
        const sp = splitFeat(s);
        return { step: idx + 1, title: sp.title, description: sp.description };
      }),
      source: {
        sectionTitle: stepsSec.title,
        sourceType: 'Sequential Workflow Extractor',
        lineIndex: stepsSec.lineIndex,
        confidence: 91,
        signalReason: `Parsed ${stepsSec.lists.length} execution setup commands and instructions`
      }
    });
  }

  // Architecture
  const arch = find('architecture');
  if (arch && (arch.rawText || '').length > 40) {
    spec.sections.push({
      id: 'content-block',
      type: 'content-block',
      title: arch.title,
      text: trunc(arch.rawText, 350),
      source: {
        sectionTitle: arch.title,
        sourceType: 'Architecture Overview Parser',
        lineIndex: arch.lineIndex,
        confidence: 89,
        signalReason: 'System architecture narrative and design principles'
      }
    });
  }

  // API
  const api = find('api');
  if (api && ((api.lists || []).length >= 2 || (api.tables || []).length > 0)) {
    const items = (api.lists || []).map((l) => splitFeat(l));
    if (api.tables && api.tables[0]) {
      api.tables[0].rows.forEach((r) => {
        if (r[0]) items.push({ title: r[0], description: r[1] || '' });
      });
    }
    if (items.length >= 2) {
      spec.sections.push({
        id: 'content-list',
        type: 'content-list',
        title: api.title,
        items: items.slice(0, 6),
        source: {
          sectionTitle: api.title,
          sourceType: 'API Endpoint / Interface Extractor',
          lineIndex: api.lineIndex,
          confidence: 88,
          signalReason: `Extracted ${items.length} interface methods and routes`
        }
      });
    }
  }

  // Timeline / Roadmap
  const roadSec = find('roadmap') || cls.find((s) => /roadmap|changelog|history|milestone|releases?/i.test(s.title));
  if (roadSec && ((roadSec.lists || []).length >= 2 || (roadSec.rawText || '').length > 60)) {
    const rawItems = (roadSec.lists && roadSec.lists.length >= 2) ? roadSec.lists : (roadSec.rawText || '').split(/\n+/).filter((l) => l.trim().length > 5);
    const tItems: TimelineItem[] = [];
    for (let i = 0; i < rawItems.length && tItems.length < 5; i++) {
      const line = rawItems[i].replace(/^[-*•\d.]+\s*/, '').trim();
      const versionMatch = line.match(/^([vV]?\d+(\.\d+)*(-[a-z\d.]+)|\d{4}(-\d{2})?|Q[1-4]|Phase\s*\d+|Step\s*\d+)[\s:—–-]+(.*)/i);
      if (versionMatch) {
        const v = versionMatch[1];
        const rest = (versionMatch[6] || '').trim();
        const parts = rest.split(/[:—–-]\s+/);
        tItems.push({
          versionOrDate: v,
          title: parts[0] || 'Release Update',
          description: trunc(parts.slice(1).join(' - ') || parts[0], 120)
        });
      } else if (line.includes(':')) {
        const [v, ...rest] = line.split(':');
        tItems.push({
          versionOrDate: trunc(v.trim(), 12),
          title: trunc(rest.join(':').trim(), 36),
          description: trunc(rest.join(':').trim(), 100)
        });
      }
    }
    if (tItems.length >= 2) {
      spec.sections.push({
        id: 'timeline',
        type: 'timeline',
        title: roadSec.title || 'Roadmap & Milestones',
        items: tItems,
        source: {
          sectionTitle: roadSec.title || 'Roadmap',
          sourceType: 'Milestone Timeline Parser',
          lineIndex: roadSec.lineIndex,
          confidence: 92,
          signalReason: `Extracted ${tItems.length} sequential chronological milestones`
        }
      });
    }
  }

  // Feature Comparison Table
  const compSec = cls.find((s) => /compar|versus|\bvs\b|alternative/i.test(s.title)) ||
    cls.find((s) => s.tables && s.tables.some((t) => t.header && t.header.length >= 3 && t.rows.length >= 2));
  if (compSec && compSec.tables && compSec.tables.length > 0) {
    const table = compSec.tables.find((t) => t.header && t.header.length >= 3 && t.rows.length >= 2) || compSec.tables[0];
    if (table.header && table.header.length >= 3 && table.rows && table.rows.length >= 2) {
      const rows: ComparisonRow[] = table.rows.slice(0, 6).map((r) => {
        const feat = r[0] || 'Feature';
        const parseBoolOrStr = (v: string): string | boolean => {
          const lv = (v || '').trim().toLowerCase();
          if (/^(yes|true|✓|✔|x|supported|included)$/.test(lv)) return true;
          if (/^(no|false|✕|✖|none|unsupported)$/.test(lv)) return false;
          return trunc(v || '', 20);
        };
        return {
          feature: trunc(feat, 24),
          us: parseBoolOrStr(r[1] || 'Yes'),
          others: parseBoolOrStr(r[2] || 'No')
        };
      });

      spec.sections.push({
        id: 'comparison',
        type: 'comparison',
        title: compSec.title || 'Feature Comparison',
        headers: [
          trunc(table.header[0] || 'Feature', 18),
          trunc(table.header[1] || 'This Project', 18),
          trunc(table.header[2] || 'Alternatives', 18)
        ],
        rows,
        source: {
          sectionTitle: compSec.title || 'Feature Comparison',
          sourceType: 'Tabular Comparison Miner',
          lineIndex: compSec.lineIndex,
          confidence: 96,
          signalReason: `Mined ${rows.length} tabular competitive comparison features`
        }
      });
    }
  }

  // Callout / Blockquote / Highlight
  for (let i = 0; i < cls.length; i++) {
    const s = cls[i];
    const quoteMatch = (s.rawText || '').match(/(?:^|\n)>\s*([^\n]+(?:\n>[^\n]+)*)/);
    if (quoteMatch) {
      const cleanQuote = quoteMatch[1].replace(/\n>\s*/g, ' ').trim();
      if (cleanQuote.length >= 20 && cleanQuote.length <= 300) {
        const authorMatch = cleanQuote.match(/—\s*([A-Za-z0-9\s.,@_-]+)$/);
        const text = authorMatch ? cleanQuote.slice(0, authorMatch.index).trim() : cleanQuote;
        const author = authorMatch ? authorMatch[1].trim() : undefined;
        spec.sections.push({
          id: 'callout',
          type: 'callout',
          title: /note|tip|quote|highlight/i.test(s.title) ? s.title : undefined,
          text: trunc(text, 220),
          author: author ? trunc(author, 40) : undefined,
          calloutType: 'quote',
          source: {
            sectionTitle: s.title || 'Blockquote Highlight',
            sourceType: 'Blockquote Miner',
            lineIndex: s.lineIndex,
            confidence: 88,
            signalReason: 'Highlighted pullquote or maintainer testimonial'
          }
        });
        break;
      }
    }
  }

  // Fallback content
  if (spec.sections.length < 4) {
    const used: Record<string, boolean> = {};
    spec.sections.forEach((s) => { used[s.id] = true; });
    for (let i = 0; i < cls.length; i++) {
      const s = cls[i];
      if (s.type === 'license') continue;
      if ((s.rawText || '').length > 80) {
        const id = 'content-block-' + i;
        if (used[id]) continue;
        spec.sections.push({
          id: id,
          type: 'content-block',
          title: s.title,
          text: trunc(s.rawText, 320),
          source: {
            sectionTitle: s.title,
            sourceType: 'Markdown Text Block',
            lineIndex: s.lineIndex,
            confidence: 80,
            signalReason: 'Secondary descriptive text passage'
          }
        });
        if (spec.sections.length >= 5) break;
      }
    }
  }

  // Ultimate fallback
  if (spec.sections.length === 0) {
    const allText = cls.map((s) => s.rawText || '').join(' ').trim();
    if (allText.length > 30) {
      spec.sections.push({
        id: 'about',
        type: 'content-block',
        title: 'About',
        text: trunc(allText, 400),
        source: {
          sectionTitle: 'About',
          sourceType: 'Document Text Aggregator',
          confidence: 75,
          signalReason: 'Fallback general summary'
        }
      });
    } else if (doc.subtitle) {
      spec.sections.push({
        id: 'about',
        type: 'content-block',
        title: 'About',
        text: doc.subtitle,
        source: {
          sectionTitle: 'Tagline',
          sourceType: 'Subtitle Extractor',
          confidence: 75,
          signalReason: 'Header subtitle summary'
        }
      });
    }
  }

  // Enrich with GitHub Metadata if provided
  if (ghMeta) {
    mergeGHMeta(spec, ghMeta);
  }

  // Calculate Grounding & Traceability Metrics
  const contributingSections = spec.sections.filter((s) => s.source != null).length;
  const totalParsedSections = Math.max(1, doc.sections?.length || 1);
  const coveragePercent = Math.min(100, Math.round((contributingSections / totalParsedSections) * 100));
  const confidences = spec.sections.map((s) => s.source?.confidence || 85);
  const averageConfidence = confidences.length > 0
    ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length)
    : 85;

  const recommendation = detectSmartLayout(doc, ghMeta, spec.sections);
  spec.grounding = {
    coveragePercent,
    sourceDensity: coveragePercent >= 70 ? 'comprehensive' : coveragePercent >= 40 ? 'balanced' : 'compact',
    totalSourceLines: (doc.sections || []).reduce((acc, s) => acc + (s.totalLinesHint || (s.rawText || '').split('\n').length), 0),
    contributingSections,
    totalParsedSections,
    averageConfidence,
    recommendation
  };

  return spec;
}

/**
 * GitHub Metadata Enrichment:
 * Merges repo statistics (stars, forks, open issues, license, etc.)
 */
export function mergeGHMeta(spec: InfographicSpec, ghMeta: GitHubMeta): InfographicSpec {
  if (!ghMeta) return spec;

  // Subtitle fallback
  if (!spec.subtitle && ghMeta.description) {
    spec.subtitle = ghMeta.description;
  }

  // Find or create stats section
  let statsSec = spec.sections.find((s) => s.id === 'stats' && s.type === 'stats') as
    | { id: string; type: 'stats'; items: MetricItem[]; source?: SectionSource }
    | undefined;

  const ghMetrics: MetricItem[] = [];

  if (ghMeta.stars != null && ghMeta.stars > 0) {
    ghMetrics.push({
      value: formatNumber(ghMeta.stars),
      label: 'Stars'
    });
  }
  if (ghMeta.forks != null && ghMeta.forks > 0) {
    ghMetrics.push({
      value: formatNumber(ghMeta.forks),
      label: 'Forks'
    });
  }
  if (ghMeta.openIssues != null && ghMeta.openIssues > 0) {
    ghMetrics.push({
      value: formatNumber(ghMeta.openIssues),
      label: 'Issues'
    });
  }
  if (ghMeta.watchers != null && ghMeta.watchers > 0 && ghMetrics.length < 4) {
    ghMetrics.push({
      value: formatNumber(ghMeta.watchers),
      label: 'Watchers'
    });
  }

  if (ghMetrics.length > 0) {
    if (statsSec) {
      // Prepend or merge GitHub metrics without duplicating labels
      const existingLabels = new Set(statsSec.items.map((it) => it.label.toLowerCase()));
      const filteredGH = ghMetrics.filter((m) => !existingLabels.has(m.label.toLowerCase()));
      statsSec.items = [...filteredGH, ...statsSec.items].slice(0, 4);
      if (!statsSec.source) {
        statsSec.source = {
          sectionTitle: 'Repository Telemetry & Benchmarks',
          sourceType: 'GitHub REST API & Parser',
          confidence: 97,
          signalReason: 'Combined GitHub repository stats with parsed benchmarks'
        };
      }
    } else {
      // Insert stats right after problem-solution or at top
      const newSec: SpecSection = {
        id: 'stats',
        type: 'stats' as const,
        items: ghMetrics.slice(0, 4),
        source: {
          sectionTitle: 'GitHub Repository Telemetry',
          sourceType: 'GitHub REST API Miner',
          confidence: 98,
          signalReason: `Live repository telemetry (${ghMetrics.map((m) => `${m.value} ${m.label}`).join(', ')})`
        }
      };
      const psIndex = spec.sections.findIndex((s) => s.type === 'problem-solution');
      if (psIndex >= 0) {
        spec.sections.splice(psIndex + 1, 0, newSec);
      } else {
        spec.sections.unshift(newSec);
      }
      statsSec = newSec;
    }
  }

  // Safety check: if stats has 0 items, remove it
  if (statsSec && statsSec.items.length < 1) {
    spec.sections = spec.sections.filter((s) => s.id !== 'stats');
  }

  // Add primary language to Tech Stack if present
  if (ghMeta.language) {
    const techSec = spec.sections.find((s) => s.id === 'tech-stack' && s.type === 'tech-stack') as
      | { id: string; type: 'tech-stack'; title: string; items: string[] }
      | undefined;
    if (techSec) {
      if (!techSec.items.some((t) => t.toLowerCase() === ghMeta.language!.toLowerCase())) {
        techSec.items.unshift(ghMeta.language);
      }
    }
  }

  return spec;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return String(num);
}
