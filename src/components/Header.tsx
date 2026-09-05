import React, { useState } from 'react';
import {
  Github,
  Sparkles,
  Download,
  Copy,
  Layers,
  FileCode2,
  RefreshCw,
  Search,
  BookOpen,
  HelpCircle,
  Palette,
  Terminal,
  Compass
} from 'lucide-react';
import { THEMES } from '../engine/themes';
import { SAMPLE_READMES, SampleReadme } from '../engine/samples';

interface HeaderProps {
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
  onSelectSample: (sample: SampleReadme) => void;
  onFetchRepo: (repoUrl: string) => Promise<void>;
  isFetching: boolean;
  onCopySvg: () => void;
  onDownloadSvg: () => void;
  onDownloadPng: () => void;
  onOpenActionModal: () => void;
  onOpenArchModal: () => void;
  onOpenInfoModal: (tab?: 'overview' | 'manual' | 'faq') => void;
  onOpenOnboarding: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTheme,
  onThemeChange,
  onSelectSample,
  onFetchRepo,
  isFetching,
  onCopySvg,
  onDownloadSvg,
  onDownloadPng,
  onOpenActionModal,
  onOpenArchModal,
  onOpenInfoModal,
  onOpenOnboarding
}) => {
  const [repoInput, setRepoInput] = useState('');

  const handleFetchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoInput.trim()) {
      onFetchRepo(repoInput.trim());
    }
  };

  return (
    <header className="border-b border-stone-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4">
        {/* Brand & Preset Row */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-stone-50 flex items-center justify-center shrink-0 shadow-2xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-base tracking-tight text-stone-900">
                  GitInfoGraphics
                </span>
                <span className="text-[10px] font-medium text-stone-500 bg-stone-100 border border-stone-200/80 px-1.5 py-0.2 rounded">
                  Studio
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                README vector infographics & CI/CD
              </p>
            </div>
          </div>

          {/* Quick preset selector */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="sample-select" className="text-xs text-stone-500 hidden lg:inline">
              Sample:
            </label>
            <select
              id="sample-select"
              onChange={(e) => {
                const s = SAMPLE_READMES.find((r) => r.id === e.target.value);
                if (s) onSelectSample(s);
              }}
              defaultValue="infographic-studio"
              className="bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs text-stone-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-stone-400 cursor-pointer min-h-[38px] sm:min-h-0"
              aria-label="Select sample README preset"
            >
              {SAMPLE_READMES.map((s) => (
                <option key={s.id} value={s.id} className="bg-white text-stone-800">
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* GitHub Repo Search/Fetch Form */}
        <form
          onSubmit={handleFetchSubmit}
          className="flex items-center gap-1 w-full md:w-auto max-w-md bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 focus-within:border-stone-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-stone-200 transition-all"
        >
          <Github className="w-3.5 h-3.5 text-stone-400 shrink-0 ml-1" />
          <input
            type="text"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            placeholder="owner/repo or GitHub URL..."
            className="w-full bg-transparent text-xs text-stone-800 placeholder-stone-400 focus:outline-none px-2 py-1 font-mono min-h-[36px] sm:min-h-0"
          />
          <button
            type="submit"
            disabled={isFetching || !repoInput.trim()}
            className="min-h-[34px] sm:min-h-0 px-3 py-1 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-400 text-white text-xs font-medium rounded-md shrink-0 transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            {isFetching ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span className="hidden sm:inline">Fetching</span>
              </>
            ) : (
              <span>Fetch</span>
            )}
          </button>
        </form>

        {/* Right Action Controls: Themes & Modals */}
        <div className="flex items-center gap-1.5 w-full md:w-auto justify-between md:justify-end overflow-x-auto pb-0.5 md:pb-0">
          {/* Theme Selector */}
          <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1">
            <Palette className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <select
              value={currentTheme}
              onChange={(e) => onThemeChange(e.target.value)}
              className="bg-transparent text-xs text-stone-800 focus:outline-none cursor-pointer max-w-[140px] sm:max-w-none"
              aria-label="Select graphic theme"
            >
              {Object.values(THEMES).map((th) => (
                <option key={th.id} value={th.id} className="bg-white text-stone-800">
                  {th.name}
                </option>
              ))}
            </select>
          </div>

          {/* CI/CD Workflow */}
          <button
            onClick={onOpenActionModal}
            className="flex items-center gap-1 min-h-[36px] px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-700 shadow-2xs transition-colors shrink-0"
            title="GitHub Actions CI/CD automation workflow"
          >
            <Terminal className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">CI/CD</span>
          </button>

          {/* Manual & FAQ */}
          <button
            onClick={() => onOpenInfoModal('overview')}
            className="flex items-center gap-1 min-h-[36px] px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-700 shadow-2xs transition-colors shrink-0"
            title="Manual, Documentation & FAQ"
          >
            <BookOpen className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">Docs</span>
          </button>

          {/* Guided Tour */}
          <button
            onClick={onOpenOnboarding}
            className="flex items-center gap-1 min-h-[36px] px-2.5 py-1 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg text-xs font-medium text-stone-700 shadow-2xs transition-colors shrink-0"
            title="Open guided tour"
          >
            <Compass className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline">Tour</span>
          </button>
        </div>
      </div>
    </header>
  );
};
