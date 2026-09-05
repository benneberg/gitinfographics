import React from 'react';
import {
  Sliders,
  CheckSquare,
  Square,
  HelpCircle,
  Activity,
  ListCheck,
  Cpu,
  Footprints,
  FileText
} from 'lucide-react';
import { InfographicSpec, VariantMap } from '../engine/types';

interface SectionControlsProps {
  spec: InfographicSpec;
  variants: VariantMap;
  onVariantChange: (sectionKey: string, val: number) => void;
  disabledSections: Record<string, boolean>;
  onToggleSection: (sectionId: string) => void;
  onTitleChange: (title: string) => void;
  onSubtitleChange: (subtitle: string) => void;
}

export const SectionControls: React.FC<SectionControlsProps> = ({
  spec,
  variants,
  onVariantChange,
  disabledSections,
  onToggleSection,
  onTitleChange,
  onSubtitleChange
}) => {
  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'problem-solution':
        return <HelpCircle className="w-4 h-4 text-amber-600" />;
      case 'stats':
        return <Activity className="w-4 h-4 text-emerald-600" />;
      case 'features':
        return <ListCheck className="w-4 h-4 text-stone-700" />;
      case 'tech-stack':
        return <Cpu className="w-4 h-4 text-sky-600" />;
      case 'steps':
        return <Footprints className="w-4 h-4 text-violet-600" />;
      default:
        return <FileText className="w-4 h-4 text-stone-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white border border-stone-200 rounded-xl shadow-xs text-xs text-stone-700 font-sans">
      {/* Title & Subtitle overrides */}
      <div className="flex flex-col gap-3 pb-4 border-b border-stone-200">
        <span className="font-semibold text-sm text-stone-900 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-stone-600" />
          Infographic Titles & Header
        </span>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-stone-500">Header Title</label>
          <input
            type="text"
            value={spec.title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white text-xs font-semibold text-stone-900 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-stone-500">Tagline / Subtitle</label>
          <input
            type="text"
            value={spec.subtitle}
            onChange={(e) => onSubtitleChange(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white text-xs text-stone-700 transition-colors"
          />
        </div>
      </div>

      {/* Detected Sections & Toggles */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-stone-900 text-xs">
            Active Sections ({spec.sections.filter((s) => !disabledSections[s.id]).length}/{spec.sections.length})
          </span>
          <span className="text-[11px] text-stone-400 font-medium">Click to toggle</span>
        </div>

        <div className="flex flex-col gap-2">
          {spec.sections.map((sec, idx) => {
            const isOff = !!disabledSections[sec.id];
            return (
              <div
                key={sec.id + idx}
                className={`flex flex-col gap-2 p-3 rounded-lg border transition-all ${
                  isOff
                    ? 'bg-stone-50/50 border-stone-200/60 opacity-60'
                    : 'bg-stone-50/70 border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => onToggleSection(sec.id)}
                    className="flex items-center gap-2 text-left hover:text-stone-950 transition-colors"
                  >
                    {isOff ? (
                      <Square className="w-4 h-4 text-stone-400 shrink-0" />
                    ) : (
                      <CheckSquare className="w-4 h-4 text-stone-900 shrink-0" />
                    )}
                    <span className="flex items-center gap-1.5 font-medium text-xs text-stone-900">
                      {getSectionIcon(sec.type)}
                      {'title' in sec ? sec.title : sec.type.toUpperCase()}
                    </span>
                  </button>

                  <span className="text-[10px] font-mono px-2 py-0.5 bg-white text-stone-500 border border-stone-200 rounded">
                    {sec.type}
                  </span>
                </div>

                {/* Section Specific Variant Controls */}
                {!isOff && (
                  <div className="flex items-center justify-between text-[11px] text-stone-500 pl-6 pt-2 border-t border-stone-200/70">
                    {sec.type === 'features' && (
                      <div className="flex items-center gap-2 w-full justify-between">
                        <span className="text-[11px] text-stone-500">Columns:</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onVariantChange('features', 0)}
                            className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${
                              (variants['features'] || 0) % 3 === 0
                                ? 'bg-stone-900 text-white shadow-2xs'
                                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                            }`}
                          >
                            3 Cols (6 max)
                          </button>
                          <button
                            onClick={() => onVariantChange('features', 1)}
                            className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${
                              (variants['features'] || 0) % 3 === 1
                                ? 'bg-stone-900 text-white shadow-2xs'
                                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                            }`}
                          >
                            2 Cols (4 max)
                          </button>
                        </div>
                      </div>
                    )}

                    {sec.type === 'stats' && (
                      <div className="flex items-center gap-2 w-full justify-between">
                        <span className="text-[11px] text-stone-500">Card count:</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onVariantChange('stats', 0)}
                            className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${
                              (variants['stats'] || 0) % 2 === 0
                                ? 'bg-stone-900 text-white shadow-2xs'
                                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                            }`}
                          >
                            4 Cards
                          </button>
                          <button
                            onClick={() => onVariantChange('stats', 1)}
                            className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${
                              (variants['stats'] || 0) % 2 === 1
                                ? 'bg-stone-900 text-white shadow-2xs'
                                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                            }`}
                          >
                            3 Cards
                          </button>
                        </div>
                      </div>
                    )}

                    {sec.type === 'problem-solution' && (
                      <div className="flex items-center gap-2 w-full justify-between">
                        <span className="text-[11px] text-stone-500">Density:</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onVariantChange('problem-solution', 0)}
                            className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${
                              (variants['problem-solution'] || 0) % 3 === 0
                                ? 'bg-stone-900 text-white shadow-2xs'
                                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                            }`}
                          >
                            Standard
                          </button>
                          <button
                            onClick={() => onVariantChange('problem-solution', 1)}
                            className={`px-2 py-0.5 text-[11px] font-medium rounded transition-colors ${
                              (variants['problem-solution'] || 0) % 3 === 1
                                ? 'bg-stone-900 text-white shadow-2xs'
                                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                            }`}
                          >
                            Compact
                          </button>
                        </div>
                      </div>
                    )}

                    {sec.type === 'tech-stack' && (
                      <span className="text-stone-500">{sec.items.length} technologies detected</span>
                    )}

                    {sec.type === 'steps' && (
                      <span className="text-stone-500">{sec.items.length} sequence steps</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
