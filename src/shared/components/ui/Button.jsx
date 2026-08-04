import React from 'react';

const baseClass = 'inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60';

const variants = {
  primary: 'bg-[var(--color-primary)] text-white hover:opacity-90 shadow-sm',
  secondary: 'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-muted)]',
  ghost: 'bg-transparent text-[var(--color-text)] hover:bg-[var(--color-muted)]',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
};

const sizes = {
  sm: 'min-h-9 px-3 py-2 text-xs',
  md: 'min-h-11 px-4 py-2.5 text-sm',
  lg: 'min-h-12 px-5 py-3 text-base',
};

export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  return (
    <button className={`${baseClass} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
