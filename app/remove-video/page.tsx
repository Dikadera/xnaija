'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function RemoveVideoPage() {
  const [videoId, setVideoId] = useState('');
  const [reason, setReason] = useState('non_consensual');
  const [email, setEmail] = useState('');
  const [details, setDetails] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { setVideoId(new URLSearchParams(window.location.search).get('id') || ''); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg('');
    const r = await fetch('/api/remove-request', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ videoId, reason, email, details }) });
    const j = await r.json().catch(() => ({}));
    setMsg(r.ok ? (j.hidden ? 'Done. The video has been hidden from the site right away and your request is queued for review.' : 'Request received. We will review it shortly.') : j.error || 'Something went wrong.');
    setBusy(false);
  }

  const field = 'w-full rounded-lg border border-line bg-card px-3 py-2 text-sm outline-none focus:border-brand';
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-2 text-3xl font-bold">Remove video</h1>
      <p className="mb-6 text-sm text-zinc-400">Want a video taken down? Tell us which one. Reports of non-consensual content, underage content or privacy violations hide the video immediately.</p>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm">Video link or ID
          <input id="rv-video" required className={field} value={videoId} onChange={(e) => setVideoId(e.target.value)} placeholder="https://…/video/1000001" />
        </label>
        <label className="block text-sm">Reason
          <select id="rv-reason" className={field} value={reason} onChange={(e) => setReason(e.target.value)}>
            <option value="non_consensual">Shared without my consent / leaked</option>
            <option value="underage">Person appears to be under 18</option>
            <option value="privacy">Privacy violation</option>
            <option value="copyright">Copyright (I own this content)</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="block text-sm">Your email (optional, for follow-up)
          <input id="rv-email" type="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block text-sm">Details (optional)
          <textarea id="rv-details" rows={4} className={field} value={details} onChange={(e) => setDetails(e.target.value)} />
        </label>
        <Button id="rv-submit" type="submit" variant="gold" disabled={busy}>{busy ? 'Sending…' : 'Remove video'}</Button>
        {msg && <p className="text-sm text-zinc-300" role="status">{msg}</p>}
      </form>
    </div>
  );
}
