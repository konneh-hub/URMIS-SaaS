import React from 'react';
import DashboardCard from '../../../shared/components/DashboardCard';
import Charts from '../../../shared/components/Charts';

export default function SystemAdminWidgets() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard title="Total Institutions" value="12" description="Active tenants" />
        <DashboardCard title="Active Users" value="184" description="Platform users" />
        <DashboardCard title="Subscription Statistics" value="87%" description="Renewal rate" />
      </div>
      <Charts />
    </div>
  );
}
