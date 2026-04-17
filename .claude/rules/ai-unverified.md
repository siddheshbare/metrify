# AI-UNVERIFIED Flag Convention

## When to flag

Add `// AI-UNVERIFIED: <reason>` to any code block where:

1. **API shape guessed** — the model wrote a call to a Meta Graph API or Google API endpoint
   without verifying the exact request/response shape from official docs.

2. **OAuth flow logic** — any step in the Facebook Login 4-step handshake, token exchange,
   token refresh, or state verification that is complex enough to have edge cases.

3. **Crypto code** — any use of AES-256-GCM, IV generation, key derivation, or
   `crypto.subtle`/Node `crypto` module that the model wrote from pattern-matching
   rather than verified spec.

4. **Rate limits / retry logic** — any hardcoded number like "6 hours", "3 retries",
   "429 backoff" that was inferred rather than taken from API documentation.

5. **Prisma relation behavior** — any complex `include`, `select`, `upsert`, or
   transaction pattern where the model assumed behavior rather than confirmed it
   against Prisma docs for the current version.

6. **NextAuth v5 internals** — anything in `auth.ts` that touches events, callbacks,
   JWT handling, or session shape — v5 API differs significantly from v4.

## Format

```ts
// AI-UNVERIFIED: guessed Meta Graph API /me/accounts response shape — verify field names
const pages = response.data; // may be response.data.pages or just response.data
```

```ts
// AI-UNVERIFIED: assumed AES-256-GCM authTag is 16 bytes — confirm against Node crypto docs
const authTag = cipher.getAuthTag(); // should be 16 bytes by default
```

## What NOT to flag

- Standard Next.js App Router patterns (layout.tsx, route.ts, Server Actions).
- Well-established Tailwind/shadcn patterns.
- Basic Prisma CRUD that mirrors the schema exactly.
- TypeScript type definitions that mirror documented API responses.

## Reviewer obligation

Before merging any phase, the human reviewer must:
1. Grep for `AI-UNVERIFIED` in all changed files.
2. Verify each flagged block against official documentation.
3. Remove the flag comment once verified (or rewrite the code if wrong).
