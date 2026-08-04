/**
 * @typedef {import('react').ReactNode} ReactNode
 * @typedef {{
 *   eyebrow?: string;
 *   title: string;
 *   description?: string;
 *   actions?: ReactNode;
 *   badge?: ReactNode;
 * }} PageHeaderProps
 */
import React from 'react';

/** @type {import('react').FC<PageHeaderProps>} */
const PageHeader = ({ eyebrow, title, description, actions = null, badge = null }) => {
  return (
    <div className="flex flex-col gap-4 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)] sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-primary)]">{eyebrow}</p> : null}
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">{title}</h1>
        {description ? <p className="max-w-2xl text-sm text-[var(--color-muted-text)] sm:text-base">{description}</p> : null}
        {badge ? <div className="pt-1">{badge}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export default PageHeader;
