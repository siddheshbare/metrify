# Tech — Stack Decisions & Rationale

## Framework: Next.js 15 (App Router)

- App Router gives us React Server Components by default — fewer client bundles, direct DB access in components.
- Turbopack in dev for fast HMR.
- Vercel deployment is first-class with zero config.
- v15 specifically chosen for stable RSC patterns and `use cache` / `after()` primitives.

## Language: TypeScript strict

- Strict mode catches null/undefined issues at compile time — essential for OAuth callback handling where many fields are optional.

## Styling: Tailwind CSS v4

- v4's PostCSS plugin (`@tailwindcss/postcss`) replaces the old config-file approach with CSS-first configuration.
- No `tailwind.config.js` needed for most customizations — use `@theme` blocks in CSS.
- Significantly smaller output via CSS layers.
- Do NOT use v3 APIs (`@apply` with arbitrary values, JIT config file tricks) — they don't work in v4.

## UI components: shadcn/ui

- Unstyled, copy-paste components that we own — no version lock.
- Already adapted for Tailwind v4.
- Base theme: slate.
- Do not add other UI kits (MUI, Chakra, etc.).

## Database: Prisma + PostgreSQL (Neon)

- Prisma gives type-safe queries generated from schema — catches schema drift at build time.
- Neon provides a serverless PostgreSQL with pooled connections (Prisma Accelerate-compatible).
- Vercel Marketplace integration auto-injects `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) env vars.
- `DIRECT_URL` is required for Prisma migrations — the pooled URL cannot run DDL.

## Auth: NextAuth v5 (Auth.js)

- v5 uses the `auth.ts` + `auth.config.ts` split pattern to support Edge Middleware.
- `auth.config.ts` — edge-safe config (no Node.js-only imports like Prisma).
- `auth.ts` — full config with Prisma adapter, Google provider, token refresh callbacks.
- Google provider handles YouTube scopes; Instagram is a separate custom OAuth flow.

## Instagram OAuth: custom (not NextAuth)

- Meta's Facebook Login is not a standard OIDC provider — it requires a 4-step handshake.
- We implement it manually in `/api/instagram/connect` and `/api/instagram/callback`.
- Long-lived tokens (~60 days) are encrypted at rest (AES-256-GCM).

## Package manager: pnpm

- Strict hoisting prevents phantom dependencies.
- Faster installs via content-addressable store.
- `pnpm-lock.yaml` is committed.

## Deployment: Vercel

- Edge Middleware for route protection (uses `auth.config.ts` — edge-safe).
- Neon integration for DB provisioning.
- `VERCEL_URL` is auto-injected for callback URLs in production.

## What we explicitly rejected

| Option | Reason not chosen |
|--------|------------------|
| Zustand / Redux | No client state management needed — RSC + URL state suffices |
| React Query / SWR | No client-side data fetching — all data from Server Components or snapshots |
| Framer Motion | Out of POC scope |
| React Hook Form | Out of POC scope |
| Drizzle ORM | Prisma chosen for type safety and mature ecosystem |
| MySQL | PostgreSQL chosen for Neon compatibility and JSON column support |
