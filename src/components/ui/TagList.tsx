import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { TagButton } from './TagButton';

interface TagListProps {
  tags: string[];
  activeTags: string[];
  onTagClick: (tag: string) => void;
}

export default function TagList({ tags, activeTags, onTagClick }: TagListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(tags.length);
  const [measureKey, setMeasureKey] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const sortedTags = useMemo(() => [
    ...tags.filter(t => activeTags.includes(t)),
    ...tags.filter(t => !activeTags.includes(t)),
  ], [tags, activeTags]);

  useEffect(() => {
    setIsExpanded(false);
  }, [activeTags]);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const spans = Array.from(el.querySelectorAll<HTMLElement>('[data-tag-span]'));
    if (spans.length === 0) {
      setVisibleCount(sortedTags.length);
      return;
    }
    const firstTop = spans[0].getBoundingClientRect().top;
    let firstLineCount = 0;
    for (const span of spans) {
      if (Math.abs(span.getBoundingClientRect().top - firstTop) < 1) {
        firstLineCount++;
      } else {
        break;
      }
    }
    const fittingCount = firstLineCount < sortedTags.length ? firstLineCount - 1 : firstLineCount;
    const activeCount = tags.filter(t => activeTags.includes(t)).length;
    setVisibleCount(Math.max(activeCount, fittingCount, 1));
  }, [sortedTags, activeTags, measureKey, tags]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (!isExpanded) setMeasureKey(k => k + 1);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isExpanded]);

  const displayedTags = isExpanded ? sortedTags : sortedTags.slice(0, visibleCount);
  const hasOverflow = visibleCount < sortedTags.length;

  return (
    <div ref={wrapperRef} className="relative mt-3">
      <div
        ref={measureRef}
        className="absolute inset-x-0 top-0 flex flex-wrap gap-1.5 invisible pointer-events-none"
        aria-hidden="true"
      >
        {sortedTags.map(tag => (
          <span
            key={tag}
            data-tag-span
            className="font-mono text-xs px-2 py-0.5 rounded-full border border-transparent shrink-0"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {displayedTags.map(tag => (
          <TagButton key={tag} tag={tag} onClick={() => onTagClick(tag)} isActive={activeTags.includes(tag)} />
        ))}
        {!isExpanded && hasOverflow && (
          <button
            onClick={() => setIsExpanded(true)}
            aria-label={`Show ${sortedTags.length - visibleCount} more tags`}
            className="font-mono text-xs px-2 py-0.5 rounded-full border border-transparent text-muted-foreground hover:text-primary transition-colors shrink-0 cursor-pointer pointer-events-auto"
          >
            ...
          </button>
        )}
      </div>
    </div>
  );
}
