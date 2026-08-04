import React from 'react';
import DashboardCard from '../../../shared/components/DashboardCard';
import DataTable from '../../../shared/components/DataTable';

export default function UniversityAdminWidgets() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <DashboardCard title="Total Students" value="320" description="Enrolled students" />
        <DashboardCard title="Faculties" value="5" description="Academic faculties" />
        <DashboardCard title="Departments" value="12" description="Academic departments" />
        <DashboardCard title="Courses" value="48" description="Active courses" />
      </div>
      <DataTable
        columns={['Name', 'Status', 'Action']}
        rows={[
          { Name: 'Pending results', Status: '3 awaiting review', Action: 'Review' },
          { Name: 'Faculty approvals', Status: '2 pending', Action: 'Approve' },
        ]}
      />
    </div>
  );
}
