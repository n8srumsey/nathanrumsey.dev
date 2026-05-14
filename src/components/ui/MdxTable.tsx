import type { ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  className?: string;
}

export default function MdxTable({ children, className }: Props) {
  return (
    <div className="overflow-x-auto my-6">
      <table className={className}>{children}</table>
    </div>
  );
}
