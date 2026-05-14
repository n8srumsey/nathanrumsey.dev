import { RectangleStackIcon } from '@heroicons/react/24/outline';

export default function LayersIcon({ size = 12 }: { size?: number }) {
  return (
    <RectangleStackIcon width={size} height={size} aria-hidden="true" className="inline-block align-middle shrink-0" />
  );
}
