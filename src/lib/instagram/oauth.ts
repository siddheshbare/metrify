const GRAPH_API = "https://graph.facebook.com/v21.0";

export function buildFBAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: process.env.META_REDIRECT_URI!,
    state,
    scope: [
      "pages_show_list",
      "instagram_basic",
      "instagram_manage_insights",
      "business_management",
    ].join(","),
  });
  return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;
}

// AI-UNVERIFIED: Meta Graph API token exchange endpoint and response field names — verify against Meta docs
interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export async function exchangeCodeForShortLivedToken(code: string): Promise<string> {
  const url = new URL(`${GRAPH_API}/oauth/access_token`);
  url.searchParams.set("client_id", process.env.META_APP_ID!);
  url.searchParams.set("client_secret", process.env.META_APP_SECRET!);
  url.searchParams.set("redirect_uri", process.env.META_REDIRECT_URI!);
  url.searchParams.set("code", code);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[instagram/oauth] Code exchange failed: ${body}`);
  }
  const data = (await res.json()) as TokenResponse;
  return data.access_token;
}

// AI-UNVERIFIED: fb_exchange_token grant type and expires_in field — verify against Meta long-lived token docs
export async function exchangeForLongLivedToken(
  shortLivedToken: string
): Promise<{ token: string; expiresIn: number }> {
  const url = new URL(`${GRAPH_API}/oauth/access_token`);
  url.searchParams.set("grant_type", "fb_exchange_token");
  url.searchParams.set("client_id", process.env.META_APP_ID!);
  url.searchParams.set("client_secret", process.env.META_APP_SECRET!);
  url.searchParams.set("fb_exchange_token", shortLivedToken);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[instagram/oauth] Long-lived token exchange failed: ${body}`);
  }
  const data = (await res.json()) as TokenResponse;
  return { token: data.access_token, expiresIn: data.expires_in ?? 5184000 };
}

// AI-UNVERIFIED: /me/accounts response shape and instagram_business_account field name — verify against Meta Graph API docs
interface PageAccount {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: { id: string };
}

interface AccountsResponse {
  data: PageAccount[];
}

export async function findInstagramBusinessId(
  longLivedToken: string
): Promise<string> {
  const url = new URL(`${GRAPH_API}/me/accounts`);
  url.searchParams.set("fields", "id,name,access_token,instagram_business_account");
  url.searchParams.set("access_token", longLivedToken);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[instagram/oauth] Fetching FB pages failed: ${body}`);
  }
  const data = (await res.json()) as AccountsResponse;

  const page = data.data.find((p) => p.instagram_business_account?.id);
  if (!page?.instagram_business_account?.id) {
    throw new Error("no_business_account");
  }

  return page.instagram_business_account.id;
}
