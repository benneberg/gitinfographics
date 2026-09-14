import React, { useState, useRef } from 'react';
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
  FileText,
  Eye,
  ShieldCheck,
  Activity,
  Cpu,
  GitCommit,
  Columns,
  Quote,
  SlidersHorizontal,
  X,
  Code2,
  Image as ImageIcon
} from 'lucide-react';
import { InfographicSpec } from '../engine/types';
import { ColorBlindnessType, COLOR_BLINDNESS_MATRICES } from '../engine/contrast';
import { triggerHaptic } from '../ui/haptics';

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
  colorBlindness?: ColorBlindnessType;
  onOpenContrastModal?: () => void;
  onResetColorBlindness?: () => void;
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
  spec,
  colorBlindness = 'normal',
  onOpenContrastModal,
  onResetColorBlindness
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
  const [accessibleView, setAccessibleView] = useState(false);
  const [summaryCopied, setSummaryCopied] = useState(false);

  // Slide-in / Collapsible Menu Panels
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const svgContainerRef = useRef<HTMLDivElement>(null);

  const handleSvgKeyDown = (e: React.KeyboardEvent) => {
    if (!svgContainerRef.current) return;
    const focusables = Array.from(
      svgContainerRef.current.querySelectorAll<HTMLElement>('.gig-sec[tabindex="0"]')
    );
    if (!focusables.length) return;

    const activeEl = document.activeElement as HTMLElement | null;
    const currentIndex = activeEl ? focusables.indexOf(activeEl) : -1;

    if (e.key === 'ArrowDown' || e.key === 'j') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % focusables.length;
      focusables[nextIndex]?.focus();
      focusables[nextIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else if (e.key === 'ArrowUp' || e.key === 'k') {
      e.preventDefault();
      const prevIndex = currentIndex <= 0 ? focusables.length - 1 : currentIndex - 1;
      focusables[prevIndex]?.focus();
      focusables[prevIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusables[0]?.focus();
      focusables[0]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else if (e.key === 'End') {
      e.preventDefault();
      focusables[focusables.length - 1]?.focus();
      focusables[focusables.length - 1]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

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
      return `<picture>\n  <source media="(max-width: 600px)" srcset="./infographic-mobile.svg">\n  <img alt="Repository Infographic" src="./infographic.svg">\n</picture>`;
    }
    if (snippetMode === 'mobile') {
      return `[![Repository Infographic](./infographic-mobile.svg)](https://github.com/)`;
    }
    return `[![Repository Infographic](./infographic.svg)](https://github.com/)`;
  };

  const copyMarkdownSnippet = () => {
    triggerHaptic(15);
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

  const toggleViewMenu = () => {
    triggerHaptic(10);
    setShowViewMenu((prev) => !prev);
    if (!showViewMenu) setShowExportMenu(false);
  };

  const toggleExportMenu = () => {
    triggerHaptic(10);
    setShowExportMenu((prev) => !prev);
    if (!showExportMenu) setShowViewMenu(false);
  };

  return (
    <div className="relative flex flex-col h-full bg-white border border-stone-200/90 rounded-2xl shadow-xs overflow-hidden">
      
      {/* ======================================================================= */}
      {/* 1. CLEAN PREVIEW HEADER                                                 */}
      {/* ======================================================================= */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-stone-200/80 bg-white/95 backdrop-blur-md text-xs font-sans z-10 shrink-0">
        
        {/* Left: Quick Layout Switcher & Dimensions */}
        <div className="flex items-center gap-2">
          {/* Quick Layout Pill Switcher */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-xl text-[11px] font-semibold">
            <button
              type="button"
              id="canvas-format-desktop"
              onClick={() => {
                triggerHaptic(8);
                setViewportMode('desktop');
                setFluidLayout('desktop');
              }}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewportMode === 'desktop' && fluidLayout === 'desktop'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Desktop
            </button>
            <button
              type="button"
              id="canvas-format-mobile"
              onClick={() => {
                triggerHaptic(8);
                setFluidLayout('mobile');
              }}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeLayout === 'mobile'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Mobile
            </button>
          </div>

          {/* Dimensions Badge */}
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-stone-500 bg-stone-50 border border-stone-200/70 rounded-lg">
            <span>{width} × {height}px</span>
          </span>

          {accessibleView && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
              <Eye className="w-3 h-3" /> Text-Only
            </span>
          )}
        </div>

        {/* Right: Consolidated View & Export Menus */}
        <div className="flex items-center gap-1.5">
          {/* Quick Copy SVG button */}
          <button
            type="button"
            onClick={() => onCopySvg(activeLayout)}
            className="flex items-center gap-1 min-h-[34px] px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-200/90 rounded-xl text-stone-700 text-xs font-semibold shadow-2xs transition-all active:scale-95"
            title="Quick copy SVG vector code to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
            <span className="hidden md:inline">{copied ? 'Copied' : 'Copy SVG'}</span>
          </button>

          {/* View Settings Menu Trigger */}
          <button
            type="button"
            id="canvas-view-settings-btn"
            onClick={toggleViewMenu}
            className={`flex items-center gap-1.5 min-h-[34px] px-2.5 sm:px-3 py-1 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
              showViewMenu
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
            }`}
            title="Configure canvas view, frame, zoom, and accessibility"
            aria-expanded={showViewMenu}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Options</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showViewMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Export Settings Menu Trigger */}
          <button
            type="button"
            id="canvas-export-settings-btn"
            onClick={toggleExportMenu}
            className={`flex items-center gap-1.5 min-h-[34px] px-2.5 sm:px-3 py-1 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
              showExportMenu
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                : 'bg-stone-900 hover:bg-stone-800 border-stone-900 text-white shadow-2xs'
            }`}
            title="Download SVG, Retina PNG, or copy embed codes"
            aria-expanded={showExportMenu}
          >
            <Download className="w-3.5 h-3.5 text-stone-200" />
            <span>Export</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. SLIDE-IN VIEW SETTINGS MENU PANEL                                    */}
      {/* ======================================================================= */}
      {showViewMenu && (
        <div
          id="canvas-view-settings-panel"
          className="absolute right-3 top-[54px] z-30 w-80 bg-white/95 backdrop-blur-xl border border-stone-200/90 rounded-2xl shadow-xl p-4 text-xs font-sans space-y-4 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="font-bold text-stone-900 flex items-center gap-1.5 text-sm">
              <SlidersHorizontal className="w-4 h-4 text-stone-700" />
              View &amp; Display Settings
            </span>
            <button
              type="button"
              onClick={() => setShowViewMenu(false)}
              className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Frame & Display Mode */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Display Mode
            </label>
            <div className="grid grid-cols-2 gap-1.5 bg-stone-50 p-1 rounded-xl border border-stone-200/70">
              <button
                type="button"
                onClick={() => {
                  setAccessibleView(false);
                  setViewportMode('desktop');
                  setZoomMode('fit');
                  setZoom(1);
                }}
                className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  !accessibleView && viewportMode === 'desktop'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" /> Fluid Canvas
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccessibleView(false);
                  setViewportMode('mobile');
                  setZoomMode('fit');
                  setZoom(1);
                }}
                className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  !accessibleView && viewportMode === 'mobile'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Phone Frame
              </button>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Zoom &amp; Scale
              </label>
              <span className="font-mono text-[10px] text-stone-500 font-semibold">
                {zoomMode === 'fit' ? 'Auto Fit' : `${Math.round(zoom * 100)}%`}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-stone-50 p-1 rounded-xl border border-stone-200/70">
              <button
                type="button"
                onClick={handleResetFit}
                className={`flex-1 py-1 px-2 rounded-lg font-semibold transition-all ${
                  zoomMode === 'fit' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Fit
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-white text-stone-600 rounded-lg transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoomMode('custom');
                  setZoom(1);
                }}
                className={`flex-1 py-1 px-2 rounded-lg font-semibold transition-all ${
                  zoomMode === 'custom' && zoom === 1
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                100%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-white text-stone-600 rounded-lg transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Backdrop Mode */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Canvas Backdrop
            </label>
            <div className="grid grid-cols-3 gap-1 bg-stone-50 p-1 rounded-xl border border-stone-200/70">
              <button
                type="button"
                onClick={() => setBackdrop('light')}
                className={`py-1.5 rounded-lg font-semibold transition-all ${
                  backdrop === 'light' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setBackdrop('grid')}
                className={`py-1.5 rounded-lg font-semibold transition-all ${
                  backdrop === 'grid' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => setBackdrop('dark')}
                className={`py-1.5 rounded-lg font-semibold transition-all ${
                  backdrop === 'dark' ? 'bg-stone-900 text-white shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Dark
              </button>
            </div>
          </div>

          {/* Accessibility & Testing Tools */}
          <div className="pt-2 border-t border-stone-100 space-y-2">
            <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Accessibility &amp; Audits
            </label>
            
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setAccessibleView(!accessibleView);
                  setShowViewMenu(false);
                }}
                className={`w-full py-2 px-3 rounded-xl font-semibold flex items-center justify-between border transition-all ${
                  accessibleView
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Text-Only Fallback View</span>
                </div>
                <span className="text-[10px] font-mono text-stone-400">
                  {accessibleView ? 'ON' : 'OFF'}
                </span>
              </button>

              {onOpenContrastModal && (
                <button
                  type="button"
                  onClick={() => {
                    setShowViewMenu(false);
                    onOpenContrastModal();
                  }}
                  className="w-full py-2 px-3 rounded-xl font-semibold flex items-center justify-between bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WCAG AA Contrast Audit</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-700">PASS</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 3. SLIDE-IN EXPORT SETTINGS MENU PANEL                                  */}
      {/* ======================================================================= */}
      {showExportMenu && (
        <div
          id="canvas-export-settings-panel"
          className="absolute right-3 top-[54px] z-30 w-84 bg-white/95 backdrop-blur-xl border border-stone-200/90 rounded-2xl shadow-xl p-4 text-xs font-sans space-y-4 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="font-bold text-stone-900 flex items-center gap-1.5 text-sm">
              <Download className="w-4 h-4 text-stone-700" />
              Export &amp; Embed Settings
            </span>
            <button
              type="button"
              onClick={() => setShowExportMenu(false)}
              className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Downloads */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Vector SVG Downloads
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onDownloadSvg('desktop');
                  setShowExportMenu(false);
                }}
                className="p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-left transition-colors group"
              >
                <div className="font-semibold text-stone-900 group-hover:text-stone-950">Desktop SVG</div>
                <div className="text-[10px] text-stone-500 font-mono">880px • Vector XML</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  onDownloadSvg('mobile');
                  setShowExportMenu(false);
                }}
                className="p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-left transition-colors group"
              >
                <div className="font-semibold text-stone-900 group-hover:text-stone-950">Mobile SVG</div>
                <div className="text-[10px] text-stone-500 font-mono">400px • Mobile XML</div>
              </button>
            </div>
          </div>

          {/* Retina PNG Exports */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Retina PNG Exports (@2x)
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onDownloadPng('desktop');
                  setShowExportMenu(false);
                }}
                className="p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-left transition-colors group"
              >
                <div className="font-semibold text-stone-900 flex items-center gap-1">
                  <span>Desktop PNG</span>
                  <Sparkles className="w-3 h-3 text-amber-500" />
                </div>
                <div className="text-[10px] text-stone-500 font-mono">1760px Retina</div>
              </button>
              <button
                type="button"
                onClick={() => {
                  onDownloadPng('mobile');
                  setShowExportMenu(false);
                }}
                className="p-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-left transition-colors group"
              >
                <div className="font-semibold text-stone-900 flex items-center gap-1">
                  <span>Mobile PNG</span>
                  <Sparkles className="w-3 h-3 text-amber-500" />
                </div>
                <div className="text-[10px] text-stone-500 font-mono">800px Retina</div>
              </button>
            </div>
          </div>

          {/* GitHub README Embed Snippet */}
          <div className="pt-2 border-t border-stone-100 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                README Embed Snippet
              </label>
              <button
                type="button"
                onClick={copyMarkdownSnippet}
                className="flex items-center gap-1 text-[11px] font-semibold text-stone-800 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded-lg transition-colors"
              >
                {mdCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{mdCopied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Snippet format selector */}
            <div className="grid grid-cols-3 gap-1 bg-stone-50 p-1 rounded-xl border border-stone-200/70 text-[10px]">
              <button
                type="button"
                onClick={() => setSnippetMode('picture')}
                className={`py-1 rounded-lg font-medium transition-all ${
                  snippetMode === 'picture' ? 'bg-white text-stone-900 font-semibold shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Responsive &lt;picture&gt;
              </button>
              <button
                type="button"
                onClick={() => setSnippetMode('desktop')}
                className={`py-1 rounded-lg font-medium transition-all ${
                  snippetMode === 'desktop' ? 'bg-white text-stone-900 font-semibold shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Desktop MD
              </button>
              <button
                type="button"
                onClick={() => setSnippetMode('mobile')}
                className={`py-1 rounded-lg font-medium transition-all ${
                  snippetMode === 'mobile' ? 'bg-white text-stone-900 font-semibold shadow-2xs' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Mobile MD
              </button>
            </div>

            <pre className="p-2.5 bg-stone-900 text-stone-200 rounded-xl text-[10px] font-mono overflow-x-auto whitespace-pre leading-relaxed select-all">
              {getEmbedSnippet()}
            </pre>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 4. CANVAS STAGE / RENDER VIEW                                           */}
      {/* ======================================================================= */}
      <div
        className={`flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 flex items-start justify-center transition-colors ${
          backdrop === 'light'
            ? 'bg-[#F9F9F8]'
            : backdrop === 'dark'
            ? 'bg-[#18181B]'
            : 'bg-[radial-gradient(#E2E0DD_1px,transparent_1px)] [background-size:16px_16px] bg-[#FAF9F6]'
        }`}
      >
        {accessibleView ? (
          /* Accessible Semantic HTML Fallback View */
          <div className="w-full max-w-3xl bg-white border border-stone-200 rounded-2xl shadow-xs p-6 sm:p-8 font-sans text-stone-800">
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
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium transition-colors shadow-2xs"
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
                          <div key={sIdx} className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
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
                        <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1">{sec.problemTitle || 'The Problem'}</h3>
                          <p className="text-sm text-stone-800 leading-relaxed">{sec.problem}</p>
                        </div>
                        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl">
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
                          <li key={fIdx} className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
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
                          <li key={tIdx} className="px-3 py-1 bg-stone-100 border border-stone-200 rounded-lg text-xs font-mono text-stone-800 font-medium">
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
                      <blockquote className="p-4 bg-stone-50 border-l-4 border-stone-400 rounded-r-xl space-y-1">
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
          /* Desktop / Fluid Viewport */
          <div className="w-full max-w-full flex justify-center py-1">
            <svg className="hidden absolute" aria-hidden="true" width="0" height="0">
              <defs>
                <filter id="cb-filter">
                  <feColorMatrix type="matrix" values={COLOR_BLINDNESS_MATRICES[colorBlindness]} />
                </filter>
              </defs>
            </svg>
            <div
              ref={svgContainerRef}
              tabIndex={0}
              onKeyDown={handleSvgKeyDown}
              role="region"
              aria-label="Infographic SVG viewer. Use Up and Down arrow keys to focus and navigate between sections."
              style={
                zoomMode === 'custom'
                  ? {
                      transform: `scale(${zoom})`,
                      transformOrigin: 'top center',
                      transition: 'transform 0.15s ease-out',
                      maxWidth: '100%',
                      filter: colorBlindness !== 'normal' ? 'url(#cb-filter)' : undefined
                    }
                  : {
                      width: '100%',
                      maxWidth: `${width}px`,
                      filter: colorBlindness !== 'normal' ? 'url(#cb-filter)' : undefined
                    }
              }
              className="w-full max-w-full transition-all duration-150 outline-hidden focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:rounded-2xl [&_svg]:w-full [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:block [&_svg]:shadow-xs"
              dangerouslySetInnerHTML={{ __html: activeSvg }}
            />
          </div>
        ) : (
          /* Mobile Phone Portrait Simulation */
          <div className="w-full max-w-[390px] sm:max-w-[420px] mx-auto my-2 shrink-0">
            <div className="bg-stone-900 border border-stone-800 shadow-2xl rounded-[40px] p-2.5 overflow-hidden flex flex-col text-stone-300">
              {/* Phone Status Bar */}
              <div className="px-4 pt-1.5 pb-2 flex items-center justify-between text-stone-400 font-sans text-[11px] select-none">
                <span className="font-semibold text-white">09:41</span>
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
              <div className="bg-stone-950/80 rounded-t-2xl px-3.5 py-1.5 border border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
                <div className="truncate flex items-center gap-1 text-[10px]">
                  <span className="text-stone-500">github.com/</span>
                  <span className="text-stone-200 font-medium">project</span>
                  <span className="text-stone-500">/README.md</span>
                </div>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                  MOBILE RESPONSIVE
                </span>
              </div>

              {/* Phone Content Screen */}
              <div className="bg-white rounded-b-2xl p-2.5 max-h-[620px] overflow-y-auto overflow-x-hidden border-x border-b border-stone-800/80">
                <div className="mb-2 pb-1.5 border-b border-stone-100 flex items-center justify-between text-[10px] text-stone-500 font-sans">
                  <span className="flex items-center gap-1 font-medium text-stone-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    True Mobile Reflow (400px)
                  </span>
                  <span className="text-stone-400 font-mono">1:1 Native Scale</span>
                </div>

                <div
                  style={{ filter: colorBlindness !== 'normal' ? 'url(#cb-filter)' : undefined }}
                  className="w-full max-w-full overflow-hidden [&_svg]:w-full [&_svg]:max-w-full [&_svg]:h-auto [&_svg]:block"
                  dangerouslySetInnerHTML={{ __html: mobileSvg }}
                />

                <div className="mt-3 pt-2 border-t border-stone-100 text-[10px] text-stone-400 text-center leading-relaxed">
                  Reflowed with 2×2 metrics, vertical problem ↓ solution flow &amp; touch-legible fonts
                </div>
              </div>

              {/* Phone Home Bar */}
              <div className="pt-2.5 pb-1 flex justify-center">
                <div className="w-32 h-1 bg-stone-700 rounded-full" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
