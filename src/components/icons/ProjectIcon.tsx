import { CubeIcon } from '@heroicons/react/24/outline';

export default function ProjectIcon({ size = 12 }: { size?: number }) {
  return (
    <CubeIcon width={size} height={size} aria-hidden="true" className="inline-block align-middle shrink-0" />
  );
}
