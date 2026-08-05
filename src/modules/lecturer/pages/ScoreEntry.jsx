"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Card from '../../../shared/components/ui/Card';
import Table from '../../../shared/components/ui/Table';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import MetricTile from '../../../shared/components/ui/MetricTile';
import Alert from '../../../shared/components/ui/Alert';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function ScoreEntry() {
  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

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
          if (body.success) setStudents(body.data);
          else setError(body.message || 'Failed to load students');
        }
      } catch (e) {
        if (!cancelled) setError('Could not reach the platform API.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function handleScoreChange(studentId, value) {
    setScores((prev) => ({ ...prev, [studentId]: value }));
    setSaved(false);
  }

  async function handleSave() {
    try {
      const token = localStorage.getItem('accessToken');
      const entries = Object.entries(scores).map(([studentId, score]) => ({ studentId, score: Number(score) }));
      for (const entry of entries) {
        await fetch(`${API_BASE}/api/admin/platform/assessments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title: `Score entry ${entry.studentId}`, type: 'SCORE', ...entry }),
        });
      }
      setSaved(true);
    } catch (e) {
      setError('Could not save scores');
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Marks Entry"
          title="Score Entry"
          description="Enter and update assessment scores for your students."
          badge={<Badge tone="info">{students.length} students</Badge>}
          actions={<Button variant="primary" size="sm" onClick={handleSave}>Save scores</Button>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}
        {saved ? <Alert title="Saved" tone="success">Scores saved successfully.</Alert> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <MetricTile title="Students" value={students.length} description="Ready for entry" badge="All" />
          <MetricTile title="Entered" value={Object.keys(scores).length} description="Scores provided" badgeTone="success" badge="Entered" />
          <MetricTile title="Remaining" value={students.length - Object.keys(scores).length} description="Awaiting entry" badgeTone="warning" badge="Pending" />
        </div>

        <Card title="Score sheet" description="Enter marks for each enrolled student.">
          {loading ? (
            <p className="text-sm text-[var(--color-muted-text)]">Loading students...</p>
          ) : (
            <Table
              columns={[
                { header: 'Name', accessor: 'name', render: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || value || '—' },
                { header: 'Matric', accessor: 'matricNumber', render: (value) => value || '—' },
                { header: 'Score', accessor: 'score', render: (_v, row) => (
                  <Input
                    type="number"
                    value={scores[row.id] ?? ''}
                    onChange={(e) => handleScoreChange(row.id, e.target.value)}
                    className="w-24"
                  />
                ) },
              ]}
              rows={students}
              emptyText="No students available for score entry."
            />
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
