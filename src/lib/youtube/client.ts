import { db } from "@/lib/prisma";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

interface RefreshedToken {
  access_token: string;
  expires_in: number;
}

// Retrieves a valid access token for the user, refreshing it if needed.
// Always reads from and writes to the Account table — single source of truth.
export async function getAccessToken(userId: string): Promise<string> {
  const account = await db.account.findFirst({
    where: { userId, provider: "google" },
    select: {
      access_token: true,
      refresh_token: true,
      expires_at: true,
      providerAccountId: true,
    },
  });

  if (!account?.access_token) {
    throw new Error(`[youtube/client] No Google account or access token for user ${userId}`);
  }

  // Return current token if not expired (with 60s buffer)
  const nowSeconds = Date.now() / 1000;
  if (!account.expires_at || nowSeconds < account.expires_at - 60) {
    return account.access_token;
  }

  // Token expired — refresh it
  if (!account.refresh_token) {
    throw new Error(`[youtube/client] Access token expired and no refresh token for user ${userId}`);
  }

  // AI-UNVERIFIED: Google token refresh endpoint and response field names — verify against Google OAuth2 docs
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.AUTH_GOOGLE_ID!,
      client_secret: process.env.AUTH_GOOGLE_SECRET!,
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`[youtube/client] Token refresh failed: ${err}`);
  }

  const refreshed = (await response.json()) as RefreshedToken;
  const newExpiresAt = Math.floor(nowSeconds + refreshed.expires_in);

  await db.account.update({
    where: {
      provider_providerAccountId: {
        provider: "google",
        providerAccountId: account.providerAccountId,
      },
    },
    data: {
      access_token: refreshed.access_token,
      expires_at: newExpiresAt,
    },
  });

  return refreshed.access_token;
}

// Thin authenticated fetch wrapper for Google APIs
export async function googleFetch(
  url: string,
  accessToken: string
): Promise<Response> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 0 }, // never cache — always fresh
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[youtube/client] Google API error ${res.status}: ${body}`);
  }
  return res;
}
