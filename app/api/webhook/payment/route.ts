import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from '@/lib/admin';
import { PLANS } from '@/lib/server-auth';

const sortKeys = (o: any): any =>
  o && typeof o === 'object' && !Array.isArray(o)
    ? Object.keys(o).sort().reduce((a: any, k) => ((a[k] = sortKeys(o[k])), a), {})
    : o;

export async function POST(req: NextRequest) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: 'not configured' }, { status: 503 });
  const body = await req.json();

  // NowPayments signature: HMAC-SHA512 of key-sorted JSON using IPN secret
  const sig = req.headers.get('x-nowpayments-sig') || '';
  const expected = crypto.createHmac('sha512', secret).update(JSON.stringify(sortKeys(body))).digest('hex');
  const ok = sig.length === expected.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  if (!ok) return NextResponse.json({ error: 'bad signature' }, { status: 401 });

  if (!['finished', 'confirmed'].includes(body.payment_status)) return NextResponse.json({ ok: true, ignored: true });

  const [uid, plan] = String(body.order_id || '').split('|');
  const p = PLANS[plan as keyof typeof PLANS];
  if (!uid || !p) return NextResponse.json({ error: 'bad order' }, { status: 400 });

  const ref = db().collection('users').doc(uid);
  const paidRef = db().collection('payments').doc(String(body.payment_id));
  await db().runTransaction(async (t) => {
    if ((await t.get(paidRef)).exists) return; // idempotent
    const cur = (await t.get(ref)).data();
    const base = Math.max(Date.now(), cur?.expiresAt?.toMillis?.() || 0);
    t.set(ref, { isSubscribed: true, plan, expiresAt: Timestamp.fromMillis(base + p.days * 864e5) }, { merge: true });
    t.set(paidRef, { uid, plan, at: Timestamp.now() });
  });
  return NextResponse.json({ ok: true });
}
