import React, { useState, type ReactNode } from 'react';
import Badge from './Badge';

type TabItem = {
  value: string;
  label: string;
  badge?: string;
  badgeTone?: string;
  content: ReactNode;
};

type TabsProps = {
  tabs?: TabItem[];
  defaultValue?: string;
  className?: string;
};

export default function Tabs({ tabs = [], defaultValue = '', className = '' }: TabsProps) {
  const [value, setValue] = useState(defaultValue || tabs[0]?.value || '');
  const activeTab = tabs.find((tab) => tab.value === value) || tabs[0] || { value: '', label: '', content: null };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setValue(tab.value)}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${value === tab.value ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'text-[var(--color-text)] hover:bg-[var(--color-muted)]'}`.trim()}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab.badge ? <Badge tone={activeTab.badgeTone || 'info'}>{activeTab.badge}</Badge> : null}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-card)]">
        {activeTab.content}
      </div>
    </div>
  );
}
