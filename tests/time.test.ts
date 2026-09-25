import { describe, expect, it } from 'vitest';
import { etIso, etText, etTick } from '../src/time';

describe('Eastern time display', () => {
  it('uses EDT (UTC−4) in summer and EST (UTC−5) in winter', () => {
    expect(etText(Date.UTC(2026, 8, 25, 12, 0) / 1000)).toBe('Sep 25, 8:00 AM ET');
    expect(etText(Date.UTC(2026, 0, 15, 12, 0) / 1000)).toBe('Jan 15, 7:00 AM ET');
    expect(etIso(Date.UTC(2026, 8, 25, 3, 30) / 1000)).toBe('2026-09-24 23:30');
  });
  it('labels chart ticks with the date at midnight Eastern, else the hour', () => {
    expect(etTick(Date.UTC(2026, 8, 25, 4, 0) / 1000)).toBe('Sep 25');
    expect(etTick(Date.UTC(2026, 8, 25, 16, 0) / 1000)).toBe('12 PM');
  });
});
