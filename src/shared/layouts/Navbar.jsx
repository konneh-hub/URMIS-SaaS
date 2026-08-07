"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../auth/AuthProvider';
import { getLayoutConfig } from '../layoutConfig';
import SearchIcon from '@mui/icons-material/Search';
import DashboardIcon from '@mui/icons-material/Dashboard';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MailIcon from '@mui/icons-material/Mail';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import CloudIcon from '@mui/icons-material/Cloud';
import BuildIcon from '@mui/icons-material/Build';
import SettingsIcon from '@mui/icons-material/Settings';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import FolderIcon from '@mui/icons-material/Folder';

const buttonRouteMap = {
  Dashboard: '/dashboard',
  Notifications: '/dashboard/notifications',
  Messages: '/dashboard/communication',
  Help: '/dashboard/help-documentation',
  'Academic Calendar': '/dashboard/academic-calendar',
  'Faculty Calendar': '/dashboard/faculty-calendar',
  'Quick Actions': '/dashboard',
  'Platform Status': '/dashboard/status',
  'System Tools': '/dashboard/tools',
  'University Settings': '/dashboard/university-settings',
};

const buttonIconMap = {
  Search: SearchIcon,
  Dashboard: DashboardIcon,
  Notifications: NotificationsIcon,
  Messages: MailIcon,
  Help: HelpOutlineIcon,
  'Academic Calendar': CalendarMonthIcon,
  'Faculty Calendar': CalendarTodayIcon,
  'Quick Actions': FlashOnIcon,
  'Platform Status': CloudIcon,
  'System Tools': BuildIcon,
  'University Settings': SettingsIcon,
};

export default function Navbar({ onMenuToggle }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const layoutConfig = getLayoutConfig(user?.role);

  const visibleButtons = (layoutConfig.navbar || []).filter(
    (item) => !['Profile', 'Logout', 'Search', 'Global Search'].includes(item)
  );

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleAction = (item) => {
    if (item === 'Help') {
      router.push('/dashboard/help-documentation');
      return;
    }

    const route = buttonRouteMap[item];
    if (route) {
      router.push(route);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (!user?.role) return undefined;

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const url = user.role === 'STUDENT'
          ? `${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000'}/api/student/notifications`
          : `${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000'}/api/admin/platform/notifications`;
        const resp = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        if (isMounted) {
          setNotificationCount(Array.isArray(body.data) ? body.data.length : 0);
        }
      } catch {
        if (isMounted) setNotificationCount(0);
      }
    };

    fetchNotifications();
    return () => { isMounted = false; };
  }, [user?.role]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    router.push(`/dashboard?search=${encodeURIComponent(query)}`);
  };

  return (
    <header className="border-b border-slate-200 bg-[var(--color-surface)] px-4 py-3 shadow-sm lg:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] transition hover:bg-[var(--color-muted)] lg:hidden"
            aria-label="Open navigation menu"
          >
            ☰
          </button>
          <div className="flex items-center gap-3">
            <Image src="/urmis.png" alt="URMIS logo" width={40} height={40} className="rounded-lg bg-white/10 p-1" />
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-[var(--color-text)]">URMIS</p>
              <p className="text-xs text-[var(--color-muted-text)]">Result management platform</p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form className="flex flex-1 min-w-0 items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 shadow-sm sm:max-w-xl" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search URMIS"
              className="min-w-0 flex-1 bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted-text)]"
            />
            <button type="submit" className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-800">
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            {visibleButtons.map((item) => {
              const ButtonIcon = buttonIconMap[item] || FolderIcon;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleAction(item)}
                  title={item}
                  aria-label={item}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-muted)] text-[var(--color-text)] transition hover:bg-[var(--color-background)]"
                >
                  <ButtonIcon className="h-5 w-5" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleAction('Notifications')}
            className="relative inline-flex h-11 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 text-sm text-[var(--color-text)] transition hover:bg-[var(--color-muted)]"
          >
            Notifications
            {notificationCount > 0 ? (
              <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-rose-500 px-2 text-xs font-semibold text-white">
                {notificationCount}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => handleAction('Messages')}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 text-sm text-[var(--color-text)] transition hover:bg-[var(--color-muted)]"
          >
            Messages
          </button>

          <button
            type="button"
            onClick={() => handleAction('Help')}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 text-sm text-[var(--color-text)] transition hover:bg-[var(--color-muted)]"
          >
            Help
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-11 items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm text-[var(--color-text)] transition hover:bg-[var(--color-muted)]"
              aria-expanded={menuOpen}
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {user?.name?.[0] || 'U'}
              </span>
              <span className="hidden sm:block text-left">
                <span className="block text-sm font-medium">{user?.name || 'User'}</span>
                <span className="block text-xs text-[var(--color-muted-text)]">{user?.role || 'Guest'}</span>
              </span>
            </button>

            {menuOpen ? (
              <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); router.push('/dashboard/profile'); }}
                  className="w-full px-4 py-3 text-left text-sm text-[var(--color-text)] transition hover:bg-[var(--color-muted)]"
                >
                  Profile
                </button>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); handleLogout(); }}
                  className="w-full px-4 py-3 text-left text-sm text-[var(--color-text)] transition hover:bg-[var(--color-muted)]"
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
