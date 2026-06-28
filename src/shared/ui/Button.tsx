import { clsx } from 'clsx';
import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'soft';
};

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' &&
          'bg-electric text-ink shadow-lift hover:-translate-y-0.5 hover:bg-electric/90 active:translate-y-0',
        variant === 'ghost' && 'text-slate-200 hover:bg-white/10',
        variant === 'soft' &&
          'border border-white/10 bg-white/[0.06] text-slate-50 hover:border-white/20 hover:bg-white/[0.12]',
        className
      )}
      {...props}
    />
  );
}
