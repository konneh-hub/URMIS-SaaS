"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../shared/auth/AuthProvider';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Card from '../../../shared/components/ui/Card';
import Table from '../../../shared/components/ui/Table';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import MetricTile from '../../../shared/components/ui/MetricTile';
import Alert from '../../../shared/components/ui/Alert';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

function typeTone(type) {
  switch (type) {
    case 'TRANSCRIPT': return 'info';
    case 'CERTIFICATE': return 'success';
    case 'ID': return 'warning';
    case 'LETTER': return 'neutral';
    default: return 'neutral';
  }
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return isNaN(d) ? '—' : d.toLocaleDateString();
}

export default function Documents() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const resp = await fetch(`${API_BASE}/api/institution/student/documents`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await resp.json();
        if (!cancelled) {
          setDocuments(Array.isArray(body) ? body : (body.data || []));
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.email]);

  const transcripts = documents.filter((d) => d.type === 'TRANSCRIPT').length;
  const certificates = documents.filter((d) => d.type === 'CERTIFICATE').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Records"
          title="Documents"
          description="Your official academic documents and certificates."
          badge={<Badge tone="info">{documents.length} documents</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Documents" value={documents.length} description="On file" badge="All" />
          <MetricTile title="Transcripts" value={transcripts} description="Academic transcripts" badgeTone="info" badge="Trans" />
          <MetricTile title="Certificates" value={certificates} description="Awarded certificates" badgeTone="success" badge="Certs" />
        </div>

        <Card title="My documents" description="Documents issued to you by the university.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading documents...</p>
          ) : (
            <Table
              columns={[
                { header: 'Document', accessor: 'name', render: (_v, row) => row.name || row.type || '—' },
                { header: 'Type', accessor: 'type', render: (value) => <Badge tone={typeTone(value)}>{value || '—'}</Badge> },
                { header: 'Issued', accessor: 'issuedAt', render: formatDate },
                { header: 'Action', accessor: 'id', render: () => <Button variant="secondary" size="sm">Download</Button> },
              ]}
              rows={documents}
              emptyText="No documents available yet."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
