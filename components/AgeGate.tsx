'use client';
import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { Button } from './ui/button';

export default function AgeGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => setOk(localStorage.getItem('age_confirmed') === '1'), []);

  if (ok === null) return <div className="min-h-screen bg-bg" />; // block everything until checked
  if (!ok)
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black p-4" role="dialog" aria-modal="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,61,113,.25),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(245,194,107,.15),transparent_50%)]" />
        <div className="relative w-full max-w-md rounded-2xl border border-line bg-card/90 p-8 text-center backdrop-blur-xl">
          <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-brand" />
          <h1 className="text-2xl font-bold">Age Verification</h1>
          <p className="mt-3 text-sm text-zinc-400">
            This website contains adult material intended only for persons 18 years of age or older. By entering you confirm you are of legal age in your jurisdiction.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button id="age-confirm" onClick={() => { localStorage.setItem('age_confirmed', '1'); setOk(true); }}>I am 18 or older – Enter</Button>
            <Button id="age-leave" variant="outline" onClick={() => (window.location.href = 'https://www.google.com')}>I am under 18 – Leave</Button>
          </div>
        </div>
      </div>
    );
  return <>{children}</>;
}
