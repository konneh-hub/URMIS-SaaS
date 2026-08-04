import React from 'react';
import DashboardCard from '../../../shared/components/DashboardCard';

export default function StudentWidgets() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <DashboardCard title="GPA" value="4.56" description="Current academic standing" />
      <DashboardCard title="Published Results" value="8" description="Available results" />
      <DashboardCard title="Transcript Status" value="Ready" description="Transcript is available" />
    </div>
  );
}
