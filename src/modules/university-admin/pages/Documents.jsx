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

function tone(type) {
  if (type === 'TRANSCRIPT') return 'info';
  if (type === 'CERTIFICATE') return 'success';
  if (type === 'ID') return 'warning';
  return 'neutral';
}

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const resp = await fetch(`${API_BASE}/api/admin/students`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        if (!cancelled) {
          if (body.success) {
            const docs = [];
            body.data.forEach((student) => {
              (student.documents || []).forEach((d) => {
                docs.push({ ...d, studentName: `${student.firstName} ${student.lastName}` });
              });
            });
            setDocuments(docs);
          } else {
            setError(body.message || 'Failed to load documents');
          }
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
          eyebrow="Records"
          title="Documents"
          description="Upload and organize institutional documents."
          badge={<Badge tone="info">{documents.length} documents</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Documents" value={documents.length} description="On file" badge="All" />
          <MetricTile title="Transcripts" value={documents.filter((d) => d.type === 'TRANSCRIPT').length} description="Academic transcripts" badgeTone="info" badge="Trans" />
          <MetricTile title="Certificates" value={documents.filter((d) => d.type === 'CERTIFICATE').length} description="Awarded certificates" badgeTone="success" badge="Certs" />
        </div>

        <Card title="Document registry" description="Documents associated with student records.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading documents...</p>
          ) : (
            <Table
              columns={[
                { header: 'Student', accessor: 'studentName' },
                { header: 'Type', accessor: 'type', render: (value) => <Badge tone={tone(value)}>{value}</Badge> },
                { header: 'Uploaded', accessor: 'uploadedAt', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
              ]}
              rows={documents}
              emptyText="No documents on file yet."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
