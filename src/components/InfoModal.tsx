import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Info,
  HelpCircle,
  CheckCircle2,
  Layers,
  Terminal,
  FileCode,
  Sliders,
  ChevronDown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  GitBranch,
  Search,
  ExternalLink
} from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'overview' | 'manual' | 'faq';
  onOpenWorkflowModal?: () => void;
  onOpenOnboarding?: () => void;
}

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  code?: string;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'overview',
  onOpenWorkflowModal,
  onOpenOnboarding
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'manual' | 'faq'>(initialTab);
  const [expandedFaq, setExpandedFaq] = useState<Record<string, boolean>>({
    faq_1: true
  });
  const [faqFilter, setFaqFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const toggleFaq = (id: string) => {
    setExpandedFaq((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const faqItems: FaqItem[] = [
    {
      id: 'faq_1',
      category: 'ENGINE & RENDERING',
      question: 'How does GitInfoGraphics generate SVGs without external cloud dependencies?',
      answer:
        'GitInfoGraphics uses a deterministic rule-based tokenizer and geometry compiler written in vanilla TypeScript. It analyzes headings, badges, markdown tables, and tech keywords, calculating SVG layout matrices, text wrapping, and vertical rhythm mathematically. It requires zero browser DOM dependencies, making it equally capable in modern browsers and headless Node.js CI/CD environments.'
    },
    {
      id: 'faq_2',
      category: 'CI/CD & AUTOMATION',
      question: 'How do I automate infographic generation in GitHub Actions?',
      answer:
        'Add our ready-made workflow file to `.github/workflows/generate-infographic.yml` and the standalone script to `scripts/generate-infographic.mjs`. On every push to main, GitHub Actions automatically executes the runner, regenerates `infographic.svg`, and commits the updated vector graphic back to the repository.',
      code: `// .github/workflows/generate-infographic.yml
name: Generate Infographic
on:
  push:
    branches: [main]
    paths: ['README.md']
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: node scripts/generate-infographic.mjs
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "docs(readme): update infographic.svg"`
    },
    {
      id: 'faq_3',
      category: 'MARKDOWN & PARSING',
      question: 'How does the parser recognize features, problem-solution, and tech stacks?',
      answer:
        'The classifier evaluates four signals for each markdown block: title semantic boosts (matching keywords like "Features", "Architecture", "Installation"), document position heuristics (problems appear near top, license near bottom), syntax density (bullet lists vs. code blocks vs. tables), and badge metadata tokens.'
    },
    {
      id: 'faq_4',
      category: 'MOBILE & DISPLAY',
      question: 'How does the SVG look on mobile screens and dark/light GitHub themes?',
      answer:
        'Every SVG rendered by GitInfoGraphics includes adaptive viewport bounds and standard vector responsive scaling (preserveAspectRatio="xMidYMid meet"). It scales fluidly to mobile screen widths with zero horizontal overflow.'
    },
    {
      id: 'faq_5',
      category: 'ENGINE & RENDERING',
      question: 'Can I render and export high-resolution PNGs as well as SVGs?',
      answer:
        'Yes. In the studio, click "Retina PNG". The engine rasterizes the vector XML onto a high-density 2x canvas in-memory and triggers an instant client-side download without sending any data to a remote server.'
    },
    {
      id: 'faq_6',
      category: 'CUSTOMIZATION',
      question: 'Can I override titles, reorder sections, and toggle QR codes?',
      answer:
        'Yes! Switch to the "Sections" tab in the left panel. You can reorder sections with Up/Down buttons, select bento vs. column variants, edit custom titles/subtitles, and toggle a deterministic vector QR code in the footer with custom link target URLs.'
    },
    {
      id: 'faq_7',
      category: 'PROJECTS & SHARING',
      question: 'How do project management and shareable links work?',
      answer:
        'Click "Projects" in the header toolbar to save multiple designs, switch between them, or duplicate/delete projects. Click "Share" to generate copyable HTML iframes, image tags, markdown embed snippets, or an instant shareable URL with the configuration embedded directly in the hash.'
    },
    {
      id: 'faq_8',
      category: 'PRODUCTIVITY',
      question: 'What keyboard shortcuts are available?',
      answer:
        'Press Ctrl/Cmd+S to export SVG, Ctrl/Cmd+Shift+P to export Retina PNG, Ctrl/Cmd+M to toggle mobile preview, Ctrl/Cmd+T to switch themes, and Ctrl/Cmd+Shift+? to open the shortcuts cheat sheet.'
    },
    {
      id: 'faq_9',
      category: 'ACCESSIBILITY',
      question: 'How accessible are the generated vector SVGs?',
      answer:
        'Every SVG contains native W3C accessibility metadata including role="img", role="region", semantic aria-labelledby titles, and aria-describedby descriptions so screen readers can accurately convey the infographic architecture.'
    },
    {
      id: 'faq_10',
      category: 'TROUBLESHOOTING',
      question: 'What if my README is very long or has huge code blocks?',
      answer:
        'GitInfoGraphics includes an "Optimize" feature and defensive token cap. Code blocks are limited to a clean snippet representation, and section text is intelligently condensed to preserve vertical balance without visual clipping.'
    }
  ];

  const filteredFaqs = faqItems.filter((item) => {
    const matchesCategory = faqFilter === 'all' || item.category === faqFilter;
    const matchesQuery =
      searchQuery.trim() === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Application Information and Manual"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-150 font-sans"
    >
      <div className="bg-white border border-stone-200 w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-stone-200 bg-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 text-stone-900 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-semibold text-stone-900">
                  About GitInfoGraphics
                </h2>
                <span className="bg-stone-100 border border-stone-200 text-stone-600 text-[11px] px-2 py-0.5 rounded-full font-medium hidden sm:inline">
                  Documentation
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Comprehensive specification, user manual & architecture guide
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            title="Close Docs"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-2 border-b border-stone-200 bg-white overflow-x-auto">
          <div className="flex gap-4 sm:gap-6 min-w-max">
            <button
              onClick={() => setActiveTab('overview')}
              className={`min-h-[42px] pb-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-stone-900 text-stone-900 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('manual')}
              className={`min-h-[42px] pb-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'manual'
                  ? 'border-stone-900 text-stone-900 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>User Manual</span>
            </button>

            <button
              onClick={() => setActiveTab('faq')}
              className={`min-h-[42px] pb-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'faq'
                  ? 'border-stone-900 text-stone-900 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>FAQ & Support</span>
            </button>
          </div>

          {onOpenOnboarding && (
            <button
              onClick={() => {
                onClose();
                onOpenOnboarding();
              }}
              className="hidden md:flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-stone-700 hover:text-stone-950 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors mb-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-stone-500" />
              <span>Re-run tour</span>
            </button>
          )}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-xs text-stone-600 leading-relaxed bg-[#FAFAF9]">
          {/* =================== TAB 1: OVERVIEW =================== */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6 max-w-3xl mx-auto">
              {/* Summary Card */}
              <div className="border border-stone-200 bg-white p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-900">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>System Manifest</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-stone-900">
                  What is GitInfoGraphics?
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  GitInfoGraphics is an open-source, deterministic vector generation engine and interactive studio that compiles plain GitHub README markdown and repository metadata into publication-quality SVG visual summaries.
                </p>
              </div>

              {/* The Problem It Solves */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-stone-200 bg-white p-5 rounded-2xl shadow-xs flex flex-col gap-2">
                  <div className="text-[11px] font-semibold text-rose-700">
                    The Problem
                  </div>
                  <h4 className="font-semibold text-sm text-stone-900">Walls of Text Go Unread</h4>
                  <p className="text-stone-600 text-xs">
                    Software repositories have 3-5 seconds to communicate their architecture, value proposition, and performance benefits to users, hiring managers, and prospective contributors. Long markdown files are frequently skimmed or bounced.
                  </p>
                </div>

                <div className="border border-stone-200 bg-white p-5 rounded-2xl shadow-xs flex flex-col gap-2">
                  <div className="text-[11px] font-semibold text-emerald-700">
                    The Solution
                  </div>
                  <h4 className="font-semibold text-sm text-stone-900">Instant Visual Architecture</h4>
                  <p className="text-stone-600 text-xs">
                    GitInfoGraphics extracts the core essence — stats, features, problem/solution, and tech stacks — and presents it as a single calm, high-contrast vector infographic that looks crisp on Retina displays, mobile apps, and README embeds.
                  </p>
                </div>
              </div>

              {/* Who Target Users Are */}
              <div className="border border-stone-200 bg-white p-5 rounded-2xl shadow-xs flex flex-col gap-3">
                <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  Target Users
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
                    <div className="font-semibold text-stone-900 mb-1">Open Source Authors</div>
                    <div className="text-stone-600 text-[11px]">
                      Boost README retention, star conversions, and contributor onboarding with professional headers.
                    </div>
                  </div>
                  <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
                    <div className="font-semibold text-stone-900 mb-1">Engineering Teams</div>
                    <div className="text-stone-600 text-[11px]">
                      Standardize visual architecture cards across company microservices and client SDKs.
                    </div>
                  </div>
                  <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
                    <div className="font-semibold text-stone-900 mb-1">Portfolio Builders</div>
                    <div className="text-stone-600 text-[11px]">
                      Showcase full-stack and systems engineering projects with clean technical infographics.
                    </div>
                  </div>
                </div>
              </div>

              {/* How Users Interact With It */}
              <div className="border border-stone-200 bg-white p-5 rounded-2xl shadow-xs flex flex-col gap-3">
                <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  How Users Interact With The App
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-center text-xs">
                  <div className="p-3 border border-stone-200 bg-stone-50 rounded-xl flex flex-col items-center gap-1.5">
                    <span className="w-6 h-6 bg-stone-900 text-white rounded-full font-bold flex items-center justify-center text-xs">1</span>
                    <span className="font-semibold text-stone-900">Input</span>
                    <span className="text-stone-500 text-[11px]">Markdown or GitHub Repo</span>
                  </div>
                  <div className="p-3 border border-stone-200 bg-stone-50 rounded-xl flex flex-col items-center gap-1.5">
                    <span className="w-6 h-6 bg-stone-900 text-white rounded-full font-bold flex items-center justify-center text-xs">2</span>
                    <span className="font-semibold text-stone-900">Customize</span>
                    <span className="text-stone-500 text-[11px]">Bento variants & themes</span>
                  </div>
                  <div className="p-3 border border-stone-200 bg-stone-50 rounded-xl flex flex-col items-center gap-1.5">
                    <span className="w-6 h-6 bg-stone-900 text-white rounded-full font-bold flex items-center justify-center text-xs">3</span>
                    <span className="font-semibold text-stone-900">Preview</span>
                    <span className="text-stone-500 text-[11px]">Fluid & Mobile Phone tabs</span>
                  </div>
                  <div className="p-3 border border-stone-200 bg-stone-50 rounded-xl flex flex-col items-center gap-1.5">
                    <span className="w-6 h-6 bg-stone-900 text-white rounded-full font-bold flex items-center justify-center text-xs">4</span>
                    <span className="font-semibold text-stone-900">Automate</span>
                    <span className="text-stone-500 text-[11px]">GitHub Actions CI/CD</span>
                  </div>
                </div>
              </div>

              {/* Value proposition pill */}
              <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-stone-900">100% Deterministic • 0 External Cloud Dependencies</div>
                  <div className="text-stone-600 text-xs mt-0.5">
                    Both this browser studio and your GitHub Actions CI workflow execute identical pure TypeScript geometry calculations.
                  </div>
                </div>
                {onOpenWorkflowModal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenWorkflowModal();
                    }}
                    className="min-h-[36px] px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>CI/CD Setup</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* =================== TAB 2: DETAILED MANUAL =================== */}
          {activeTab === 'manual' && (
            <div className="flex flex-col gap-6 max-w-3xl mx-auto">
              {/* Section 1: Core Concepts */}
              <div className="border border-stone-200 bg-white p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col gap-3">
                <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  Chapter 1 • Core Architecture
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-stone-900">
                  The 5-Stage Rendering Pipeline
                </h3>
                <p className="text-stone-600 text-xs leading-relaxed">
                  GitInfoGraphics treats documentation as an Abstract Document Tree (ADT). Rather than converting HTML to canvas via heavy headless browser instances (Puppeteer/Chromium), it compiles directly into standard SVG tags:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 text-xs">
                  <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
                    <div className="text-stone-900 font-semibold mb-1">1. Parser (parser.ts)</div>
                    <p className="text-stone-600 text-[11px]">
                      Strips HTML comments, normalizes Markdown headings, tokenizes tables defensive against malformed pipes, and extracts initial shields.io badges.
                    </p>
                  </div>
                  <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
                    <div className="text-stone-900 font-semibold mb-1">2. Classifier (classifier.ts)</div>
                    <p className="text-stone-600 text-[11px]">
                      Scores sections using title keyword matches, document position (0.0 to 1.0), and syntax patterns (code vs. lists) to assign semantic types.
                    </p>
                  </div>
                  <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
                    <div className="text-stone-900 font-semibold mb-1">3. Extractor (extractors.ts)</div>
                    <p className="text-stone-600 text-[11px]">
                      Scans for quantitative metrics (99.9% uptime, 10x faster, &lt;50ms latency), technology badges (TypeScript, Rust, Docker), and feature lists.
                    </p>
                  </div>
                  <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
                    <div className="text-stone-900 font-semibold mb-1">4. Spec Builder (specBuilder.ts)</div>
                    <p className="text-stone-600 text-[11px]">
                      Synthesizes layout slots, applies user variant overrides (e.g. Bento vs. List), and merges live GitHub API metadata (stars, forks, license).
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Step-by-Step Instructions */}
              <div className="border border-stone-200 bg-white p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col gap-4">
                <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  Chapter 2 • Step-by-Step Workflow
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-stone-900">
                  How to Craft Your Infographic
                </h3>

                <div className="space-y-4 text-xs">
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </span>
                    <div>
                      <span className="font-semibold text-stone-900 block mb-0.5">
                        Select Your Source
                      </span>
                      <p className="text-stone-600">
                        Paste markdown into the editor, pick from predefined templates (e.g. CLI tool, Microservice, REST API), or enter any public repository (e.g. `facebook/react`) in the header fetch bar.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </span>
                    <div>
                      <span className="font-semibold text-stone-900 block mb-0.5">
                        Fine-Tune Sections & Titles
                      </span>
                      <p className="text-stone-600">
                        Switch to the Sections panel to rename the main title/subtitle or toggle optional blocks. Click the variant buttons to choose between Bento Grid layouts, split columns, or minimal badge strips.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      3
                    </span>
                    <div>
                      <span className="font-semibold text-stone-900 block mb-0.5">
                        Verify Fluid & Mobile Phone Viewports
                      </span>
                      <p className="text-stone-600">
                        In the preview canvas toolbar, switch between Fluid and Mobile Phone tabs. The graphic scales smoothly to mobile portrait dimensions without horizontal sidescroll.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                      4
                    </span>
                    <div>
                      <span className="font-semibold text-stone-900 block mb-0.5">
                        Embed in Your Repository
                      </span>
                      <p className="text-stone-600">
                        Click Download to save `infographic.svg`. Commit it to your repository and add the following Markdown snippet to the very top of your `README.md`:
                      </p>
                      <code className="mt-2 block p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 text-[11px] font-mono select-all">
                        [![Infographic](./infographic.svg)](https://github.com/)
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Best Practices */}
              <div className="border border-stone-200 bg-white p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col gap-3">
                <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  Chapter 3 • Best Practices
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-stone-900">
                  Tips for Maximum Visual Polish
                </h3>

                <ul className="space-y-2.5 text-xs text-stone-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-stone-900">Use Quantitative Metrics in Bullet Points:</strong> Phrases like `10x faster execution`, `99.99% reliability`, or `&lt;15ms latency` are automatically extracted and styled as high-impact statistic badges.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-stone-900">Keep Subtitles Under 12 Words:</strong> Concise one-line project summaries yield the most balanced visual header typography.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-stone-900">Run the GitHub Action in CI:</strong> Automate SVG regeneration on push so visual documentation stays 100% synchronized with code updates automatically.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* =================== TAB 3: FAQ ACCORDION =================== */}
          {activeTab === 'faq' && (
            <div className="flex flex-col gap-4 max-w-3xl mx-auto">
              {/* Category Filter & Search */}
              <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between bg-white border border-stone-200 p-2.5 rounded-xl shadow-xs">
                <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  {['all', 'ENGINE & RENDERING', 'CI/CD & AUTOMATION', 'MARKDOWN & PARSING', 'MOBILE & DISPLAY'].map(
                    (cat) => (
                      <button
                        key={cat}
                        onClick={() => setFaqFilter(cat)}
                        className={`min-h-[34px] px-3 py-1 text-[11px] font-medium rounded-lg transition-colors whitespace-nowrap ${
                          faqFilter === cat
                            ? 'bg-stone-900 text-white shadow-2xs'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                        }`}
                      >
                        {cat === 'all' ? 'All Questions' : cat}
                      </button>
                    )
                  )}
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-52 bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-xs">
                  <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search FAQ..."
                    className="bg-transparent text-xs text-stone-800 placeholder-stone-400 focus:outline-none w-full"
                  />
                </div>
              </div>

              {/* Accordion List */}
              <div className="flex flex-col gap-2.5">
                {filteredFaqs.length === 0 ? (
                  <div className="text-center py-8 text-stone-500 text-xs bg-white border border-stone-200 rounded-xl">
                    No questions found matching "{searchQuery}".
                  </div>
                ) : (
                  filteredFaqs.map((faq) => {
                    const isExpanded = !!expandedFaq[faq.id];
                    return (
                      <div
                        key={faq.id}
                        className="border border-stone-200 bg-white rounded-xl shadow-xs overflow-hidden transition-colors"
                      >
                        <button
                          onClick={() => toggleFaq(faq.id)}
                          className="w-full min-h-[44px] p-4 text-left flex items-center justify-between gap-3 hover:bg-stone-50/70 transition-colors"
                          aria-expanded={isExpanded}
                        >
                          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-stone-900">
                            <span>{faq.question}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-stone-400 font-mono hidden sm:inline">
                              {faq.category}
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180 text-stone-900' : ''
                              }`}
                            />
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="p-4 pt-0 border-t border-stone-100 bg-stone-50/50 text-xs text-stone-600 flex flex-col gap-2.5 animate-in fade-in duration-150">
                            <p className="leading-relaxed mt-3">{faq.answer}</p>
                            {faq.code && (
                              <pre className="p-3 bg-white border border-stone-200 rounded-lg text-[11px] text-stone-800 font-mono overflow-x-auto selection:bg-stone-200">
                                {faq.code}
                              </pre>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-stone-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
            <span>GitInfoGraphics Core • Client & CI/CD Ready</span>
          </div>

          <button
            onClick={onClose}
            className="min-h-[36px] px-4 py-1 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
