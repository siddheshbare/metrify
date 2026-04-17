# Environment Setup

## Google Cloud Console (YouTube OAuth + APIs)

### Step 1: Create a project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project: `metrify-poc`

### Step 2: Enable APIs

Enable both of these APIs in your project:
- **YouTube Data API v3** — for channel stats, video list
- **YouTube Analytics API** — for demographics and growth trends

Navigation: APIs & Services → Library → search each API name → Enable

### Step 3: Configure OAuth consent screen

1. APIs & Services → OAuth consent screen
2. User type: **External** (for testing — set to Internal only if G Workspace)
3. App name: `metrify`
4. Developer contact email: your email
5. **Scopes to add**:
   - `../auth/youtube.readonly`
   - `../auth/yt-analytics.readonly`
   - `openid`, `email`, `profile` (added by default)
6. Test users: add your Gmail account during development

### Step 4: Create OAuth credentials

1. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
2. Application type: **Web application**
3. Authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.vercel.app/api/auth/callback/google`
4. Save → copy **Client ID** and **Client Secret**
   → set as `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in `.env.local`

---

## Meta for Developers (Instagram via Facebook Login)

### Step 1: Create an app

1. Go to [developers.facebook.com/apps](https://developers.facebook.com/apps)
2. Create App → Business type → App name: `metrify`
3. Add your Facebook account as a test user

### Step 2: Add Facebook Login product

1. App Dashboard → Add a Product → Facebook Login → Set Up (Web)
2. Settings → Valid OAuth Redirect URIs:
   - Development: `http://localhost:3000/api/instagram/callback`
   - Production: `https://your-domain.vercel.app/api/instagram/callback`

### Step 3: Request permissions (for production)

For development (App Mode: Development), you can test with your own accounts without review.
For production, you need App Review approval for:
- `instagram_basic`
- `instagram_manage_insights`
- `pages_show_list`
- `pages_read_engagement`
- `business_management`

### Step 4: Get credentials

App Dashboard → Settings → Basic:
- **App ID** → set as `META_APP_ID`
- **App Secret** → set as `META_APP_SECRET`

---

## Neon (PostgreSQL)

### Via Vercel Marketplace (recommended for production)

1. Vercel project → Storage → Browse Marketplace → Neon
2. Create a new Neon database
3. Vercel auto-injects: `DATABASE_URL` (pooled) and `DIRECT_URL` (direct)

### For local development

1. Sign up at [neon.tech](https://neon.tech)
2. Create a project → get connection strings
3. Copy the **pooled** connection string as `DATABASE_URL`
4. Copy the **direct** connection string as `DIRECT_URL`
5. Both go in `.env.local`

---

## Generating secrets

```bash
# AUTH_SECRET
openssl rand -base64 32

# ENCRYPTION_KEY (must be exactly 32 bytes when decoded)
openssl rand -base64 32
```
