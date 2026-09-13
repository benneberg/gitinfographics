import React, { useState } from 'react';
import {
  Download,
  Palette,
  Copy,
  Check,
  RefreshCw,
  Plus,
  X,
  Sparkles,
  Layers
} from 'lucide-react';
import { triggerHaptic } from '../../ui/haptics';

interface MobileFabProps {
  onDownloadPng: () => void;
  onDownloadSvg: () => void;
  onCycleTheme: () => void;
  onCopySvg: () => void;
  onRefresh: () => void;
  copied: boolean;
}

export const MobileFab: React.FC<MobileFabProps> = ({
  onDownloadPng,
  onDownloadSvg,
  onCycleTheme,
  onCopySvg,
  onRefresh,
  copied,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => {
    triggerHaptic(12);
    setIsOpen((o) => !o);
  };

  const handleAction = (action: () => void) => {
    triggerHaptic(15);
    action();
    setIsOpen(false);
  };

  return (
    <div className="lg:hidden fixed bottom-[76px] right-4 z-30 flex flex-col items-end pointer-events-none">
      {/* Backdrop when open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-stone-900/20 backdrop-blur-2xs z-20 pointer-events-auto"
        />
      )}

      {/* Speed Dial Menu Items */}
      {isOpen && (
        <div className="flex flex-col items-end gap-2.5 mb-3 z-30 pointer-events-auto animate-in fade-in slide-in-from-bottom-3 duration-150">
          {/* Action 1: Export Retina PNG */}
          <button
            type="button"
            onClick={() => handleAction(onDownloadPng)}
            className="flex items-center gap-2.5 bg-white border border-stone-200/90 shadow-lg hover:bg-stone-50 px-3.5 py-2 rounded-full text-stone-800 text-xs font-semibold active:scale-95 transition-all min-h-[44px]"
          >
            <span>Export Retina PNG</span>
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Download className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Action 2: Export SVG */}
          <button
            type="button"
            onClick={() => handleAction(onDownloadSvg)}
            className="flex items-center gap-2.5 bg-white border border-stone-200/90 shadow-lg hover:bg-stone-50 px-3.5 py-2 rounded-full text-stone-800 text-xs font-semibold active:scale-95 transition-all min-h-[44px]"
          >
            <span>Export Vector SVG</span>
            <div className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center shrink-0">
              <Download className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Action 3: Cycle Theme */}
          <button
            type="button"
            onClick={() => handleAction(onCycleTheme)}
            className="flex items-center gap-2.5 bg-white border border-stone-200/90 shadow-lg hover:bg-stone-50 px-3.5 py-2 rounded-full text-stone-800 text-xs font-semibold active:scale-95 transition-all min-h-[44px]"
          >
            <span>Next Theme</span>
            <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Palette className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Action 4: Copy SVG */}
          <button
            type="button"
            onClick={() => handleAction(onCopySvg)}
            className="flex items-center gap-2.5 bg-white border border-stone-200/90 shadow-lg hover:bg-stone-50 px-3.5 py-2 rounded-full text-stone-800 text-xs font-semibold active:scale-95 transition-all min-h-[44px]"
          >
            <span>{copied ? 'Copied SVG!' : 'Copy SVG'}</span>
            <div className="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </div>
          </button>

          {/* Action 5: Re-render / Refresh */}
          <button
            type="button"
            onClick={() => handleAction(onRefresh)}
            className="flex items-center gap-2.5 bg-white border border-stone-200/90 shadow-lg hover:bg-stone-50 px-3.5 py-2 rounded-full text-stone-800 text-xs font-semibold active:scale-95 transition-all min-h-[44px]"
          >
            <span>Refresh Canvas</span>
            <div className="w-7 h-7 rounded-full bg-stone-700 text-white flex items-center justify-center shrink-0">
              <RefreshCw className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        id="mobile-fab-button"
        onClick={toggle}
        aria-label={isOpen ? 'Close quick menu' : 'Open quick menu'}
        className={`w-13 h-13 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 pointer-events-auto z-30 min-h-[48px] min-w-[48px] ${
          isOpen
            ? 'bg-stone-800 text-white rotate-45'
            : 'bg-stone-900 text-white hover:bg-stone-800'
        }`}
      >
        {isOpen ? <Plus className="w-6 h-6" /> : <Sparkles className="w-5 h-5 text-amber-300" />}
      </button>
    </div>
  );
};
