import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="btn-pwa-install"
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 text-stone-100 hover:bg-stone-800 transition shadow-sm border border-stone-700"
        title="Install GitInfoGraphics as a desktop or mobile application"
      >
        <Download className="w-3.5 h-3.5 text-orange-400" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          id="btn-pwa-install-ios"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          title="Add to Home Screen on iOS"
        >
          <Smartphone className="w-3.5 h-3.5 text-stone-500" />
          <span>Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-xl bg-white dark:bg-stone-900 p-5 shadow-2xl border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-orange-500" />
                  <h3 className="text-sm font-bold">Install on iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-md text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 space-y-2.5 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                <p>To install GitInfoGraphics as a standalone app on iOS:</p>
                <ol className="list-decimal list-inside space-y-1.5 pl-1 font-medium text-stone-800 dark:text-stone-200">
                  <li>
                    Tap the <strong>Share</strong> button in the Safari toolbar.
                  </li>
                  <li>
                    Scroll down and tap <strong>Add to Home Screen</strong>.
                  </li>
                  <li>
                    Confirm by tapping <strong>Add</strong> in the top right.
                  </li>
                </ol>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-lg bg-stone-900 text-white dark:bg-stone-800 py-2 text-xs font-semibold hover:bg-stone-800 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
