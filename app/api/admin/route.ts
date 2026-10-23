import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminAuth, db } from '@/lib/admin';
import { requireAdmin } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const what = req.nextUrl.searchParams.get('what');
  if (what === 'support') {
    const s = await db().collection('support_chats').orderBy('createdAt', 'desc').limit(200).get();
    return NextResponse.json({ items: s.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toMillis?.() })) });
  }
  const s = await db().collection('users').limit(500).get();
  return NextResponse.json({
    items: s.docs.map((d) => {
      const x = d.data();
      return { uid: d.id, email: x.email, isSubscribed: !!x.isSubscribed, plan: x.plan, expiresAt: x.expiresAt?.toMillis?.() || null };
    }),
  });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin(req))) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const b = await req.json();
  if (b.action === 'extend') {
    const days = Math.min(Math.max(parseInt(b.days) || 0, 1), 3650);
    const ref = db().collection('users').doc(String(b.uid));
    const cur = (await ref.get()).data();
    const base = Math.max(Date.now(), cur?.expiresAt?.toMillis?.() || 0);
    await ref.set(
      { isSubscribed: true, plan: cur?.plan || (days >= 365 ? 'yearly' : 'monthly'), expiresAt: Timestamp.fromMillis(base + days * 864e5) },
      { merge: true }
    );
    return NextResponse.json({ ok: true });
  }
  if (b.action === 'reply') {
    await db().collection('support_chats').doc(String(b.id)).update({ reply: String(b.reply).slice(0, 2000), status: 'answered' });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'bad action' }, { status: 400 });
}
