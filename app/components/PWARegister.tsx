'use client';

import { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function PWARegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstall(false);
      setDeferredPrompt(null);
    });

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted install');
    }
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  if (!showInstall || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 bg-white rounded-xl shadow-2xl border border-amber-200 p-4 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="bg-amber-100 p-2 rounded-lg shrink-0">
          <Smartphone className="w-5 h-5 text-amber-700" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-amber-900 text-sm">Add AstroVeda to Home Screen</h3>
          <p className="text-xs text-amber-700 mt-1">Get instant access to your cosmic guidance</p>
          <button
            onClick={handleInstall}
            className="mt-2 flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Install App
          </button>
        </div>
        <button
          onClick={() => setShowInstall(false)}
          className="text-amber-400 hover:text-amber-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
