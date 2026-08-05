"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Card from '../../../shared/components/ui/Card';
import Table from '../../../shared/components/ui/Table';
import Badge from '../../../shared/components/ui/Badge';
import MetricTile from '../../../shared/components/ui/MetricTile';
import Alert from '../../../shared/components/ui/Alert';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

function actionTone(action) {
  if (action.includes('approved') || action.includes('published')) return 'success';
  if (action.includes('pending')) return 'warning';
  if (action.includes('rejected')) return 'danger';
  return 'info';
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const [resultsResp, transcriptResp, graduationResp] = await Promise.all([
          fetch(`${API_BASE}/api/admin/platform/results`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/admin/platform/transcript-requests`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/admin/platform/graduation-clearances`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const resultsBody = await resultsResp.json();
        const transcriptBody = await transcriptResp.json();
        const graduationBody = await graduationResp.json();

        if (!cancelled) {
          if (!resultsBody.success && !transcriptBody.success && !graduationBody.success) {
            setError('Failed to load audit log data');
            setLoading(false);
            return;
          }

          const entries = [];
          if (resultsBody.success) {
            resultsBody.data.forEach((item) => {
              entries.push({ timestamp: item.updatedAt || item.createdAt, actor: item.approvedBy?.email || 'Exam Office', action: `Result ${item.status.toLowerCase()}`, target: `${item.student?.firstName || ''} ${item.student?.lastName || ''}`.trim(), details: item.course?.title || 'Course record' });
            });
          }

          if (transcriptBody.success) {
            transcriptBody.data.forEach((request) => {
              entries.push({ timestamp: request.updatedAt || request.requestedAt, actor: request.requestedBy?.email || 'Exam Office', action: `Transcript ${request.status?.toLowerCase()}`, target: `${request.student?.firstName || ''} ${request.student?.lastName || ''}`.trim(), details: request.remarks || 'Transcript request' });
            });
          }

          if (graduationBody.success) {
            graduationBody.data.forEach((clearance) => {
              entries.push({ timestamp: clearance.updatedAt || clearance.createdAt, actor: clearance.clearedBy?.email || 'Exam Office', action: `Graduation ${clearance.status?.toLowerCase()}`, target: `${clearance.student?.firstName || ''} ${clearance.student?.lastName || ''}`.trim(), details: clearance.notes || 'Graduation clearance' });
            });
          }

          entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setLogs(entries);
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Compliance"
          title="Audit Logs"
          description="Review key exam office actions and status changes in the academic workflow."
          badge={<Badge tone="info">{logs.length} events</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Events" value={logs.length} description="Recent activity" badge="Events" />
          <MetricTile title="Result changes" value={logs.filter((entry) => entry.action.includes('result')).length} description="Result workflow events" badgeTone="info" badge="Results" />
          <MetricTile title="Requests" value={logs.filter((entry) => entry.action.includes('transcript') || entry.action.includes('graduation')).length} description="Transcript and clearance events" badgeTone="success" badge="Requests" />
        </div>

        <Card title="Activity log" description="Audit-style event history generated from exam office actions.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading activity audit logs...</p>
          ) : (
            <Table
              columns={[
                { header: 'Date', accessor: 'timestamp', render: (value) => value ? new Date(value).toLocaleString() : '—' },
                { header: 'Actor', accessor: 'actor' },
                { header: 'Action', accessor: 'action', render: (value) => <Badge tone={actionTone(value)}>{value}</Badge> },
                { header: 'Target', accessor: 'target' },
                { header: 'Details', accessor: 'details' },
              ]}
              rows={logs}
              emptyText="No audit events available."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
