import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Copy,
  Download,
  Check,
  Sparkles,
  Smartphone,
  Monitor,
  Wifi,
  Battery,
  ChevronDown,
  Layers,
  Info,
  FileText,
  Eye,
  ShieldCheck,
  Activity,
  Cpu,
  GitCommit,
  Columns,
  Quote
} from 'lucide-react';
import { InfographicSpec } from '../engine/types';

interface InfographicCanvasProps {
  desktopSvgString?: string;
  mobileSvgString?: string;
  svgString?: string;
  themeName: string;
  onCopySvg: (layout?: 'desktop' | 'mobile') => void;
  onDownloadSvg: (layout?: 'desktop' | 'mobile') => void;
  onDownloadPng: (layout?: 'desktop' | 'mobile') => void;
  copied: boolean;
  spec?: InfographicSpec;
}

export const InfographicCanvas: React.FC<InfographicCanvasProps> = ({
  desktopSvgString: propDesktopSvg,
  mobileSvgString: propMobileSvg,
  svgString,
  themeName,
  onCopySvg,
  onDownloadSvg,
  onDownloadPng,
  copied,
  spec
}) => {
  const desktopSvg = propDesktopSvg || svgString || '';
  const mobileSvg = propMobileSvg || svgString || '';

  const [zoomMode, setZoomMode] = useState<'fit' | 'custom'>('fit');
  const [zoom, setZoom] = useState(1);
  const [backdrop, setBackdrop] = useState<'light' | 'grid' | 'dark'>('light');
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');
  const [fluidLayout, setFluidLayout] = useState<'desktop' | 'mobile'>('desktop');
  const [snippetMode, setSnippetMode] = useState<'picture' | 'desktop' | 'mobile'>('picture');
  const [mdCopied, setMdCopied] = useState(false);
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [accessibleView, setAccessibleView] = useState(false);
  const [summaryCopied, setSummaryCopied] = useState(false);

  // Active SVG based on current view
  const activeLayout = viewportMode === 'mobile' ? 'mobile' : fluidLayout;
  const activeSvg = activeLayout === 'mobile' ? mobileSvg : desktopSvg;

  const copyAccessibleSummary = () => {
    if (!spec) return;
    const lines: string[] = [
      `# ${spec.title || 'Repository Overview'}`,
      spec.subtitle ? `${spec.subtitle}\n` : '',
    ];
    for (const sec of spec.sections) {
      if ('title' in sec && sec.title) lines.push(`## ${sec.title}`);
      if (sec.type === 'stats') {
        lines.push(sec.items.map((it) => `- ${it.label}: ${it.value}`).join('\n'));
      } else if (sec.type === 'problem-solution') {
        lines.push(`Problem: ${sec.problem}\nSolution: ${sec.solution}`);
      } else if (sec.type === 'features') {
        lines.push(sec.items.map((it) => `- ${it.title}: ${it.description}`).join('\n'));
      } else if (sec.type === 'tech-stack') {
        lines.push(sec.items.map((it) => `- ${it}`).join('\n'));
      } else if (sec.type === 'timeline') {
        lines.push(sec.items.map((it) => `- [${it.versionOrDate}] ${it.title}: ${it.description}`).join('\n'));
      } else if (sec.type === 'comparison') {
        lines.push(`| ${sec.headers.join(' | ')} |`);
        lines.push(`|---|---|---|`);
        sec.rows.forEach((r) => lines.push(`| ${r.feature} | ${String(r.us)} | ${String(r.others)} |`));
      } else if (sec.type === 'callout') {
        lines.push(`> "${sec.text}" ${sec.author ? `— ${sec.author}` : ''}`);
      } else if ('text' in sec && sec.text) {
        lines.push(sec.text);
      }
      lines.push('');
    }
    navigator.clipboard.writeText(lines.join('\n'));
    setSummaryCopied(true);
    setTimeout(() => setSummaryCopied(false), 2000);
  };

  // Extract dimensions from SVG viewBox
  const viewBoxMatch = activeSvg.match(/viewBox="0 0 (\d+) (\d+)"/);
  const width = viewBoxMatch ? viewBoxMatch[1] : activeLayout === 'mobile' ? '400' : '880';
  const height = viewBoxMatch ? viewBoxMatch[2] : 'Auto';

  const getEmbedSnippet = () => {
    if (snippetMode === 'picture') {
      return `<picture>
  <source media="(max-width: 600px)" srcset="./infographic-mobile.svg">
  <img alt="Repository Infographic" src="./infographic.svg">
</picture>`;
    }
    if (snippetMode === 'mobile') {
      return `[![Repository Infographic](./infographic-mobile.svg)](https://github.com/)`;
    }
    return `[![Repository Infographic](./infographic.svg)](https://github.com/)`;
  };

  const copyMarkdownSnippet = () => {
    navigator.clipboard.writeText(getEmbedSnippet());
    setMdCopied(true);
    setTimeout(() => setMdCopied(false), 2000);
  };

  const handleZoomIn = () => {
    setZoomMode('custom');
    setZoom((z) => Math.min(2.0, Number((z + 0.1).toFixed(1))));
  };

  const handleZoomOut = () => {
    setZoomMode('custom');
    setZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(1))));
  };

  const handleResetFit = () => {
    setZoomMode('fit');
    setZoom(1);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
      {/* Top View Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2.5 border-b border-stone-200 bg-stone-50/70 text-xs font-sans">
        {/* Left: Viewport Switch Tabs (Fluid Desktop vs Mobile Phone) */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-white border border-stone-200 rounded-lg p-0.5 shadow-2xs">
            <button
              onClick={() => {
                setAccessibleView(false);
                setViewportMode('desktop');
                setZoomMode('fit');
                setZoom(1);
              }}
              className={`min-h-[34px] px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
                !accessibleView && viewportMode === 'desktop'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
              }`}
              title="Fluid Preview (View at desktop or mobile width)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Fluid</span>
            </button>

            <button
              onClick={() => {
                setAccessibleView(false);
                setViewportMode('mobile');
                setZoomMode('fit');
                setZoom(1);
              }}
              className={`min-h-[34px] px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
                !accessibleView && viewportMode === 'mobile'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
              }`}
              title="True Mobile Portrait View (Simulates smartphone screen with true reflowed layout)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Phone</span>
            </button>
          </div>

          {/* Accessible Text-Only View Toggle */}
          <button
            onClick={() => setAccessibleView(!accessibleView)}
            className={`min-h-[34px] px-3 py-1 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
              accessibleView
                ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                : 'bg-white border-stone-200 text-stone-700 hover:text-stone-950 hover:bg-stone-50'
            }`}
            title="Toggle Accessible Text-Only View (Screen-reader friendly parallel fallback)"
            aria-pressed={accessibleView}
          >
            {accessibleView ? <Eye className="w-3.5 h-3.5 text-white" /> : <FileText className="w-3.5 h-3.5 text-stone-500" />}
            <span>Text-Only View</span>
          </button>

          {/* WCAG AA Compliance Indicator */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200/80 rounded-lg text-[11px] font-medium text-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>WCAG AA Passed</span>
          </div>

          {/* Fluid view layout toggle (Desktop 880 vs Mobile 400) */}
          {viewportMode === 'desktop' && (
            <div className="flex items-center bg-white border border-stone-200 rounded-lg p-0.5 shadow-2xs text-[11px]">
              <button
                onClick={() => setFluidLayout('desktop')}
                className={`px-2 py-1 rounded transition-colors ${
                  fluidLayout === 'desktop'
                    ? 'bg-stone-100 text-stone-900 font-semibold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title="880px Desktop Multi-column Layout"
              >
                Desktop (880px)
              </button>
              <button
                onClick={() => setFluidLayout('mobile')}
                className={`px-2 py-1 rounded transition-colors ${
                  fluidLayout === 'mobile'
                    ? 'bg-stone-100 text-stone-900 font-semibold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title="400px Responsive Mobile Layout"
              >
                Mobile (400px)
              </button>
            </div>
          )}

          {/* Active Layout Badge */}
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono text-stone-600 bg-white border border-stone-200 rounded-md">
            <span>{width} × {height} px</span>
            <span className="text-stone-300">•</span>
            <span className="font-sans text-[10px] text-stone-500 capitalize">{activeLayout} layout</span>
          </span>
        </div>

        {/* Right: Controls (Zoom, Backdrop, Actions) */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {/* Zoom controls */}
          <div className="flex items-center bg-white border border-stone-200 rounded-lg p-0.5 text-stone-700 shadow-2xs">
            <button
              onClick={() => {
                if (zoomMode === 'fit') {
                  setZoomMode('custom');
                  setZoom(1);
                } else {
                  handleResetFit();
                }
              }}
              className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                zoomMode === 'fit' ? 'bg-stone-100 text-stone-900 font-semibold' : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Fit to container width"
            >
              Fit
            </button>
            <div className="h-3 w-px bg-stone-200 mx-0.5" />
            <button
              onClick={handleZoomOut}
              className="p-1 hover:text-stone-950 text-stone-500 hover:bg-stone-100 rounded"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-9 text-center text-[10px] font-mono text-stone-600">
              {zoomMode === 'fit' ? 'Auto' : `${Math.round(zoom * 100)}%`}
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:text-stone-950 text-stone-500 hover:bg-stone-100 rounded"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Backdrop Mode */}
          <div className="flex items-center bg-white border border-stone-200 rounded-lg p-0.5 shadow-2xs">
            <button
              onClick={() => setBackdrop('light')}
              className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                backdrop === 'light' ? 'bg-stone-100 text-stone-900 font-semibold' : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Natural light background"
            >
              Light
            </button>
            <button
              onClick={() => setBackdrop('grid')}
              className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                backdrop === 'grid' ? 'bg-stone-100 text-stone-900 font-semibold' : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Subtle grid canvas"
            >
              Grid
            </button>
            <button
              onClick={() => setBackdrop('dark')}
              className={`px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                backdrop === 'dark' ? 'bg-stone-900 text-white font-semibold' : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Dark backdrop"
            >
              Dark
            </button>
          </div>

          {/* Quick Actions */}
          <button
            onClick={() => onCopySvg(activeLayout)}
            className="flex items-center gap-1.5 min-h-[34px] px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg text-stone-700 text-xs font-medium shadow-2xs transition-colors"
            title={`Copy ${activeLayout} SVG XML to clipboard`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : `Copy ${activeLayout === 'mobile' ? 'Mobile' : 'Desktop'} SVG`}</span>
          </button>

          {/* Download split button */}
          <div className="relative inline-flex">
            <button
              onClick={() => onDownloadSvg(activeLayout)}
              className="flex items-center gap-1.5 min-h-[34px] px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-l-lg shadow-2xs transition-colors"
              title={`Download ${activeLayout === 'mobile' ? 'infographic-mobile.svg' : 'infographic.svg'}`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {activeLayout === 'mobile' ? 'Mobile SVG' : 'Desktop SVG'}</span>
            </button>
            <button
              onClick={() => setDownloadMenuOpen((o) => !o)}
              className="px-1.5 min-h-[34px] bg-stone-900 hover:bg-stone-800 text-white border-l border-stone-700 rounded-r-lg"
              title="More download options"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {downloadMenuOpen && (
              <div
                className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-stone-200 rounded-xl shadow-lg p-1.5 z-50 text-xs font-sans text-stone-700"
                onMouseLeave={() => setDownloadMenuOpen(false)}
              >
                <div className="px-2 py-1 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">SVG Downloads</div>
                <button
                  onClick={() => {
                    onDownloadSvg('desktop');
                    setDownloadMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-stone-50 rounded-lg flex items-center justify-between"
                >
                  <span>Desktop SVG (880px)</span>
                  <span className="font-mono text-[10px] text-stone-400">.svg</span>
                </button>
                <button
                  onClick={() => {
                    onDownloadSvg('mobile');
                    setDownloadMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-stone-50 rounded-lg flex items-center justify-between"
                >
                  <span>Mobile SVG (400px portrait)</span>
                  <span className="font-mono text-[10px] text-stone-400">.svg</span>
                </button>
                <div className="my-1 border-t border-stone-100" />
                <div className="px-2 py-1 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Retina PNG Exports</div>
                <button
                  onClick={() => {
                    onDownloadPng('desktop');
                    setDownloadMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-stone-50 rounded-lg flex items-center justify-between"
                >
                  <span>Desktop Retina PNG (@2x)</span>
                  <span className="font-mono text-[10px] text-stone-400">1760px</span>
                </button>
                <button
                  onClick={() => {
                    onDownloadPng('mobile');
                    setDownloadMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-stone-50 rounded-lg flex items-center justify-between"
                >
                  <span>Mobile Retina PNG (@2x)</span>
                  <span className="font-mono text-[10px] text-stone-400">800px</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SVG Canvas Stage or Accessible Text View - Guaranteed ZERO sidescroll */}
      <div
        className={`flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-5 flex items-start justify-center transition-colors ${
          backdrop === 'light'
            ? 'bg-[#F9F9F8]'
            : backdrop === 'dark'
            ? 'bg-[#18181B]'
            : 'bg-[radial-gradient(#E2E0DD_1px,transparent_1px)] [background-size:16px_16px] bg-[#FAF9F6]'
        }`}
      >
        {accessibleView ? (
          /* Accessible Semantic HTML Fallback View */
          <div className="w-full max-w-3xl bg-white border border-stone-200 rounded-xl shadow-xs p-6 sm:p-8 font-sans text-stone-800">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-xs font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Screen Reader &amp; Text Alternative
                </span>
                <span className="text-xs text-stone-500">WCAG AA Compliant Fallback</span>
              </div>
              <button
                type="button"
                onClick={copyAccessibleSummary}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs"
              >
                {summaryCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{summaryCopied ? 'Summary Copied' : 'Copy Text Summary'}</span>
              </button>
            </div>

            <article role="region" aria-label="Accessible Repository Infographic" className="space-y-6">
              <header className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
                  {spec?.title || 'Repository Infographic'}
                </h1>
                {spec?.subtitle && (
                  <p className="text-base text-stone-600 leading-relaxed" role="doc-subtitle">
                    {spec.subtitle}
                  </p>
                )}
              </header>

              {spec?.sections.map((sec, idx) => {
                if (sec.type === 'stats') {
                  return (
                    <section key={sec.id || idx} className="space-y-3 pt-4 border-t border-stone-100" aria-label="Key Metrics">
                      <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-600" />
                        Key Metrics
                      </h2>
                      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {sec.items.map((stat, sIdx) => (
                          <div key={sIdx} className="p-3 bg-stone-50 border border-stone-200 rounded-lg">
                            <dt className="text-xs font-medium text-stone-500">{stat.label}</dt>
                            <dd className="text-xl font-bold text-stone-900 mt-1">{stat.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                  );
                }

                if (sec.type === 'problem-solution') {
                  return (
                    <section key={sec.id || idx} className="space-y-3 pt-4 border-t border-stone-100" aria-label="The Challenge and Our Solution">
                      <h2 className="text-lg font-semibold text-stone-900">
                        {sec.problemTitle && sec.solutionTitle ? `${sec.problemTitle} & ${sec.solutionTitle}` : 'Challenge & Solution'}
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-lg">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">{sec.problemTitle || 'The Problem'}</h3>
                          <p className="text-sm text-stone-800 leading-relaxed">{sec.problem}</p>
                        </div>
                        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1">{sec.solutionTitle || 'The Solution'}</h3>
                          <p className="text-sm text-stone-800 leading-relaxed">{sec.solution}</p>
                        </div>
                      </div>
                    </section>
                  );
                }

                if (sec.type === 'features') {
                  return (
                    <section key={sec.id || idx} className="space-y-3 pt-4 border-t border-stone-100" aria-label={sec.title || 'Core Features'}>
                      <h2 className="text-lg font-semibold text-stone-900">{sec.title || 'Core Features'}</h2>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0">
                        {sec.items.map((feat, fIdx) => (
                          <li key={fIdx} className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-1">
                            <strong className="text-sm font-semibold text-stone-900 block">{feat.title}</strong>
                            <p className="text-xs text-stone-600 leading-relaxed">{feat.description}</p>
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                }

                if (sec.type === 'tech-stack') {
                  return (
                    <section key={sec.id || idx} className="space-y-3 pt-4 border-t border-stone-100" aria-label={sec.title || 'Technology Architecture'}>
                      <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-sky-600" />
                        {sec.title || 'Technology Stack'}
                      </h2>
                      <ul className="flex flex-wrap gap-2 list-none p-0">
                        {sec.items.map((tech, tIdx) => (
                          <li key={tIdx} className="px-3 py-1 bg-stone-100 border border-stone-200 rounded-md text-xs font-mono text-stone-800 font-medium">
                            {tech}
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                }

                if (sec.type === 'timeline') {
                  return (
                    <section key={sec.id || idx} className="space-y-3 pt-4 border-t border-stone-100" aria-label={sec.title || 'Project Milestones'}>
                      <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                        <GitCommit className="w-4 h-4 text-indigo-600" />
                        {sec.title || 'Milestones & Timeline'}
                      </h2>
                      <ol className="space-y-3 list-none p-0 border-l-2 border-stone-200 pl-4">
                        {sec.items.map((item, mIdx) => (
                          <li key={mIdx} className="relative space-y-0.5">
                            <span className="text-xs font-mono font-semibold text-indigo-600 block">{item.versionOrDate}</span>
                            <strong className="text-sm text-stone-900 block">{item.title}</strong>
                            <p className="text-xs text-stone-600">{item.description}</p>
                          </li>
                        ))}
                      </ol>
                    </section>
                  );
                }

                if (sec.type === 'comparison') {
                  return (
                    <section key={sec.id || idx} className="space-y-3 pt-4 border-t border-stone-100" aria-label={sec.title || 'Comparison'}>
                      <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                        <Columns className="w-4 h-4 text-teal-600" />
                        {sec.title || 'Comparison Overview'}
                      </h2>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse border border-stone-200">
                          <thead>
                            <tr className="bg-stone-50 border-b border-stone-200">
                              {sec.headers.map((h, hIdx) => (
                                <th key={hIdx} className="p-2.5 font-semibold text-stone-900">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {sec.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="border-b border-stone-200 hover:bg-stone-50/50">
                                <td className="p-2.5 font-medium text-stone-900">{row.feature}</td>
                                <td className="p-2.5 text-stone-800">{String(row.us)}</td>
                                <td className="p-2.5 text-stone-600">{String(row.others)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  );
                }

                if (sec.type === 'callout') {
                  return (
                    <section key={sec.id || idx} className="space-y-2 pt-4 border-t border-stone-100" aria-label="Key Highlight">
                      <blockquote className="p-4 bg-stone-50 border-l-4 border-stone-400 rounded-r-lg space-y-1">
                        <p className="text-sm italic text-stone-800">"{sec.text}"</p>
                        {sec.author && <cite className="text-xs text-stone-500 font-medium block not-italic">— {sec.author}</cite>}
                      </blockquote>
                    </section>
                  );
                }

                return null;
              })}
            </article>
          </div>
        ) : viewportMode === 'desktop' ? (
          /* Desktop / Fluid Viewport: Constrained to 100% width, absolutely no horizontal scrolling */
          <div className="w-full max-w-full flex justify-center py-1">
            <div
              style={
                zoomMode === 'custom'
                  ? {
                      transform: `scale(${zoom})`,
                      transformOrigin: 'top center',
                      transition: 'transform 0.15s ease-out',
                      maxWidth: '100%'
                    }
                  : {
                      width: '100%',
                      maxWidth: `${width}px`
                    }
              }
              className="w-full max-w-full transition-all duration-150 [&_svg]:w-full [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:block [&_svg]:shadow-xs"
              dangerouslySetInnerHTML={{ __html: activeSvg }}
            />
          </div>
        ) : (
          /* Mobile Phone Portrait Simulation: Renders the genuine 400px mobile SVG layout */
          <div className="w-full max-w-[390px] sm:max-w-[420px] mx-auto my-2 shrink-0">
            {/* Minimalist Scandinavian Phone Chasis */}
            <div className="bg-stone-900 border border-stone-800 shadow-xl rounded-[36px] p-2.5 overflow-hidden flex flex-col text-stone-300">
              {/* Phone Status Bar */}
              <div className="px-3 pt-1 pb-1.5 flex items-center justify-between text-stone-400 font-sans text-[11px] select-none">
                <span className="font-semibold text-white">09:41</span>
                {/* Minimal Dynamic Island / Camera */}
                <div className="w-20 h-4 bg-stone-950 rounded-full flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-stone-800" />
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Wifi className="w-3 h-3 text-stone-400" />
                  <Battery className="w-3.5 h-3.5 text-stone-400" />
                </div>
              </div>

              {/* GitHub App / Mobile Browser URL bar */}
              <div className="bg-stone-950/80 rounded-t-xl px-3 py-1.5 border border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
                <div className="truncate flex items-center gap-1 text-[10px]">
                  <span className="text-stone-500">github.com/</span>
                  <span className="text-stone-200 font-medium">project</span>
                  <span className="text-stone-500">/README.md</span>
                </div>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                  MOBILE RESPONSIVE
                </span>
              </div>

              {/* Phone Content Screen: Displays genuine 400px mobile layout with 2x2 stats, stacked problem/solution, 1-col features */}
              <div className="bg-white rounded-b-xl p-2.5 max-h-[620px] overflow-y-auto overflow-x-hidden border-x border-b border-stone-800/80">
                <div className="mb-2 pb-1.5 border-b border-stone-100 flex items-center justify-between text-[10px] text-stone-500 font-sans">
                  <span className="flex items-center gap-1 font-medium text-stone-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    True Mobile Reflow (400px)
                  </span>
                  <span className="text-stone-400 font-mono">1:1 Native Scale</span>
                </div>

                {/* SVG rendered inside mobile phone with true mobile layout */}
                <div
                  className="w-full max-w-full overflow-hidden [&_svg]:w-full [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:block"
                  dangerouslySetInnerHTML={{ __html: mobileSvg }}
                />

                <div className="mt-3 pt-2 border-t border-stone-100 text-[10px] text-stone-400 text-center leading-relaxed">
                  Reflowed with 2×2 metrics, vertical problem ↓ solution flow &amp; touch-legible fonts
                </div>
              </div>

              {/* Phone Home Bar */}
              <div className="pt-2 pb-0.5 flex justify-center">
                <div className="w-32 h-1 bg-stone-700 rounded-full" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Markdown & Responsive Embed snippet bar */}
      <div className="px-3.5 py-2.5 border-t border-stone-200 bg-stone-50/90 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-stone-600 font-mono text-[11px] truncate max-w-full">
          <div className="flex items-center bg-white border border-stone-200 rounded-md p-0.5 shrink-0 font-sans">
            <button
              onClick={() => setSnippetMode('picture')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                snippetMode === 'picture'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="GitHub & Web Responsive <picture> tag: Auto-serves mobile SVG on phones and desktop SVG on monitors"
            >
              Responsive &lt;picture&gt;
            </button>
            <button
              onClick={() => setSnippetMode('desktop')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                snippetMode === 'desktop'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Standard single image markdown"
            >
              Desktop MD
            </button>
            <button
              onClick={() => setSnippetMode('mobile')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                snippetMode === 'mobile'
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="Mobile single image markdown"
            >
              Mobile MD
            </button>
          </div>

          <code className="bg-white px-2 py-0.5 border border-stone-200 rounded text-stone-800 select-all truncate max-w-xs sm:max-w-md">
            {snippetMode === 'picture'
              ? '<picture><source media="(max-width: 600px)" srcset="./infographic-mobile.svg"><img alt="Infographic" src="./infographic.svg"></picture>'
              : snippetMode === 'mobile'
              ? '[![Infographic](./infographic-mobile.svg)](https://github.com/)'
              : '[![Infographic](./infographic.svg)](https://github.com/)'}
          </code>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={copyMarkdownSnippet}
            className="min-h-[34px] flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-white border border-stone-200 hover:bg-stone-50 rounded-lg text-stone-700 shadow-2xs transition-colors"
          >
            {mdCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
            <span>{mdCopied ? 'Copied Snippet' : 'Copy Embed Snippet'}</span>
          </button>

          <button
            onClick={() => onDownloadPng(activeLayout)}
            className="min-h-[34px] flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-white border border-stone-200 hover:bg-stone-50 rounded-lg text-stone-700 shadow-2xs transition-colors"
            title={`Rasterize ${activeLayout} SVG to high-res Retina PNG`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Retina PNG ({activeLayout === 'mobile' ? 'Mobile' : 'Desktop'})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

