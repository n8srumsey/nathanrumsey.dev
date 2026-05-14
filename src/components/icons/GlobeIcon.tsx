import { GlobeAltIcon } from '@heroicons/react/24/outline';

export default function GlobeIcon({ size = 12 }: { size?: number }) {
  return (
    <GlobeAltIcon width={size} height={size} aria-hidden="true" className="shrink-0" />
  );
}
