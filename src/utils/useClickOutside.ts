import { useEffect, useRef, type RefObject } from 'react';

export function useClickOutside<T extends HTMLElement>(ref: RefObject<T | null>, onClose: () => void): void {
  const saved = useRef(onClose);
  saved.current = onClose;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) saved.current();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref]);
}
