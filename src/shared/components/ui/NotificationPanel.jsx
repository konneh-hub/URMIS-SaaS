import React from 'react';
import Badge from './Badge';

/**
 * @typedef {{
 *   title: string;
 *   message: string;
 *   time: string;
 * }} NotificationItem
 *
 * @typedef {{
 *   title?: string;
 *   items?: NotificationItem[];
 * }} NotificationPanelProps
 */

/** @param {NotificationPanelProps} props */
export default function NotificationPanel({ title = 'Recent alerts', items = [] }) {
  return (
    <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-[var(--color-text)]">{title}</h2>
        <Badge tone="info">{items.length} new</Badge>
      </div>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-[var(--color-muted-text)]">No new notifications.</p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[var(--color-text)]">{item.title}</p>
                <span className="text-xs text-[var(--color-muted-text)]">{item.time}</span>
              </div>
              <p className="mt-2 text-sm text-[var(--color-muted-text)]">{item.message}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
