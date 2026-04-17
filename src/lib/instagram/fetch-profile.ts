import type { InstagramProfile } from "@/types/instagram";

const GRAPH_API = "https://graph.facebook.com/v21.0";

// AI-UNVERIFIED: IG Business profile fields and response shape — verify field names against Meta Graph API /ig-user docs
interface ProfileResponse {
  id: string;
  username?: string;
  name?: string;
  profile_picture_url?: string;
  biography?: string;
  website?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
}

export async function fetchInstagramProfile(
  igUserId: string,
  accessToken: string
): Promise<InstagramProfile> {
  const url = new URL(`${GRAPH_API}/${igUserId}`);
  url.searchParams.set(
    "fields",
    "id,username,name,profile_picture_url,biography,website,followers_count,follows_count,media_count"
  );
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[instagram/fetch-profile] ${res.status}: ${body}`);
  }

  const data = (await res.json()) as ProfileResponse;

  return {
    igUserId: data.id,
    username: data.username ?? "",
    name: data.name ?? "",
    profilePictureUrl: data.profile_picture_url ?? "",
    biography: data.biography ?? "",
    website: data.website ?? "",
    followersCount: data.followers_count ?? 0,
    followsCount: data.follows_count ?? 0,
    mediaCount: data.media_count ?? 0,
  };
}
