import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  History as HistoryIcon,
  Code2,
  Share2,
  Trash2,
  FileCode,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { VisualFormatPicker } from './VisualFormatPicker';
import { InfographicSpec } from '../../engine/types';
import { triggerHaptic } from '../../ui/haptics';

interface MobileExportSheetProps {
  currentFormat: string;
  onFormatChange: (format: string) => void;
  onDownloadSvg: (format?: string) => void;
  onDownloadPng: (format?: string) => void;
  onCopySvg: (format?: string) => void;
  copied: boolean;
  history: any[];
  onLoadHistory: (item: any) => void;
  onClearHistory: () => void;
  spec: InfographicSpec;
  svgContent: string;
  onOpenShareModal: () => void;
}

export const MobileExportSheet: React.FC<MobileExportSheetProps> = ({
  currentFormat,
  onFormatChange,
  onDownloadSvg,
  onDownloadPng,
  onCopySvg,
  copied,
  history,
  onLoadHistory,
  onClearHistory,
  spec,
  svgContent,
  onOpenShareModal,
}) => {
  const [showSpec, setShowSpec] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const [specCopied, setSpecCopied] = useState(false);

  const handleCopyEmbed = () => {
    triggerHaptic(15);
    const snippet = `<!-- GitInfoGraphics README Banner -->\n<p align="center">\n  <img src="https://raw.githubusercontent.com/owner/repo/main/infographic.svg" alt="${spec.title || 'Infographic'}" width="100%" />\n</p>`;
    navigator.clipboard.writeText(snippet);
    setEmbedCopied(true);
    setTimeout(() => setEmbedCopied(false), 2200);
  };

  const handleCopySpec = () => {
    triggerHaptic(15);
    navigator.clipboard.writeText(JSON.stringify(spec, null, 2));
    setSpecCopied(true);
    setTimeout(() => setSpecCopied(false), 2200);
  };

  return (
    <div className="flex flex-col gap-5 p-4 bg-[#FAFAF9] pb-24 text-stone-800 font-sans">
      {/* 1. Visual Format Selector */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-3.5 shadow-xs">
        <VisualFormatPicker
          currentFormat={currentFormat}
          onFormatChange={onFormatChange}
        />
      </div>

      {/* 2. Direct Export Buttons */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
        <div className="text-xs font-semibold text-stone-900 flex items-center justify-between">
          <span>Export Assets</span>
          <span className="text-[10px] uppercase font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
            Razor-sharp
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Retina PNG */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(15);
              onDownloadPng(currentFormat);
            }}
            className="min-h-[48px] px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>Download Retina PNG (@2x)</span>
          </button>

          {/* Vector SVG */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(15);
              onDownloadSvg(currentFormat);
            }}
            className="min-h-[48px] px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>Download Vector SVG</span>
          </button>
        </div>

        {/* Quick Copy buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(15);
              onCopySvg(currentFormat);
            }}
            className="min-h-[44px] px-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-medium text-stone-700 flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
            <span>{copied ? 'Copied XML' : 'Copy SVG XML'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyEmbed}
            className="min-h-[44px] px-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-medium text-stone-700 flex items-center justify-center gap-1.5 transition-colors"
          >
            {embedCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileCode className="w-3.5 h-3.5 text-stone-500" />}
            <span>{embedCopied ? 'Copied HTML' : 'Copy Markdown'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            triggerHaptic(12);
            onOpenShareModal();
          }}
          className="min-h-[44px] px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors mt-1"
        >
          <Share2 className="w-4 h-4 text-stone-600" />
          <span>More Share & Embed Options</span>
        </button>
      </div>

      {/* 3. Generation History */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
            <HistoryIcon className="w-3.5 h-3.5 text-stone-500" />
            Generation History
          </span>
          {history.length > 0 && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                onClearHistory();
              }}
              className="text-[11px] text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-6 px-3 bg-stone-50 rounded-xl border border-stone-200/60 text-xs text-stone-400">
            No exported versions yet. Export a graphic to save snapshots here.
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
            {history.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  triggerHaptic(12);
                  onLoadHistory(item);
                }}
                className="p-3 bg-stone-50 hover:bg-stone-100/80 border border-stone-200 rounded-xl text-left transition-colors flex flex-col gap-1 min-h-[48px]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-stone-900 truncate">
                    {item.title || 'Repository Infographic'}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono shrink-0">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-1.5 py-0.2 bg-white border border-stone-200 rounded text-stone-600 capitalize">
                    {item.theme}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-white border border-stone-200 rounded text-stone-600 capitalize">
                    {item.format}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Advanced: Spec JSON View */}
      <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => {
            triggerHaptic(10);
            setShowSpec((s) => !s);
          }}
          className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-semibold text-stone-800 hover:bg-stone-50 transition-colors min-h-[44px]"
        >
          <div className="flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-stone-500" />
            <span>Advanced: Infographic Spec JSON</span>
          </div>
          {showSpec ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </button>

        {showSpec && (
          <div className="p-3 border-t border-stone-200 bg-stone-50 flex flex-col gap-2">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleCopySpec}
                className="px-2.5 py-1 text-[11px] bg-white border border-stone-200 rounded-md font-medium text-stone-700 hover:bg-stone-100 flex items-center gap-1"
              >
                {specCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-stone-500" />}
                <span>{specCopied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="p-2.5 bg-white border border-stone-200 rounded-lg text-[11px] font-mono text-stone-700 max-h-56 overflow-auto leading-relaxed">
              {JSON.stringify(spec, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
