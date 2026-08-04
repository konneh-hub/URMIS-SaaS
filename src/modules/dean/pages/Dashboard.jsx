import React from 'react';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';

export default function DeanDashboard() {
  return (
    <DashboardLayout>
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Dean Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">Placeholder dashboard for faculty oversight.</p>
      </div>
    </DashboardLayout>
  );
}
