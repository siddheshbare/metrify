# Product — POC Vision & Scope

## What metrify is

A lightweight platform where **content creators** sign in once with Google, optionally connect their Instagram Business account, and receive a **shareable public URL** (`/c/[slug]`) that displays their channel metrics. **Brands** visit that URL without signing in — the public page is the product.

## Core value proposition

A creator can hand a brand a single link. That link always shows live-ish (snapshot-cached) metrics: subscriber count, engagement rates, audience demographics, top content. No PDF decks, no screenshots, no "DM me your media kit."

## Target user: creator

- Has a YouTube channel (required — connected via Google sign-in)
- Optionally has an Instagram Business account
- Wants to attract brand partnerships
- May share the link in email pitches, DMs, or their website

## Target user: brand (not a platform user)

- Visits `/c/[slug]` — no sign-in, no account
- Reads the metrics, decides whether to reach out directly
- The platform does not mediate the outreach

## In scope for this POC

- Google OAuth sign-in (NextAuth v5) with YouTube Data API + YouTube Analytics API scopes
- Creator dashboard at `/dashboard` (private)
- Instagram Business connection via Facebook Login OAuth flow
- **YouTube metrics:** subscribers, total views, video count, avg views, avg engagement, per-video top 10, audience demographics (age/geo/gender), growth trends over 90 days
- **Instagram metrics:** followers, media count, per-post performance, reach, impressions, engagement
- Public creator page at `/c/[slug]` showing metrics (minus creator-private flags)
- Snapshot-and-cache pattern: live fetch on dashboard visit, debounced to once per 6 hours; public page reads only from snapshot
- Shareable slug: auto-generated from Google name with `-XXXX` collision suffix, editable once from settings, previous slug 301-redirects for 30 days
- `/connections` page: connect/disconnect YouTube and Instagram
- `/settings` page: edit display name, bio, niche, slug, visibility toggle

## Out of scope (do not build)

- Brand accounts, brand sign-in, brand dashboards
- Messaging, contracts, payments, campaigns
- TikTok, Twitter, LinkedIn integrations
- Email notifications
- Background jobs beyond snapshot refresh on dashboard visit
- Admin panel
- Multi-channel YouTube support (first channel only)
- Instagram Personal accounts (Business only)

## Success criteria for POC

1. A creator can sign in with Google and see their YouTube metrics within 30 seconds.
2. A creator can connect Instagram and see IG metrics on the same dashboard.
3. The public `/c/[slug]` page loads metrics from the latest snapshot without any auth.
4. The slug is shareable and the page is legible to a non-technical brand viewer.
