import React, { useState } from 'react';
import { Github, RefreshCw, Sparkles, ChevronDown, Check, ArrowRight } from 'lucide-react';
import { SAMPLE_READMES, SampleReadme } from '../../engine/samples';
import { triggerHaptic } from '../../ui/haptics';

interface MobileTopRepoBarProps {
  onFetchRepo: (repoUrl: string) => Promise<void>;
  isFetching: boolean;
  onSelectSample: (sample: SampleReadme) => void;
  currentTitle?: string;
}

export const MobileTopRepoBar: React.FC<MobileTopRepoBarProps> = ({
  onFetchRepo,
  isFetching,
  onSelectSample,
  currentTitle,
}) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [showPresets, setShowPresets] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim() || isFetching) return;
    triggerHaptic(12);
    onFetchRepo(repoUrl.trim());
  };

  const handleSelectPreset = (sample: SampleReadme) => {
    triggerHaptic(10);
    onSelectSample(sample);
    setShowPresets(false);
  };

  return (
    <div
      id="mobile-persistent-repo-bar"
      className="lg:hidden sticky top-[53px] z-20 bg-white/92 backdrop-blur-xl border-b border-stone-200/90 px-3 py-2 shadow-2xs transition-all"
    >
      <form onSubmit={handleSubmit} className="flex items-center gap-1.5 max-w-lg mx-auto">
        <div className="relative flex-1 flex items-center min-w-0">
          <Github className="w-4 h-4 text-stone-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none shrink-0" />
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="Paste repo URL (e.g. facebook/react)..."
            aria-label="GitHub Repository URL or owner/repo"
            className="w-full pl-8 pr-2.5 py-1.5 min-h-[38px] text-base sm:text-xs bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200/90 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1.5 focus:ring-stone-900/20 font-mono transition-colors"
          />
        </div>

        {/* Fetch/Import Button */}
        <button
          type="submit"
          disabled={isFetching || !repoUrl.trim()}
          className="min-h-[38px] px-3 bg-stone-900 text-white rounded-xl text-xs font-semibold disabled:bg-stone-200 disabled:text-stone-400 flex items-center gap-1 shrink-0 transition-all active:scale-95 shadow-2xs"
          title="Fetch and generate infographic from GitHub repository"
        >
          {isFetching ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span className="hidden xs:inline">Importing</span>
            </>
          ) : (
            <>
              <span>Import</span>
              <ArrowRight className="w-3 h-3 hidden xs:inline" />
            </>
          )}
        </button>

        {/* Quick Presets Dropdown */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(8);
              setShowPresets((prev) => !prev);
            }}
            className="min-h-[38px] px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors active:scale-95"
            title="Load sample README preset"
            aria-expanded={showPresets}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Presets</span>
            <ChevronDown className={`w-3 h-3 text-stone-500 transition-transform ${showPresets ? 'rotate-180' : ''}`} />
          </button>

          {showPresets && (
            <div
              className="absolute right-0 top-full mt-1.5 w-64 bg-white/95 backdrop-blur-xl border border-stone-200/90 rounded-2xl shadow-xl p-1.5 z-50 text-xs font-sans animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-2.5 py-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100">
                Sample Repository READMEs
              </div>
              <div className="max-h-60 overflow-y-auto py-1 space-y-0.5">
                {SAMPLE_READMES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectPreset(s)}
                    className="w-full text-left px-2.5 py-2 hover:bg-stone-50 rounded-xl transition-colors flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-stone-900 truncate">{s.name}</p>
                      <p className="text-[10px] text-stone-500 truncate">{s.description}</p>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 shrink-0 group-hover:bg-stone-200 truncate max-w-[80px]">
                      {s.id}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
