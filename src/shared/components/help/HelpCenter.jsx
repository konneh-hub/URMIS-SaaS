"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../auth/AuthProvider';
import DashboardLayout from '../../layouts/DashboardLayout';
import PageHeader from '../ui/PageHeader';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Table from '../ui/Table';
import Alert from '../ui/Alert';

const faqItems = [
  {
    question: 'How do I access role-specific guidance?',
    answer: 'Use the Help Center to learn the workflows and responsibilities for your role. The content adapts automatically to your current role.',
  },
  {
    question: 'Where can I submit a support ticket?',
    answer: 'Students can submit tickets directly from the Support page. Other users can contact support by email or through your institution’s help desk channel.',
  },
  {
    question: 'What should I do if I cannot find a feature?',
    answer: 'Search the dashboard or use the Help button in the top bar. If the feature is still missing, contact support with your role and the page you were trying to access.',
  },
  {
    question: 'How can I get the fastest response?',
    answer: 'Include your institution name, role, and a short description of the issue when contacting support. Attach screenshots for UI issues when possible.',
  },
];

const roleHelpContent = {
  SYSTEM_ADMIN: {
    title: 'Platform operations and governance',
    description: 'Monitor university tenants, manage users, review audit logs, and enforce access controls across the entire platform.',
    highlights: [
      'Manage universities, administrators, and platform users.',
      'Monitor subscriptions, auditors, and security alerts.',
      'Use the Help Center to review governance guides and onboarding workflows.',
    ],
  },
  UNIVERSITY_ADMIN: {
    title: 'University administration guidance',
    description: 'Manage institution structures, faculties, departments, and academic operations while staying aligned with university policies.',
    highlights: [
      'Create and maintain faculties, departments, and programmes.',
      'Manage academic sessions, course catalogues, and student records.',
      'Review institution analytics and internal communications.',
    ],
  },
  DEAN: {
    title: 'Faculty leadership support',
    description: 'Coordinate faculty operations, review assessments, and approve academic results in one place.',
    highlights: [
      'Review faculty performance, pending results, and student progress.',
      'Approve academic workflows and communicate with lecturers.',
      'Access the Help Center for faculty-specific best practices.',
    ],
  },
  HOD: {
    title: 'Department leadership resources',
    description: 'Manage department workflows, oversee courses and results, and support lecturers and students effectively.',
    highlights: [
      'Review department performance, course allocations, and pending approvals.',
      'Coordinate results verification and department reporting.',
      'Access role-specific guidance for department leadership tasks.',
    ],
  },
  LECTURER: {
    title: 'Teaching and assessment help',
    description: 'Find guidance for course management, score entry, result submission, and student communications.',
    highlights: [
      'Manage your assigned courses and student lists.',
      'Submit scores, track assessment status, and view result workflows.',
      'Access quick help for teaching and examination tasks.',
    ],
  },
  EXAM_OFFICER: {
    title: 'Examination office workflows',
    description: 'Manage result processing, transcript requests, and graduation clearance with step-by-step assistance.',
    highlights: [
      'Process and verify results through the exam workflow.',
      'Manage transcript requests, publication, and graduation clearance.',
      'Use the Help Center to align with institutional exam policies.',
    ],
  },
  STUDENT: {
    title: 'Student support and documentation',
    description: 'Submit support tickets, check your academic progress, and learn how to use URMIS efficiently.',
    highlights: [
      'Track your registrations, results, transcripts, and fee status.',
      'Open support tickets for account or academic issues.',
      'Use the Help Center for student-facing guides and FAQs.',
    ],
  },
};

