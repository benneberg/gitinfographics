import React from 'react';
import { Check, Monitor, Smartphone, Twitter, Share2, Image as ImageIcon } from 'lucide-react';
import { triggerHaptic } from '../../ui/haptics';

export interface FormatConfig {
  id: string;
  name: string;
  shortLabel: string;
  widthLabel: string;
  dimensions: string;
  aspectClass: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const FORMAT_ITEMS: FormatConfig[] = [
  {
    id: 'desktop',
    name: 'Desktop README',
    shortLabel: 'Desktop',
    widthLabel: '880 px',
    dimensions: '880px wide',
    aspectClass: 'w-10 h-6',
    icon: Monitor,
    description: 'Optimal for GitHub repository web headers',
  },
  {
    id: 'mobile',
    name: 'Mobile README',
    shortLabel: 'Mobile',
    widthLabel: '400 px',
    dimensions: '400px portrait',
    aspectClass: 'w-6 h-9',
    icon: Smartphone,
    description: 'Single-column layout for GitHub mobile app',
  },
  {
    id: 'twitter',
    name: 'Twitter / X Post',
    shortLabel: 'Twitter / X',
    widthLabel: '1200×675',
    dimensions: '16:9 Card',
    aspectClass: 'w-11 h-6',
    icon: Twitter,
    description: 'Landscape card preview for social shares',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Post',
    shortLabel: 'LinkedIn',
    widthLabel: '1080×1080',
    dimensions: '1:1 Square',
    aspectClass: 'w-8 h-8',
    icon: Share2,
    description: 'Square feed post for technical updates',
  },
  {
    id: 'github-preview',
    name: 'GitHub Social Preview',
    shortLabel: 'GH Preview',
    widthLabel: '1280×640',
    dimensions: '2:1 Banner',
    aspectClass: 'w-12 h-6',
    icon: ImageIcon,
    description: 'Repository OpenGraph social preview image',
  },
  {
    id: 'instagram',
    name: 'Story Format',
    shortLabel: 'Story',
    widthLabel: '1080×1920',
    dimensions: '9:16 Vertical',
    aspectClass: 'w-5 h-9',
    icon: Smartphone,
    description: 'Full-height vertical card for stories/reels',
  },
];

interface VisualFormatPickerProps {
  currentFormat: string;
  onFormatChange: (formatId: string) => void;
  className?: string;
}

export const VisualFormatPicker: React.FC<VisualFormatPickerProps> = ({
  currentFormat,
  onFormatChange,
  className = '',
}) => {
  const handleSelect = (id: string) => {
    triggerHaptic(10);
    onFormatChange(id);
  };

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      <div className="flex items-center justify-between px-0.5">
        <span className="text-xs font-semibold text-stone-900">Visual Export Format</span>
        <span className="text-[11px] text-stone-500 font-mono">
          {FORMAT_ITEMS.find((f) => f.id === currentFormat)?.widthLabel || 'Standard'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {FORMAT_ITEMS.map((item) => {
          const isSelected = currentFormat === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              className={`p-2.5 rounded-xl border text-left flex flex-col justify-between gap-2 min-h-[92px] transition-all relative ${
                isSelected
                  ? 'border-stone-900 bg-stone-900 text-white shadow-xs ring-1 ring-stone-900'
                  : 'border-stone-200/90 bg-white hover:border-stone-400 text-stone-800'
              }`}
            >
              {/* Header: Aspect Preview thumbnail & Icon */}
              <div className="flex items-start justify-between w-full">
                <div
                  className={`border rounded flex items-center justify-center transition-colors ${
                    item.aspectClass
                  } ${
                    isSelected
                      ? 'border-stone-600 bg-stone-800'
                      : 'border-stone-300 bg-stone-100'
                  }`}
                >
                  <Icon
                    className={`w-3 h-3 ${
                      isSelected ? 'text-stone-300' : 'text-stone-600'
                    }`}
                  />
                </div>

                {isSelected ? (
                  <span className="w-4 h-4 rounded-full bg-white text-stone-900 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-stone-400">
                    {item.dimensions}
                  </span>
                )}
              </div>

              {/* Title & Dimension */}
              <div>
                <div
                  className={`text-xs font-semibold line-clamp-1 ${
                    isSelected ? 'text-white' : 'text-stone-900'
                  }`}
                >
                  {item.name}
                </div>
                <div
                  className={`text-[11px] font-mono mt-0.5 ${
                    isSelected ? 'text-stone-300' : 'text-stone-500'
                  }`}
                >
                  {item.widthLabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
