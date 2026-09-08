import React, { useMemo } from 'react';
import { X, ShieldCheck, AlertTriangle, CheckCircle2, Eye, Palette } from 'lucide-react';
import { ThemeConfig } from '../engine/types';
import { auditThemeContrast, ColorBlindnessType } from '../engine/contrast';

interface ContrastModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeConfig;
  colorBlindness: ColorBlindnessType;
  onColorBlindnessChange: (type: ColorBlindnessType) => void;
}

export const ContrastModal: React.FC<ContrastModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  colorBlindness,
  onColorBlindnessChange
}) => {
  const audit = useMemo(() => auditThemeContrast(currentTheme), [currentTheme]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="bg-white border border-stone-200 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900">WCAG AA Contrast &amp; Accessibility</h2>
              <p className="text-xs text-stone-500">
                Auditing theme: <span className="font-medium text-stone-800">{currentTheme.name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              audit.passedAllNormal
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}
          >
            {audit.passedAllNormal ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className="text-sm font-semibold">
                {audit.passedAllNormal
                  ? 'All Primary Text Elements Pass WCAG 2.1 AA (4.5:1)'
                  : 'Notice: Some Low-Contrast Accents May Be Hard to Read'}
              </h3>
              <p className="text-xs mt-1 text-stone-600 leading-relaxed">
                WCAG 2.1 AA mandates a minimum contrast ratio of 4.5:1 for normal body text and 3.0:1 for large text / graphical objects.
              </p>
            </div>
          </div>

          {/* Contrast Audit Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
              Contrast Ratios Breakdown
            </h4>
            <div className="border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600">
                  <tr>
                    <th className="p-3 font-semibold">Element Pairing</th>
                    <th className="p-3 font-semibold">Preview</th>
                    <th className="p-3 font-semibold">Ratio</th>
                    <th className="p-3 font-semibold">WCAG Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {audit.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/50">
                      <td className="p-3 font-medium text-stone-800">{item.name}</td>
                      <td className="p-3">
                        <span
                          className="px-2.5 py-1 rounded text-xs font-mono font-semibold inline-block border border-stone-200/50"
                          style={{ backgroundColor: item.bg, color: item.fg }}
                        >
                          Aa Sample
                        </span>
                      </td>
                      <td className="p-3 font-mono font-semibold text-stone-900">
                        {item.ratio}:1
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.level === 'AAA'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.level === 'AA'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.level === 'AA Large'
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Color Blindness Simulator */}
          <div className="space-y-3 pt-3 border-t border-stone-200">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-stone-700" />
              <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
                Color Blindness Simulation
              </h4>
            </div>
            <p className="text-xs text-stone-500">
              Preview how this infographic renders for users with various types of color vision deficiencies.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {[
                { id: 'normal', name: 'Standard Vision', desc: 'No color deficiency' },
                { id: 'protanopia', name: 'Protanopia', desc: 'Red-blind (1% of males)' },
                { id: 'deuteranopia', name: 'Deuteranopia', desc: 'Green-blind (5% of males)' },
                { id: 'tritanopia', name: 'Tritanopia', desc: 'Blue-blind (rare)' },
                { id: 'achromatopsia', name: 'Achromatopsia', desc: 'Complete color blindness' }
              ].map((sim) => (
                <button
                  key={sim.id}
                  onClick={() => onColorBlindnessChange(sim.id as ColorBlindnessType)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    colorBlindness === sim.id
                      ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div className="text-xs font-semibold">{sim.name}</div>
                  <div className={`text-[10px] mt-0.5 ${colorBlindness === sim.id ? 'text-stone-300' : 'text-stone-400'}`}>
                    {sim.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
          <span>Target Standard: WCAG 2.1 Level AA</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-lg transition-colors shadow-2xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
