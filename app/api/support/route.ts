import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from '@/lib/admin';
import { getUser } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const u = await getUser(req);
  if (!u) return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  const s = await db().collection('support_chats').where('userId', '==', u.uid).limit(50).get();
  const chats = s.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toMillis?.() }));
  chats.sort((a: any, b: any) => b.createdAt - a.createdAt);
  return NextResponse.json({ chats });
}

export async function POST(req: NextRequest) {
  const u = await getUser(req);
  if (!u) return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  const { message } = await req.json();
  const m = String(message || '').trim().slice(0, 2000);
  if (!m) return NextResponse.json({ error: 'empty' }, { status: 400 });
  await db().collection('support_chats').add({ userId: u.uid, email: u.email, message: m, status: 'open', reply: null, createdAt: Timestamp.now() });
  return NextResponse.json({ ok: true });
}
