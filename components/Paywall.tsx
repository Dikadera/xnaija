'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Crown, ShieldCheck, Zap, Infinity as Inf } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const PLANS = [
  { id: 'monthly', name: 'Monthly', price: 10, per: '/month', note: 'Flexible, cancel anytime' },
  { id: 'yearly', name: 'Yearly', price: 80, per: '/year', note: 'Just $6.67/mo – save 33%', best: true },
];
const FEATURES = ['Unlimited access to the full library', 'Fast HD embedded player', 'Fresh trending updates daily', 'Pay privately with USDT crypto', 'Priority live support'];

export default function Paywall({ title = 'Unlock Premium Access', sub = 'Subscribe to browse and watch the full catalogue.' }: { title?: string; sub?: string }) {
  const { user, api } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');

  async function buy(plan: string) {
    if (!user) return router.push('/login?next=/pricing');
    setBusy(plan); setErr('');
    const r = await api('/api/create-payment', { method: 'POST', body: JSON.stringify({ plan }) });
    const j = await r.json();
    if (j.url) window.location.href = j.url;
    else { setErr(j.error || 'Payment error'); setBusy(''); }
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-b from-[#1a1218] to-[#0f0f0f] px-4 py-12 sm:px-10">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-brand/20 blur-[100px]" />
      <div className="relative mx-auto max-w-4xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold"><Crown className="h-3.5 w-3.5" />Members only</span>
        <h2 className="mt-5 text-3xl font-extrabold sm:text-5xl">{title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-zinc-400">{sub}</p>

        <div className="mt-10 grid gap-6 text-left md:grid-cols-2">
          {PLANS.map((p) => (
            <div key={p.id} className={cn('relative rounded-2xl border p-7 transition hover:-translate-y-1', p.best ? 'border-gold/60 bg-gradient-to-b from-gold/10 to-card shadow-2xl shadow-gold/10' : 'border-line bg-card')}>
              {p.best && <span className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-gold to-amber-400 px-3 py-1 text-xs font-bold text-black">BEST VALUE</span>}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <div className="mt-3 flex items-end gap-1"><span className="text-5xl font-extrabold">${p.price}</span><span className="mb-1.5 text-zinc-500">{p.per}</span></div>
              <p className="mt-1 text-sm text-zinc-400">{p.note}</p>
              <ul className="my-6 space-y-2.5 text-sm text-zinc-300">
                {FEATURES.map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{f}</li>)}
              </ul>
              <Button id={`buy-${p.id}`} variant={p.best ? 'gold' : 'default'} className="w-full py-3" disabled={!!busy} onClick={() => buy(p.id)}>
                {busy === p.id ? 'Redirecting…' : `Get ${p.name}`}
              </Button>
            </div>
          ))}
        </div>
        {err && <p className="mt-4 text-sm text-red-400">{err}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" />Discreet billing</span>
          <span className="flex items-center gap-1.5"><Zap className="h-4 w-4" />Instant activation</span>
          <span className="flex items-center gap-1.5"><Inf className="h-4 w-4" />No hidden fees</span>
        </div>
      </div>
    </section>
  );
}
