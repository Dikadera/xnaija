import { NextRequest, NextResponse } from 'next/server';
import { getUser, PLANS } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  const u = await getUser(req);
  if (!u) return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  const { plan } = await req.json();
  const p = PLANS[plan as keyof typeof PLANS];
  if (!p) return NextResponse.json({ error: 'bad plan' }, { status: 400 });
  if (!process.env.PAYMENT_API_KEY) return NextResponse.json({ error: 'Payments not configured (PAYMENT_API_KEY)' }, { status: 503 });

  const site = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
  // NowPayments invoice. For Cryptomus, replace this block with its /v1/payment call.
  const r = await fetch('https://api.nowpayments.io/v1/invoice', {
    method: 'POST',
    headers: { 'x-api-key': process.env.PAYMENT_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({
      price_amount: p.price,
      price_currency: 'usd',
      pay_currency: 'usdttrc20',
      order_id: `${u.uid}|${plan}|${Date.now()}`,
      order_description: `${p.label} subscription`,
      ipn_callback_url: `${site}/api/webhook/payment`,
      success_url: `${site}/?paid=1`,
      cancel_url: `${site}/pricing`,
    }),
  });
  const j = await r.json();
  if (!r.ok || !j.invoice_url) return NextResponse.json({ error: 'provider_error', detail: j }, { status: 502 });
  return NextResponse.json({ url: j.invoice_url });
}
