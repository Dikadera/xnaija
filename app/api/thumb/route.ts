import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// SSRF protection: only proxy known CDN hosts
const ALLOWED = ['xvideos-cdn.com', 'xnxx-cdn.com', 'xvideos.com'];

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('url') || '';
  if (raw.startsWith('/')) return NextResponse.redirect(new URL(raw, req.url));
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return new NextResponse('bad url', { status: 400 });
  }
  if (u.protocol !== 'https:' || !ALLOWED.some((h) => u.hostname === h || u.hostname.endsWith('.' + h)))
    return new NextResponse('host not allowed', { status: 403 });
  const r = await fetch(u, { headers: { 'user-agent': 'Mozilla/5.0', referer: 'https://www.xvideos.com/' } });
  if (!r.ok || !r.headers.get('content-type')?.startsWith('image/')) return new NextResponse('upstream', { status: 502 });
  return new NextResponse(r.body, {
    headers: { 'content-type': r.headers.get('content-type')!, 'cache-control': 'public, max-age=86400, s-maxage=86400' },
  });
}
