export type AnnotationStyle = 'keyword' | 'tech' | 'achievement';

export type Annotation = {
  term: string;
  detail: string;
  style?: AnnotationStyle;
};

export type Segment =
  | { type: 'text'; text: string }
  | { type: 'annotated'; text: string; annotation: Annotation };

/**
 * Splits a description string into plain and annotated segments.
 * Matches are left-to-right; overlapping ranges keep the first match.
 * All occurrences of each term are matched.
 */
export function parseAnnotatedText(description: string, annotations: Annotation[]): Segment[] {
  if (!annotations.length) return [{ type: 'text', text: description }];

  const matches: { start: number; end: number; annotation: Annotation }[] = [];

  for (const annotation of annotations) {
    const { term } = annotation;
    if (!term) continue;
    let idx = 0;
    while (idx <= description.length - term.length) {
      const found = description.indexOf(term, idx);
      if (found === -1) break;
      matches.push({ start: found, end: found + term.length, annotation });
      idx = found + 1;
    }
  }

  if (!matches.length) return [{ type: 'text', text: description }];

  matches.sort((a, b) => a.start - b.start);

  const nonOverlapping: typeof matches = [];
  let lastEnd = 0;
  for (const match of matches) {
    if (match.start >= lastEnd) {
      nonOverlapping.push(match);
      lastEnd = match.end;
    }
  }

  const segments: Segment[] = [];
  let pos = 0;
  for (const match of nonOverlapping) {
    if (match.start > pos) {
      segments.push({ type: 'text', text: description.slice(pos, match.start) });
    }
    segments.push({ type: 'annotated', text: description.slice(match.start, match.end), annotation: match.annotation });
    pos = match.end;
  }
  if (pos < description.length) {
    segments.push({ type: 'text', text: description.slice(pos) });
  }

  return segments;
}
