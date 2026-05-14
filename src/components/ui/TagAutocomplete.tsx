import { useState, useRef, useEffect, useId } from 'react';

interface Props {
  allTags: string[];
  activeTags: string[];
  onSelect: (tag: string) => void;
  placeholder?: string;
}

export function TagAutocomplete({ allTags, activeTags, onSelect, placeholder = 'Search tags\u2026' }: Props) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const filtered = allTags.filter(
    t => !activeTags.includes(t) && t.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (tag: string) => {
    onSelect(tag);
    setQuery('');
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') setIsOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => (i < filtered.length - 1 ? i + 1 : i));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => (i > 0 ? i - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && filtered[activeIndex]) select(filtered[activeIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const optionId = (i: number) => `${listboxId}-opt-${i}`;

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen && filtered.length > 0}
        aria-controls={listboxId}
        aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
        value={query}
        onChange={e => { setQuery(e.target.value); setIsOpen(true); setActiveIndex(-1); }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="font-mono text-xs border border-border rounded px-2 py-1 bg-surface text-foreground w-full focus:outline-none focus:border-primary/60 placeholder:text-muted-foreground"
      />
      {isOpen && filtered.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 top-full left-0 mt-0.5 w-full max-h-48 overflow-y-auto bg-surface border border-border rounded shadow-md"
        >
          {filtered.map((tag, i) => (
            <li
              key={tag}
              id={optionId(i)}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={e => { e.preventDefault(); select(tag); }}
              className={`font-mono text-xs px-2 py-1.5 cursor-pointer ${
                i === activeIndex
                  ? 'bg-primary-subtle text-primary'
                  : 'text-foreground hover:bg-primary-subtle hover:text-primary'
              }`}
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
