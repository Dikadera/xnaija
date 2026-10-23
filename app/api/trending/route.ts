import { NextRequest, NextResponse } from 'next/server';
import { getVideos } from '@/lib/source';
import { limited, requireSub } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (await limited(req)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const g = await requireSub(req);
  if (g.res) return g.res;
  const page = Math.max(0, parseInt(req.nextUrl.searchParams.get('page') || '0') || 0);
  const cat = req.nextUrl.searchParams.get('category') || 'nigerian';
  return NextResponse.json({ videos: await getVideos('trending', '', page, cat) });
}
