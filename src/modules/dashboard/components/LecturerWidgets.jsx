import React from 'react';
import DashboardCard from '../../../shared/components/DashboardCard';
import DataTable from '../../../shared/components/DataTable';

export default function LecturerWidgets() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard title="Assigned Courses" value="4" description="Current teaching load" />
        <DashboardCard title="Student Lists" value="120" description="Students under your courses" />
        <DashboardCard title="Result Entry Status" value="85%" description="Completion progress" />
      </div>
      <DataTable
        columns={['Course', 'Status', 'Action']}
        rows={[
          { Course: 'CSC 101', Status: 'Draft', Action: 'Continue' },
          { Course: 'MAT 201', Status: 'Submitted', Action: 'View' },
        ]}
      />
    </div>
  );
}
