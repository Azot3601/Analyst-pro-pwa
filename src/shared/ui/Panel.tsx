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
        'rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 shadow-panel backdrop-blur-md sm:p-5',
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
