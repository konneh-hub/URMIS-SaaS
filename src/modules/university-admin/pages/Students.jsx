import React from 'react';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';

export default function Students() {
  return (
    <DashboardLayout>
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Students</h1>
        <p className="mt-2 text-sm text-slate-600">Student management placeholder.</p>
      </div>
    </DashboardLayout>
  );
}
