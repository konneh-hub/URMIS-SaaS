export const roleRoutes = {
  'system-admin': [
    { path: '/system-admin/dashboard', label: 'Dashboard' },
    { path: '/system-admin/institutions', label: 'Institutions' },
    { path: '/system-admin/create-institution', label: 'Create Institution' },
    { path: '/system-admin/users', label: 'Users' },
    { path: '/system-admin/reports', label: 'Reports' },
  ],
  'university-admin': [
    { path: '/university-admin/dashboard', label: 'Dashboard' },
    { path: '/university-admin/faculties', label: 'Faculties' },
    { path: '/university-admin/departments', label: 'Departments' },
    { path: '/university-admin/programmes', label: 'Programmes' },
    { path: '/university-admin/students', label: 'Students' },
    { path: '/university-admin/courses', label: 'Courses' },
    { path: '/university-admin/staff', label: 'Staff' },
  ],
  'examination-officer': [
    { path: '/examination-officer/dashboard', label: 'Dashboard' },
    { path: '/examination-officer/results', label: 'Results' },
    { path: '/examination-officer/approve-results', label: 'Approve Results' },
    { path: '/examination-officer/publish-results', label: 'Publish Results' },
    { path: '/examination-officer/reports', label: 'Reports' },
  ],
  dean: [
    { path: '/dean/dashboard', label: 'Dashboard' },
    { path: '/dean/review-results', label: 'Review Results' },
    { path: '/dean/approvals', label: 'Approvals' },
  ],
  hod: [
    { path: '/hod/dashboard', label: 'Dashboard' },
    { path: '/hod/courses', label: 'Courses' },
    { path: '/hod/lecturers', label: 'Lecturers' },
    { path: '/hod/review-results', label: 'Review Results' },
  ],
  lecturer: [
    { path: '/lecturer/dashboard', label: 'Dashboard' },
    { path: '/lecturer/courses', label: 'Courses' },
    { path: '/lecturer/students', label: 'Students' },
    { path: '/lecturer/enter-results', label: 'Enter Results' },
    { path: '/lecturer/submit-results', label: 'Submit Results' },
  ],
  student: [
    { path: '/student/dashboard', label: 'Dashboard' },
    { path: '/student/profile', label: 'Profile' },
    { path: '/student/results', label: 'Results' },
    { path: '/student/transcript', label: 'Transcript' },
  ],
};
