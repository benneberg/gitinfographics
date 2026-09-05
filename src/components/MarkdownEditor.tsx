import React, { useRef } from 'react';
import { FileText, Upload, Wand2, Star, GitFork, AlertCircle, Award, Code2, Check } from 'lucide-react';
import { ParsedDoc, GitHubMeta } from '../engine/types';

interface MarkdownEditorProps {
  markdown: string;
  onChange: (val: string) => void;
  parsedDoc: ParsedDoc;
  ghMeta: GitHubMeta | null;
  onSmartTruncate: () => void;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  markdown,
  onChange,
  parsedDoc,
  ghMeta,
  onSmartTruncate
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) onChange(content);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.md') || file.name.endsWith('.markdown') || file.type.includes('text'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) onChange(content);
      };
      reader.readAsText(file);
    }
  };

  const lineCount = markdown.split('\n').length;
  const wordCount = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;

  return (
    <div className="flex flex-col h-full bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
      {/* Editor Header Toolbar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-stone-200 bg-stone-50/70 text-xs font-sans">
        <div className="flex items-center gap-2 text-stone-700 font-medium">
          <FileText className="w-3.5 h-3.5 text-stone-500" />
          <span>README.md</span>
          <span className="text-[11px] text-stone-400 font-mono">({lineCount} lines)</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onSmartTruncate}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-md shadow-2xs transition-colors font-medium"
            title="Intelligently optimize long READMEs by prioritizing Problem, Solution, Features & Tech Stack"
          >
            <Wand2 className="w-3 h-3 text-stone-500" />
            <span>Optimize</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-md shadow-2xs transition-colors font-medium"
          >
            <Upload className="w-3 h-3 text-stone-500" />
            <span>Upload</span>
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

      {/* GitHub Repository Metadata Card (if connected) */}
      {ghMeta && (
        <div className="px-3.5 py-2 bg-stone-50 border-b border-stone-200 text-xs font-sans flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-900">
              {ghMeta.owner}/{ghMeta.repo}
            </span>
            {ghMeta.language && (
              <span className="px-1.5 py-0.5 bg-white text-stone-700 text-[10px] font-mono border border-stone-200 rounded">
                {ghMeta.language}
              </span>
            )}
            {ghMeta.license && (
              <span className="px-1.5 py-0.5 bg-white border border-stone-200 text-stone-500 text-[10px] rounded">
                {ghMeta.license}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-stone-500 text-[11px] font-sans">
            <span className="flex items-center gap-1 text-stone-800 font-medium">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              {ghMeta.stars.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="w-3 h-3 text-stone-400" />
              {ghMeta.forks.toLocaleString()}
            </span>
            {ghMeta.openIssues != null && (
              <span className="flex items-center gap-1 text-stone-500">
                <AlertCircle className="w-3 h-3 text-stone-400" />
                {ghMeta.openIssues} issues
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Textarea */}
      <div
        className="flex-1 relative bg-white"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <textarea
          value={markdown}
          onChange={(e) => onChange(e.target.value)}
          placeholder="# Project Title&#10;&#10;A concise description of your project...&#10;&#10;## Features&#10;- Feature 1&#10;- Feature 2"
          className="w-full h-full p-4 font-mono text-xs text-stone-800 bg-transparent resize-none focus:outline-none leading-relaxed placeholder-stone-400 selection:bg-stone-200"
          spellCheck={false}
        />
      </div>

      {/* Bottom Status Bar */}
      <div className="px-3.5 py-2 border-t border-stone-200 bg-stone-50/70 text-[11px] text-stone-500 flex items-center justify-between font-sans">
        <div className="flex items-center gap-3">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{parsedDoc.sections.length} detected sections</span>
        </div>

        <div className="flex items-center gap-2">
          {parsedDoc.badges.length > 0 && (
            <span className="flex items-center gap-1 text-stone-700 font-medium">
              <Award className="w-3 h-3 text-stone-500" />
              {parsedDoc.badges.length} badges
            </span>
          )}
          {parsedDoc.sections.some((s) => s.codeBlocks?.length > 0) && (
            <span className="flex items-center gap-1 text-stone-500">
              <Code2 className="w-3 h-3 text-stone-400" />
              Code blocks
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
