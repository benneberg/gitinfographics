import React, { useState } from 'react';
import { X, Share2, Copy, Check, Code, Link2, ExternalLink } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  svgContent: string;
  projectData?: any;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  svgContent,
  projectData
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generate Base64 Data URI
  const base64Svg = typeof window !== 'undefined' && btoa ? btoa(unescape(encodeURIComponent(svgContent))) : '';
  const dataUri = `data:image/svg+xml;base64,${base64Svg}`;

  // Generate Embed Snippets
  const iframeEmbed = `<iframe src="${dataUri}" width="880" height="1200" style="border:none; border-radius:16px; width:100%; max-width:880px;" title="GitInfoGraphics Infographic"></iframe>`;
  const imgEmbed = `<img src="${dataUri}" alt="GitInfoGraphics Infographic" style="width:100%; max-width:880px; height:auto; border-radius:16px;" />`;
  const markdownEmbed = `![GitInfoGraphics Infographic](${dataUri})`;

  // Generate state URL (stored in hash)
  const stateString = projectData ? encodeURIComponent(JSON.stringify(projectData)) : '';
  const shareableUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}#project=${stateString}`
    : '';

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white border border-stone-200/90 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200/80 bg-stone-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-stone-50 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 id="share-modal-title" className="text-sm font-semibold text-stone-900">
                Share &amp; Embed Infographic
              </h2>
              <p className="text-xs text-stone-500">HTML embed code, direct image tags, and shareable links</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            aria-label="Close share modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Shareable Project URL */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-stone-600" />
                Shareable State URL
              </label>
              <button
                type="button"
                onClick={() => copyToClipboard(shareableUrl, 'url')}
                className="text-[11px] font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1 bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded transition-colors"
              >
                {copiedType === 'url' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === 'url' ? 'Copied' : 'Copy URL'}</span>
              </button>
            </div>
            <div className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono text-stone-700 truncate select-all">
              {shareableUrl}
            </div>
          </div>

          {/* HTML Image Tag Embed */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-stone-600" />
                HTML Image Tag (&lt;img&gt;)
              </label>
              <button
                type="button"
                onClick={() => copyToClipboard(imgEmbed, 'img')}
                className="text-[11px] font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1 bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded transition-colors"
              >
                {copiedType === 'img' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === 'img' ? 'Copied' : 'Copy HTML'}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={2}
              value={imgEmbed}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono text-stone-700 focus:outline-none"
            />
          </div>

          {/* Iframe Embed */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-stone-600" />
                Responsive IFrame Embed
              </label>
              <button
                type="button"
                onClick={() => copyToClipboard(iframeEmbed, 'iframe')}
                className="text-[11px] font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1 bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded transition-colors"
              >
                {copiedType === 'iframe' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === 'iframe' ? 'Copied' : 'Copy Iframe'}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={2}
              value={iframeEmbed}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono text-stone-700 focus:outline-none"
            />
          </div>

          {/* Markdown Badge / Embed */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-stone-600" />
                Markdown Code (For GitHub README)
              </label>
              <button
                type="button"
                onClick={() => copyToClipboard(markdownEmbed, 'md')}
                className="text-[11px] font-medium text-stone-600 hover:text-stone-900 flex items-center gap-1 bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded transition-colors"
              >
                {copiedType === 'md' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === 'md' ? 'Copied' : 'Copy Markdown'}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={2}
              value={markdownEmbed}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono text-stone-700 focus:outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-200/80 bg-stone-50/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 bg-white border border-stone-200 rounded-lg shadow-2xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
