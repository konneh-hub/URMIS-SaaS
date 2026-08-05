"use client";

import React, { useState } from 'react';
import DashboardLayout from '../../../shared/layouts/DashboardLayout';
import PageHeader from '../../../shared/components/ui/PageHeader';
import Card from '../../../shared/components/ui/Card';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import Input from '../../../shared/components/ui/Input';
import Alert from '../../../shared/components/ui/Alert';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

export default function CreateInstitution() {
  const [form, setForm] = useState({ name: '', code: '', domain: '', email: '', phone: '', address: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('accessToken');
      const resp = await fetch(`${API_BASE}/api/institutions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const body = await resp.json();
      if (body.success) {
        setSuccess(`Institution "${form.name}" created successfully.`);
        setForm({ name: '', code: '', domain: '', email: '', phone: '', address: '' });
      } else {
        setError(body.message || 'Failed to create institution');
      }
    } catch (e) {
      setError('Could not create institution');
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Onboarding"
          title="Create Institution"
          description="Provision a new university tenant on the platform."
          badge={<Badge tone="info">New tenant</Badge>}
        />

        {error ? <Alert title="Error" tone="danger">{error}</Alert> : null}
        {success ? <Alert title="Success" tone="success">{success}</Alert> : null}

        <div className="max-w-3xl">
          <Card title="Institution details" description="Provide the basic details for the new tenant.">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Institution name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
                <Input label="Domain" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} required />
              </div>
              <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <div className="flex justify-end gap-2">
                <Button type="submit" variant="primary" size="sm">Create institution</Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
