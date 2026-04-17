# Structure — Folder Conventions

## Root layout

```
metrify/
├── CLAUDE.md                          # root rules — read every session
├── .claude/rules/                     # code-style, security, ai-unverified rules
├── steering/                          # product, tech, and structure docs
├── spec/poc-creator-dashboard/        # requirements, design, tasks
├── architecture/                      # env setup, OAuth flows, data flow docs
├── prisma/                            # schema + seed
├── src/                               # all application code
├── public/                            # static assets
└── [config files]                     # next.config.ts, tailwind.config.ts, etc.
```

## App Router structure (`src/app/`)

Route groups keep layout concerns separate:

```
src/app/
├── (public)/                          # no auth required
│   ├── page.tsx                       # marketing landing
│   └── c/[slug]/page.tsx              # public creator page
├── (auth)/
│   └── sign-in/page.tsx               # Google sign-in
├── (dashboard)/                       # requires session
│   ├── dashboard/page.tsx
│   ├── connections/page.tsx
│   └── settings/page.tsx
├── api/
│   ├── auth/[...nextauth]/route.ts    # NextAuth handler
│   ├── instagram/connect/route.ts
│   ├── instagram/callback/route.ts
│   ├── youtube/refresh/route.ts
│   └── creator/slug-check/route.ts
└── layout.tsx                         # root layout
```

## Components (`src/components/`)

```
src/components/
├── ui/                                # shadcn components (auto-generated, owned)
├── dashboard/                         # metric cards, charts, top-videos grid
├── public-page/                       # public creator page sections
└── shared/                            # reused across dashboard + public page
```

## Lib (`src/lib/`)

```
src/lib/
├── auth.ts                            # NextAuth full config (Prisma adapter, callbacks)
├── auth.config.ts                     # NextAuth edge-safe config
├── prisma.ts                          # Prisma client singleton
├── crypto.ts                          # AES-256-GCM encrypt/decrypt
├── slug.ts                            # slug generation + collision logic
├── utils.ts                           # cn(), formatNumber(), etc.
├── youtube/
│   ├── client.ts                      # Google API client + token refresh
│   ├── fetch-channel.ts               # YouTube Data API calls
│   ├── fetch-analytics.ts             # YouTube Analytics API calls
│   └── snapshot.ts                    # orchestrator: fetch + save to DB
└── instagram/
    ├── oauth.ts                       # 4-step FB Login handshake helpers
    ├── fetch-profile.ts
    ├── fetch-media.ts
    ├── fetch-insights.ts
    └── snapshot.ts
```

## Types (`src/types/`)

```
src/types/
├── youtube.ts                         # YouTubeChannelStats, TopVideo, Demographics, etc.
└── instagram.ts                       # InstagramProfile, MediaPost, InsightsTrend, etc.
```

## Naming conventions

- **Route files**: `page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`, `error.tsx`
- **Component files**: `PascalCase.tsx` (e.g., `MetricCard.tsx`, `TopVideosGrid.tsx`)
- **Lib files**: `kebab-case.ts` (e.g., `fetch-channel.ts`, `slug.ts`)
- **Type files**: `kebab-case.ts`, types themselves are `PascalCase`

## Import alias

`@/*` maps to `src/*`. Always use this alias, never relative `../../` paths.
