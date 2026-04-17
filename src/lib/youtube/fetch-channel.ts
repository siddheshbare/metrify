import { googleFetch } from "./client";
import type { TopVideo } from "@/types/youtube";

const DATA_API = "https://www.googleapis.com/youtube/v3";

// AI-UNVERIFIED: YouTube Data API v3 response shapes — field names inferred from docs; verify against live responses
interface ChannelResponse {
  items?: Array<{
    id: string;
    statistics: {
      subscriberCount: string;
      viewCount: string;
      videoCount: string;
    };
    contentDetails: {
      relatedPlaylists: {
        uploads: string;
      };
    };
  }>;
}

interface PlaylistItemsResponse {
  nextPageToken?: string;
  items?: Array<{
    contentDetails: {
      videoId: string;
    };
  }>;
}

interface VideosResponse {
  items?: Array<{
    id: string;
    snippet: {
      title: string;
      publishedAt: string;
      thumbnails: {
        maxres?: { url: string };
        high?: { url: string };
        medium?: { url: string };
        default?: { url: string };
      };
    };
    statistics: {
      viewCount?: string;
      likeCount?: string;
      commentCount?: string;
    };
  }>;
}

export interface ChannelStats {
  channelId: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  uploadsPlaylistId: string;
}

export async function fetchChannelStats(accessToken: string): Promise<ChannelStats> {
  const url = `${DATA_API}/channels?part=statistics,contentDetails&mine=true`;
  const res = await googleFetch(url, accessToken);
  const data = (await res.json()) as ChannelResponse;

  const channel = data.items?.[0];
  if (!channel) throw new Error("[fetch-channel] No YouTube channel found for this account");

  return {
    channelId: channel.id,
    subscriberCount: parseInt(channel.statistics.subscriberCount, 10),
    viewCount: parseInt(channel.statistics.viewCount, 10),
    videoCount: parseInt(channel.statistics.videoCount, 10),
    uploadsPlaylistId: channel.contentDetails.relatedPlaylists.uploads,
  };
}

// Fetches up to 50 recent video IDs from the uploads playlist
async function fetchUploadedVideoIds(
  playlistId: string,
  accessToken: string,
  maxResults = 50
): Promise<string[]> {
  const url = `${DATA_API}/playlistItems?part=contentDetails&playlistId=${encodeURIComponent(playlistId)}&maxResults=${maxResults}`;
  const res = await googleFetch(url, accessToken);
  const data = (await res.json()) as PlaylistItemsResponse;
  return (data.items ?? []).map((item) => item.contentDetails.videoId);
}

// Fetches stats for a list of video IDs, returns sorted by view count desc
async function fetchVideoStats(
  videoIds: string[],
  accessToken: string
): Promise<TopVideo[]> {
  if (videoIds.length === 0) return [];

  const ids = videoIds.slice(0, 50).join(",");
  const url = `${DATA_API}/videos?part=snippet,statistics&id=${encodeURIComponent(ids)}`;
  const res = await googleFetch(url, accessToken);
  const data = (await res.json()) as VideosResponse;

  const videos = (data.items ?? []).map((item): TopVideo => {
    const thumbnails = item.snippet.thumbnails;
    const thumbnail =
      thumbnails.maxres?.url ??
      thumbnails.high?.url ??
      thumbnails.medium?.url ??
      thumbnails.default?.url ??
      "";

    return {
      videoId: item.id,
      title: item.snippet.title,
      thumbnail,
      views: parseInt(item.statistics.viewCount ?? "0", 10),
      likes: parseInt(item.statistics.likeCount ?? "0", 10),
      comments: parseInt(item.statistics.commentCount ?? "0", 10),
      publishedAt: item.snippet.publishedAt,
    };
  });

  return videos.sort((a, b) => b.views - a.views).slice(0, 10);
}

export async function fetchTopVideos(
  uploadsPlaylistId: string,
  accessToken: string
): Promise<TopVideo[]> {
  const videoIds = await fetchUploadedVideoIds(uploadsPlaylistId, accessToken);
  return fetchVideoStats(videoIds, accessToken);
}
