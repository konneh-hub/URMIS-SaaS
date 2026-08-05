"use client";

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Card from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import Alert from '../../../shared/components/ui/Alert';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function UniversitySettings() {
  const [settings, setSettings] = useState({ timezone: 'UTC', locale: 'en', language: 'en', theme: 'default', currency: 'USD' });
  const [institutionId, setInstitutionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };
        const resp = await fetch(`${API_BASE}/api/institutions`, { headers });
        const body = await resp.json();
        if (!cancelled) {
          if (body.success && body.data.length > 0) {
            const inst = body.data[0];
            setInstitutionId(inst.id);
            if (inst.settings) setSettings(inst.settings);
          } else if (!body.success) {
            setError(body.message || 'Failed to load settings');
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

  async function handleSave(e) {
    e.preventDefault();
    setSaved(false);
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/institutions/${institutionId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      const body = await resp.json();
      if (body.success) setSaved(true);
      else setError(body.message || 'Failed to save settings');
    } catch (err) {
      setError('Could not save settings');
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Configuration"
          title="University Settings"
          description="Configure university preferences."
          badge={<Badge tone="info">Institution-wide</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}
        {saved ? <Alert title="Saved" tone="success">University settings updated successfully.</Alert> : null}

        <div className="max-w-3xl">
          <Card title="University preferences" description="Default settings applied to your institution.">
            {loading ? (
              <p className="text-sm text-[var(--color-muted-text)]">Loading settings...</p>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Timezone" value={settings.timezone || ''} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} />
                  <Input label="Locale" value={settings.locale || ''} onChange={(e) => setSettings({ ...settings, locale: e.target.value })} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input label="Language" value={settings.language || ''} onChange={(e) => setSettings({ ...settings, language: e.target.value })} />
                  <Input label="Currency" value={settings.currency || ''} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} />
                </div>
                <Input label="Theme" value={settings.theme || ''} onChange={(e) => setSettings({ ...settings, theme: e.target.value })} />
                <div className="flex justify-end gap-2">
                  <Button type="submit" variant="primary" size="sm">Save settings</Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
