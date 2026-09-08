import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from './useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-indicator-banner"
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-stone-900 border border-stone-700 px-3.5 py-2 text-xs font-medium text-stone-200 shadow-xl animate-in slide-in-from-bottom-2 duration-200"
    >
      <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span>Offline Mode — Using local deterministic engine &amp; cached assets.</span>
    </div>
  );
};
