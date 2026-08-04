"use client";

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function DashboardLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--color-text)]">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      ) : null}

      <div className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-200 lg:hidden`}>
        <Sidebar />
      </div>

      <div className="flex-1">
        <Navbar onMenuToggle={() => setIsMobileMenuOpen((value) => !value)} />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
