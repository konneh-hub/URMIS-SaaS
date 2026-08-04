"use client";

import Link from "next/link";
import MainLayout from "../src/shared/layouts/MainLayout";
import { useAuth } from "../src/shared/auth/AuthProvider";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <MainLayout>
      <div className="mx-auto flex max-w-5xl flex-col gap-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
            University Result Management Information System
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            A modern platform for academic result management
          </h1>
          <p className="max-w-3xl text-lg text-slate-600">
            URMIS is designed to help institutions manage students, courses, results,
            approvals, and academic reporting in a secure, scalable, and multi-tenant environment.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            {isAuthenticated ? "Open dashboard" : "Sign in"}
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Explore demo dashboard
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="font-semibold text-slate-900">Role-based access</h2>
            <p className="mt-2 text-sm text-slate-600">
              Support for system admins, university admins, exam officers, deans, HODs, lecturers, and students.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="font-semibold text-slate-900">Result workflow</h2>
            <p className="mt-2 text-sm text-slate-600">
              Manage marks entry, validation, approval, publishing, and student result visibility.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="font-semibold text-slate-900">Scalable foundation</h2>
            <p className="mt-2 text-sm text-slate-600">
              Built with Next.js and structured for future growth into a full institutional management suite.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
