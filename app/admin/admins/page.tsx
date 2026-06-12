'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminHeader } from '@/components/Header';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export default function ManageAdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Add-admin form state
  const [name, setName]                   = useState('');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [confirmPw, setConfirmPw]         = useState('');
  const [saving, setSaving]     = useState(false);
  const [formError, setFormError] = useState('');
  const [formOk, setFormOk]     = useState('');

  const [deleting, setDeleting] = useState<string | null>(null);

  async function fetchAdmins() {
    setLoading(true);
    const res = await fetch('/api/admin/list');
    if (res.ok) setAdmins(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchAdmins(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setFormOk('');
    if (!name.trim() || !email.trim() || !password.trim()) { setFormError('All fields are required.'); return; }
    if (password.length < 8) { setFormError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPw) { setFormError('Passwords do not match.'); return; }
    setSaving(true);
    const res = await fetch('/api/admin/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
    });
    setSaving(false);
    const data = await res.json();
    if (!res.ok) { setFormError(data.error ?? 'Failed to create admin.'); return; }
    setFormOk(`✅ Admin "${name.trim()}" created successfully.`);
    setName(''); setEmail(''); setPassword(''); setConfirmPw('');
    fetchAdmins();
  }

  async function handleDelete(admin: AdminUser) {
    if (!confirm(`Remove admin "${admin.name}" (${admin.email})?`)) return;
    setDeleting(admin.id);
    const res = await fetch(`/api/admin/delete/${admin.id}`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) { alert(data.error ?? 'Failed to remove admin.'); }
    else fetchAdmins();
    setDeleting(null);
  }

  return (
    <div className="page-container">
      <AdminHeader title="Manage Admins" />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px' }}>

        {/* Current admins */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--bcc-navy)' }}>
            Current Admins ({admins.length})
          </h2>
          {loading ? (
            <p className="text-gray-400">Loading…</p>
          ) : admins.length === 0 ? (
            <p className="text-gray-400">No admins found.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {admins.map(a => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-4 p-3 rounded-xl"
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                  <div>
                    <p className="font-bold" style={{ color: 'var(--bcc-navy)' }}>{a.name}</p>
                    <p className="text-sm text-gray-500">{a.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Added {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(a)}
                    disabled={deleting === a.id || admins.length <= 1}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all"
                    style={{
                      borderColor: '#dc2626',
                      color: '#dc2626',
                      background: 'white',
                      opacity: (deleting === a.id || admins.length <= 1) ? 0.4 : 1,
                      cursor: admins.length <= 1 ? 'not-allowed' : 'pointer',
                    }}
                    title={admins.length <= 1 ? 'Cannot remove the last admin' : ''}
                  >
                    {deleting === a.id ? 'Removing…' : 'Remove'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add new admin */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--bcc-navy)' }}>
            Add New Admin
          </h2>

          {formError && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#fee2e2', color: '#991b1b' }}>
              {formError}
            </div>
          )}
          {formOk && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#dcfce7', color: '#166534' }}>
              {formOk}
            </div>
          )}

          <form onSubmit={handleAdd}>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block font-bold mb-1">Full Name</label>
                <input className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="Jean Mutoni" />
              </div>
              <div className="flex-1">
                <label className="block font-bold mb-1">Email</label>
                <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} placeholder="jean@bcc.org" />
              </div>
            </div>
            <div className="flex gap-4 mb-5">
              <div className="flex-1">
                <label className="block font-bold mb-1">Password</label>
                <input type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" />
              </div>
              <div className="flex-1">
                <label className="block font-bold mb-1">Confirm Password</label>
                <input type="password" className="input-field" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat password" />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={saving} style={{ width: 'auto' }}>
              {saving ? 'Creating…' : 'Add Admin →'}
            </button>
          </form>
        </div>

        <div className="mt-6">
          <Link href="/admin/dashboard" className="btn-outline" style={{ display: 'inline-block', width: 'auto', textDecoration: 'none' }}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
