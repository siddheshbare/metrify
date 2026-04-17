# Security Rules

## Secrets and environment variables

- Never commit secrets. `.env.local` is gitignored.
- Never hardcode API keys, client secrets, tokens, or connection strings.
- All secrets come from environment variables only.
- Use `.env.example` as the documented template — fill `.env.local` manually.
- Never log env var values, even in dev.

## OAuth

- Always verify CSRF `state` param in OAuth callbacks before exchanging code.
- Generate `state` using `crypto.randomUUID()` — store in a signed/HttpOnly cookie.
- Never pass tokens in URL query params or fragment — use POST body or headers.
- Instagram long-lived tokens must be encrypted at rest (AES-256-GCM via `src/lib/crypto.ts`).
- Refresh tokens from Google OAuth are stored by NextAuth in the `Account` table — do not duplicate them elsewhere.

## Database

- All Prisma queries run only in server code: Server Components, Route Handlers, Server Actions.
- Never import `src/lib/prisma.ts` in client components or browser-side code.
- Use parameterized queries (Prisma does this automatically — never use raw SQL with string interpolation).
- Apply `onDelete: Cascade` only where data ownership is clear (e.g., Creator → Snapshots).

## HTTP / API routes

- Route Handlers that mutate data must verify the authenticated session first.
- Use `auth()` from NextAuth on every protected handler — never trust client-supplied user IDs.
- Set appropriate `Cache-Control` headers. Public creator pages: `s-maxage=3600, stale-while-revalidate=86400`. Dashboard: `no-store`.
- Never expose internal database IDs in public URLs — use `slug` for creator pages.

## Client-side

- Never store tokens, secrets, or sensitive data in `localStorage` or `sessionStorage`.
- Never render user-controlled content as HTML without sanitization.
- The session object exposed to the client (NextAuth `useSession`) must not contain refresh tokens.

## Encryption helper (src/lib/crypto.ts)

- Use AES-256-GCM with a random IV per encryption.
- `ENCRYPTION_KEY` must be a 32-byte base64 string from env.
- The `encrypt()` function returns `iv:ciphertext:authTag` as a single base64-encoded string.
- The `decrypt()` function splits on `:` and reconstructs IV + auth tag before decrypting.
