import React, { useRef, useState } from 'react';
import {
  Sparkles,
  Scissors,
  Upload,
  ChevronDown,
  Maximize2,
  Trash2,
  ListPlus,
  BarChart3,
  Cpu,
  HelpCircle,
  Clock,
  Columns,
  Quote
} from 'lucide-react';
import { SAMPLE_READMES, SampleReadme } from '../../engine/samples';
import { triggerHaptic } from '../../ui/haptics';

interface MobileInlineEditorProps {
  markdown: string;
  onChange: (val: string) => void;
  onSelectSample: (sample: SampleReadme) => void;
  onSmartTruncate: () => void;
  onOpenFullScreen?: () => void;
}

export const MobileInlineEditor: React.FC<MobileInlineEditorProps> = ({
  markdown,
  onChange,
  onSelectSample,
  onSmartTruncate,
  onOpenFullScreen,
}) => {
  const [showPresets, setShowPresets] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerHaptic(10);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        if (text) onChange(text);
      };
      reader.readAsText(file);
    }
  };

  const insertSnippet = (snippet: string) => {
    triggerHaptic(10);
    const updated = markdown ? `${markdown.trim()}\n\n${snippet}\n` : snippet;
    onChange(updated);
  };

  const wordCount = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  const lineCount = markdown ? markdown.split('\n').length : 0;

  return (
    <div className="flex-1 flex flex-col p-3.5 space-y-3 bg-stone-50 overflow-y-auto">
      {/* Editor Control Card */}
      <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-900">Markdown Content</span>
            <span className="text-[10px] font-mono text-stone-400">
              {wordCount} words • {lineCount} lines
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenFullScreen && (
              <button
                type="button"
                onClick={onOpenFullScreen}
                className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                title="Full-screen focus mode"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
            {markdown && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  onChange('');
                }}
                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                title="Clear content"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons: Presets, Optimize, Upload */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className="flex items-center gap-1 min-h-[34px] px-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-medium shrink-0 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Presets</span>
              <ChevronDown className="w-3 h-3 text-stone-500" />
            </button>

            {showPresets && (
              <div className="absolute left-0 top-full mt-1.5 w-60 bg-white border border-stone-200 rounded-2xl shadow-xl p-1 z-30 animate-in fade-in">
                <div className="px-2.5 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  Preset Templates
                </div>
                {SAMPLE_READMES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      onSelectSample(s);
                      setShowPresets(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-stone-700 hover:bg-stone-50 rounded-xl transition-colors flex items-center justify-between"
                  >
                    <span className="font-medium truncate">{s.name}</span>
                    <span className="text-[10px] text-stone-400 font-mono truncate max-w-[80px]">{s.id}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onSmartTruncate}
            className="flex items-center gap-1 min-h-[34px] px-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-medium shrink-0 transition-colors"
            title="Auto-optimize content length for infographics"
          >
            <Scissors className="w-3 h-3 text-stone-600" />
            <span>Optimize</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 min-h-[34px] px-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-medium shrink-0 transition-colors"
          >
            <Upload className="w-3 h-3 text-stone-600" />
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
      </div>

      {/* Main Textarea Area */}
      <div className="flex-1 bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs flex flex-col min-h-[280px]">
        <textarea
          value={markdown}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write or paste your GitHub README markdown here...&#10;&#10;# My Repository&#10;A high-performance library for...&#10;&#10;## Features&#10;- Fast and deterministic&#10;- Zero runtime dependencies"
          aria-label="README Markdown text"
          className="flex-1 w-full p-3.5 font-mono text-base sm:text-xs text-stone-900 bg-transparent focus:outline-none resize-none leading-relaxed"
          spellCheck={false}
        />
      </div>

      {/* Quick Insert Snippet Pills */}
      <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
        <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
          Insert Section Snippet:
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => insertSnippet('## Features\n- ⚡ Lightning Fast: Sub-millisecond execution\n- 🔒 Type Safe: 100% TypeScript with strict null checks\n- 📦 Zero Dependencies: Pure native engine')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-medium text-stone-700 transition-colors"
          >
            <ListPlus className="w-3 h-3 text-stone-500" />
            <span>Features</span>
          </button>

          <button
            type="button"
            onClick={() => insertSnippet('## Benchmarks\n- 99.99% Uptime SLA\n- < 12ms P99 Latency\n- 10M+ Operations/sec')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-medium text-stone-700 transition-colors"
          >
            <BarChart3 className="w-3 h-3 text-stone-500" />
            <span>Stats</span>
          </button>

          <button
            type="button"
            onClick={() => insertSnippet('## Problem & Solution\n**Problem**: Traditional tools require heavy server backends.\n**Solution**: 100% deterministic client-side rendering with SVG vector graphics.')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-medium text-stone-700 transition-colors"
          >
            <HelpCircle className="w-3 h-3 text-stone-500" />
            <span>Problem/Solution</span>
          </button>

          <button
            type="button"
            onClick={() => insertSnippet('## Tech Stack\nTypeScript, React, Vite, Tailwind CSS, SVG Graphics')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-medium text-stone-700 transition-colors"
          >
            <Cpu className="w-3 h-3 text-stone-500" />
            <span>Tech Stack</span>
          </button>

          <button
            type="button"
            onClick={() => insertSnippet('## Roadmap\n- v1.0.0 Initial launch with core features\n- v1.5.0 Mobile optimization and export sheets\n- v2.0.0 Clean view menus and dynamic layout')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-medium text-stone-700 transition-colors"
          >
            <Clock className="w-3 h-3 text-stone-500" />
            <span>Timeline</span>
          </button>

          <button
            type="button"
            onClick={() => insertSnippet('## Comparison\n| Feature | GitInfoGraphics | Others |\n|---|---|---|\n| Client-side | Yes | No |\n| CI/CD Ready | Yes | Partial |')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-medium text-stone-700 transition-colors"
          >
            <Columns className="w-3 h-3 text-stone-500" />
            <span>Comparison</span>
          </button>

          <button
            type="button"
            onClick={() => insertSnippet('> "The most intuitive way to showcase our open source projects."\n> — Tech Lead')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-medium text-stone-700 transition-colors"
          >
            <Quote className="w-3 h-3 text-stone-500" />
            <span>Quote</span>
          </button>
        </div>
      </div>
    </div>
  );
};
