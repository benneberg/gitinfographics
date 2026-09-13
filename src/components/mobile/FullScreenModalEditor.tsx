import React, { useRef, useState } from 'react';
import {
  FileText,
  Check,
  Wand2,
  Upload,
  Github,
  RefreshCw,
  Sparkles,
  Plus,
  Code2
} from 'lucide-react';
import { ParsedDoc, GitHubMeta } from '../../engine/types';
import { SAMPLE_READMES, SampleReadme } from '../../engine/samples';
import { triggerHaptic } from '../../ui/haptics';

interface FullScreenModalEditorProps {
  isOpen: boolean;
  onClose: () => void;
  markdown: string;
  onChange: (val: string) => void;
  parsedDoc: ParsedDoc;
  ghMeta: GitHubMeta | null;
  onSmartTruncate: () => void;
  onFetchRepo: (url: string) => Promise<void>;
  isFetching: boolean;
  onSelectSample: (sample: SampleReadme) => void;
}

export const FullScreenModalEditor: React.FC<FullScreenModalEditorProps> = ({
  isOpen,
  onClose,
  markdown,
  onChange,
  parsedDoc,
  ghMeta,
  onSmartTruncate,
  onFetchRepo,
  isFetching,
  onSelectSample,
}) => {
  const [repoInput, setRepoInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const lineCount = markdown.split('\n').length;
  const wordCount = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;

  const handleFetchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoInput.trim()) {
      triggerHaptic(15);
      onFetchRepo(repoInput.trim());
      setRepoInput('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onChange(content);
        triggerHaptic(15);
      }
    };
    reader.readAsText(file);
  };

  const insertSnippet = (snippet: string) => {
    triggerHaptic(10);
    onChange(`${markdown.trimEnd()}\n\n${snippet}\n`);
  };

  return (
    <div
      id="mobile-fullscreen-editor-modal"
      className="fixed inset-0 z-50 bg-[#FAFAF9] flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-200"
    >
      {/* Top App Bar with Done Button */}
      <header className="border-b border-stone-200 bg-white/95 backdrop-blur-md px-4 py-2.5 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-stone-900 truncate">
              Edit README.md
            </div>
            <div className="text-[11px] text-stone-500 font-mono">
              {lineCount} lines • {wordCount} words • {parsedDoc.sections.length} sections
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            triggerHaptic(10);
            onClose();
          }}
          className="min-h-[44px] px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 shrink-0"
        >
          <Check className="w-4 h-4" />
          <span>Done</span>
        </button>
      </header>

      {/* GitHub URL quick fetch banner */}
      <div className="bg-stone-50 border-b border-stone-200 px-3 py-2 shrink-0">
        <form onSubmit={handleFetchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Github className="w-4 h-4 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              placeholder="Paste owner/repo or GitHub URL..."
              className="w-full pl-8 pr-3 min-h-[40px] text-xs bg-white border border-stone-200 rounded-lg text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isFetching || !repoInput.trim()}
            className="min-h-[40px] px-3.5 bg-stone-900 text-white rounded-lg text-xs font-medium disabled:bg-stone-200 disabled:text-stone-400 flex items-center gap-1 shrink-0"
          >
            {isFetching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Fetch'}
          </button>
        </form>
      </div>

      {/* Quick Action Pills: Sample, Optimize, Upload */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-stone-200/80 overflow-x-auto shrink-0 scrollbar-none">
        {/* Sample selector */}
        <select
          onChange={(e) => {
            const s = SAMPLE_READMES.find((r) => r.id === e.target.value);
            if (s) {
              triggerHaptic(15);
              onSelectSample(s);
            }
          }}
          defaultValue=""
          className="min-h-[38px] px-2.5 text-xs bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 rounded-lg cursor-pointer focus:outline-none"
        >
          <option value="" disabled>
            Load Sample README...
          </option>
          {SAMPLE_READMES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Smart Truncate */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic(15);
            onSmartTruncate();
          }}
          className="min-h-[38px] px-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 rounded-lg text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors"
          title="Optimize markdown for infographic presentation"
        >
          <Wand2 className="w-3.5 h-3.5 text-stone-600" />
          <span>Smart Optimize</span>
        </button>

        {/* Upload File */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="min-h-[38px] px-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 rounded-lg text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors"
        >
          <Upload className="w-3.5 h-3.5 text-stone-600" />
          <span>Upload .md</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".md,.markdown,text/markdown,text/plain"
          className="hidden"
        />
      </div>

      {/* Editor Main Content Area */}
      <div className="flex-1 p-3 flex flex-col min-h-0 bg-[#FAFAF9]">
        <div className="flex-1 bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
          <textarea
            value={markdown}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Write or paste your GitHub README markdown here..."
            className="flex-1 w-full p-3 font-mono text-xs sm:text-sm text-stone-900 bg-transparent focus:outline-none resize-none leading-relaxed"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Quick Snippet Inserts Bar at Bottom */}
      <div className="border-t border-stone-200 bg-white px-3 py-2 flex items-center gap-1.5 overflow-x-auto shrink-0 pb-[max(env(safe-area-inset-bottom),10px)]">
        <span className="text-[10px] uppercase font-semibold text-stone-400 shrink-0">
          Insert:
        </span>
        <button
          type="button"
          onClick={() =>
            insertSnippet('## Problem & Solution\n\n### The Problem\nExplain the pain point.\n\n### The Solution\nExplain your innovation.')
          }
          className="min-h-[36px] px-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-md text-[11px] font-medium text-stone-700 shrink-0 flex items-center gap-1"
        >
          <Plus className="w-3 h-3 text-stone-400" />
          <span>Problem/Solution</span>
        </button>

        <button
          type="button"
          onClick={() =>
            insertSnippet('## Key Features\n\n- **Fast Rendering**: Deterministic zero-DOM engine\n- **Vector Precision**: Sharp retina SVG\n- **Autonomous**: Operates in CI/CD')
          }
          className="min-h-[36px] px-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-md text-[11px] font-medium text-stone-700 shrink-0 flex items-center gap-1"
        >
          <Plus className="w-3 h-3 text-stone-400" />
          <span>Features</span>
        </button>

        <button
          type="button"
          onClick={() =>
            insertSnippet('## Statistics\n\n- 100% Vector Output\n- 0 External Runtime Deps\n- 40ms Generation Time\n- 6 Color Themes')
          }
          className="min-h-[36px] px-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-md text-[11px] font-medium text-stone-700 shrink-0 flex items-center gap-1"
        >
          <Plus className="w-3 h-3 text-stone-400" />
          <span>Stats</span>
        </button>

        <button
          type="button"
          onClick={() =>
            insertSnippet('## Tech Stack\n\n- TypeScript\n- React\n- Vite\n- Tailwind CSS')
          }
          className="min-h-[36px] px-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-md text-[11px] font-medium text-stone-700 shrink-0 flex items-center gap-1"
        >
          <Plus className="w-3 h-3 text-stone-400" />
          <span>Tech Stack</span>
        </button>
      </div>
    </div>
  );
};
