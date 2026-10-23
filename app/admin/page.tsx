'use client';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Button, Input } from '@/components/ui/button';

const fmt = (t: number | null) => (t ? new Date(t).toLocaleDateString() : '—');

export default function Admin() {
  const { me, loading, api } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [days, setDays] = useState<Record<string, string>>({});
  const [reply, setReply] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const [u, s] = await Promise.all([api('/api/admin'), api('/api/admin?what=support')]);
    if (u.ok) setUsers((await u.json()).items);
    if (s.ok) setChats((await s.json()).items);
  }, [api]);
  useEffect(() => { if (me?.isAdmin) load(); }, [me, load]);

  if (loading) return null;
  if (!me?.isAdmin) return <p className="text-zinc-400">403 – Admins only.</p>;

  const post = async (body: any) => { await api('/api/admin', { method: 'POST', body: JSON.stringify(body) }); load(); };

  return (
    <div className="space-y-10">
      <section>
        <h1 className="mb-4 text-2xl font-bold">Users ({users.length})</h1>
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-card text-zinc-400"><tr><th className="p-3">Email</th><th>Status</th><th>Plan</th><th>Expires</th><th className="pr-3">Extend (days)</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.uid} className="border-t border-line">
                  <td className="p-3">{u.email}</td>
                  <td>{u.isSubscribed && u.expiresAt > Date.now() ? <span className="text-emerald-400">Active</span> : <span className="text-zinc-500">Inactive</span>}</td>
                  <td>{u.plan || '—'}</td>
                  <td>{fmt(u.expiresAt)}</td>
                  <td className="flex gap-2 py-2 pr-3">
                    <Input className="w-20 py-1.5" type="number" min={1} placeholder="30" value={days[u.uid] || ''} onChange={(e) => setDays({ ...days, [u.uid]: e.target.value })} />
                    <Button className="py-1.5" onClick={() => post({ action: 'extend', uid: u.uid, days: days[u.uid] || 30 })}>Extend</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-2xl font-bold">Support chats ({chats.length})</h2>
        <div className="space-y-3">
          {chats.map((c) => (
            <div key={c.id} className="rounded-2xl border border-line bg-card p-4 text-sm">
              <p className="text-xs text-zinc-500">{c.email} · {fmt(c.createdAt)} · {c.status}</p>
              <p className="mt-1">{c.message}</p>
              {c.reply && <p className="mt-2 text-brand">Reply: {c.reply}</p>}
              <div className="mt-3 flex gap-2">
                <Input placeholder="Write a reply…" value={reply[c.id] || ''} onChange={(e) => setReply({ ...reply, [c.id]: e.target.value })} />
                <Button disabled={!reply[c.id]} onClick={() => post({ action: 'reply', id: c.id, reply: reply[c.id] })}>Reply</Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
