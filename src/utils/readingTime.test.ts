import { describe, it, expect } from 'vitest';
import { readingTime } from './readingTime';

describe('readingTime', () => {
  it('returns 0 for empty string', () => {
    expect(readingTime('')).toBe(0);
  });

  it('returns 1 for content under 200 words', () => {
    expect(readingTime(Array(100).fill('word').join(' '))).toBe(1);
  });

  it('returns 1 for exactly 200 words', () => {
    expect(readingTime(Array(200).fill('word').join(' '))).toBe(1);
  });

  it('returns 2 for 201 words', () => {
    expect(readingTime(Array(201).fill('word').join(' '))).toBe(2);
  });

  it('ignores extra whitespace between words', () => {
    // 3 words regardless of spacing — filter(Boolean) drops empty tokens
    expect(readingTime('word  word   word')).toBe(1);
  });
});
