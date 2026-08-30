'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TYPE_STYLES: Record<ToastType, { icon: typeof Info; ring: string; iconColor: string; bar: string }> = {
  success: {
    icon: CheckCircle2,
    ring: 'border-emerald-200 dark:border-emerald-500/30',
    iconColor: 'text-emerald-500',
    bar: 'from-emerald-400 to-emerald-600',
  },
  error: {
    icon: AlertTriangle,
    ring: 'border-red-200 dark:border-red-500/30',
    iconColor: 'text-red-500',
    bar: 'from-red-400 to-red-600',
  },
  info: {
    icon: Info,
    ring: 'border-indigo-200 dark:border-indigo-500/30',
    iconColor: 'text-indigo-500',
    bar: 'from-indigo-400 to-indigo-600',
  },
} as any;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const { t: uiT } = useLanguage();

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, type, message }].slice(-4));
      // Auto-dismiss after 4s (errors linger a touch longer).
      window.setTimeout(() => dismiss(id), type === 'error' ? 6000 : 4000);
    },
    [dismiss]
  );

  const success = useCallback((m: string) => toast(m, 'success'), [toast]);
  const error = useCallback((m: string) => toast(m, 'error'), [toast]);
  const info = useCallback((m: string) => toast(m, 'info'), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      {/* Toast viewport — stacked top-center so it never overlaps the bottom PWA install banner */}
      <div
        aria-live="polite"
        role="status"
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none"
      >
        {toasts.map((t) => {
          const styles = TYPE_STYLES[t.type];
          const Icon = styles.icon;
          return (
            <div
              key={t.id}
              className={`pointer-events-auto animate-slide-up flex items-start gap-3 rounded-xl border bg-white dark:bg-[#121026] shadow-2xl p-3.5 overflow-hidden relative ${styles.ring}`}
            >
              {/* accent bar */}
              <span className={`absolute inset-y-0 left-0 w-1 ${styles.bar}`} />
              <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${styles.iconColor}`} />
              <p className="flex-1 text-sm font-medium text-slate-700 dark:text-[#F3F4F6] leading-snug">
                {t.message}
              </p>
              <button
                onClick={() => dismiss(t.id)}
                aria-label={uiT.common.dismissNotification}
                className="shrink-0 rounded-md p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}