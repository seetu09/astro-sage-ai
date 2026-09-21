import { describe, it, expect } from 'vitest';
import { deriveMoonDetails } from '@/lib/astrology';

describe('deriveMoonDetails — timezone handling', () => {
  it('deriveMoonDetails differs for IST vs America/New_York at the same local clock time', () => {
    const ist = deriveMoonDetails('1990-01-15', '00:00', false, 'Asia/Kolkata');
    const ny = deriveMoonDetails('1990-01-15', '00:00', false, 'America/New_York');
    expect(ist).not.toEqual(ny);
  });

  it('deriveMoonDetails falls back to IST when timezone is empty', () => {
    const a = deriveMoonDetails('1990-01-15', '00:00', false, '');
    const b = deriveMoonDetails('1990-01-15', '00:00', false, null);
    const ist = deriveMoonDetails('1990-01-15', '00:00', false, 'Asia/Kolkata');
    expect(a).toEqual(ist);
    expect(b).toEqual(ist);
  });
});
