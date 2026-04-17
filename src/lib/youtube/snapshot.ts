import { db } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { getAccessToken } from "./client";
import { fetchChannelStats, fetchTopVideos } from "./fetch-channel";
import { fetchDemographics, fetchGrowthTrend, fetchEngagement } from "./fetch-analytics";
import { getLatestYouTubeSnapshot, isSnapshotStale } from "@/lib/repo";
import type { YouTubeSnapshotData } from "@/types/youtube";
import type { YouTubeSnapshot } from "@prisma/client";

export interface SnapshotResult {
  snapshot: YouTubeSnapshot;
  cached: boolean;
}

export async function takeYouTubeSnapshot(userId: string): Promise<SnapshotResult> {
  // Look up the Creator record for this user
  const creator = await db.creator.findUnique({
    where: { userId },
    select: { id: true, youtubeChannelId: true },
  });

  if (!creator) throw new Error(`[youtube/snapshot] No creator found for userId ${userId}`);

  // Return cached snapshot if it's fresh enough
  const existing = await getLatestYouTubeSnapshot(creator.id);
  if (existing && !isSnapshotStale(existing.fetchedAt)) {
    return { snapshot: existing, cached: true };
  }

  // Fetch a fresh access token (refreshes if needed)
  const accessToken = await getAccessToken(userId);

  // Fetch all data in parallel where possible
  const channelStats = await fetchChannelStats(accessToken);

  const [topVideos, demographics, growthTrend, engagement] = await Promise.all([
    fetchTopVideos(channelStats.uploadsPlaylistId, accessToken),
    fetchDemographics(accessToken),
    fetchGrowthTrend(accessToken),
    fetchEngagement(accessToken),
  ]);

  // Compute averages
  const avgViews =
    channelStats.videoCount > 0
      ? Math.round(channelStats.viewCount / channelStats.videoCount)
      : 0;

  const avgEngagement =
    engagement.views > 0
      ? (engagement.likes + engagement.comments) / engagement.views
      : 0;

  const snapshotData: YouTubeSnapshotData = {
    channelId: channelStats.channelId,
    subscribers: channelStats.subscriberCount,
    totalViews: channelStats.viewCount,
    videoCount: channelStats.videoCount,
    avgViews,
    avgEngagement,
    topVideos,
    demographics,
    growthTrend,
  };

  // Persist to DB
  const snapshot = await db.youTubeSnapshot.create({
    data: {
      creatorId: creator.id,
      subscribers: BigInt(snapshotData.subscribers),
      totalViews: BigInt(snapshotData.totalViews),
      videoCount: snapshotData.videoCount,
      avgViews: BigInt(snapshotData.avgViews),
      avgEngagement: snapshotData.avgEngagement,
      topVideos: snapshotData.topVideos as unknown as Prisma.InputJsonValue,
      demographics: snapshotData.demographics as unknown as Prisma.InputJsonValue,
      growthTrend: snapshotData.growthTrend as unknown as Prisma.InputJsonValue,
    },
  });

  // Update creator's linked channel ID if not set
  if (!creator.youtubeChannelId) {
    await db.creator.update({
      where: { id: creator.id },
      data: {
        youtubeChannelId: channelStats.channelId,
        youtubeConnectedAt: new Date(),
      },
    });
  }

  return { snapshot, cached: false };
}
