import { clsx } from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'soft';
};

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-electric/70 disabled:opacity-50',
        variant === 'primary' && 'bg-electric text-ink hover:bg-cyan-200',
        variant === 'ghost' && 'text-slate-200 hover:bg-white/10',
        variant === 'soft' && 'bg-white/10 text-slate-50 hover:bg-white/[0.15]',
        className
      )}
      {...props}
    />
  );
}
