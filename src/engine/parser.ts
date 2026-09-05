import { ParsedDoc, DocSection, TableData, SectionType } from './types';
import { classifySec } from './classifier';
import { cleanMarkdownText } from './extractors';

/**
 * 1. Enhanced Markdown Parser
 * - Safer HTML skipping (only skips obvious non-content tags).
 * - Badge/image collection works in the first ~20 lines, not only before the first heading.
 * - Code-block language normalized.
 * - Nested-list tracking retained but kept lightweight.
 * - Table parser more defensive.
 * - Code blocks capped to prevent pathological READMEs from exploding memory.
 */
export function parseMD(text: string): ParsedDoc {
  if (!text) {
    return { title: '', subtitle: '', sections: [], badges: [], images: [] };
  }

  const lines = text.split('\n');
  const doc: ParsedDoc = { title: '', subtitle: '', sections: [], badges: [], images: [] };
  let cur: DocSection | null = null;
  let inCode = false;
  let codeLang: string | null = null;
  let inTable = false;
  let tableBuf: string[] = [];
  let hasSub = false;
  let listStack: { indent: number; content: string }[] = [];
  let lineCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trim = raw.trim();
    lineCount++;

    // Safer HTML skip – only obvious block-level non-content
    if (/^<(?:div|section|style|script|svg|iframe|object|embed)\b/i.test(trim)) continue;

    // Code fences
    if (/^```/.test(trim)) {
      if (!inCode) {
        inCode = true;
        codeLang = (trim.slice(3).trim().split(/\s+/)[0] || '').toLowerCase();
        if (cur) {
          cur.codeBlocks = cur.codeBlocks || [];
          cur.codeBlocks.push({ lang: codeLang, lines: [] });
        }
      } else {
        inCode = false;
        codeLang = null;
      }
      continue;
    }

    if (inCode) {
      if (cur && cur.codeBlocks && cur.codeBlocks.length) {
        const blk = cur.codeBlocks[cur.codeBlocks.length - 1];
        if (blk.lines.length < 40) blk.lines.push(raw); // hard cap
      }
      continue;
    }

    // Horizontal rules
    if (/^(---|\*\*\*|___)\s*$/.test(trim)) continue;

    // Badges & images (collect early + inside sections)
    const imgRe = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let bm: RegExpExecArray | null;
    const isEarly = lineCount < 25 && doc.sections.length === 0;
    while ((bm = imgRe.exec(raw)) !== null) {
      const item = { alt: bm[1], url: bm[2] };
      if (isEarly || /shields\.io|badge|travis|circleci|coveralls|codecov/i.test(bm[2])) {
        doc.badges.push(item);
      } else if (!doc.sections.length) {
        doc.images.push(item);
      } else if (cur) {
        cur.images = cur.images || [];
        cur.images.push(item);
      }
    }
    if (/!\[.*?\]\(.*?\)/.test(raw) && isEarly) continue; // skip pure badge lines early

    // H1
    if (/^#\s+/.test(raw) && !/^##\s+/.test(raw)) {
      doc.title = cleanMarkdownText(raw.replace(/^#\s+/, ''));
      continue;
    }

    // H2 / H3
    const h2Match = raw.match(/^##\s+(.*)/);
    const h3Match = raw.match(/^###\s+(.*)/);
    if (h2Match || h3Match) {
      listStack = [];
      const title = cleanMarkdownText((h2Match || h3Match)![1]);
      cur = {
        level: h2Match ? 2 : 3,
        title: title,
        content: [],
        lists: [],
        nestedLists: [],
        rawText: '',
        codeBlocks: [],
        images: [],
        tables: [],
        lineIndex: i,
        totalLinesHint: lines.length
      };
      doc.sections.push(cur);
      continue;
    }

    // Tables
    if (trim.charAt(0) === '|') {
      if (!inTable) { inTable = true; tableBuf = []; }
      tableBuf.push(trim);
      continue;
    } else if (inTable) {
      if (cur) {
        const tbl = parseTable(tableBuf);
        if (tbl) {
          cur.tables = cur.tables || [];
          cur.tables.push(tbl);
        }
      }
      inTable = false;
      tableBuf = [];
    }

    // Lists with light nesting tracking
    const listMatch = raw.match(/^(\s*)(?:[-*+]|\d+\.)\s+(.*)$/);
    if (listMatch) {
      const indent = listMatch[1].length;
      const content = cleanMarkdownText(listMatch[2]);
      if (cur) {
        cur.lists.push(content);
        while (listStack.length && listStack[listStack.length - 1].indent >= indent) listStack.pop();
        listStack.push({ indent: indent, content: content });
        cur.nestedLists.push({ depth: listStack.length, content: content });
      }
      continue;
    }

    if (!trim) { listStack = []; continue; }

    // Body text (clean all markdown links, bold, code, blockquotes)
    const clean = cleanMarkdownText(trim);
    if (!clean) continue;

    if (cur) {
      cur.content.push(clean);
      cur.rawText += clean + ' ';
    } else if (doc.title && !hasSub && clean.length > 8) {
      doc.subtitle = clean;
      hasSub = true;
    }
  }

  // Close trailing table
  if (inTable && cur) {
    const tbl = parseTable(tableBuf);
    if (tbl) {
      cur.tables = cur.tables || [];
      cur.tables.push(tbl);
    }
  }

  return doc;
}

export function parseTable(rows: string[]): TableData | null {
  if (!rows || rows.length < 2) return null;
  const clean = rows.map(function(r) {
    return r.split('|').map(function(c) { return c.trim(); }).filter(Boolean);
  }).filter(function(r) {
    return r.length > 0 && !r.every(function(c) { return /^[-\s|:]+$/.test(c); });
  });
  if (clean.length < 2) return null;
  return { header: clean[0], rows: clean.slice(1, 12) }; // cap rows
}

/**
 * 8. Smart Truncation
 * Prioritizes high-value sections (problem, solution, features, tech-stack)
 * when README exceeds maximum length.
 */
export function smartTrunc(text: string, max: number): string {
  if (!text || text.length <= max) return text;

  const lines = text.split('\n');
  let result: string[] = [];
  let len = 0;

  if (lines[0] && /^#\s+/.test(lines[0])) {
    result.push(lines[0]);
    len += lines[0].length + 1;
  }

  const pri: Record<SectionType, number> = {
    problem: 6,
    solution: 6,
    features: 5,
    'tech-stack': 4,
    metrics: 4,
    architecture: 3,
    'getting-started': 3,
    usage: 3,
    api: 3,
    roadmap: 2,
    contributing: 1,
    security: 2,
    testing: 2,
    license: 0,
    generic: 1
  };

  interface SecItem {
    lines: string[];
    pri: number;
    type: SectionType;
  }

  const secs: SecItem[] = [];
  let cur: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const l = lines[i];
    if (/^#{2,3}\s+/.test(l)) {
      if (cur.length) {
        const title = cur[0].replace(/^#+\s*/, '');
        const type = classifySec({
          level: 2,
          title: title,
          content: [],
          lists: [],
          nestedLists: [],
          codeBlocks: [],
          images: [],
          tables: [],
          rawText: cur.slice(1).join(' '),
          lineIndex: i,
          totalLinesHint: lines.length
        });
        secs.push({ lines: cur, pri: pri[type] || 1, type: type });
        cur = [];
      }
      cur = [l];
    } else {
      cur.push(l);
    }
  }
  if (cur.length) {
    const title = cur[0].replace(/^#+\s*/, '');
    const type = classifySec({
      level: 2,
      title: title,
      content: [],
      lists: [],
      nestedLists: [],
      codeBlocks: [],
      images: [],
      tables: [],
      rawText: cur.slice(1).join(' '),
      lineIndex: lines.length,
      totalLinesHint: lines.length
    });
    secs.push({ lines: cur, pri: pri[type] || 1, type: type });
  }

  secs.sort((a, b) => b.pri - a.pri);

  for (let j = 0; j < secs.length; j++) {
    const sec = secs[j];
    const secText = sec.lines.join('\n') + '\n';
    if (len + secText.length <= max) {
      result = result.concat(sec.lines);
      len += secText.length;
    } else {
      const remaining = max - len - 40;
      if (remaining > 80 && sec.lines.length > 1) {
        const partial = [sec.lines[0]];
        let partialLen = sec.lines[0].length;
        for (let k = 1; k < sec.lines.length && partialLen < remaining; k++) {
          partial.push(sec.lines[k]);
          partialLen += sec.lines[k].length + 1;
        }
        if (partial.length > 1) partial.push('...');
        result = result.concat(partial);
      }
      break;
    }
  }

  return result.join('\n');
}
