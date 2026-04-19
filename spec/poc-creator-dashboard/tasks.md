# Tasks — Phase-by-Phase Build Checklist

Each phase ends with a stop. One phase = one commit. Do not proceed to the next phase without explicit confirmation.

---

## Phase 1: Scaffolding + docs ✓

- [x] Initialize pnpm project
- [x] Install Next.js 15, React 19, Tailwind v4, shadcn/ui (base slate)
- [x] Install Prisma (latest), NextAuth v5, @auth/prisma-adapter
- [x] Create full folder structure
- [x] Write CLAUDE.md
- [x] Write .claude/rules/ (code-style, security, ai-unverified)
- [x] Write steering/ (product, tech, structure)
- [x] Write spec/poc-creator-dashboard/ (requirements, design, tasks)
- [x] Write architecture/ (env-setup, oauth-flows, data-flow)
- [x] Write .env.example, .gitignore, README.md
- [x] Initialize Prisma schema (full data model)
- [x] Generate Prisma client
- [ ] shadcn/ui init (base slate theme) — see Phase 1 notes

**Stop. Wait for confirmation before Phase 2.**

---

## Phase 2: Database + auth foundation ✓

- [x] Run `prisma migrate dev --name init` (requires DATABASE_URL in .env.local)
- [x] Implement `src/lib/prisma.ts` singleton (uses @prisma/adapter-pg for Prisma v7)
- [x] Implement `src/lib/auth.ts` + `src/lib/auth.config.ts`
- [x] Implement `src/lib/crypto.ts` (AES-256-GCM)
- [x] Implement `src/lib/slug.ts`
- [x] Set up `middleware.ts` for route protection
- [x] Create `/sign-in` page (Google button only)
- [x] Create `src/app/api/auth/[...nextauth]/route.ts`

**Stop. Manual test checklist:**
1. Set DATABASE_URL + DIRECT_URL in .env.local
2. Run `pnpm db:migrate`
3. Sign in with Google → check Account + User rows in DB
4. Visit /dashboard without session → confirm redirect to /sign-in
5. Check that refresh_token is stored in Account table

---

## Phase 3: YouTube integration ✓

- [x] `src/lib/youtube/client.ts` — Google API client + token refresh
- [x] `src/lib/youtube/fetch-channel.ts` — Data API
- [x] `src/lib/youtube/fetch-analytics.ts` — Analytics API
- [x] `src/lib/youtube/snapshot.ts` — orchestrator
- [x] `src/lib/repo.ts` — getLatestSnapshot helpers + isSnapshotStale
- [x] NextAuth `events.signIn` → trigger snapshot (non-blocking)
- [x] `GET /api/youtube/refresh` route
- [x] `src/types/youtube.ts` — all TypeScript types

**Stop. Manual test checklist:**
1. Sign in → check YouTubeSnapshot row created in DB
2. Visit /api/youtube/refresh → check new snapshot (or 429 if <6h)
3. Verify snapshot JSON shape matches types in src/types/youtube.ts

---

## Phase 4: Instagram integration ✓

- [x] `src/lib/instagram/oauth.ts` — handshake helpers
- [x] `GET /api/instagram/connect` route
- [x] `GET /api/instagram/callback` route
- [x] `POST /api/instagram/disconnect` route
- [x] `src/lib/instagram/fetch-profile.ts`
- [x] `src/lib/instagram/fetch-media.ts`
- [x] `src/lib/instagram/fetch-insights.ts`
- [x] `src/lib/instagram/snapshot.ts`
- [x] Add AI-UNVERIFIED flags

**Stop. Manual test checklist:**
1. Click Connect Instagram → confirm FB OAuth redirect with correct scopes
2. Complete FB OAuth → check Creator.instagramBusinessId and encrypted token in DB
3. Check InstagramSnapshot row created
4. Disconnect Instagram → confirm token cleared

---

## Phase 5: UI ✓

- [x] Install shadcn components: button, card, tabs, avatar, badge, dialog, input, label, separator, skeleton, sonner, switch, textarea
- [x] Install Recharts
- [x] Build `/dashboard` page + components
- [x] Build `/connections` page
- [x] Build `/settings` page
- [x] Build `/c/[slug]` public page
- [x] Build `/` landing page
- [x] Previous-slug 301 redirect handled in `/c/[slug]/page.tsx`

**Stop. Manual test checklist:**
1. Full happy path: sign in → dashboard → connect IG → share link → open link in incognito
2. Slug edit → test old slug 301 redirect
3. Toggle visibility → test public page 404

---

## Phase 6: Seed + polish

- [ ] Write `prisma/seed.ts` (3 fake creators with YT + IG snapshots)
- [ ] Add loading skeletons to dashboard and public page
- [ ] Add error boundaries
- [ ] Add pnpm scripts: dev, build, seed, db:studio, db:migrate
- [ ] Write `architecture/deployment.md`
- [ ] Optional: `vercel.json`

**Done. Final summary.**
