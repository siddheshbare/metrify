# metrify

A Creator-Brand collaboration platform POC. Creators sign in with Google, connect YouTube and Instagram, and share a public URL (`/c/[slug]`) that shows their channel metrics to brands.

## Stack

- **Next.js 15** (App Router, TypeScript, Turbopack)
- **React 19**
- **Tailwind CSS v4** + **shadcn/ui**
- **Prisma** + **PostgreSQL** (Neon)
- **NextAuth v5** (Google OAuth with YouTube scopes)
- **pnpm**

## Getting started

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- A Neon PostgreSQL database (or local Postgres)
- Google Cloud project with YouTube Data API v3 + YouTube Analytics API enabled
- Meta Developer app (for Instagram connection)

### Setup

```bash
# Install dependencies
pnpm install

# Copy env template and fill in values
cp .env.example .env.local
# Edit .env.local with your credentials (see architecture/env-setup.md)

# Run database migrations
pnpm db:migrate

# Seed development data (optional)
pnpm seed

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start dev server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:studio` | Open Prisma Studio (DB browser) |
| `pnpm seed` | Seed dev database with fake creator data |

## Project docs

- `CLAUDE.md` — Claude session rules (read first every session)
- `steering/product.md` — POC scope and vision
- `steering/tech.md` — Stack decisions and rationale
- `steering/structure.md` — Folder conventions
- `spec/poc-creator-dashboard/requirements.md` — User stories and acceptance criteria
- `spec/poc-creator-dashboard/design.md` — Data model, API routes, OAuth flows
- `spec/poc-creator-dashboard/tasks.md` — Phase-by-phase build checklist
- `architecture/env-setup.md` — Google Cloud + Meta Developer console setup
- `architecture/oauth-flows.md` — OAuth flow diagrams
- `architecture/data-flow.md` — Snapshot strategy and cache invalidation

## Deployment

See `architecture/deployment.md` (created in Phase 6).