function formatRole(role) {
  if (!role) return 'User';
  return String(role).replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function HelpCenter() {
  const router = useRouter();
  const { user } = useAuth();
  const rawRole = (user?.role || 'STUDENT').toUpperCase().replace(/[-_ ]/g, '_');
  const role = rawRole === 'EXAMINATION_OFFICER' ? 'EXAM_OFFICER' : rawRole;
  const help = roleHelpContent[role] || roleHelpContent.STUDENT;
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@urmis.com';
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(role === 'STUDENT');
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (role !== 'STUDENT') {
      setLoading(false);
      return undefined;
    }

    async function fetchTickets() {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000'}/api/institution/student/support-tickets`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await response.json();
        if (!cancelled) {
          setTickets(Array.isArray(body) ? body : body.data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Unable to load your support tickets at this time.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTickets();
    return () => {
      cancelled = true;
    };
  }, [role]);

  const openTickets = tickets.filter((ticket) => ticket.status === 'OPEN').length;
  const resolvedTickets = tickets.filter((ticket) => ticket.status === 'RESOLVED').length;

  const supportAction = () => {
    if (role === 'STUDENT') {
      router.push('/dashboard/support');
      return;
    }

    window.location.href = `mailto:${supportEmail}?subject=${encodeURIComponent('URMIS Help Center Request')}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Help Center"
          title="Help & Support"
          description="Role-aware support, documentation, and guidance for your URMIS experience."
          badge={<Badge tone="info">{formatRole(role)} help</Badge>}
          actions={(
            <Button variant="secondary" size="sm" onClick={supportAction}>
              {role === 'STUDENT' ? 'Open student ticket' : 'Contact support'}
            </Button>
          )}
        />

        <div className="grid gap-4 xl:grid-cols-[0.65fr_0.35fr]">
          <Card title={help.title} description={help.description}>
            <ul className="space-y-2 text-sm text-[var(--color-muted-text)]">
              {help.highlights.map((item) => (
                <li key={item} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Support resources" description="Quick access to the most common help tools.">
            <div className="space-y-4 text-sm text-[var(--color-muted-text)]">
              <div>
                <p className="font-semibold text-[var(--color-text)]">Find answers fast</p>
                <p className="mt-2">Browse role-specific guides, FAQs, and common workflows below.</p>
              </div>

              <div>
                <p className="font-semibold text-[var(--color-text)]">Support email</p>
                <p className="mt-1 break-all text-sm text-[var(--color-muted-text)]">
                  <a href={`mailto:${supportEmail}`} className="text-slate-100 underline">{supportEmail}</a>
                </p>
              </div>

              {role === 'STUDENT' ? (
                <div>
                  <p className="font-semibold text-[var(--color-text)]">Ticket submission</p>
                  <p className="mt-1">Submit a ticket for student account or academic issues.</p>
                </div>
              ) : (
                <div>
                  <p className="font-semibold text-[var(--color-text)]">Institution support</p>
                  <p className="mt-1">Contact your institution support team or send a request directly to the URMIS support desk.</p>
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="primary" onClick={supportAction}>
                {role === 'STUDENT' ? 'Open student ticket' : 'Email support'}
              </Button>
              {role === 'STUDENT' ? (
                <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/support')}>
                  View my tickets
                </Button>
              ) : null}
            </div>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          {faqItems.map((faq) => (
            <Card key={faq.question} title={faq.question} description={faq.answer} />
          ))}
        </div>

        {role === 'STUDENT' ? (
          <Card title="Support ticket summary" description="Your recent support requests and current statuses.">
            {error ? <Alert title="Support error" tone="danger">{error}</Alert> : null}
            {loading ? (
              <p className="text-sm text-[var(--color-muted-text)]">Loading ticket history…</p>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <Card title="Total tickets" description={`${tickets.length}`} className="bg-[var(--color-background)]" />
                  <Card title="Open" description={`${openTickets}`} className="bg-[var(--color-background)]" />
                  <Card title="Resolved" description={`${resolvedTickets}`} className="bg-[var(--color-background)]" />
                </div>
                <Table
                  columns={[
                    { header: 'Subject', accessor: 'subject' },
                    { header: 'Status', accessor: 'status', render: (status) => <Badge tone={status === 'RESOLVED' ? 'success' : status === 'OPEN' ? 'warning' : 'info'}>{status}</Badge> },
                    { header: 'Created', accessor: 'createdAt', render: (value) => (value ? new Date(value).toLocaleDateString() : '—') },
                  ]}
                  rows={tickets}
                  emptyText="No support tickets found."
                />
              </div>
            )}
          </Card>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
