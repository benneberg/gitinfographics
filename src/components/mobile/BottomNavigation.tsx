import React from 'react';
import { Eye, FileText, Palette, Download } from 'lucide-react';
import { triggerHaptic } from '../../ui/haptics';

export type MobileTab = 'preview' | 'editor' | 'style' | 'export';

interface BottomNavigationProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  editorBadge?: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onSelectTab,
  editorBadge = false,
}) => {
  const tabs: { id: MobileTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'editor', label: 'Edit', icon: FileText },
    { id: 'style', label: 'Style', icon: Palette },
    { id: 'export', label: 'Export', icon: Download },
  ];

  const handleTabClick = (tabId: MobileTab) => {
    triggerHaptic(10);
    onSelectTab(tabId);
  };

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-lg px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-1"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              id={`nav-tab-${t.id}`}
              type="button"
              onClick={() => handleTabClick(t.id)}
              className={`flex-1 min-h-[48px] min-w-[48px] py-1.5 px-2 flex flex-col items-center justify-center gap-1 transition-all rounded-xl relative ${
                isActive
                  ? 'text-stone-900 font-semibold'
                  : 'text-stone-400 hover:text-stone-700 font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <div
                  className={`p-1 rounded-lg transition-transform ${
                    isActive ? 'bg-stone-100 scale-105' : 'bg-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-stone-900' : 'text-stone-500'}`} />
                </div>

                {t.id === 'editor' && editorBadge && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
                )}
                {t.id === 'preview' && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </div>

              <span className="text-[11px] leading-none tracking-tight whitespace-nowrap">
                {t.label}
              </span>

              {isActive && (
                <span className="absolute bottom-1 w-5 h-0.5 rounded-full bg-stone-900" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
