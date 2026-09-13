import React from 'react';
import {
  X,
  Github,
  Sparkles,
  GitBranch,
  FolderOpen,
  Share2,
  HelpCircle,
  Keyboard,
  Eye,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { triggerHaptic } from '../../ui/haptics';

interface MobileActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWorkflow: () => void;
  onOpenProjects: () => void;
  onOpenShare: () => void;
  onOpenShortcuts: () => void;
  onOpenContrast: () => void;
  onOpenTour: () => void;
  onOpenDocs: () => void;
  onReset: () => void;
}

export const MobileActionSheet: React.FC<MobileActionSheetProps> = ({
  isOpen,
  onClose,
  onOpenWorkflow,
  onOpenProjects,
  onOpenShare,
  onOpenShortcuts,
  onOpenContrast,
  onOpenTour,
  onOpenDocs,
  onReset,
}) => {
  if (!isOpen) return null;

  const handleItemClick = (action: () => void) => {
    triggerHaptic(12);
    action();
    onClose();
  };

  const menuItems = [
    {
      label: 'Projects & Snapshots',
      sub: 'Manage saved repository infographics',
      icon: FolderOpen,
      action: onOpenProjects,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Share & Embed',
      sub: 'Social cards, markdown snippets, badges',
      icon: Share2,
      action: onOpenShare,
      color: 'text-sky-600 bg-sky-50',
    },
    {
      label: 'CI/CD GitHub Action',
      sub: 'Automated README infographics via GitHub Actions',
      icon: GitBranch,
      action: onOpenWorkflow,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Contrast & Accessibility',
      sub: 'WCAG AA verification & color blindness simulator',
      icon: Eye,
      action: onOpenContrast,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Interactive Guided Tour',
      sub: 'Step-by-step walkthrough of features',
      icon: Sparkles,
      action: onOpenTour,
      color: 'text-amber-500 bg-amber-50',
    },
    {
      label: 'Keyboard Shortcuts',
      sub: 'Power-user keys & hotkeys cheat-sheet',
      icon: Keyboard,
      action: onOpenShortcuts,
      color: 'text-stone-700 bg-stone-100',
    },
    {
      label: 'Architecture & Engine Docs',
      sub: 'Deterministic SVG layout & tokenization guide',
      icon: BookOpen,
      action: onOpenDocs,
      color: 'text-indigo-600 bg-indigo-50',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-end justify-center animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={() => {
          triggerHaptic(10);
          onClose();
        }}
      />

      <div className="w-full max-w-lg bg-white rounded-t-3xl p-5 shadow-2xl z-10 animate-in slide-in-from-bottom-6 duration-200 flex flex-col gap-3 max-h-[85vh] overflow-y-auto pb-[max(env(safe-area-inset-bottom),20px)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-stone-900">
              Tools & Features
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              onClose();
            }}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-full min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col gap-1">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleItemClick(item.action)}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-stone-50 transition-colors text-left min-h-[52px] group"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-stone-900 group-hover:text-stone-950">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-stone-500 truncate">
                    {item.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Reset Action */}
        <div className="border-t border-stone-100 pt-3">
          <button
            type="button"
            onClick={() => handleItemClick(onReset)}
            className="w-full flex items-center justify-center gap-2 min-h-[44px] text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50/70 hover:bg-rose-100/70 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Sections & Inputs</span>
          </button>
        </div>
      </div>
    </div>
  );
};
