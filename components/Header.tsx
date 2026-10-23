'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Search, Crown, LogOut } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { Button } from './ui/button';

function SearchBox() {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get('q') || '');
  return (
    <form onSubmit={(e) => { e.preventDefault(); router.push(q ? `/?q=${encodeURIComponent(q)}` : '/'); }} className="relative hidden flex-1 max-w-xl sm:block">
      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
      <input id="search-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search videos…" className="w-full rounded-full border border-line bg-card py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand" />
    </form>
  );
}

export default function Header() {
  const { user, me, logout } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link href="/" className="text-xl font-extrabold tracking-tight">Tube<span className="text-brand">Vault</span></Link>
        <Suspense><SearchBox /></Suspense>
        <nav className="ml-auto flex items-center gap-2">
          {me?.isAdmin && <Link href="/admin" className="px-3 text-sm text-zinc-300 hover:text-white">Admin</Link>}
          {user && <Link href="/support" className="hidden px-3 text-sm text-zinc-300 hover:text-white md:block">Support</Link>}
          {!me?.active && <Link href="/pricing"><Button variant="gold" className="px-4 py-2"><Crown className="h-4 w-4" />Premium</Button></Link>}
          {user ? (
            <Button variant="ghost" onClick={logout} title="Log out"><LogOut className="h-4 w-4" /></Button>
          ) : (
            <Link href="/login"><Button variant="outline">Log in</Button></Link>
          )}
        </nav>
      </div>
    </header>
  );
}
