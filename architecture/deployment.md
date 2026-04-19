# Deployment Guide

## Platform

Vercel (Next.js first-party hosting). PostgreSQL via Neon (Vercel Marketplace add-on).

## Prerequisites

- Vercel account + CLI (`pnpm i -g vercel`)
- Neon database provisioned via Vercel Marketplace
- Google Cloud project with YouTube Data API v3 and YouTube Analytics API enabled
- Meta developer app with Instagram Business Login configured

## Environment Variables

Set all variables in Vercel project settings → Environment Variables.

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon pooled connection string (for runtime) |
| `DIRECT_URL` | Neon direct (non-pooled) connection string (for migrations) |
| `AUTH_SECRET` | Random 32+ byte secret — `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `GOOGLE_API_KEY` | Google API key (YouTube Data API) |
| `META_APP_ID` | Facebook App ID |
| `META_APP_SECRET` | Facebook App Secret |
| `ENCRYPTION_KEY` | 32-byte base64 key for AES-256-GCM — `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Production URL e.g. `https://metrify.vercel.app` |

## Deploy Steps

```bash
# 1. Push to GitHub
git push origin main

# 2. Import project in Vercel dashboard
#    → Connect repo → auto-detects Next.js

# 3. Set env vars in Vercel project settings

# 4. Run database migration against production (uses DIRECT_URL)
pnpm db:migrate

# 5. Deploy
vercel --prod
```

## Google OAuth Redirect URIs

Add to Google Cloud Console → Credentials → OAuth 2.0 Client:

```
https://your-domain.vercel.app/api/auth/callback/google
```

## Meta OAuth Redirect URIs

Add to Facebook App → Instagram Business Login → Valid OAuth Redirect URIs:

```
https://your-domain.vercel.app/api/instagram/callback
```

## Caching Strategy

| Route | Cache |
|---|---|
| `/c/[slug]` | `s-maxage=3600, stale-while-revalidate=86400` (set via `revalidate = 3600`) |
| `/dashboard` | `force-dynamic` (no-store) |
| API routes | No cache (dynamic) |

## Seeding Demo Data

```bash
# Against production DB (requires DIRECT_URL in env)
DATABASE_URL=<pooled-url> pnpm seed
```

## Common Issues

**Prisma adapter error on deploy**: Ensure `DATABASE_URL` is the pooled Neon URL (PgBouncer). `DIRECT_URL` is only used by Prisma CLI for migrations.

**Instagram token expiry**: Long-lived tokens last 60 days. Users must reconnect via `/connections`. Consider adding a cron job to refresh tokens approaching expiry.

**YouTube snapshot on first sign-in**: The `signIn` event triggers a non-blocking snapshot. If the YouTube Data API or Analytics API returns 403, check that both APIs are enabled in Google Cloud Console for the correct project.
