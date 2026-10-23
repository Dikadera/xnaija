import { NextRequest, NextResponse } from 'next/server';
import { requireSub } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const g = await requireSub(req);
  if (g.res) return g.res;
  if (!/^\w{1,20}$/.test(params.id)) return NextResponse.json({ error: 'bad id' }, { status: 400 });
  return NextResponse.json({ embedUrl: `https://www.xvideos.com/embedframe/${params.id}` });
}
