"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Card from '../../../shared/components/ui/Card';
import Table from '../../../shared/components/ui/Table';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import MetricTile from '../../../shared/components/ui/MetricTile';
import Alert from '../../../shared/components/ui/Alert';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

function statusTone(status) {
  switch (status) {
    case 'PENDING': return 'warning';
    case 'APPROVED': return 'info';
    case 'PUBLISHED': return 'success';
    case 'CORRECTED': return 'success';
    default: return 'neutral';
  }
}

export default function ResultCorrections() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadResults() {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/admin/platform/results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await resp.json();
      if (body.success) setResults(body.data);
      else setError(body.message || 'Failed to load results');
    } catch (e) {
      setError('Could not reach the platform API.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResults();
  }, []);

  async function handleCorrection(id) {
    const newScore = window.prompt('Enter new score for correction:');
    if (!newScore) return;
    const scoreValue = Number(newScore);
    if (Number.isNaN(scoreValue)) return alert('Please enter a valid numeric score.');
    const remarks = window.prompt('Enter correction remarks (optional):', 'Correction requested by exam officer');

    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/admin/platform/results/${id}/correct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ score: scoreValue, remarks }),
      });
      const body = await resp.json();
      if (!body.success) throw new Error(body.message || 'Correction failed');
      loadResults();
    } catch (err) {
      setError(err.message || 'Correction failed');
    }
  }

  const needingCorrection = results.filter((r) => r.status === 'PUBLISHED' || r.status === 'APPROVED').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Corrections"
          title="Result Corrections"
          description="Apply corrections to published or approved results when issues are identified."
          badge={<Badge tone="info">{needingCorrection} items</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Correction candidates" value={needingCorrection} description="Results that may require updates" badgeTone="warning" badge="Review" />
          <MetricTile title="Total results" value={results.length} description="All results" badge="Total" />
          <MetricTile title="Published/results" value={results.filter((r) => r.status === 'PUBLISHED').length} description="Published results" badgeTone="success" badge="Published" />
        </div>

        <Card title="Corrections queue" description="Review results and submit correction requests for records that need updating.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading results...</p>
          ) : (
            <Table
              columns={[
                { header: 'Student', accessor: 'student', render: (_value, row) => row.student ? `${row.student.firstName} ${row.student.lastName}` : '—' },
                { header: 'Course', accessor: 'course', render: (_value, row) => row.course?.title || '—' },
                { header: 'Score', accessor: 'score' },
                { header: 'Grade', accessor: 'grade' },
                { header: 'Status', accessor: 'status', render: (value) => <Badge tone={statusTone(value)}>{value}</Badge> },
                {
                  header: 'Action',
                  accessor: 'id',
                  render: (_value, row) => (
                    <Button variant="secondary" size="sm" onClick={() => handleCorrection(row.id)}>Correct</Button>
                  ),
                },
              ]}
              rows={results}
              emptyText="No results available for correction."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
