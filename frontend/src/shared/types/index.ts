export type UserRole =
  | 'system-admin'
  | 'university-admin'
  | 'examination-officer'
  | 'dean'
  | 'hod'
  | 'lecturer'
  | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  institutionId?: string;
}
