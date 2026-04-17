# Design — Data Model, API Routes, OAuth Flows

## Data model overview

See `prisma/schema.prisma` for the authoritative schema.

### Key relationships

```
User (NextAuth)
  └── Creator (1:1)
        ├── YouTubeSnapshot[] (1:many, ordered by fetchedAt desc)
        └── InstagramSnapshot[] (1:many, ordered by fetchedAt desc)

User (NextAuth)
  └── Account[] (1:many, managed by NextAuth Prisma adapter)
        └── Google account stores: access_token, refresh_token, expires_at
```

### Snapshot strategy

- **Dashboard visit**: check `fetchedAt` of latest snapshot. If > 6h ago (or no snapshot), trigger fresh fetch.
- **Public page**: always reads from the latest snapshot — never calls live APIs.
- **Old snapshots**: retained (not deleted) — used to compute growth trends.
- **Helper**: `getLatestSnapshot(creatorId, platform)` in a `src/lib/repo.ts` file.

## API routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET/POST | `/api/auth/[...nextauth]` | — | NextAuth handler |
| GET | `/api/youtube/refresh` | Session | Trigger manual snapshot (rate-limited 6h) |
| GET | `/api/instagram/connect` | Session | Initiate FB OAuth redirect |
| GET | `/api/instagram/callback` | Session (cookie) | Handle FB code exchange + IG handshake |
| GET | `/api/creator/slug-check?slug=...` | Session | Check if slug is available |

## OAuth flows

See `architecture/oauth-flows.md` for full diagrams.

### Google / YouTube (via NextAuth v5)

1. User clicks "Sign in with Google" → NextAuth initiates Google OAuth.
2. Google redirects back with code → NextAuth exchanges for tokens.
3. NextAuth stores `access_token`, `refresh_token`, `expires_at` on `Account` row.
4. `events.signIn` callback triggers YouTube snapshot (non-blocking).
5. Token refresh: `auth.ts` callbacks check expiry on each session read; refresh if needed.

**Scopes**: `openid email profile https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly`

**Required params**: `access_type=offline`, `prompt=consent` (ensures refresh token always returned).

### Facebook / Instagram (custom 4-step)

1. Creator clicks "Connect Instagram" on `/connections`.
2. `GET /api/instagram/connect` → server generates `state`, stores in signed cookie, redirects to FB OAuth URL.
3. FB redirects to `GET /api/instagram/callback?code=...&state=...`.
4. Server verifies `state`, exchanges `code` for short-lived user access token.
5. Exchanges short-lived token for long-lived (~60d) token.
6. `GET /v21.0/me/accounts` → find Page with `instagram_business_account` field.
7. Store `instagram_business_account.id` and encrypted long-lived token on `Creator` row.
8. Trigger IG snapshot, redirect to `/connections`.

## Route protection (middleware.ts)

- `/dashboard/*` → requires session → redirect to `/sign-in`
- `/connections/*` → requires session → redirect to `/sign-in`
- `/settings/*` → requires session → redirect to `/sign-in`
- `/c/[slug]` → public, no auth
- `/api/auth/*` → public (NextAuth handlers)
- `/api/instagram/*` → session verified inside handler
- `/api/youtube/*` → session verified inside handler

## Slug generation algorithm

```
1. Take Google display name → lowercase → replace non-alphanumeric with "-" → trim hyphens
2. Append "-" + 4 random hex chars (e.g., "john-doe-a3f2")
3. Check uniqueness in DB
4. If collision (extremely unlikely), regenerate suffix
5. Max 3 attempts, then throw
```

Slug is editable once. On edit:
- Set `Creator.previousSlug = old slug`
- Set `Creator.previousSlugExpiresAt = now + 30 days`
- Set `Creator.slug = new slug`
- Middleware handles 301 redirect for `previousSlug` within expiry window
