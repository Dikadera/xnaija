import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from '@/lib/admin';
import { getUser, isActive } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

/** Upserts the user doc on first call and returns subscription status. */
export async function GET(req: NextRequest) {
  const u = await getUser(req);
  if (!u) return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  const ref = db().collection('users').doc(u.uid);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({ email: u.email, isSubscribed: false, plan: null, expiresAt: null, createdAt: Timestamp.now() });
  }
  const d = snap.data() || {};
  return NextResponse.json({
    active: isActive(d),
    plan: d.plan || null,
    expiresAt: d.expiresAt?.toMillis?.() || null,
    isAdmin: !!u.email && u.email === process.env.ADMIN_EMAIL,
  });
}
