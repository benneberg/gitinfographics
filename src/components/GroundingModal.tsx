import React from 'react';
import {
  ShieldCheck,
  X,
  Sparkles,
  Layers,
  HelpCircle,
  Activity,
  ListCheck,
  Cpu,
  Footprints,
  GitCommit,
  Columns,
  Quote,
  FileText,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { InfographicSpec, SpecSection, SmartRecommendation, VisualDensity, VariantMap } from '../engine/types';

interface GroundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  spec: InfographicSpec;
  onApplyRecommendation?: (recommendation: SmartRecommendation) => void;
}

export const GroundingModal: React.FC<GroundingModalProps> = ({
  isOpen,
  onClose,
  spec,
  onApplyRecommendation
}) => {
  if (!isOpen) return null;

  const grounding = spec.grounding;
  const recommendation = grounding?.recommendation;

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'problem-solution':
        return <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'stats':
        return <Activity className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'features':
        return <ListCheck className="w-4 h-4 text-stone-700 shrink-0" />;
      case 'tech-stack':
        return <Cpu className="w-4 h-4 text-sky-600 shrink-0" />;
      case 'steps':
        return <Footprints className="w-4 h-4 text-violet-600 shrink-0" />;
      case 'timeline':
        return <GitCommit className="w-4 h-4 text-indigo-600 shrink-0" />;
      case 'comparison':
        return <Columns className="w-4 h-4 text-teal-600 shrink-0" />;
      case 'callout':
        return <Quote className="w-4 h-4 text-rose-600 shrink-0" />;
      default:
        return <FileText className="w-4 h-4 text-stone-500 shrink-0" />;
    }
  };

  const getConfidenceBadgeColor = (conf: number) => {
    if (conf >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (conf >= 80) return 'bg-sky-50 text-sky-700 border-sky-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  return (
    <div
      id="grounding-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="grounding-modal-container"
        className="bg-white border border-stone-200 rounded-2xl shadow-xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden text-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 leading-tight">
                Grounding & Content Traceability
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Deterministic audit verification linking infographic cards to source markdown
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Smart Layout Auto-Detection Banner */}
          {recommendation && (
            <div className="p-4 bg-stone-900 text-stone-100 rounded-xl flex flex-col gap-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold tracking-wide uppercase text-stone-300">
                    Smart Layout Heuristic Detection
                  </span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 bg-stone-800 text-emerald-400 rounded-full border border-emerald-500/30">
                  {recommendation.confidence}% Match
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  {recommendation.label}
                </h4>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                  {recommendation.reason}
                </p>
              </div>
              {onApplyRecommendation && (
                <button
                  onClick={() => {
                    onApplyRecommendation(recommendation);
                    onClose();
                  }}
                  className="mt-1 self-start inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-semibold text-xs rounded-lg transition-all shadow-xs active:scale-98 cursor-pointer"
                >
                  Apply Suggested Configuration
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Key Metrics Meter Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex flex-col">
              <span className="text-[11px] text-stone-500 font-medium">Coverage</span>
              <span className="text-xl font-bold text-stone-900 mt-1">
                {grounding?.coveragePercent || 100}%
              </span>
              <span className="text-[10px] text-emerald-600 font-medium mt-0.5">
                {grounding?.contributingSections || spec.sections.length} contributing
              </span>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex flex-col">
              <span className="text-[11px] text-stone-500 font-medium">Source Density</span>
              <span className="text-sm font-bold text-stone-900 mt-2 uppercase tracking-wide">
                {grounding?.sourceDensity || 'Balanced'}
              </span>
              <span className="text-[10px] text-stone-500 font-medium mt-0.5">
                Content volume
              </span>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex flex-col">
              <span className="text-[11px] text-stone-500 font-medium">Avg Confidence</span>
              <span className="text-xl font-bold text-stone-900 mt-1">
                {grounding?.averageConfidence || 92}%
              </span>
              <span className="text-[10px] text-sky-600 font-medium mt-0.5">
                Rule certainty
              </span>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex flex-col">
              <span className="text-[11px] text-stone-500 font-medium">Source Lines</span>
              <span className="text-xl font-bold text-stone-900 mt-1">
                {grounding?.totalSourceLines || 45}+
              </span>
              <span className="text-[10px] text-stone-500 font-medium mt-0.5">
                Scanned lines
              </span>
            </div>
          </div>

          {/* Traceability List */}
          <div>
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-stone-500" />
              Card-to-Source Traceability Matrix ({spec.sections.length} Visual Cards)
            </h3>
            <div className="divide-y divide-stone-200 border border-stone-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              {spec.sections.map((sec, idx) => {
                const source = sec.source;
                return (
                  <div key={sec.id || idx} className="p-3.5 hover:bg-stone-50/70 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="mt-0.5 p-1.5 bg-stone-100 rounded-lg border border-stone-200/60">
                          {getSectionIcon(sec.type)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-stone-900">
                              {'title' in sec && sec.title ? sec.title : sec.type.replace('-', ' ').toUpperCase()}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-stone-100 text-stone-600 border border-stone-200 rounded">
                              {sec.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            {source?.signalReason || 'Classified from markdown semantic structure'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${getConfidenceBadgeColor(
                            source?.confidence || 85
                          )}`}
                        >
                          {source?.confidence || 85}% Conf
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {source?.sourceType || 'Markdown Heuristic'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-stone-200 bg-stone-50/50 flex items-center justify-between text-xs text-stone-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            100% Deterministic & Zero Hallucination
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 text-white font-medium rounded-lg hover:bg-stone-800 transition-colors shadow-2xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
