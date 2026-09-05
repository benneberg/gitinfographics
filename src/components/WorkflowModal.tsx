import React, { useState } from 'react';
import { X, Copy, Check, Terminal, FileCode, ArrowRight, ShieldCheck } from 'lucide-react';
import { GITHUB_ACTION_YAML, STANDALONE_NODE_SCRIPT } from '../engine/workflowTemplate';

interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkflowModal: React.FC<WorkflowModalProps> = ({ isOpen, onClose }) => {
  const [copiedYaml, setCopiedYaml] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeTab, setActiveTab] = useState<'yaml' | 'script'>('yaml');

  if (!isOpen) return null;

  const copyYaml = () => {
    navigator.clipboard.writeText(GITHUB_ACTION_YAML);
    setCopiedYaml(true);
    setTimeout(() => setCopiedYaml(false), 2000);
  };

  const copyScript = () => {
    navigator.clipboard.writeText(STANDALONE_NODE_SCRIPT);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="bg-white border border-stone-200 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-100 border border-stone-200 text-stone-900 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900">GitHub Actions CI/CD Integration</h2>
              <p className="text-xs text-stone-500">
                Automate infographic generation on every push to README.md
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps overview */}
        <div className="px-6 py-3 bg-stone-50 border-b border-stone-200 text-xs flex flex-wrap items-center justify-between gap-2 text-stone-600">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-stone-900 text-white font-mono font-bold flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Create <code className="font-mono bg-white px-1.5 py-0.5 border border-stone-200 rounded">.github/workflows/infographic.yml</code></span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-stone-900 text-white font-mono font-bold flex items-center justify-center text-[10px]">
              2
            </span>
            <span>Save <code className="font-mono bg-white px-1.5 py-0.5 border border-stone-200 rounded">scripts/generate-infographic.mjs</code></span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700 font-medium">Auto-commits on push</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between px-6 pt-3 bg-white border-b border-stone-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('yaml')}
              className={`pb-2.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'yaml'
                  ? 'border-stone-900 text-stone-900 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              1. Workflow YAML
            </button>
            <button
              onClick={() => setActiveTab('script')}
              className={`pb-2.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'script'
                  ? 'border-stone-900 text-stone-900 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              2. Generator Script (Node.js)
            </button>
          </div>

          <button
            onClick={activeTab === 'yaml' ? copyYaml : copyScript}
            className="flex items-center gap-1.5 px-3 py-1.5 mb-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg shadow-2xs transition-colors"
          >
            {(activeTab === 'yaml' ? copiedYaml : copiedScript) ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy {activeTab === 'yaml' ? 'YAML' : 'Script'}</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-5 bg-[#FAFAF9] font-mono text-xs text-stone-800">
          <pre className="whitespace-pre overflow-x-auto leading-relaxed selection:bg-stone-200">
            {activeTab === 'yaml' ? GITHUB_ACTION_YAML : STANDALONE_NODE_SCRIPT}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 bg-white flex items-center justify-between text-xs text-stone-500">
          <span className="text-[11px] text-stone-500">
            Deterministic vanilla Node.js • 0 external dependencies
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
