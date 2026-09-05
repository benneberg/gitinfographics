import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 shadow-lg bg-white border border-stone-200 rounded-xl text-stone-800 text-xs font-sans animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-stone-500 shrink-0" />}
            <span className="font-medium truncate">{t.message}</span>
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
