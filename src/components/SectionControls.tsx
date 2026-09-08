import React, { useRef } from 'react';
import {
  Sliders,
  CheckSquare,
  Square,
  HelpCircle,
  Activity,
  ListCheck,
  Cpu,
  Footprints,
  FileText,
  ArrowUp,
  ArrowDown,
  QrCode,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  GitCommit,
  Columns,
  Quote,
  Play,
  Minimize2
} from 'lucide-react';
import { InfographicSpec, VariantMap, LogoConfig } from '../engine/types';

interface SectionControlsProps {
  spec: InfographicSpec;
  variants: VariantMap;
  onVariantChange: (sectionKey: string, val: number) => void;
  disabledSections: Record<string, boolean>;
  onToggleSection: (sectionId: string) => void;
  onMoveSection?: (sectionId: string, direction: 'up' | 'down') => void;
  onTitleChange: (title: string) => void;
  onSubtitleChange: (subtitle: string) => void;
  showQR?: boolean;
  onToggleQR?: (val: boolean) => void;
  qrUrl?: string;
  onQrUrlChange?: (url: string) => void;
  logo?: LogoConfig | null;
  onLogoChange?: (logo: LogoConfig | null) => void;
  onAutoDetectLogo?: () => void;
  animated?: boolean;
  onToggleAnimated?: (val: boolean) => void;
  compact?: boolean;
  onToggleCompact?: (val: boolean) => void;
}

export const SectionControls: React.FC<SectionControlsProps> = ({
  spec,
  variants,
  onVariantChange,
  disabledSections,
  onToggleSection,
  onMoveSection,
  onTitleChange,
  onSubtitleChange,
  showQR = false,
  onToggleQR,
  qrUrl = '',
  onQrUrlChange,
  logo,
  onLogoChange,
  onAutoDetectLogo,
  animated = false,
  onToggleAnimated,
  compact = false,
  onToggleCompact
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onLogoChange) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onLogoChange({
          dataUrl,
          position: logo?.position || 'top-right',
          size: logo?.size || 42
        });
      }
    };
    reader.readAsDataURL(file);
  };

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
      case 'timeline':
        return <GitCommit className="w-4 h-4 text-indigo-600" />;
      case 'comparison':
        return <Columns className="w-4 h-4 text-teal-600" />;
      case 'callout':
        return <Quote className="w-4 h-4 text-rose-600" />;
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

        {/* Custom Logo & Branding */}
        {onLogoChange && (
          <div className="flex flex-col gap-2 pt-2 border-t border-stone-200/70">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-stone-900 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-stone-600" />
                Repository Logo / Icon
              </span>
              {logo && (
                <button
                  type="button"
                  onClick={() => onLogoChange(null)}
                  className="text-[10px] text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium transition-colors"
                  title="Remove logo"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </button>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="hidden"
            />

            {!logo ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-1.5 px-3 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-700 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-stone-500" />
                  Upload Logo (PNG/SVG)
                </button>
                {onAutoDetectLogo && (
                  <button
                    type="button"
                    onClick={onAutoDetectLogo}
                    className="py-1.5 px-3 bg-white hover:bg-stone-50 border border-stone-200 rounded-lg text-stone-700 font-medium text-xs flex items-center gap-1 transition-colors"
                    title="Auto-detect logo from repository avatar"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Auto-detect
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 p-2.5 bg-stone-50 rounded-lg border border-stone-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={logo.dataUrl}
                      alt="Logo preview"
                      className="w-8 h-8 rounded object-contain bg-white border border-stone-200 p-0.5"
                    />
                    <span className="text-[11px] font-medium text-stone-800">Custom Logo Embedded</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] text-stone-600 hover:text-stone-900 underline font-medium"
                  >
                    Change
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-200/60">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-medium text-stone-500">Position</label>
                    <div className="flex rounded border border-stone-200 bg-white p-0.5">
                      <button
                        type="button"
                        onClick={() => onLogoChange({ ...logo, position: 'top-left' })}
                        className={`flex-1 py-1 text-[10px] font-medium rounded transition-colors ${
                          logo.position === 'top-left' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Left
                      </button>
                      <button
                        type="button"
                        onClick={() => onLogoChange({ ...logo, position: 'top-right' })}
                        className={`flex-1 py-1 text-[10px] font-medium rounded transition-colors ${
                          logo.position !== 'top-left' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Right
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-medium text-stone-500">Size</label>
                      <span className="text-[10px] font-mono text-stone-500">{logo.size || 42}px</span>
                    </div>
                    <input
                      type="range"
                      min={24}
                      max={64}
                      value={logo.size || 42}
                      onChange={(e) => onLogoChange({ ...logo, size: Number(e.target.value) })}
                      className="w-full accent-stone-800 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
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

                  <div className="flex items-center gap-1.5">
                    {onMoveSection && (
                      <div className="flex items-center gap-0.5 bg-white border border-stone-200 rounded p-0.5 shadow-2xs">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => onMoveSection(sec.id, 'up')}
                          className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-30 disabled:hover:text-stone-500 rounded transition-colors"
                          title="Move section up"
                          aria-label="Move section up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === spec.sections.length - 1}
                          onClick={() => onMoveSection(sec.id, 'down')}
                          className="p-1 text-stone-500 hover:text-stone-900 disabled:opacity-30 disabled:hover:text-stone-500 rounded transition-colors"
                          title="Move section down"
                          aria-label="Move section down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-white text-stone-500 border border-stone-200 rounded">
                      {sec.type}
                    </span>
                  </div>
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

      {/* QR Code Embedding Settings */}
      {onToggleQR && (
        <div className="flex flex-col gap-2.5 pt-3 border-t border-stone-200">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-stone-900 text-xs flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-stone-600" />
              Repository QR Code
            </span>
            <button
              type="button"
              onClick={() => onToggleQR(!showQR)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                showQR
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {showQR ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {showQR && onQrUrlChange && (
            <div className="flex flex-col gap-1 mt-1">
              <label className="text-[11px] font-medium text-stone-500">Target Repository URL</label>
              <input
                type="text"
                value={qrUrl}
                onChange={(e) => onQrUrlChange(e.target.value)}
                placeholder="https://github.com/owner/repo"
                className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white text-xs font-mono text-stone-900 transition-colors"
              />
              <span className="text-[10px] text-stone-400">
                Vector QR code is rendered in the SVG footer linking mobile scanners directly to GitHub.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
