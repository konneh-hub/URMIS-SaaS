import React from 'react';
import Button from './Button';

/**
 * @typedef {{
 *   open: boolean;
 *   title?: string;
 *   description?: string;
 *   children?: import('react').ReactNode;
 *   footer?: import('react').ReactNode | null;
 *   onClose?: () => void;
 *   className?: string;
 * }} DialogProps
 */

/** @type {import('react').FC<any>} */
const Dialog = ({ open, title, description, children, footer = null, onClose, className = '' }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full max-w-2xl overflow-hidden rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] ${className}`}>
        <div className="flex flex-col gap-3 border-b border-[var(--color-border)] px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title ? <h2 className="text-xl font-semibold text-[var(--color-text)]">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-[var(--color-muted-text)]">{description}</p> : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer ? <div className="border-t border-[var(--color-border)] px-6 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}

export default Dialog;
