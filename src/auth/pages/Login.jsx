"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../shared/auth/AuthProvider';

const roleProfiles = {
  LECTURER: {
    id: 'lecturer-demo',
    name: 'Amina Yusuf',
    email: 'amina@urmis.edu',
    role: 'LECTURER',
    institution_id: 'inst-demo',
    permissions: ['VIEW_ASSIGNED_COURSES', 'ENTER_RESULTS', 'SUBMIT_RESULTS', 'VIEW_RESULTS'],
  },
  UNIVERSITY_ADMIN: {
    id: 'admin-demo',
    name: 'Grace Okafor',
    email: 'grace@urmis.edu',
    role: 'UNIVERSITY_ADMIN',
    institution_id: 'inst-demo',
    permissions: ['MANAGE_STUDENTS', 'MANAGE_COURSES', 'MANAGE_DEPARTMENTS', 'MANAGE_FACULTIES', 'VIEW_RESULTS'],
  },
  STUDENT: {
    id: 'student-demo',
    name: 'Bola Ade',
    email: 'bola@student.urmis.edu',
    role: 'STUDENT',
    institution_id: 'inst-demo',
    permissions: ['VIEW_RESULTS', 'VIEW_TRANSCRIPT', 'VIEW_PROFILE'],
  },
};

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState('LECTURER');

  const handleSubmit = (event) => {
    event.preventDefault();
    login(roleProfiles[selectedRole]);
    router.push('/dashboard');
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">URMIS</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">Sign in to continue</h1>
        <p className="mt-2 text-sm text-slate-600">Choose a demo role to explore the unified dashboard experience.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Demo role
            <select
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="LECTURER">Lecturer</option>
              <option value="UNIVERSITY_ADMIN">University Admin</option>
              <option value="STUDENT">Student</option>
            </select>
          </label>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Continue to dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
