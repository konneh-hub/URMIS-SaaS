import React from 'react';
import Badge from './Badge';

export default function MetricTile({ title, value, description, badge, badgeTone = 'info', className = '' }) {
  return (
    <div className={`rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)] ${className}`.trim()}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--color-muted-text)]">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-text)]">{value}</p>
        </div>
        {badge ? <Badge tone={badgeTone}>{badge}</Badge> : null}
      </div>
      {description ? <p className="mt-4 text-sm text-[var(--color-muted-text)]">{description}</p> : null}
    </div>
  );
}
