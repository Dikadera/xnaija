import * as React from 'react';
import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-gradient-to-r from-brand to-orange-500 text-white hover:brightness-110 shadow-lg shadow-brand/20',
  outline: 'border border-line bg-transparent text-zinc-200 hover:bg-white/5',
  ghost: 'text-zinc-300 hover:bg-white/5',
  gold: 'bg-gradient-to-r from-gold to-amber-400 text-black hover:brightness-110 shadow-lg shadow-gold/20',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = 'default', ...p }, ref) => (
  <button
    ref={ref}
    className={cn('inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:opacity-50 disabled:pointer-events-none active:scale-[.98]', variants[variant], className)}
    {...p}
  />
));
Button.displayName = 'Button';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, ref) => (
  <input ref={ref} className={cn('w-full rounded-xl border border-line bg-card px-4 py-2.5 text-sm outline-none placeholder:text-zinc-500 focus:border-brand', className)} {...p} />
));
Input.displayName = 'Input';
