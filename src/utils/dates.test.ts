import { describe, it, expect } from 'vitest';
import { formatDate } from './dates';

describe('formatDate', () => {
  it('formats January correctly', () => {
    expect(formatDate('2024-01')).toBe('Jan 2024');
  });

  it('formats December correctly', () => {
    expect(formatDate('2024-12')).toBe('Dec 2024');
  });

  it('formats a mid-year month correctly', () => {
    expect(formatDate('2022-06')).toBe('Jun 2022');
  });

  it('formats single-digit months (no leading zero) correctly', () => {
    expect(formatDate('2020-3')).toBe('Mar 2020');
  });

  it('produces the short month name, not the full name', () => {
    const result = formatDate('2024-09');
    expect(result).toBe('Sep 2024');
    expect(result).not.toContain('September');
  });

  it('includes the four-digit year', () => {
    expect(formatDate('2019-11')).toContain('2019');
  });

  it('handles year boundaries correctly', () => {
    expect(formatDate('2000-01')).toBe('Jan 2000');
    expect(formatDate('1999-12')).toBe('Dec 1999');
  });
});
