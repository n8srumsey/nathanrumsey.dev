import { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import LayersIcon from '../icons/LayersIcon';
import { TagButton } from '../ui/TagButton';
import TagList from '../ui/TagList';

export type BlogPostData = {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  series?: string;
  seriesLabel?: string;
  seriesSlug?: string;
  seriesPosition?: number;
  readingMinutes: number;
};

interface Props {
  post: BlogPostData;
  onTagClick: (tag: string) => void;
  activeTags: string[];
}

export default function BlogPostCard({ post, onTagClick, activeTags }: Props) {
  const dateStr = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const hasSeries = !!(post.seriesLabel && post.seriesSlug);
  const hasTags = post.tags.length > 0;

  const [inlineLayout, setInlineLayout] = useState(false);
  const [measureKey, setMeasureKey] = useState(0);
  const articleRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const sortedTags = useMemo(() => [
    ...post.tags.filter(t => activeTags.includes(t)),
    ...post.tags.filter(t => !activeTags.includes(t)),
  ], [post.tags, activeTags]);

  useLayoutEffect(() => {
    if (!hasSeries || !hasTags) return;
    const el = measureRef.current;
    if (!el) return;
    const items = Array.from(el.children);
    if (items.length < 2) { setInlineLayout(true); return; }
    const firstTop = items[0].getBoundingClientRect().top;
    const lastTop = items[items.length - 1].getBoundingClientRect().top;
    setInlineLayout(Math.abs(lastTop - firstTop) < 1);
  }, [hasSeries, hasTags, sortedTags, measureKey]);

  useEffect(() => {
    if (!hasSeries || !hasTags) return;
    const el = articleRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setMeasureKey(k => k + 1));
    ro.observe(el);
    return () => ro.disconnect();
  }, [hasSeries, hasTags]);

  return (
    <article ref={articleRef} className="border border-border rounded-lg p-5 hover:border-primary/40 bg-surface-raised shadow-md transition-colors relative">
      {hasSeries && hasTags && (
        <div
          ref={measureRef}
          className="absolute inset-x-5 top-0 flex flex-wrap gap-1.5 invisible pointer-events-none font-mono text-sm"
          aria-hidden="true"
        >
          <span className="shrink-0">
            {post.seriesPosition != null ? `Part ${post.seriesPosition} of ` : ''}{post.seriesLabel}
          </span>
          <span className="shrink-0">·</span>
          {sortedTags.map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded-full border border-transparent shrink-0">{tag}</span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <h2 className="font-semibold">
          <a href={`/blog/${post.slug}`} className="hover:underline">{post.title}</a>
        </h2>
        <div className="flex items-center gap-x-2 font-mono text-sm text-muted-foreground">
          <time dateTime={post.date}>{dateStr}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} min read</span>
        </div>
      </div>

      {hasSeries && hasTags && inlineLayout ? (
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-sm text-muted-foreground mt-1">
          <span className="shrink-0 flex items-center gap-1">
            {post.seriesPosition != null && <span>Part {post.seriesPosition} of</span>}
            <a href={`/blog/series/${post.seriesSlug!}`} className="hover:text-primary transition-colors flex items-center gap-1">
              <LayersIcon />
              {post.seriesLabel}
            </a>
          </span>
          <span aria-hidden="true" className="shrink-0">·</span>
          {sortedTags.map(tag => (
            <TagButton key={tag} tag={tag} onClick={() => onTagClick(tag)} isActive={activeTags.includes(tag)} />
          ))}
        </div>
      ) : (
        <>
          {hasSeries && (
            <div className="flex items-center gap-1 font-mono text-sm text-muted-foreground mt-1">
              {post.seriesPosition != null && <span>Part {post.seriesPosition} of</span>}
              <a href={`/blog/series/${post.seriesSlug!}`} className="hover:text-primary transition-colors flex items-center gap-1">
                <LayersIcon />
                {post.seriesLabel}
              </a>
            </div>
          )}
          {hasTags && <TagList tags={post.tags} activeTags={activeTags} onTagClick={onTagClick} />}
        </>
      )}

      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{post.description}</p>
    </article>
  );
}
