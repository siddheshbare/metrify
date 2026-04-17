import type { InstagramPost } from "@/types/instagram";

const GRAPH_API = "https://graph.facebook.com/v21.0";

// AI-UNVERIFIED: IG media fields (like_count, comments_count) — verify availability for Business accounts vs Creator accounts
interface MediaItem {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  permalink?: string;
  like_count?: number;
  comments_count?: number;
  timestamp?: string;
}

interface MediaResponse {
  data: MediaItem[];
}

export async function fetchTopMedia(
  igUserId: string,
  accessToken: string
): Promise<InstagramPost[]> {
  const url = new URL(`${GRAPH_API}/${igUserId}/media`);
  url.searchParams.set(
    "fields",
    "id,caption,media_type,media_url,permalink,like_count,comments_count,timestamp"
  );
  url.searchParams.set("limit", "12");
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[instagram/fetch-media] ${res.status}: ${body}`);
  }

  const data = (await res.json()) as MediaResponse;

  return (data.data ?? []).map((item): InstagramPost => ({
    mediaId: item.id,
    caption: item.caption ?? "",
    mediaType: item.media_type ?? "IMAGE",
    mediaUrl: item.media_url ?? "",
    permalink: item.permalink ?? "",
    likes: item.like_count ?? 0,
    comments: item.comments_count ?? 0,
    timestamp: item.timestamp ?? "",
  }));
}
