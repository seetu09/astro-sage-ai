'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Inbox, RefreshCw, Search, MessageSquare, FileQuestion } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/app/context/LanguageContext';

interface EmptyStateProps {
  type?: 'empty' | 'error' | 'no-results' | 'no-messages' | 'no-data';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  href?: string;
  icon?: React.ReactNode;
}

import { Translations } from '@/lib/i18n';

const icons = {
  empty: <Inbox className="w-12 h-12 text-[var(--text-muted)]" />,
  error: <AlertCircle className="w-12 h-12 text-red-500" />,
  'no-results': <Search className="w-12 h-12 text-[var(--text-muted)]" />,
  'no-messages': <MessageSquare className="w-12 h-12 text-[var(--text-muted)]" />,
  'no-data': <FileQuestion className="w-12 h-12 text-[var(--text-muted)]" />,
};

type EmptyStateType = NonNullable<EmptyStateProps['type']>;

/** Resolve the default title/description for a given empty state, in the active language. */
const getEmptyDefaults = (type: EmptyStateType, t: Translations): { title: string; desc: string } => {
  switch (type) {
    case 'error':
      return { title: t.common.error, desc: t.common.errorDesc };
    case 'no-results':
      return { title: t.common.noResults, desc: t.common.noResultsDesc };
    case 'no-messages':
      return { title: t.common.noMessages, desc: t.common.noMessagesDesc };
    case 'no-data':
      return { title: t.common.noData, desc: t.common.noDataDesc };
    case 'empty':
    default:
      return { title: t.common.empty, desc: t.common.emptyDesc };
  }
};

export default function EmptyState({
  type = 'empty',
  title,
  description,
  actionLabel,
  onAction,
  href,
  icon,
}: EmptyStateProps) {
  const { t } = useLanguage();
  const defaults = getEmptyDefaults(type, t);
  const displayIcon = icon || icons[type];
  const displayTitle = title || defaults.title;
  const displayDescription = description || defaults.desc;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center py-12 sm:py-16 px-4"
    >
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center mb-4">
        {displayIcon}
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] mb-2">
        {displayTitle}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-6">
        {displayDescription}
      </p>
      {(actionLabel || href) && (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          {href ? (
            <Link
              href={href}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all"
            >
                {actionLabel || (href ? t.common.goBack : t.common.tryAgain)}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all"
            >
              {type === 'error' && <RefreshCw className="w-4 h-4" />}
              {actionLabel || t.common.tryAgain}
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
