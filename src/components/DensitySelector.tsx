import React from 'react';
import { Sparkles, AlignLeft, Layers, Check } from 'lucide-react';
import { VisualDensity, DENSITY_CONFIG } from '../engine/types';
import { triggerHaptic } from '../ui/haptics';

interface DensitySelectorProps {
  value: VisualDensity;
  onChange: (density: VisualDensity) => void;
  compact?: boolean;
  className?: string;
}

export const DensitySelector: React.FC<DensitySelectorProps> = ({
  value,
  onChange,
  compact = false,
  className = '',
}) => {
  const levels: { id: VisualDensity; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'minimal', label: 'Minimal', icon: AlignLeft },
    { id: 'medium', label: 'Balanced', icon: Layers },
    { id: 'dense', label: 'Rich Studio', icon: Sparkles },
  ];

  const handleSelect = (density: VisualDensity) => {
    triggerHaptic(10);
    onChange(density);
  };

  if (compact) {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-stone-500" />
            Visual Density
          </label>
          <span className="text-[10px] font-mono text-stone-400 capitalize">{value}</span>
        </div>
        <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100 rounded-xl border border-stone-200">
          {levels.map((lvl) => {
            const Icon = lvl.icon;
            const isSelected = value === lvl.id;
            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => handleSelect(lvl.id)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80 font-semibold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-stone-400'}`} />
                <span>{lvl.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Infographic Visual Density
        </label>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 capitalize">
          {value} mode
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {levels.map((lvl) => {
          const config = DENSITY_CONFIG[lvl.id];
          const isSelected = value === lvl.id;
          const Icon = lvl.icon;

          return (
            <button
              key={lvl.id}
              type="button"
              onClick={() => handleSelect(lvl.id)}
              className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-3 ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500/50 shadow-xs'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
              }`}
            >
              <div
                className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? 'text-emerald-950' : 'text-stone-900'}`}>
                    {lvl.label}
                  </span>
                  {isSelected && (
                    <span className="flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                      <Check className="w-3 h-3 mr-0.5" /> Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                  {config.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
