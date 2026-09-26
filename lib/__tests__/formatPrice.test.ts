import { describe, it, expect } from 'vitest';
import { formatPrice } from '@/lib/formatPrice';

describe('formatPrice', () => {
  it('formats whole INR amounts without decimals', () => {
    expect(formatPrice(999, 'INR')).toBe('₹999');
  });
  it('formats INR with thousands separator', () => {
    expect(formatPrice(1234, 'INR')).toBe('₹1,234');
  });
  it('rounds fractional INR amounts to whole rupees', () => {
    expect(formatPrice(999.5, 'INR')).toBe('₹1,000');
  });
  it('renders zero as ₹0 (does not hide)', () => {
    expect(formatPrice(0, 'INR')).toBe('₹0');
  });
  it('formats USD with the en-US locale', () => {
    expect(formatPrice(1234, 'USD')).toBe('$1,234');
  });
});
