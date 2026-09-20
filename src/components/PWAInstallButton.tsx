import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        id="btn-pwa-install"
        onClick={install}
        className={`inline-flex items-center gap-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-1.5 text-xs sm:text-sm'
        }`}
        title="Install Enterprise ERP as Desktop / Mobile App"
      >
        <Download className="w-4 h-4" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          id="btn-pwa-ios-install"
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium transition ${
            compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs sm:text-sm'
          }`}
          title="Install on iOS Home Screen"
        >
          <Smartphone className="w-3.5 h-3.5 text-slate-600" />
          <span>Install iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-slate-900">Install ERP on iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed space-y-2">
                <span>1. Tap the <strong>Share</strong> icon in the Safari bottom toolbar.</span><br />
                <span>2. Scroll down and choose <strong>Add to Home Screen</strong>.</span><br />
                <span>3. Tap <strong>Add</strong> in the upper-right corner.</span>
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition"
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
