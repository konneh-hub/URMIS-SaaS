/**
 * @typedef {import('react').ReactNode} ReactNode
 * @typedef {{
 *   title?: string;
 *   description?: string;
 *   children?: ReactNode;
 *   footer?: ReactNode;
 *   className?: string;
 * }} CardProps
 */
import React from 'react';

/** @type {import('react').FC<CardProps>} */
const Card = ({ title = null, description = null, children = null, footer = null, className = '' }) => {
  return (
    <section className={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] ${className}`.trim()}>
      {(title || description) ? (
        <div className="mb-4">
          {title ? <h3 className="text-base font-semibold text-[var(--color-text)]">{title}</h3> : null}
          {description ? <p className="mt-1 text-sm text-[var(--color-muted-text)]">{description}</p> : null}
        </div>
      ) : null}
      {children}
      {footer ? <div className="mt-4 border-t border-[var(--color-border)] pt-4">{footer}</div> : null}
    </section>
  );
}

export default Card;
