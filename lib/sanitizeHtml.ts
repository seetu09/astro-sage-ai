import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize a string of HTML before rendering it with
 * dangerouslySetInnerHTML. Strips <script>, event handlers
 * (onerror/onload/...), javascript: URLs, <iframe>, <object>, etc.
 * Safe to call with null/undefined.
 */
export function sanitizeHtml(html: string | null | undefined): string {
  return DOMPurify.sanitize(html ?? '');
}
