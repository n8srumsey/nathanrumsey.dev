import { NewspaperIcon } from '@heroicons/react/24/outline';

export default function ArticleIcon({ size = 12 }: { size?: number }) {
  return (
    <NewspaperIcon width={size} height={size} aria-hidden="true" className="inline-block align-middle shrink-0" />
  );
}
