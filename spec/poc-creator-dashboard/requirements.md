# Requirements — POC Creator Dashboard

## User stories

### Authentication

- **US-01** As a creator, I can sign in with my Google account so that my YouTube channel is automatically connected.
- **US-02** As a creator, after signing in, I am redirected to `/dashboard` where I can see my YouTube metrics.
- **US-03** As a creator, I can sign out and my session is cleared.

### YouTube metrics

- **US-04** As a creator, on my dashboard I can see: subscriber count, total views, video count, average views per video, and average engagement rate (last 30 days).
- **US-05** As a creator, I can see a list of my top 10 videos by view count, with thumbnail, title, views, likes, and comments.
- **US-06** As a creator, I can see audience demographics: age group breakdown, gender split, and top countries.
- **US-07** As a creator, I can see a growth trend chart showing subscribers and views over the last 90 days.
- **US-08** As a creator, my YouTube metrics are cached and will not re-fetch from the API more than once every 6 hours.

### Instagram

- **US-09** As a creator, from the `/connections` page I can connect my Instagram Business account via a Facebook Login OAuth flow.
- **US-10** As a creator, after connecting Instagram, I can see IG metrics on my dashboard: followers, media count, average likes, average comments, engagement rate, reach (30d), impressions (30d).
- **US-11** As a creator, I can see my top posts by engagement, with media thumbnail, caption snippet, likes, and comments.
- **US-12** As a creator, I can disconnect Instagram from the `/connections` page, which removes the token and clears IG data from my profile.

### Public page

- **US-13** As a creator, I have a unique public URL at `/c/[slug]` that I can share with brands.
- **US-14** As a brand, I can visit a creator's public URL without signing in and see their YouTube + Instagram metrics.
- **US-15** As a brand, the public page shows the same metrics as the creator's dashboard (from the latest snapshot).
- **US-16** As a creator, my public page is live as soon as my first snapshot is taken (on sign-in).

### Slug management

- **US-17** As a creator, my slug is auto-generated from my Google display name (e.g., `john-doe-a3f2`).
- **US-18** As a creator, from `/settings` I can change my slug once (the old slug then 301-redirects for 30 days).
- **US-19** As a creator, if I try to use a slug already taken by another creator, I see a "slug taken" error.
- **US-20** As a creator, I can toggle my public page visibility (public/private) from `/settings`.

### Settings

- **US-21** As a creator, from `/settings` I can update my display name, bio, and niche.
- **US-22** As a creator, my profile image comes from my Google account (not editable in POC).

## Acceptance criteria

### AC-01: YouTube data on dashboard

Given a signed-in creator with a YouTube channel connected:
- Dashboard shows subscriber count, total views, video count
- Dashboard shows avg views and avg engagement (last 30 days)
- Top 10 videos are listed with thumbnail, title, views, likes, comments
- Demographics section shows age, gender, geography charts
- Growth trend chart shows 90 days of data

### AC-02: Instagram connection

Given a creator clicks "Connect Instagram":
- They are redirected to Facebook Login with correct scopes
- After authorizing, they land back on `/connections` showing IG connected
- Dashboard IG section populates with metrics

### AC-03: Public page

Given a creator's slug is `john-doe-a3f2`:
- `GET /c/john-doe-a3f2` returns 200 without auth
- Metrics shown match the latest YouTubeSnapshot / InstagramSnapshot
- If creator sets visibility to private, page returns 404

### AC-04: Slug 301 redirect

Given a creator changed slug from `old-slug` to `new-slug`:
- `GET /c/old-slug` returns 301 to `/c/new-slug` for 30 days
- After 30 days, `GET /c/old-slug` returns 404

### AC-05: Snapshot rate limiting

Given a creator visits the dashboard:
- If last snapshot is less than 6 hours old, data is served from DB without API calls
- If last snapshot is more than 6 hours old, a fresh API fetch is triggered and saved
