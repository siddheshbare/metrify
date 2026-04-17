# Data Flow — Snapshot Strategy & Cache Invalidation

## Snapshot-and-cache pattern

All metrics data is stored in the database as snapshots. Live API calls only happen at specific trigger points.

```
                    ┌─────────────────────────────────────────┐
                    │           Dashboard visit                │
                    │                                         │
                    │  1. Load latest YouTubeSnapshot from DB  │
                    │  2. Check fetchedAt timestamp            │
                    │                                         │
                    │  fetchedAt < 6h ago?                     │
                    │  ┌─────────┐          ┌───────────────┐ │
                    │  │   YES   │          │      NO       │ │
                    │  │         │          │               │ │
                    │  │ Serve   │          │ Trigger fresh │ │
                    │  │ cached  │          │ API fetch     │ │
                    │  │ data    │          │ Save snapshot │ │
                    │  └─────────┘          └───────────────┘ │
                    └─────────────────────────────────────────┘
```

## Snapshot triggers

| Trigger | Platform | Non-blocking? |
|---------|----------|--------------|
| First sign-in (`events.signIn`) | YouTube | Yes (void promise) |
| Dashboard visit (if >6h stale) | YouTube | No (await, show loading) |
| `GET /api/youtube/refresh` | YouTube | No (await) |
| Instagram connected | Instagram | Yes (void promise) |
| Dashboard visit (if >6h stale) | Instagram | No (await, show loading) |

## Rate limiting

- 6-hour debounce per creator per platform.
- Check: `snapshot.fetchedAt > Date.now() - 6 * 60 * 60 * 1000`.
- If within window, return `{ cached: true }` immediately.
- Manual refresh via `/api/youtube/refresh` respects the same 6h window.
- Return HTTP 429 if attempted within window.

## Public page data flow

```
Brand visits /c/[slug]
     │
     ▼
middleware.ts
  └── look up Creator by slug
  └── check isPublic flag
  └── if private → 404
     │
     ▼
/c/[slug]/page.tsx (Server Component)
  └── getLatestSnapshot(creatorId, "youtube")
  └── getLatestSnapshot(creatorId, "instagram")
  └── render static HTML from snapshot data
  └── NO live API calls
```

## Snapshot retention

Old snapshots are **not deleted**. This enables:
- Growth trend charts (comparing snapshots over time)
- Historical data for the creator
- Debugging / audit trail

The `getLatestSnapshot()` helper queries `ORDER BY fetchedAt DESC LIMIT 1`.

## Cache-Control headers

| Route | Cache-Control |
|-------|---------------|
| `/c/[slug]` | `s-maxage=3600, stale-while-revalidate=86400` |
| `/dashboard` | `no-store` |
| `/api/youtube/refresh` | `no-store` |
| `/api/instagram/callback` | `no-store` |

## Growth trend data

`YouTubeSnapshot.growthTrend` stores the last 90 days of daily data:
```json
[
  { "date": "2024-01-01", "subscribers": 12500, "views": 450000 },
  { "date": "2024-01-02", "subscribers": 12520, "views": 451200 },
  ...
]
```

This is fetched from YouTube Analytics API's `timeDimension: "day"` query and saved as-is.

On the next snapshot, a full new 90-day window is fetched and saved.
The old snapshot's `growthTrend` is preserved in the DB for historical comparison.

## Instagram token refresh

Instagram long-lived tokens expire after ~60 days. Refresh strategy:
- On each IG snapshot attempt, check `Creator.instagramTokenExpiresAt`.
- If within 7 days of expiry: call `/v21.0/oauth/access_token?grant_type=ig_refresh_token` to refresh.
- Update `instagramLongLivedToken` and `instagramTokenExpiresAt` in DB.
- If already expired: mark as disconnected, prompt creator to reconnect.

// AI-UNVERIFIED: Instagram token refresh endpoint path and grant_type value — verify against Meta docs
