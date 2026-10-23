import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, db } from './admin';
import { rateLimit } from './redis';

export async function getUser(req: NextRequest) {
  const h = req.headers.get('authorization') || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!token) return null;
  try {
    return await adminAuth().verifyIdToken(token);
  } catch {
    return null;
  }
}

export function isActive(d: any) {
  if (!d?.isSubscribed || !d?.expiresAt) return false;
  const ms = d.expiresAt.toMillis ? d.expiresAt.toMillis() : +d.expiresAt;
  return ms > Date.now();
}

/** Paywall guard: returns {uid} or {res} (401/403). Admin always passes. */
export async function requireSub(req: NextRequest): Promise<{ uid?: string; res?: NextResponse }> {
  // Free mode: everything is open until PAYWALL_ENABLED=true is set in the env.
  if (process.env.PAYWALL_ENABLED !== 'true') return { uid: (await getUser(req))?.uid };
  const u = await getUser(req);
  if (!u) return { res: NextResponse.json({ error: 'auth_required' }, { status: 401 }) };
  if (u.email && u.email === process.env.ADMIN_EMAIL) return { uid: u.uid };
  const snap = await db().collection('users').doc(u.uid).get();
  if (!isActive(snap.data())) return { res: NextResponse.json({ error: 'subscription_required' }, { status: 403 }) };
  return { uid: u.uid };
}

export async function requireAdmin(req: NextRequest) {
  const u = await getUser(req);
  return u && u.email && u.email === process.env.ADMIN_EMAIL ? u : null;
}

export async function limited(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  return !(await rateLimit(ip, 30, 60));
}

export const PLANS = {
  monthly: { price: 10, days: 30, label: 'Monthly' },
  yearly: { price: 80, days: 365, label: 'Yearly' },
} as const;
