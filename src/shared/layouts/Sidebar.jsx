"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../auth/AuthProvider';
import { getMenuForRole, formatRoleLabel } from './sidebarConfig';

export default function Sidebar() {
  const { user } = useAuth();
  const items = getMenuForRole(user?.role);

  return (
    <aside className="flex w-64 flex-col border-r border-slate-200 bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 p-4">
        <h2 className="text-lg font-semibold">URMIS</h2>
        <p className="mt-1 text-sm text-slate-400">{formatRoleLabel(user?.role)}</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <span className="mr-2 h-2 w-2 rounded-full bg-blue-400" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
