import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { db } from '@/lib/admin';
import { limited } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

const REASONS = ['non_consensual', 'underage', 'copyright', 'privacy', 'other'] as const;
// These reasons hide the video immediately, before any review.
const AUTO_HIDE = new Set(['non_consensual', 'underage', 'privacy']);

export async function POST(req: NextRequest) {
  if (await limited(req)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  const videoId = String(b.videoId || '').trim().replace(/^.*\/video\//, '').split(/[?#/]/)[0];
  const reason = String(b.reason || 'other');
  if (!/^\w{1,20}$/.test(videoId)) return NextResponse.json({ error: 'Enter a valid video ID or link.' }, { status: 400 });
  if (!REASONS.includes(reason as any)) return NextResponse.json({ error: 'bad reason' }, { status: 400 });
  const autoHidden = AUTO_HIDE.has(reason);
  await db().collection('removal_requests').add({
    videoId,
    reason,
    email: String(b.email || '').slice(0, 200),
    details: String(b.details || '').slice(0, 2000),
    status: autoHidden ? 'hidden' : 'open',
    createdAt: Timestamp.now(),
  });
  if (autoHidden) await db().collection('removed_videos').doc(videoId).set({ reason, at: Timestamp.now() });
  return NextResponse.json({ ok: true, hidden: autoHidden });
}
