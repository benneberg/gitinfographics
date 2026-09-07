import {
  ParsedDoc,
  VariantMap,
  GitHubMeta,
  InfographicSpec,
  DocSection,
  SectionType,
  MetricItem
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
 * 5. Intelligent Spec Builder
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
      solutionTitle: sol ? sol.title : 'The Solution'
    });
  } else if (probText.length > 60) {
    spec.sections.push({
      id: 'content-block',
      type: 'content-block',
      title: prob ? prob.title : 'Challenge',
      text: trunc(probText, 300)
    });
  } else if (solText.length > 60) {
    spec.sections.push({
      id: 'content-block',
      type: 'content-block',
      title: sol ? sol.title : 'Solution',
      text: trunc(solText, 300)
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
      items: metrics.slice(0, v === 0 ? 4 : 3)
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
    const cnt = v === 0 ? 6 : v === 1 ? 4 : 3;
    const cols = v === 1 ? 2 : 3;
    spec.sections.push({
      id: 'features',
      type: 'features',
      title: featSrc.title,
      columns: cols,
      items: featSrc.lists.slice(0, cnt).map((f) => splitFeat(f))
    });
  }

  // Tech stack
  const techs = extractTechAdvanced(doc);
  if (techs.length >= minTech) {
    spec.sections.push({
      id: 'tech-stack',
      type: 'tech-stack',
      title: 'Tech Stack',
      items: techs.slice(0, 12)
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
      })
    });
  }

  // Architecture
  const arch = find('architecture');
  if (arch && (arch.rawText || '').length > 40) {
    spec.sections.push({
      id: 'content-block',
      type: 'content-block',
      title: arch.title,
      text: trunc(arch.rawText, 350)
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
        items: items.slice(0, 6)
      });
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
          text: trunc(s.rawText, 320)
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
        text: trunc(allText, 400)
      });
    } else if (doc.subtitle) {
      spec.sections.push({
        id: 'about',
        type: 'content-block',
        title: 'About',
        text: doc.subtitle
      });
    }
  }

  // Enrich with GitHub Metadata if provided
  if (ghMeta) {
    mergeGHMeta(spec, ghMeta);
  }

  return spec;
}

/**
 * 7. GitHub Metadata Enrichment
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
    | { id: string; type: 'stats'; items: MetricItem[] }
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
    } else {
      // Insert stats right after problem-solution or at top
      const newSec = {
        id: 'stats',
        type: 'stats' as const,
        items: ghMetrics.slice(0, 4)
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

  // Safety check from Section 7: if stats has 0 items, remove it
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
