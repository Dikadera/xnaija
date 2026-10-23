'use client';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';
import { useAuth } from './AuthProvider';
import Paywall from './Paywall';

type V = { id: string; title: string; thumb: string; duration: string };

export function Skeletons({ n = 12 }: { n?: number }) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl bg-card">
          <div className="relative aspect-video overflow-hidden bg-zinc-800"><div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" /></div>
          <div className="space-y-2 p-3"><div className="h-3 w-4/5 rounded bg-zinc-800" /><div className="h-3 w-1/3 rounded bg-zinc-800" /></div>
        </div>
      ))}
    </>
  );
}

export function VideoCard({ v }: { v: V }) {
  return (
    <Link href={`/video/${v.id}?t=${encodeURIComponent(v.title)}`} className="group block overflow-hidden rounded-2xl border border-transparent bg-card transition hover:border-brand/40">
      <div className="relative aspect-video overflow-hidden bg-zinc-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img loading="lazy" src={`/api/thumb?url=${encodeURIComponent(v.thumb)}`} alt={v.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
        {v.duration && <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/75 px-1.5 py-0.5 text-xs"><Clock className="h-3 w-3" />{v.duration}</span>}
      </div>
      <h3 className="line-clamp-2 p-3 text-sm font-medium text-zinc-200">{v.title}</h3>
    </Link>
  );
}

export default function VideoGrid({ endpoint, q = '', compact = false, category = 'nigerian' }: { endpoint: 'search' | 'trending'; q?: string; compact?: boolean; category?: string }) {
  const { user, loading, api } = useAuth();
  const [items, setItems] = useState<V[]>([]);
  const [page, setPage] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [blocked, setBlocked] = useState<number | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const seen = useRef(new Set<string>());

  const load = useCallback(async (p: number) => {
    setBusy(true);
    const r = await api(`/api/${endpoint}?q=${encodeURIComponent(q)}&page=${p}&category=${category}`);
    if (r.status === 401 || r.status === 403) { setBlocked(r.status); setBusy(false); return; }
    if (r.ok) {
      const { videos } = await r.json();
      const fresh = videos.filter((v: V) => !seen.current.has(v.id));
      fresh.forEach((v: V) => seen.current.add(v.id));
      if (!fresh.length) setDone(true);
      setItems((x) => [...x, ...fresh]);
    } else setDone(true);
    setBusy(false);
  }, [api, endpoint, q, category]);

  useEffect(() => { // reset on query/user change
    if (loading) return;
    seen.current.clear(); setItems([]); setPage(0); setDone(false); setBlocked(null);
    load(0);
  }, [q, endpoint, category, user, loading, load]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || blocked || done) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !busy && items.length) { const n = page + 1; setPage(n); load(n); }
    }, { rootMargin: '600px' });
    io.observe(el);
    return () => io.disconnect();
  }, [busy, items.length, page, blocked, done, load]);

  if (blocked)
    return <Paywall title={blocked === 401 ? 'Sign in to continue' : 'Unlock Premium Access'} sub={blocked === 401 ? 'Create a free account, then pick a plan to start watching.' : 'Your subscription is inactive or expired. Choose a plan to continue.'} />;

  return (
    <>
      <div className={compact ? 'grid grid-cols-2 gap-4 sm:grid-cols-3' : 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}>
        {items.map((v) => <VideoCard key={v.id} v={v} />)}
        {(busy || loading) && <Skeletons n={compact ? 6 : 8} />}
      </div>
      <div ref={sentinel} className="h-10" />
    </>
  );
}
