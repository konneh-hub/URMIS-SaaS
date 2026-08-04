"use client";

import Link from "next/link";
import MainLayout from "../src/shared/layouts/MainLayout";
import { useAuth } from "../src/shared/auth/AuthProvider";
import Button from "../src/shared/components/ui/Button";
import Card from "../src/shared/components/ui/Card";
import PageHeader from "../src/shared/components/ui/PageHeader";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Enterprise academic platform"
          title="Modern multi-tenant SaaS for higher education operations"
          description="URMIS unifies student records, course administration, assessment workflows, approvals, transcripts, and reporting in a single responsive experience."
          actions={[
            <Link key="signin" href={isAuthenticated ? "/dashboard" : "/login"}>
              <Button variant="primary">{isAuthenticated ? "Open dashboard" : "Sign in"}</Button>
            </Link>,
            <Link key="explore" href="/dashboard">
              <Button variant="secondary">Explore demo dashboard</Button>
            </Link>,
          ]}
        />

        <div className="grid gap-4 lg:grid-cols-3">
          <Card title="Role-based access" description="Support for system admins, university admins, exam officers, deans, HODs, lecturers, and students.">
            <p className="text-sm text-[var(--color-muted-text)]">Every role can access the modules and workflows that matter to their responsibilities.</p>
          </Card>
          <Card title="Result workflow" description="Manage marks entry, validation, approval, publishing, and student result visibility.">
            <p className="text-sm text-[var(--color-muted-text)]">The experience adapts from mobile to large screens without losing clarity or control.</p>
          </Card>
          <Card title="Scalable foundation" description="Built with Next.js and structured for future growth into a full institutional management suite.">
            <p className="text-sm text-[var(--color-muted-text)]">A design system, responsive layout, and token-driven UI keep the platform consistent as it scales.</p>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
