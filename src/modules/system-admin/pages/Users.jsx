import React from 'react';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';

export default function Users() {
  return (
    <DashboardLayout>
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Users</h1>
        <p className="mt-2 text-sm text-slate-600">User management placeholder.</p>
      </div>
    </DashboardLayout>
  );
}
