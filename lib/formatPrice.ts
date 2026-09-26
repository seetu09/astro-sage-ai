/**
 * Format a price for display.
 *
 * Whole-rupee display: 999 → "₹999", not "₹999.00". The app's prices are
 * integers in practice; if a fractional price ever appears it is rounded
 * to the nearest whole rupee at render time (the stored value is not
 * touched).
 *
 * Uses Intl.NumberFormat so thousands separators follow the locale
 * (en-IN → "₹1,234").
 */
export function formatPrice(amount: number, currency: string): string {
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
