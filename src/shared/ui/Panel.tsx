import { clsx } from 'clsx';
import type { PropsWithChildren, ReactNode } from 'react';

type PanelProps = PropsWithChildren<{
  className?: string;
  title?: string;
  action?: ReactNode;
}>;

export function Panel({ children, className, title, action }: PanelProps) {
  return (
    <section
      className={clsx(
        'rounded-lg border border-white/10 bg-white/[0.055] p-4 shadow-panel backdrop-blur',
        className
      )}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-base font-semibold text-slate-50">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
