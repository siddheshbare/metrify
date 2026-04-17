# OAuth Flows

## Google / YouTube OAuth (via NextAuth v5)

```
Creator browser         Next.js server          Google OAuth
     │                       │                        │
     │  Click "Sign in with  │                        │
     │  Google"              │                        │
     │──────────────────────>│                        │
     │                       │  Redirect to Google    │
     │<──────────────────────│  with scope, state     │
     │                       │                        │
     │  Authorize on Google  │                        │
     │──────────────────────────────────────────────->│
     │                       │                        │
     │  Redirect to          │                        │
     │  /api/auth/callback/  │  code, state           │
     │  google               │<───────────────────────│
     │──────────────────────>│                        │
     │                       │  Exchange code for     │
     │                       │  access_token +        │
     │                       │  refresh_token         │
     │                       │──────────────────────->│
     │                       │<───────────────────────│
     │                       │                        │
     │                       │  Store tokens in       │
     │                       │  Account table         │
     │                       │  (NextAuth adapter)    │
     │                       │                        │
     │                       │  events.signIn         │
     │                       │  → trigger YT snapshot │
     │                       │  (non-blocking)        │
     │  Redirect to          │                        │
     │  /dashboard           │                        │
     │<──────────────────────│                        │
```

### Token refresh

On every request where session is read:
```
auth.ts callbacks.session()
  → check Account.expires_at
  → if expired: call google.com/oauth2/token with refresh_token
  → update Account row with new access_token + expires_at
  → continue with refreshed token
```

### Required params

```ts
authorization: {
  params: {
    scope: "openid email profile https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly",
    access_type: "offline",
    prompt: "consent",  // ensures refresh_token is always returned
  }
}
```

---

## Facebook / Instagram OAuth (custom 4-step)

```
Creator browser         Next.js server          Facebook API
     │                       │                        │
     │  Click "Connect       │                        │
     │  Instagram"           │                        │
     │──────────────────────>│                        │
     │                       │  Generate state UUID   │
     │                       │  Store in signed       │
     │                       │  HttpOnly cookie       │
     │                       │  Build FB OAuth URL    │
     │  Redirect to          │                        │
     │  facebook.com/dialog/ │                        │
     │  oauth?...            │                        │
     │<──────────────────────│                        │
     │                       │                        │
     │  Authorize on         │                        │
     │  Facebook             │                        │
     │──────────────────────────────────────────────->│
     │                       │                        │
     │  Redirect to          │  code, state           │
     │  /api/instagram/      │<───────────────────────│
     │  callback             │                        │
     │──────────────────────>│                        │
     │                       │                        │
     │          STEP 1: Verify state (CSRF check)      │
     │                       │                        │
     │          STEP 2: Exchange code for short-lived  │
     │                       │  GET /v21.0/oauth/     │
     │                       │  access_token?code=... │
     │                       │──────────────────────->│
     │                       │  short_lived_token     │
     │                       │<───────────────────────│
     │                       │                        │
     │          STEP 3: Exchange for long-lived (~60d) │
     │                       │  GET /v21.0/oauth/     │
     │                       │  access_token?         │
     │                       │  grant_type=           │
     │                       │  fb_exchange_token&... │
     │                       │──────────────────────->│
     │                       │  long_lived_token      │
     │                       │<───────────────────────│
     │                       │                        │
     │          STEP 4: Get Pages → find IG Business   │
     │                       │  GET /v21.0/me/        │
     │                       │  accounts?...          │
     │                       │──────────────────────->│
     │                       │  pages[]               │
     │                       │<───────────────────────│
     │                       │                        │
     │                       │  Find page where       │
     │                       │  instagram_business_   │
     │                       │  account is set        │
     │                       │                        │
     │                       │  Encrypt long-lived    │
     │                       │  token (AES-256-GCM)   │
     │                       │                        │
     │                       │  Save instagramBusiness│
     │                       │  Id + encrypted token  │
     │                       │  to Creator row        │
     │                       │                        │
     │                       │  Trigger IG snapshot   │
     │                       │  (non-blocking)        │
     │                       │                        │
     │  Redirect to          │                        │
     │  /connections         │                        │
     │<──────────────────────│                        │
```

### Error cases to handle

| Error | Cause | Handling |
|-------|-------|----------|
| `state` mismatch | CSRF attack or cookie expired | 400 + redirect to /connections with error |
| `code` invalid or expired | User took too long | 400 + redirect with error |
| No IG Business account | User has Personal Instagram only | Redirect with `error=no_business_account` |
| Page found but no IG linked | FB Page not connected to IG Business | Redirect with `error=no_ig_on_page` |
| Token expired (on snapshot) | ~60d passed without refresh | Show "reconnect Instagram" prompt |
| Missing scopes | User denied a scope on FB | Redirect with `error=missing_scopes` |
