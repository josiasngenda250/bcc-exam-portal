'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminHeader } from '@/components/Header';
import type { Promotion } from '@/lib/types';

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [legacyCount, setLegacyCount] = useState(0);
  const [loading, setLoading]  = useState(true);
  const [activating, setActivating] = useState<string | null>(null);

  // Create form
  const currentYear = new Date().getFullYear();
  const [year,      setYear]      = useState(currentYear);
  const [number,    setNumber]    = useState(1);
  const [customName, setCustomName] = useState('');
  const [setActive, setSetActive] = useState(true);
  const [creating,  setCreating]  = useState(false);
  const [createErr, setCreateErr] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/promotions');
    const data = await res.json();
    setPromotions(data.promotions ?? []);
    setLegacyCount(data.legacyCount ?? 0);
    // Auto-set the next number
    const yearPromotions = (data.promotions ?? []).filter((p: Promotion) => p.year === year);
    setNumber(yearPromotions.length + 1);
    setLoading(false);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Recompute next number when year changes
  useEffect(() => {
    const yearPromotions = promotions.filter(p => p.year === year);
    setNumber(yearPromotions.length + 1);
  }, [year, promotions]);

  const autoName = `${year} — Promotion ${number}`;
  const finalName = customName.trim() || autoName;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateErr('');
    setCreating(true);
    const res = await fetch('/api/admin/promotions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: finalName, year, number, setActive }),
    });
    const data = await res.json();
    if (!res.ok) { setCreateErr(data.error ?? 'Failed to create'); setCreating(false); return; }
    setCustomName('');
    await load();
    setCreating(false);
  }

  async function handleActivate(id: string) {
    setActivating(id);
    await fetch(`/api/admin/promotions/${id}/activate`, { method: 'POST' });
    await load();
    setActivating(null);
  }

  const active = promotions.find(p => p.isActive);
  const totalMembers = promotions.reduce((s, p) => s + (p.memberCount ?? 0), 0) + legacyCount;

  return (
    <div className="page-container">
      <AdminHeader title="Promotions" />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>

        {/* Active promotion banner */}
        {active ? (
          <div
            className="card mb-6"
            style={{ borderLeft: '5px solid #16a34a', background: '#f0fdf4' }}
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-green-600 mb-1">Active Promotion</p>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--bcc-navy)' }}>{active.name}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {active.memberCount ?? 0} registered member{(active.memberCount ?? 0) !== 1 ? 's' : ''} in this promotion
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-sm font-bold" style={{ background: '#16a34a', color: 'white' }}>
                ✓ Active
              </span>
            </div>
          </div>
        ) : (
          <div className="card mb-6" style={{ borderLeft: '5px solid #d97706', background: '#fffbeb' }}>
            <p className="font-bold text-amber-800">⚠️ No active promotion</p>
            <p className="text-sm text-amber-700 mt-1">
              New registrations will not be assigned to a promotion until you set one as active.
              Create a new promotion below or activate an existing one.
            </p>
          </div>
        )}

        {/* Stats row */}
        <div className="flex gap-3 flex-wrap mb-6">
          <div className="card flex-1 text-center py-3" style={{ minWidth: 130 }}>
            <div className="text-3xl font-bold" style={{ color: 'var(--bcc-navy)', fontFamily: 'Georgia, serif' }}>{promotions.length}</div>
            <div className="text-xs text-gray-500 mt-1">Total Promotions</div>
          </div>
          <div className="card flex-1 text-center py-3" style={{ minWidth: 130 }}>
            <div className="text-3xl font-bold" style={{ color: 'var(--bcc-navy)', fontFamily: 'Georgia, serif' }}>{totalMembers}</div>
            <div className="text-xs text-gray-500 mt-1">Total Members</div>
          </div>
          {legacyCount > 0 && (
            <div className="card flex-1 text-center py-3" style={{ minWidth: 130 }}>
              <div className="text-3xl font-bold" style={{ color: '#9ca3af', fontFamily: 'Georgia, serif' }}>{legacyCount}</div>
              <div className="text-xs text-gray-500 mt-1">Legacy (no promotion)</div>
            </div>
          )}
        </div>

        {/* Create new promotion */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--bcc-navy)' }}>Create New Promotion</h2>
          <form onSubmit={handleCreate}>
            <div className="flex gap-4 mb-4 flex-wrap">
              <div style={{ minWidth: 120 }}>
                <label className="block font-bold mb-1 text-sm">Year</label>
                <input
                  type="number"
                  className="input-field"
                  value={year}
                  onChange={e => setYear(Number(e.target.value))}
                  min={2020}
                  max={2099}
                  style={{ width: 100 }}
                />
              </div>
              <div style={{ minWidth: 120 }}>
                <label className="block font-bold mb-1 text-sm">Number</label>
                <input
                  type="number"
                  className="input-field"
                  value={number}
                  onChange={e => setNumber(Number(e.target.value))}
                  min={1}
                  max={99}
                  style={{ width: 80 }}
                />
              </div>
              <div className="flex-1" style={{ minWidth: 200 }}>
                <label className="block font-bold mb-1 text-sm">Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder={autoName}
                />
                {!customName.trim() && (
                  <p className="text-xs text-gray-400 mt-1">Auto-generated: <strong>{autoName}</strong></p>
                )}
              </div>
            </div>

            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={setActive}
                onChange={e => setSetActive(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Set as active immediately (new registrations will join this promotion)</span>
            </label>

            {createErr && (
              <p className="text-red-600 text-sm mb-3">{createErr}</p>
            )}

            <button type="submit" className="btn-primary" disabled={creating} style={{ width: 'auto' }}>
              {creating ? 'Creating…' : `Create "${finalName}" →`}
            </button>
          </form>
        </div>

        {/* All promotions list */}
        <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--bcc-navy)' }}>
          All Promotions ({promotions.length})
        </h2>

        {loading ? (
          <p className="text-gray-400 text-center py-8">Loading…</p>
        ) : promotions.length === 0 ? (
          <div className="card text-center py-10 text-gray-400">
            No promotions yet. Create the first one above.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {promotions.map(p => (
              <div
                key={p.id}
                className="card"
                style={{
                  borderLeft: p.isActive ? '5px solid #16a34a' : '5px solid #e5e7eb',
                  background: p.isActive ? '#f0fdf4' : 'white',
                }}
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg" style={{ color: 'var(--bcc-navy)' }}>{p.name}</h3>
                      {p.isActive && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#16a34a', color: 'white' }}>
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {p.memberCount ?? 0} member{(p.memberCount ?? 0) !== 1 ? 's' : ''}
                      {' · '}Created {new Date(p.createdAt).toLocaleDateString('en-CA')}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {!p.isActive && (
                      <button
                        onClick={() => handleActivate(p.id)}
                        disabled={activating === p.id}
                        className="px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all"
                        style={{ borderColor: '#16a34a', color: '#16a34a', background: 'white' }}
                      >
                        {activating === p.id ? 'Activating…' : 'Set Active'}
                      </button>
                    )}
                    <Link
                      href={`/admin/members?promotion=${p.id}`}
                      className="px-4 py-2 rounded-lg text-sm font-bold border-2 no-underline"
                      style={{ borderColor: 'var(--bcc-navy)', color: 'var(--bcc-navy)', background: 'white', textDecoration: 'none' }}
                    >
                      View Members →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <Link href="/admin/dashboard" className="underline text-sm" style={{ color: 'var(--bcc-navy)' }}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
