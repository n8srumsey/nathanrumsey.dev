import { useMemo } from 'react';
import { TagButton } from './TagButton';

interface TagListProps {
  tags: string[];
  activeTags: string[];
  onTagClick: (tag: string) => void;
}

export default function TagList({ tags, activeTags, onTagClick }: TagListProps) {
  const sortedTags = useMemo(() => [
    ...tags.filter(t => activeTags.includes(t)),
    ...tags.filter(t => !activeTags.includes(t)),
  ], [tags, activeTags]);

  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {sortedTags.map(tag => (
        <TagButton key={tag} tag={tag} onClick={() => onTagClick(tag)} isActive={activeTags.includes(tag)} />
      ))}
    </div>
  );
}
