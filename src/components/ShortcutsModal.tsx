import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';
import { KeyboardShortcuts } from '../ui/KeyboardShortcuts';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcutsManager = new KeyboardShortcuts();
  const categories: Array<{ id: 'general' | 'export' | 'navigation' | 'editing'; title: string }> = [
    { id: 'general', title: 'General' },
    { id: 'export', title: 'Export & Download' },
    { id: 'navigation', title: 'Navigation & View' },
    { id: 'editing', title: 'Editing & Project' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white border border-stone-200/90 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200/80 bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 id="shortcuts-modal-title" className="text-sm font-semibold text-stone-900">
                Keyboard Shortcuts
              </h2>
              <p className="text-xs text-stone-500">Fast keyboard navigation &amp; productivity controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
            aria-label="Close shortcuts modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-stone-700">
          {categories.map((cat) => {
            const list = shortcutsManager.getShortcutsByCategory(cat.id);
            if (list.length === 0) return null;
            return (
              <div key={cat.id} className="space-y-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-1">
                  {cat.title}
                </h3>
                <div className="divide-y divide-stone-100 border border-stone-200/80 rounded-xl overflow-hidden bg-stone-50/40">
                  {list.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-3.5 py-2.5 bg-white hover:bg-stone-50/80 transition-colors"
                    >
                      <span className="text-stone-700 font-medium">{s.description}</span>
                      <div className="flex items-center gap-1 font-mono">
                        {s.keys.split('+').map((keyPart, kIdx) => (
                          <kbd
                            key={kIdx}
                            className="px-2 py-1 text-[11px] font-semibold text-stone-700 bg-stone-100 border border-stone-200 rounded-md shadow-2xs"
                          >
                            {keyPart === 'Ctrl' ? '⌘/Ctrl' : keyPart}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="p-3 bg-stone-100/70 border border-stone-200/60 rounded-xl text-stone-600 flex items-start gap-2.5">
            <Command className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-stone-800">Pro-tip:</span> Press{' '}
              <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white border border-stone-300 rounded">
                ?
              </kbd>{' '}
              or{' '}
              <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white border border-stone-300 rounded">
                ⌘ ⇧ ?
              </kbd>{' '}
              at any time to open this cheat-sheet.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-200/80 bg-stone-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 bg-white border border-stone-200 hover:border-stone-300 rounded-lg shadow-2xs transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
