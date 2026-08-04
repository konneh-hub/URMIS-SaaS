"use client";

import React from 'react';
import { useAuth } from '../../src/shared/auth/AuthProvider';
import ProtectedRoute from '../../src/shared/auth/ProtectedRoute';
import DashboardLayout from '../../src/shared/layouts/DashboardLayout';
import PermissionGuard from '../../src/shared/guards/PermissionGuard';
import SystemAdminWidgets from '../../src/modules/dashboard/components/SystemAdminWidgets';
import UniversityAdminWidgets from '../../src/modules/dashboard/components/UniversityAdminWidgets';
import LecturerWidgets from '../../src/modules/dashboard/components/LecturerWidgets';
import StudentWidgets from '../../src/modules/dashboard/components/StudentWidgets';
import { getLayoutConfig } from '../../src/shared/layoutConfig';

export default function DashboardPage() {
  const { user } = useAuth() as {
    user?: { role?: string; name?: string; institution_id?: string };
  };

  const role = user?.role || 'STUDENT';
  const layoutConfig = getLayoutConfig(role);

  return (
    <ProtectedRoute fallback={null}>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
              URMIS Dashboard
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">
              Welcome back, {user?.name || 'User'}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Role: {role} · Institution: {user?.institution_id || 'N/A'}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">Role-based dashboard modules</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {layoutConfig.cards.map((card: string) => (
                <div key={card} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  {card}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">Charts available to this role</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {layoutConfig.charts.map((chart: string) => (
                <span key={chart} className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-700">
                  {chart}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">Quick actions</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {layoutConfig.quickActions.map((action: string) => (
                <button key={action} className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
                  {action}
                </button>
              ))}
            </div>
          </div>

          {role === 'SYSTEM_ADMIN' ? <SystemAdminWidgets /> : null}
          {role === 'UNIVERSITY_ADMIN' ? <UniversityAdminWidgets /> : null}
          {role === 'LECTURER' ? <LecturerWidgets /> : null}
          {role === 'STUDENT' ? <StudentWidgets /> : null}

          <PermissionGuard permission="ENTER_RESULTS">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-slate-900">Result Entry Panel</h2>
              <p className="mt-2 text-sm text-slate-600">Permission-gated result entry area.</p>
            </div>
          </PermissionGuard>

          <PermissionGuard permission="VIEW_RESULTS">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-slate-900">Results Access</h2>
              <p className="mt-2 text-sm text-slate-600">Results module is available for your role.</p>
            </div>
          </PermissionGuard>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
