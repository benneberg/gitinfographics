import React, { useState } from 'react';
import {
  X,
  FileCode2,
  CheckCircle,
  FolderTree,
  Cpu,
  Boxes,
  Zap,
  Check,
  Copy,
  Download
} from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeModule, setActiveModule] = useState<string>('overview');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const modules = [
    {
      id: 'overview',
      name: 'Architectural Review & Recommendation',
      desc: 'Why separating HTML, CSS and modularizing JS is critical for GitHub Actions & CI/CD',
      content: `### Architectural Recommendation: Strongly Recommended

Separating HTML, CSS, and modularizing the JavaScript into pure, decoupled modules is one of the highest-leverage improvements for Infographic Studio for 4 critical reasons:

1. Headless Execution in GitHub Actions (0 DOM Dependencies):
   In a browser, you have document, window, and UI controls. But in a GitHub Action or Node.js runner, there is no DOM.
   By isolating the core engine into pure functional modules (parser, classifier, extractors, specBuilder, renderer), the exact same algorithm runs in Node.js on GitHub Runners without needing JSDOM, Chromium, or any heavy runtime dependencies.

2. Deterministic Vector SVG Generation:
   The renderer generates clean, valid XML SVG strings directly from mathematical calculations and string templates. Both the browser studio and your GitHub Action workflow generate identical, byte-for-byte pixel-perfect SVGs.

3. Single Responsibility Principle (SRP):
   - Parser Module: Converts markdown into an abstract document tree (code blocks, tables, lists, badges).
   - Classifier Module: Scores each section with context-aware heuristics (position, title match, syntax density).
   - Extractor Module: Mines quantitative metrics, technology keywords, and structured features.
   - Spec Builder Module: Synthesizes the final infographic spec with user variants and GitHub metadata.
   - Renderer Module: Dynamic SVG layout with adaptive vertical rhythm and themes.

4. Extensibility & Maintenance:
   Adding new themes, new metric regex patterns, or new visual section types only requires modifying one single, focused file without risking regressions in the UI or markdown parser.`
    },
    {
      id: 'parser',
      name: '1. parser.ts (Markdown & Tables)',
      desc: 'Robust tokenization, table extraction, and priority-based smart truncation',
      content: `// src/engine/parser.ts
export function parseMD(text: string): ParsedDoc;
export function parseTable(rows: string[]): TableData | null;
export function smartTrunc(text: string, max: number): string;

// Highlights:
// - HTML tag skipping for non-content blocks
// - Early badge extraction (< 25 lines)
// - Normalized code block languages & 40-line hard cap
// - Table parsing defensive against malformed borders`
    },
    {
      id: 'classifier',
      name: '2. classifier.ts (Context-Aware Scoring)',
      desc: 'Multi-factor scoring using title boost, density, and relative document position',
      content: `// src/engine/classifier.ts
export const SEC_PATTERNS: Record<SectionType, RegExp>;
export function classifySec(s: DocSection): SectionType;

// Highlights:
// - Title hits receive +4 boost over body matches
// - Relative document position (0.0 to 1.0) biases problem, roadmap, license
// - Code block presence biases tech-stack and getting-started
// - Generic title penalty keeps 'overview' and 'readme' from hijacking types`
    },
    {
      id: 'extractors',
      name: '3. extractors.ts (Metrics & Tech)',
      desc: '13+ regex patterns, badge mining, and dependency manifest analysis',
      content: `// src/engine/extractors.ts
export function extractMetrics(text: string): MetricItem[];
export function extractMetricsFromBadges(badges: BadgeItem[]): MetricItem[];
export function splitFeat(text: string): FeatureItem;
export function extractTechAdvanced(doc: ParsedDoc): string[];

// Highlights:
// - Handles uptime, coverage, user counts, latency ranges, multipliers (3x faster)
// - Mines package.json, requirements.txt, Dockerfiles inside code blocks
// - Markdown checkbox & bold separator splitting for clean feature cards`
    },
    {
      id: 'specBuilder',
      name: '4. specBuilder.ts (Rule-Based Synthesis)',
      desc: 'Assembles adaptive spec and enriches with live GitHub stars/forks/issues',
      content: `// src/engine/specBuilder.ts
export function buildRuleSpec(doc: ParsedDoc, vmap?: VariantMap, ghMeta?: GitHubMeta | null): InfographicSpec;
export function mergeGHMeta(spec: InfographicSpec, ghMeta: GitHubMeta): InfographicSpec;

// Highlights:
// - Problem / Solution 2-column or content block fallback
// - Variant-driven columns (2 or 3 for features, 3 or 4 for metrics)
// - Seamless GitHub API metadata enrichment with deduplication`
    },
    {
      id: 'renderer',
      name: '5. renderer.ts (Dynamic SVG Layout)',
      desc: 'Calculates dynamic heights, wraps text, and renders responsive vector SVG',
      content: `// src/engine/renderer.ts
export function renderSVG(spec: InfographicSpec, themeName?: string): string;

// Highlights:
// - All sub-renderers (rHero, rStats, rPS, rFeats, rTech, rSteps, rCL, rCB, rFoot) return { svg, height }
// - Dynamic vertical spacing avoiding clipped text or overlapping boxes
// - Self-contained SVG with embedded fonts, subtle gradients, and clean vector geometry`
    }
  ];

  const currentMod = modules.find((m) => m.id === activeModule) || modules[0];

  const copyContent = () => {
    navigator.clipboard.writeText(currentMod.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="bg-white border border-stone-200 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-100 border border-stone-200 text-stone-900 flex items-center justify-center">
              <FolderTree className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900">Architecture & Engine Modules</h2>
              <p className="text-xs text-stone-500">
                Decoupled headless modules running both in-browser and in CI/CD pipelines
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Split */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Module Selector Sidebar */}
          <div className="w-full md:w-72 bg-stone-50 border-r border-stone-200 p-3 overflow-y-auto flex flex-col gap-1.5 shrink-0">
            <span className="text-[11px] font-semibold text-stone-500 px-2 py-1">
              Modules
            </span>
            {modules.map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveModule(m.id)}
                className={`text-left p-3 rounded-xl transition-all text-xs flex flex-col gap-0.5 border ${
                  activeModule === m.id
                    ? 'bg-white border-stone-300 text-stone-900 shadow-2xs font-medium'
                    : 'bg-transparent border-transparent hover:bg-stone-100/80 text-stone-600'
                }`}
              >
                <div className={`text-xs ${activeModule === m.id ? 'font-semibold text-stone-900' : 'text-stone-700'}`}>
                  {m.name}
                </div>
                <div className="text-[11px] line-clamp-1 text-stone-500">
                  {m.desc}
                </div>
              </button>
            ))}
          </div>

          {/* Module Detail Content */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            <div className="p-4 border-b border-stone-200 bg-white flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-stone-900">{currentMod.name}</h3>
                <p className="text-xs text-stone-500">{currentMod.desc}</p>
              </div>

              <button
                onClick={copyContent}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg shadow-2xs transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6 font-mono text-xs text-stone-800 bg-[#FAFAF9] leading-relaxed whitespace-pre-wrap selection:bg-stone-200">
              {currentMod.content}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 bg-white flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>
              Fully decoupled • Pure TypeScript runs in browsers and Node.js runners
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
