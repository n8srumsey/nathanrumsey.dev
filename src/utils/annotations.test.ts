import { describe, it, expect } from 'vitest';
import { parseAnnotatedText } from './annotations';
import type { Annotation } from './annotations';

const ann = (term: string, detail: string, style?: Annotation['style']): Annotation => ({ term, detail, style });

describe('parseAnnotatedText', () => {
  it('returns a single plain segment when annotations is empty', () => {
    expect(parseAnnotatedText('Hello world', [])).toEqual([
      { type: 'text', text: 'Hello world' },
    ]);
  });

  it('returns a single plain segment when no term matches', () => {
    expect(parseAnnotatedText('Hello world', [ann('foo', 'bar')])).toEqual([
      { type: 'text', text: 'Hello world' },
    ]);
  });

  it('splits a match in the middle into three segments', () => {
    const a = ann('world', 'detail');
    expect(parseAnnotatedText('Hello world today', [a])).toEqual([
      { type: 'text', text: 'Hello ' },
      { type: 'annotated', text: 'world', annotation: a },
      { type: 'text', text: ' today' },
    ]);
  });

  it('handles a match at the start', () => {
    const a = ann('Hello', 'detail');
    expect(parseAnnotatedText('Hello world', [a])).toEqual([
      { type: 'annotated', text: 'Hello', annotation: a },
      { type: 'text', text: ' world' },
    ]);
  });

  it('handles a match at the end', () => {
    const a = ann('world', 'detail');
    expect(parseAnnotatedText('Hello world', [a])).toEqual([
      { type: 'text', text: 'Hello ' },
      { type: 'annotated', text: 'world', annotation: a },
    ]);
  });

  it('matches all occurrences of a term', () => {
    const a = ann('go', 'detail');
    expect(parseAnnotatedText('go big or go home', [a])).toEqual([
      { type: 'annotated', text: 'go', annotation: a },
      { type: 'text', text: ' big or ' },
      { type: 'annotated', text: 'go', annotation: a },
      { type: 'text', text: ' home' },
    ]);
  });

  it('handles multiple distinct annotations', () => {
    const a1 = ann('foo', 'detail1');
    const a2 = ann('bar', 'detail2');
    expect(parseAnnotatedText('foo and bar', [a1, a2])).toEqual([
      { type: 'annotated', text: 'foo', annotation: a1 },
      { type: 'text', text: ' and ' },
      { type: 'annotated', text: 'bar', annotation: a2 },
    ]);
  });

  it('resolves overlapping terms left-to-right, keeping the first match', () => {
    const a1 = ann('foo bar', 'long match');
    const a2 = ann('bar', 'short match');
    const result = parseAnnotatedText('foo bar baz', [a1, a2]);
    const annotated = result.filter((s) => s.type === 'annotated');
    expect(annotated).toHaveLength(1);
    expect(annotated[0].annotation).toEqual(a1);
  });

  it('preserves the full description string across all segments', () => {
    const a = ann('mission-critical', 'detail');
    const desc = 'Delivered backend improvements for mission-critical financial systems.';
    const result = parseAnnotatedText(desc, [a]);
    const reconstructed = result.map((s) => s.text).join('');
    expect(reconstructed).toBe(desc);
  });
});
