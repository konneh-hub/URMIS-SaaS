export const menuByRole = {
  SYSTEM_ADMIN: [
    { label: 'Dashboard', href: '/dashboard', slug: 'dashboard' },
    { label: 'University Management', href: '/dashboard/university-management', slug: 'university-management' },
    { label: 'University Administrators', href: '/dashboard/university-administrators', slug: 'university-administrators' },
    { label: 'Platform Users', href: '/dashboard/platform-users', slug: 'platform-users' },
    { label: 'Roles & Permissions', href: '/dashboard/roles-permissions', slug: 'roles-permissions' },
    { label: 'Subscription Management', href: '/dashboard/subscription-management', slug: 'subscription-management' },
    { label: 'Billing & Payments', href: '/dashboard/billing-payments', slug: 'billing-payments' },
    { label: 'Reports & Analytics', href: '/dashboard/reports-analytics', slug: 'reports-analytics' },
    { label: 'Monitoring', href: '/dashboard/monitoring', slug: 'monitoring' },
    { label: 'Audit Logs', href: '/dashboard/audit-logs', slug: 'audit-logs' },
    { label: 'Security Center', href: '/dashboard/security-center', slug: 'security-center' },
    { label: 'Notifications', href: '/dashboard/notifications', slug: 'notifications' },
    { label: 'Backups', href: '/dashboard/backups', slug: 'backups' },
    { label: 'Global Settings', href: '/dashboard/global-settings', slug: 'global-settings' },
    { label: 'Integrations', href: '/dashboard/integrations', slug: 'integrations' },
    { label: 'Help & Documentation', href: '/dashboard/help-documentation', slug: 'help-documentation' },
    { label: 'Profile', href: '/dashboard/profile', slug: 'profile' },
    { label: 'Logout', href: '/dashboard/logout', slug: 'logout' },
  ],
  UNIVERSITY_ADMIN: [
    { label: 'Dashboard', href: '/dashboard', slug: 'dashboard' },
    { label: 'Faculty Management', href: '/dashboard/faculty-management', slug: 'faculty-management' },
    { label: 'Department Management', href: '/dashboard/department-management', slug: 'department-management' },
    { label: 'Programme Management', href: '/dashboard/programme-management', slug: 'programme-management' },
    { label: 'Course Management', href: '/dashboard/course-management', slug: 'course-management' },
    { label: 'Academic Sessions', href: '/dashboard/academic-sessions', slug: 'academic-sessions' },
    { label: 'Semesters', href: '/dashboard/semesters', slug: 'semesters' },
    { label: 'Levels', href: '/dashboard/levels', slug: 'levels' },
    { label: 'Student Management', href: '/dashboard/student-management', slug: 'student-management' },
    { label: 'Staff Management', href: '/dashboard/staff-management', slug: 'staff-management' },
    { label: 'User Management', href: '/dashboard/user-management', slug: 'user-management' },
    { label: 'Role Management', href: '/dashboard/role-management', slug: 'role-management' },
    { label: 'Course Registration', href: '/dashboard/course-registration', slug: 'course-registration' },
    { label: 'Assessment Management', href: '/dashboard/assessment-management', slug: 'assessment-management' },
    { label: 'Result Management', href: '/dashboard/result-management', slug: 'result-management' },
    { label: 'Result Approval Workflow', href: '/dashboard/result-approval-workflow', slug: 'result-approval-workflow' },
    { label: 'Transcript Management', href: '/dashboard/transcript-management', slug: 'transcript-management' },
    { label: 'Graduation Management', href: '/dashboard/graduation-management', slug: 'graduation-management' },
    { label: 'Reports', href: '/dashboard/reports', slug: 'reports' },
    { label: 'Documents', href: '/dashboard/documents', slug: 'documents' },
    { label: 'Communication', href: '/dashboard/communication', slug: 'communication' },
    { label: 'Notifications', href: '/dashboard/notifications', slug: 'notifications' },
    { label: 'Help & Documentation', href: '/dashboard/help-documentation', slug: 'help-documentation' },
    { label: 'University Settings', href: '/dashboard/university-settings', slug: 'university-settings' },
    { label: 'Audit Logs', href: '/dashboard/audit-logs', slug: 'audit-logs' },
    { label: 'Profile', href: '/dashboard/profile', slug: 'profile' },
    { label: 'Logout', href: '/dashboard/logout', slug: 'logout' },
  ],
  DEAN: [
    { label: 'Dashboard', href: '/dashboard', slug: 'dashboard' },
    { label: 'Faculty Overview', href: '/dashboard/faculty-overview', slug: 'faculty-overview' },
    { label: 'Departments', href: '/dashboard/departments', slug: 'departments' },
    { label: 'Lecturers', href: '/dashboard/lecturers', slug: 'lecturers' },
    { label: 'Students', href: '/dashboard/students', slug: 'students' },
    { label: 'Course Management', href: '/dashboard/course-management', slug: 'course-management' },
    { label: 'Assessment Review', href: '/dashboard/assessment-review', slug: 'assessment-review' },
    { label: 'Result Approval', href: '/dashboard/result-approval', slug: 'result-approval' },
    { label: 'Faculty Reports', href: '/dashboard/faculty-reports', slug: 'faculty-reports' },
    { label: 'Faculty Statistics', href: '/dashboard/faculty-statistics', slug: 'faculty-statistics' },
    { label: 'Communication', href: '/dashboard/communication', slug: 'communication' },
    { label: 'Notifications', href: '/dashboard/notifications', slug: 'notifications' },
    { label: 'Profile', href: '/dashboard/profile', slug: 'profile' },
    { label: 'Logout', href: '/dashboard/logout', slug: 'logout' },
  ],
  HOD: [
    { label: 'Dashboard', href: '/dashboard', slug: 'dashboard' },
    { label: 'Department Overview', href: '/dashboard/department-overview', slug: 'department-overview' },
    { label: 'Lecturers', href: '/dashboard/lecturers', slug: 'lecturers' },
    { label: 'Students', href: '/dashboard/students', slug: 'students' },
    { label: 'Courses', href: '/dashboard/courses', slug: 'courses' },
    { label: 'Course Allocation', href: '/dashboard/course-allocation', slug: 'course-allocation' },
    { label: 'Assessment Review', href: '/dashboard/assessment-review', slug: 'assessment-review' },
    { label: 'Result Verification', href: '/dashboard/result-verification', slug: 'result-verification' },
    { label: 'Result Approval', href: '/dashboard/result-approval', slug: 'result-approval' },
    { label: 'Department Reports', href: '/dashboard/department-reports', slug: 'department-reports' },
    { label: 'Communication', href: '/dashboard/communication', slug: 'communication' },
    { label: 'Notifications', href: '/dashboard/notifications', slug: 'notifications' },
    { label: 'Profile', href: '/dashboard/profile', slug: 'profile' },
    { label: 'Logout', href: '/dashboard/logout', slug: 'logout' },
  ],
  LECTURER: [
    { label: 'Dashboard', href: '/dashboard', slug: 'dashboard' },
    { label: 'My Courses', href: '/dashboard/my-courses', slug: 'my-courses' },
    { label: 'Course Allocation', href: '/dashboard/course-allocation', slug: 'course-allocation' },
    { label: 'Student Lists', href: '/dashboard/student-lists', slug: 'student-lists' },
    { label: 'Assessment Management', href: '/dashboard/assessment-management', slug: 'assessment-management' },
    { label: 'Score Entry', href: '/dashboard/score-entry', slug: 'score-entry' },
    { label: 'Result Submission', href: '/dashboard/result-submission', slug: 'result-submission' },
    { label: 'Attendance', href: '/dashboard/attendance', slug: 'attendance' },
    { label: 'Reports', href: '/dashboard/reports', slug: 'reports' },
    { label: 'Communication', href: '/dashboard/communication', slug: 'communication' },
    { label: 'Notifications', href: '/dashboard/notifications', slug: 'notifications' },
    { label: 'Profile', href: '/dashboard/profile', slug: 'profile' },
    { label: 'Logout', href: '/dashboard/logout', slug: 'logout' },
  ],
  EXAM_OFFICER: [
    { label: 'Dashboard', href: '/dashboard', slug: 'dashboard' },
    { label: 'Result Processing', href: '/dashboard/result-processing', slug: 'result-processing' },
    { label: 'Result Verification', href: '/dashboard/result-verification', slug: 'result-verification' },
    { label: 'Result Publication', href: '/dashboard/result-publication', slug: 'result-publication' },
    { label: 'Result Corrections', href: '/dashboard/result-corrections', slug: 'result-corrections' },
    { label: 'Transcript Requests', href: '/dashboard/transcript-requests', slug: 'transcript-requests' },
    { label: 'Graduation Clearance', href: '/dashboard/graduation-clearance', slug: 'graduation-clearance' },
    { label: 'Academic Records', href: '/dashboard/academic-records', slug: 'academic-records' },
    { label: 'Reports', href: '/dashboard/reports', slug: 'reports' },
    { label: 'Audit Logs', href: '/dashboard/audit-logs', slug: 'audit-logs' },
    { label: 'Communication', href: '/dashboard/communication', slug: 'communication' },
    { label: 'Notifications', href: '/dashboard/notifications', slug: 'notifications' },
    { label: 'Profile', href: '/dashboard/profile', slug: 'profile' },
    { label: 'Logout', href: '/dashboard/logout', slug: 'logout' },
  ],
  EXAMINATION_OFFICER: [
    { label: 'Dashboard', href: '/dashboard', slug: 'dashboard' },
    { label: 'Result Processing', href: '/dashboard/result-processing', slug: 'result-processing' },
    { label: 'Result Verification', href: '/dashboard/result-verification', slug: 'result-verification' },
    { label: 'Result Publication', href: '/dashboard/result-publication', slug: 'result-publication' },
    { label: 'Result Corrections', href: '/dashboard/result-corrections', slug: 'result-corrections' },
    { label: 'Transcript Requests', href: '/dashboard/transcript-requests', slug: 'transcript-requests' },
    { label: 'Graduation Clearance', href: '/dashboard/graduation-clearance', slug: 'graduation-clearance' },
    { label: 'Academic Records', href: '/dashboard/academic-records', slug: 'academic-records' },
    { label: 'Reports', href: '/dashboard/reports', slug: 'reports' },
    { label: 'Audit Logs', href: '/dashboard/audit-logs', slug: 'audit-logs' },
    { label: 'Communication', href: '/dashboard/communication', slug: 'communication' },
    { label: 'Notifications', href: '/dashboard/notifications', slug: 'notifications' },
    { label: 'Profile', href: '/dashboard/profile', slug: 'profile' },
    { label: 'Logout', href: '/dashboard/logout', slug: 'logout' },
  ],
  STUDENT: [
    { label: 'Dashboard', href: '/dashboard', slug: 'dashboard' },
    { label: 'My Profile', href: '/dashboard/my-profile', slug: 'my-profile' },
    { label: 'Course Registration', href: '/dashboard/course-registration', slug: 'course-registration' },
    { label: 'Registered Courses', href: '/dashboard/registered-courses', slug: 'registered-courses' },
    { label: 'Assessments', href: '/dashboard/assessments', slug: 'assessments' },
    { label: 'Results', href: '/dashboard/results', slug: 'results' },
    { label: 'Transcript Requests', href: '/dashboard/transcript-requests', slug: 'transcript-requests' },
    { label: 'Academic History', href: '/dashboard/academic-history', slug: 'academic-history' },
    { label: 'Fee Status', href: '/dashboard/fee-status', slug: 'fee-status' },
    { label: 'Documents', href: '/dashboard/documents', slug: 'documents' },
    { label: 'Notifications', href: '/dashboard/notifications', slug: 'notifications' },
    { label: 'Help & Documentation', href: '/dashboard/help-documentation', slug: 'help-documentation' },
    { label: 'Support', href: '/dashboard/support', slug: 'support' },
    { label: 'Profile Settings', href: '/dashboard/profile-settings', slug: 'profile-settings' },
    { label: 'Logout', href: '/dashboard/logout', slug: 'logout' },
  ],
};

export function getMenuForRole(role) {
  const normalizedRole = String(role || 'STUDENT').toUpperCase().replace(/[-_ ]/g, '_');
  const baseMenu = menuByRole[normalizedRole] || menuByRole.STUDENT;
  const menu = [...baseMenu];

  if (!menu.some((item) => item.slug === 'help-documentation')) {
    const profileIndex = menu.findIndex((item) => item.slug === 'profile');
    const helpItem = { label: 'Help & Documentation', href: '/dashboard/help-documentation', slug: 'help-documentation' };

    if (profileIndex >= 0) {
      menu.splice(profileIndex, 0, helpItem);
    } else {
      menu.push(helpItem);
    }
  }

  return menu;
}

export function formatRoleLabel(role) {
  if (!role) return 'User';
  return String(role).replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}
