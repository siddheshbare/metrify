# Metrify — Claude Session Rules

Read this file at the start of every session before doing anything else.

## What this project is

Metrify is a Creator-Brand collaboration POC. Creators sign in with Google, connect YouTube + Instagram, and get a shareable public URL (`/c/[slug]`) showing their metrics to brands. Brands do not sign in.

## Stack (exact versions — do not substitute)

- **Next.js 15** — App Router, TypeScript, Turbopack for dev
- **React 19**
- **Tailwind CSS v4** — PostCSS plugin setup (`@tailwindcss/postcss`), not v3
- **shadcn/ui** — latest, configured for Tailwind v4, base slate theme
- **Prisma (latest)** + PostgreSQL via Neon (Vercel Marketplace)
- **NextAuth v5** (Auth.js beta) — `auth.ts` + `auth.config.ts` split pattern
- **Node.js 20+**, **pnpm**
- Deployment: **Vercel**

## Out of scope for this POC

Do NOT build:
- Brand accounts, brand sign-in, brand dashboards
- Messaging, contracts, payments, campaigns
- TikTok, Twitter, LinkedIn
- Email notifications, background jobs beyond snapshot refresh
- Admin panel

## Folder conventions

See `steering/structure.md` for full folder map.

Key rules:
- Route groups: `(public)`, `(auth)`, `(dashboard)` — match spec exactly
- shadcn components go in `src/components/ui/`
- External API helpers go in `src/lib/youtube/` or `src/lib/instagram/`
- Types go in `src/types/`

## Code rules (read `/.claude/rules/` for full detail)

- TypeScript strict mode always. No `any` unless unavoidable — comment why.
- Server Components by default. `"use client"` only for genuine interactivity.
- Prisma queries only in server code (Server Components, Route Handlers, Server Actions). Never in client code.
- Every external API call wraps in `try/catch` with structured error logging.
- No hardcoded URLs — use env vars or `request.nextUrl.origin`.
- Never commit secrets. `.env.local` is gitignored.

## AI-UNVERIFIED flag convention

Any block where the model guessed at an API shape, wrote complex OAuth/crypto logic, made up rate-limit numbers, or inferred Prisma relation behavior must be flagged:

```ts
// AI-UNVERIFIED: <reason>
```

See `.claude/rules/ai-unverified.md` for full criteria.

## Phase checklist

See `spec/poc-creator-dashboard/tasks.md` for the phase-by-phase build checklist.
Stop after each phase. One phase = one commit.
