'use client';

import { useState } from 'react';
import { Share2, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/app/lib/i18n/useTranslation';
import { useToast } from '@/app/components/ToastProvider';

interface ShareResultButtonProps {
  /** Title passed to the native share sheet (Web Share API). */
  title: string;
  /** Body text passed to the native share sheet. */
  text: string;
  /** Absolute URL to share / copy. */
  url: string;
  /**
   * Visual variant so the button can match its sibling controls:
   *  - 'outline'    → bordered ghost button (Kundali sticky bar / cards)
   *  - 'secondary'  → filled-neutral button that reads as secondary next to a
   *                   primary CTA (Matchmaking verdict card, beside the pink
   *                   "Share Compatibility Score" button)
   */
  variant?: 'outline' | 'secondary';
  /** Optional extra classes appended after the variant's base classes. */
  className?: string;
}

/**
 * Best-effort clipboard write that works even when the async Clipboard API is
 * unavailable (non-HTTPS context, older Android WebViews). Uses a temporary
 * <textarea> + `document.execCommand('copy')` as the last resort — the only
 * remaining legitimate use of execCommand.
 *
 * Returns true when the URL landed on the clipboard.
 */
async function copyWithFallback(url: string): Promise<boolean> {
  // 1. Modern async Clipboard API (secure contexts only).
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      // Fall through to the legacy path (e.g. permission denied).
    }
  }

  // 2. Legacy <textarea> + execCommand fallback.
  if (typeof document === 'undefined') return false;
  try {
    const textarea = document.createElement('textarea');
    textarea.value = url;
    // Keep it in the viewport & out of the way so iOS doesn't scroll/jump.
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);

    // iOS Safari requires a selection range to enable the copy command.
    const selection = document.getSelection();
    const previousRange =
      selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    const range = document.createRange();
    range.selectNodeContents(textarea);
    selection?.removeAllRanges();
    selection?.addRange(range);
    textarea.select();
    textarea.setSelectionRange(0, url.length);

    const succeeded = document.execCommand('copy');

    // Restore previous selection and clean up.
    if (selection) {
      selection.removeAllRanges();
      if (previousRange) selection.addRange(previousRange);
    }
    document.body.removeChild(textarea);
    return succeeded;
  } catch {
    return false;
  }
}

export default function ShareResultButton({
  title,
  text,
  url,
  variant = 'outline',
  className = '',
}: ShareResultButtonProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    // 1. Prefer the native share sheet when the Web Share API is available
    //    (mobile Safari, Chrome Android). Shares to WhatsApp/Telegram/etc.
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        // A cancelled share sheet throws AbortError — that is NOT an error.
        if (err instanceof DOMException && err.name === 'AbortError') return;
        // Any other failure (e.g. share cancelled on some Android builds,
        // invalid data) falls through to the clipboard path below.
      }
    }

    // 2. No Web Share API (or it failed) → copy the URL and confirm.
    const copiedOk = await copyWithFallback(url);
    if (copiedOk) {
      setCopied(true);
      toast.success(t('share.linkCopied'));
      window.setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error(t('share.copyFailed'));
    }
  };

  const baseClasses =
    'inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer';
  const variantClasses =
    variant === 'secondary'
      ? 'border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:border-[var(--accent)]'
      : 'border border-slate-300/70 dark:border-white/15 text-indigo-950 dark:text-[#F3F4F6] hover:bg-slate-100 dark:hover:bg-white/10';

  const Icon = Share2;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={t('share.shareResult')}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {copied ? (
        <CheckCircle2 className="w-4 h-4 text-green-500" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
      {copied ? t('share.linkCopied') : t('share.share')}
    </button>
  );
}
