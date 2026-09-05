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
  Info
} from 'lucide-react';

interface InfographicCanvasProps {
  desktopSvgString?: string;
  mobileSvgString?: string;
  svgString?: string;
  themeName: string;
  onCopySvg: (layout?: 'desktop' | 'mobile') => void;
  onDownloadSvg: (layout?: 'desktop' | 'mobile') => void;
  onDownloadPng: (layout?: 'desktop' | 'mobile') => void;
  copied: boolean;
}

export const InfographicCanvas: React.FC<InfographicCanvasProps> = ({
  desktopSvgString: propDesktopSvg,
  mobileSvgString: propMobileSvg,
  svgString,
  themeName,
  onCopySvg,
  onDownloadSvg,
  onDownloadPng,
  copied
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

  // Active SVG based on current view
  const activeLayout = viewportMode === 'mobile' ? 'mobile' : fluidLayout;
  const activeSvg = activeLayout === 'mobile' ? mobileSvg : desktopSvg;

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
                setViewportMode('desktop');
                setZoomMode('fit');
                setZoom(1);
              }}
              className={`min-h-[34px] px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
                viewportMode === 'desktop'
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
                setViewportMode('mobile');
                setZoomMode('fit');
                setZoom(1);
              }}
              className={`min-h-[34px] px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1.5 transition-all ${
                viewportMode === 'mobile'
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
              }`}
              title="True Mobile Portrait View (Simulates smartphone screen with true reflowed layout)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Phone</span>
            </button>
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

      {/* SVG Canvas Stage - Guaranteed ZERO sidescroll */}
      <div
        className={`flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-5 flex items-start justify-center transition-colors ${
          backdrop === 'light'
            ? 'bg-[#F9F9F8]'
            : backdrop === 'dark'
            ? 'bg-[#18181B]'
            : 'bg-[radial-gradient(#E2E0DD_1px,transparent_1px)] [background-size:16px_16px] bg-[#FAF9F6]'
        }`}
      >
        {viewportMode === 'desktop' ? (
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

