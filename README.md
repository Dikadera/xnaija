# TubeVault – 18+ Video Subscription Aggregator

Next.js 14 (App Router) · Tailwind · Firebase Auth + Firestore · Redis cache · USDT crypto paywall (NowPayments).
No video files are hosted – only `https://www.xvideos.com/embedframe/VIDEO_ID` iframes.

## 1. Run

```bash
npm install
cp .env.example .env.local   # already pre-filled with your Firebase web config
npm run dev                  # http://localhost:3000
```

## 2. Firebase setup

1. **Authentication → Sign-in method** → enable **Email/Password**.
2. **Firestore** → your database id is `xnaija` (set via `FIRESTORE_DB_ID`).
3. **Service account (required for the server):** Project settings → Service accounts → *Generate new private key*.
   Put the whole JSON on ONE line in `FIREBASE_SERVICE_ACCOUNT` in `.env.local`.
4. **Security rules:** keep your current deny-all rules (`allow read, write: if false;`).
   All Firestore access goes through API routes using the Admin SDK (which bypasses rules), so clients can never edit their own subscription.
5. Collections are created automatically:
   - `users/{uid}`: `{email, isSubscribed, plan: 'monthly'|'yearly', expiresAt, createdAt}`
   - `support_chats`: `{userId, email, message, status, reply, createdAt}`
   - `payments/{paymentId}`: idempotency records
6. **Authentication → Settings → Authorized domains**: add your production domain.

## 3. Environment variables

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_FIREBASE_CONFIG` | Firebase web config JSON |
| `FIREBASE_SERVICE_ACCOUNT` | Admin SDK service-account JSON (one line) |
| `FIRESTORE_DB_ID` | `xnaija` |
| `REDIS_URL` | Upstash `rediss://…` URL (omit → in-memory fallback) |
| `TAUK_TO_ID` | Tawk.to `propertyId/widgetId` |
| `ADMIN_WHATSAPP` | digits only, e.g. `2348012345678` |
| `ADMIN_EMAIL` | the only account allowed in `/admin` |
| `PAYMENT_API_KEY` | NowPayments API key |
| `PAYMENT_WEBHOOK_SECRET` | NowPayments IPN secret |
| `NEXT_PUBLIC_SITE_URL` | public URL (used for callbacks) |
| `VIDEO_SOURCE_BASE` | listing source base URL |

## 4. Payments (NowPayments USDT)

- Dashboard → Store settings → set IPN secret = `PAYMENT_WEBHOOK_SECRET`.
- `/api/create-payment` creates an invoice (USDT TRC20) and redirects the user.
- IPN callback → `POST /api/webhook/payment` (HMAC-SHA512 verified, idempotent). On `finished`/`confirmed` it sets `isSubscribed=true` and extends `expiresAt` (30 / 365 days).
- Local testing: expose with ngrok and set `NEXT_PUBLIC_SITE_URL`. For Cryptomus, swap the provider call in `app/api/create-payment/route.ts` and the signature check in the webhook.

## 5. Admin

Sign up with the email set in `ADMIN_EMAIL`; an **Admin** link appears in the header → `/admin` (users, manual extension, support replies). Enforced server-side.

## 6. Notes

- **Paywall:** `/api/search`, `/api/trending`, `/api/video/[id]` verify the Firebase ID token and Firestore subscription; they return 401/403 and the UI renders the paywall.
- **Rate limit:** 30 req/min/IP on search/trending (Redis or memory).
- **Video source:** `lib/source.ts` parses a listing page for only id/title/thumb/duration. Source markup changes over time and scraping may be restricted by the provider's terms, so check them and adjust the parser or point it at a licensed feed. If the source can't be read, it falls back to "Premium Video #N" placeholders (their embed ids are not real).
- **Thumb proxy** only allows whitelisted CDN hosts (SSRF-safe).
- **Legal pages** (DMCA, 2257, Privacy, Terms) are templates, so have a lawyer review them before launch. Add your real contact details.
- Your Firebase web config was pasted in `.env.local` (git-ignored). Web API keys are public by design, but never commit the service account.
