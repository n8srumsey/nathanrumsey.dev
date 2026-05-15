import { useState, useRef, useEffect } from 'react';
import { parseAnnotatedText } from '../../utils/annotations';
import type { Annotation } from '../../utils/annotations';

const STYLE_LABELS: Record<NonNullable<Annotation['style']>, string> = {
  keyword: 'Keyword',
  tech: 'Tech',
  achievement: 'Achievement',
};

function AnnotationTooltip({ id, detail, style }: { id: string; detail: string; style?: Annotation['style'] }) {
  return (
    <span
      id={id}
      role="tooltip"
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-56 px-3 py-2 rounded-md bg-surface-raised border border-border text-sm text-foreground shadow-md pointer-events-none whitespace-normal not-italic"
    >
      {style && (
        <span className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">
          {STYLE_LABELS[style]}
        </span>
      )}
      {detail}
      <span
        aria-hidden="true"
        className="absolute top-full left-1/2 -translate-x-1/2"
        style={{
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid var(--color-surface-raised)',
        }}
      />
    </span>
  );
}

function AnnotationTerm({
  segmentIndex,
  text,
  annotation,
  activeIndex,
  setActiveIndex,
}: {
  segmentIndex: number;
  text: string;
  annotation: Annotation;
  activeIndex: number | null;
  setActiveIndex: (i: number | null) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const spanRef = useRef<HTMLSpanElement>(null);
  // Evaluated once on mount — stable across the component lifetime
  const hasHover = useRef(
    typeof window !== 'undefined' &&
    typeof (window as Window & typeof globalThis).matchMedia === 'function' &&
    window.matchMedia('(hover: hover)').matches
  );
  // Deterministic ID avoids useId() hydration prefix mismatches with Astro islands
  const tooltipId = `annotation-term-${segmentIndex}`;

  const isClickOpen = activeIndex === segmentIndex;
  const isOpen = mounted && (hasHover.current ? isHovered : isClickOpen);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!isClickOpen) return;
    const onOutsideClick = (e: MouseEvent) => {
      if (spanRef.current && !spanRef.current.contains(e.target as Node)) {
        setActiveIndex(null);
      }
    };
    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, [isClickOpen, setActiveIndex]);

  return (
    <span
      ref={spanRef}
      role="button"
      tabIndex={0}
      aria-describedby={isOpen ? tooltipId : undefined}
      className="relative cursor-help underline decoration-dotted underline-offset-[3px] decoration-muted-foreground"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setActiveIndex(isClickOpen ? null : segmentIndex)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setActiveIndex(isClickOpen ? null : segmentIndex);
        }
        if (e.key === 'Escape') setActiveIndex(null);
      }}
      onFocus={() => setActiveIndex(segmentIndex)}
      onBlur={() => setActiveIndex(null)}
    >
      {text}
      {isOpen && <AnnotationTooltip id={tooltipId} detail={annotation.detail} style={annotation.style} />}
    </span>
  );
}

type Props = {
  description: string;
  annotations?: Annotation[];
  className?: string;
};

export default function AnnotatedText({ description, annotations = [], className }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const segments = parseAnnotatedText(description, annotations);
  const hasAnnotations = segments.some((s) => s.type === 'annotated');

  return (
    <p className={className}>
      {hasAnnotations ? (
        segments.map((segment, i) =>
          segment.type === 'text' ? (
            <span key={i}>{segment.text}</span>
          ) : (
            <AnnotationTerm
              key={i}
              segmentIndex={i}
              text={segment.text}
              annotation={segment.annotation}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
            />
          )
        )
      ) : (
        description
      )}
    </p>
  );
}
