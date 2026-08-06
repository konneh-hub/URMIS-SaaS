export const permissions = {
  SYSTEM_ADMIN: [
    'CREATE_INSTITUTION',
    'MANAGE_SUBSCRIPTIONS',
    'VIEW_PLATFORM_ANALYTICS',
    'MANAGE_USERS',
    'VIEW_ALL_INSTITUTIONS',
  ],
  UNIVERSITY_ADMIN: [
    'MANAGE_STUDENTS',
    'MANAGE_COURSES',
    'MANAGE_DEPARTMENTS',
    'MANAGE_FACULTIES',
    'VIEW_RESULTS',
  ],
  EXAM_OFFICER: [
    'VERIFY_RESULTS',
    'PUBLISH_RESULTS',
    'VIEW_EXAM_REPORTS',
  ],
  DEAN: ['APPROVE_FACULTY_RESULTS', 'VIEW_FACULTY_REPORTS'],
  HOD: ['REVIEW_RESULTS', 'ASSIGN_COURSES', 'VIEW_DEPARTMENT_RESULTS'],
  LECTURER: ['ENTER_RESULTS', 'SUBMIT_RESULTS', 'VIEW_ASSIGNED_COURSES', 'VIEW_RESULTS'],
  STUDENT: ['VIEW_RESULTS', 'VIEW_TRANSCRIPT', 'VIEW_PROFILE'],
};

export function getRolePermissions(role) {
  const normalizedRole = String(role || 'STUDENT').toUpperCase().replace(/[-_ ]/g, '_');
  return permissions[normalizedRole] || permissions.STUDENT;
}

export function hasPermission(user, permission) {
  if (!user?.permissions) return false;
  return user.permissions.includes(permission);
}
