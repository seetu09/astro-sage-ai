'use client';

import { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Only run on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    if (!isMobile) return;

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed before
    const dismissed = localStorage.getItem('install-banner-dismissed');
    if (dismissed) return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowBanner(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert('Tap the menu (⋮) → "Add to Home Screen"');
      return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('install-banner-dismissed', 'true');
    setShowBanner(false);
  };

  if (isInstalled || !showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-2xl shadow-2xl p-4 animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-xl shrink-0">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm">Install AstroVeda App</h3>
            <p className="text-xs text-amber-100 mt-0.5">Get daily horoscopes & Kundali on your home screen</p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-amber-200 hover:text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={handleInstall}
          className="mt-3 w-full bg-white text-amber-700 font-semibold text-sm py-2.5 rounded-xl hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Add to Home Screen
        </button>
      </div>
    </div>
  );
}
