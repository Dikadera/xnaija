'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button, Input } from '@/components/ui/button';

function Form() {
  const router = useRouter();
  const next = useSearchParams().get('next') || '/';
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      await (signup ? createUserWithEmailAndPassword : signInWithEmailAndPassword)(auth, email, pw);
      router.push(next);
    } catch (e: any) {
      setErr((e.code || 'error').replace('auth/', '').replace(/-/g, ' '));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-10 max-w-sm space-y-4 rounded-2xl border border-line bg-card p-8">
      <h1 className="text-2xl font-bold">{signup ? 'Create account' : 'Welcome back'}</h1>
      <Input id="email" type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input id="password" type="password" required minLength={6} placeholder="Password (min 6)" value={pw} onChange={(e) => setPw(e.target.value)} />
      {err && <p className="text-sm capitalize text-red-400">{err}</p>}
      <Button id="auth-submit" className="w-full" disabled={busy}>{signup ? 'Sign up' : 'Log in'}</Button>
      <button type="button" onClick={() => setSignup(!signup)} className="w-full text-sm text-zinc-400 hover:text-white">
        {signup ? 'Already have an account? Log in' : 'No account? Sign up'}
      </button>
    </form>
  );
}

export default function Login() {
  return <Suspense><Form /></Suspense>;
}
