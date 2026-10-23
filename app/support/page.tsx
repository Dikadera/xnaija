'use client';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';

export default function Support() {
  const { user, loading, api } = useAuth();
  const [msg, setMsg] = useState('');
  const [chats, setChats] = useState<any[]>([]);
  const [sent, setSent] = useState(false);

  const load = useCallback(async () => {
    const r = await api('/api/support');
    if (r.ok) setChats((await r.json()).chats);
  }, [api]);
  useEffect(() => { if (user) load(); }, [user, load]);

  if (loading) return null;
  if (!user) return <p className="text-zinc-400">Please log in to contact support.</p>;

  async function send(e: React.FormEvent) {
    e.preventDefault();
    await api('/api/support', { method: 'POST', body: JSON.stringify({ message: msg }) });
    setMsg(''); setSent(true); load();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Support</h1>
      <form onSubmit={send} className="space-y-3">
        <textarea id="support-message" required value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} placeholder="How can we help?" className="w-full rounded-xl border border-line bg-card p-4 text-sm outline-none focus:border-brand" />
        <Button id="support-send">Send message</Button>
        {sent && <span className="ml-3 text-sm text-emerald-400">Sent!</span>}
      </form>
      <div className="space-y-3">
        {chats.map((c) => (
          <div key={c.id} className="rounded-2xl border border-line bg-card p-4 text-sm">
            <p>{c.message}</p>
            {c.reply && <p className="mt-3 rounded-xl bg-brand/10 p-3 text-zinc-200"><b className="text-brand">Admin:</b> {c.reply}</p>}
            <p className="mt-2 text-xs uppercase text-zinc-500">{c.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
