import { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import LayersIcon from '../icons/LayersIcon';
import ChevronRightIcon from '../icons/ChevronRightIcon';
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
  image?: string;
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

  const ghostMeasure = hasSeries && hasTags ? (
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
  ) : null;

  const mainContent = (
    <div className="relative pointer-events-none pb-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <h2 className="font-semibold font-mono line-clamp-2">
          <a href={`/blog/${post.slug}`} className="hover:underline pointer-events-auto">{post.title}</a>
        </h2>
        <div className="flex items-center gap-x-2 font-mono text-sm text-muted-foreground">
          <time dateTime={post.date}>{dateStr}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} min read</span>
        </div>
      </div>

      {hasSeries && hasTags && inlineLayout ? (
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-sm text-muted-foreground mt-1">
          <span className="shrink-0 flex items-center gap-2">
            {post.seriesPosition != null && <span>Part {post.seriesPosition} of</span>}
            <a href={`/blog/series/${post.seriesSlug!}`} className="hover:text-primary transition-colors flex items-center gap-1 pointer-events-auto">
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
            <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground mt-1">
              {post.seriesPosition != null && <span className="shrink-0">Part {post.seriesPosition} of</span>}
              <a href={`/blog/series/${post.seriesSlug!}`} className="hover:text-primary transition-colors flex items-center gap-1 min-w-0 overflow-hidden pointer-events-auto">
                <LayersIcon className="shrink-0" />
                <span className="truncate">{post.seriesLabel}</span>
              </a>
            </div>
          )}
          {hasTags && <TagList tags={post.tags} activeTags={activeTags} onTagClick={onTagClick} />}
        </>
      )}

      <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">{post.description}</p>
    </div>
  );

  const readMoreLink = (
    <a
      href={`/blog/${post.slug}`}
      className="absolute bottom-3.5 right-4 flex items-center gap-0.5 font-mono text-xs text-muted-foreground group-hover:text-primary group-hover:font-medium transition-colors"
      aria-hidden="true"
      tabIndex={-1}
    >
      Read more
      <ChevronRightIcon />
    </a>
  );

  if (post.image) {
    return (
      <article ref={articleRef} className="border border-border rounded-lg hover:border-primary/40 bg-surface-raised shadow-md transition-colors relative group flex overflow-hidden">
        <a
          href={`/blog/${post.slug}`}
          className="absolute inset-0 rounded-lg"
          aria-hidden="true"
          tabIndex={-1}
        />
        <div className="flex-1 min-w-0 p-5 relative">
          {ghostMeasure}
          {mainContent}
          {readMoreLink}
        </div>
        <div className="w-44 shrink-0 self-stretch">
          <img src={post.image} alt="" className="w-full h-full object-cover" aria-hidden="true" />
        </div>
      </article>
    );
  }

  return (
    <article ref={articleRef} className="border border-border rounded-lg p-5 hover:border-primary/40 bg-surface-raised shadow-md transition-colors relative group">
      {ghostMeasure}
      <a
        href={`/blog/${post.slug}`}
        className="absolute inset-0 rounded-lg"
        aria-hidden="true"
        tabIndex={-1}
      />
      {mainContent}
      {readMoreLink}
    </article>
  );
}
