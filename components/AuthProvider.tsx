'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

type Me = { active: boolean; plan: string | null; expiresAt: number | null; isAdmin: boolean };
type Ctx = { user: User | null; me: Me | null; loading: boolean; api: (url: string, init?: RequestInit) => Promise<Response>; logout: () => void; refresh: () => void };

const C = createContext<Ctx>(null as any);
export const useAuth = () => useContext(C);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const api = useCallback(async (url: string, init: RequestInit = {}) => {
    const token = await auth.currentUser?.getIdToken();
    return fetch(url, { ...init, headers: { ...(init.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), 'content-type': 'application/json' } });
  }, []);

  const load = useCallback(async () => {
    if (!auth.currentUser) return setMe(null);
    const r = await api('/api/me');
    setMe(r.ok ? await r.json() : null);
  }, [api]);

  useEffect(
    () =>
      onAuthStateChanged(auth, async (u) => {
        setUser(u);
        await load();
        setLoading(false);
      }),
    [load]
  );

  return <C.Provider value={{ user, me, loading, api, logout: () => signOut(auth), refresh: load }}>{children}</C.Provider>;
}
