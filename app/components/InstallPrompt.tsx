'use client';

import { useEffect, useState } from 'react';
import { Share, Plus, X } from 'lucide-react';

export default function InstallPrompt() {
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    // Detect iOS Safari (not installed, not in standalone)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    if (isIOS && !isStandalone && isSafari) {
      // Show after 3 seconds, only if not dismissed before
      const dismissed = localStorage.getItem('ios-install-dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => setShowIOSPrompt(true), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('ios-install-dismissed', 'true');
    setShowIOSPrompt(false);
  };

  if (!showIOSPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 bg-white rounded-xl shadow-2xl border border-amber-200 p-4 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="bg-amber-100 p-2 rounded-lg shrink-0">
          <Share className="w-5 h-5 text-amber-700" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-amber-900 text-sm">Install AstroVeda</h3>
          <p className="text-xs text-amber-700 mt-1">
            Tap <Share className="w-3 h-3 inline mx-0.5" /> then 
            <Plus className="w-3 h-3 inline mx-0.5" /> 
            "Add to Home Screen"
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-amber-400 hover:text-amber-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
