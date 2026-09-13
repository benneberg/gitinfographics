import React, { useRef } from 'react';
import { Check, ChevronLeft, ChevronRight, Palette, Sparkles } from 'lucide-react';
import { THEMES } from '../../engine/themes';
import { triggerHaptic } from '../../ui/haptics';

interface ThemeCarouselProps {
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
  className?: string;
}

export const ThemeCarousel: React.FC<ThemeCarouselProps> = ({
  currentTheme,
  onThemeChange,
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const themeList = Object.values(THEMES);

  const handleSelect = (id: string) => {
    triggerHaptic(10);
    onThemeChange(id);
  };

  const scrollBy = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const cycleNext = () => {
    const idx = themeList.findIndex((t) => t.id === currentTheme);
    const nextIdx = (idx + 1) % themeList.length;
    handleSelect(themeList[nextIdx].id);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Header Row */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-stone-600" />
          <span className="text-xs font-semibold text-stone-900">Color Themes</span>
          <span className="text-[10px] text-stone-400 font-mono">({themeList.length})</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={cycleNext}
            className="flex items-center gap-1 text-[11px] font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded-md transition-colors"
            title="Cycle to next theme"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Next</span>
          </button>
          <button
            type="button"
            onClick={() => scrollBy(-180)}
            className="p-1 text-stone-500 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(180)}
            className="p-1 text-stone-500 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Swipeable Carousel */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-2.5 overflow-x-auto pb-2 pt-0.5 px-1 snap-x snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {themeList.map((th) => {
          const isSelected = th.id === currentTheme;
          // Shorten long descriptive names
          const shortName = th.name.split('(')[0].trim();

          return (
            <button
              key={th.id}
              type="button"
              onClick={() => handleSelect(th.id)}
              className={`shrink-0 w-36 sm:w-40 snap-start text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between gap-2 min-h-[76px] ${
                isSelected
                  ? 'border-stone-900 bg-stone-900 text-white shadow-sm ring-1 ring-stone-900'
                  : 'border-stone-200/90 bg-white hover:border-stone-400 text-stone-800'
              }`}
            >
              {/* Top row: Name & Active Indicator */}
              <div className="flex items-start justify-between gap-1 w-full">
                <span
                  className={`text-xs font-semibold line-clamp-1 ${
                    isSelected ? 'text-white' : 'text-stone-900'
                  }`}
                >
                  {shortName}
                </span>
                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-white text-stone-900 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>

              {/* Bottom row: Swatches & Dark/Light badge */}
              <div className="flex items-center justify-between w-full pt-1">
                <div className="flex items-center gap-1">
                  {/* Background swatch */}
                  <span
                    className="w-4 h-4 rounded-full border border-stone-300 shadow-2xs shrink-0"
                    style={{ backgroundColor: th.bg }}
                    title={`Background: ${th.bg}`}
                  />
                  {/* Accent swatch */}
                  <span
                    className="w-4 h-4 rounded-full border border-stone-300 shadow-2xs shrink-0"
                    style={{ backgroundColor: th.accent }}
                    title={`Accent: ${th.accent}`}
                  />
                  {/* Card Bg swatch */}
                  <span
                    className="w-4 h-4 rounded-full border border-stone-300 shadow-2xs shrink-0"
                    style={{ backgroundColor: th.cardBg }}
                    title={`Card: ${th.cardBg}`}
                  />
                </div>

                <span
                  className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded ${
                    isSelected
                      ? 'bg-stone-800 text-stone-200'
                      : th.isDark
                      ? 'bg-stone-900 text-stone-100'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {th.isDark ? 'Dark' : 'Light'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
