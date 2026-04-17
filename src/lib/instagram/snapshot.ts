import { db } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { fetchInstagramProfile } from "./fetch-profile";
import { fetchTopMedia } from "./fetch-media";
import { fetchInsights } from "./fetch-insights";
import { getLatestInstagramSnapshot, isSnapshotStale } from "@/lib/repo";
import type { InstagramSnapshotData } from "@/types/instagram";
import type { Prisma } from "@prisma/client";
import type { InstagramSnapshot } from "@prisma/client";

export interface SnapshotResult {
  snapshot: InstagramSnapshot;
  cached: boolean;
}

export async function takeInstagramSnapshot(userId: string): Promise<SnapshotResult> {
  const creator = await db.creator.findUnique({
    where: { userId },
    select: {
      id: true,
      instagramBusinessId: true,
      instagramLongLivedToken: true,
      instagramTokenExpiresAt: true,
    },
  });

  if (!creator) throw new Error(`[instagram/snapshot] No creator found for userId ${userId}`);
  if (!creator.instagramBusinessId || !creator.instagramLongLivedToken) {
    throw new Error(`[instagram/snapshot] Instagram not connected for userId ${userId}`);
  }

  const existing = await getLatestInstagramSnapshot(creator.id);
  if (existing && !isSnapshotStale(existing.fetchedAt)) {
    return { snapshot: existing, cached: true };
  }

  const accessToken = decrypt(creator.instagramLongLivedToken);
  const igUserId = creator.instagramBusinessId;

  const [profile, topPosts, insightsResult] = await Promise.all([
    fetchInstagramProfile(igUserId, accessToken),
    fetchTopMedia(igUserId, accessToken),
    fetchInsights(igUserId, accessToken),
  ]);

  const avgLikes =
    topPosts.length > 0
      ? Math.round(topPosts.reduce((sum, p) => sum + p.likes, 0) / topPosts.length)
      : 0;

  const avgComments =
    topPosts.length > 0
      ? Math.round(topPosts.reduce((sum, p) => sum + p.comments, 0) / topPosts.length)
      : 0;

  const avgEngagement =
    profile.followersCount > 0
      ? (avgLikes + avgComments) / profile.followersCount
      : 0;

  const snapshotData: InstagramSnapshotData = {
    igUserId,
    followers: profile.followersCount,
    following: profile.followsCount,
    mediaCount: profile.mediaCount,
    avgLikes,
    avgComments,
    avgEngagement,
    reach30d: insightsResult.reach30d,
    impressions30d: insightsResult.impressions30d,
    topPosts,
    insights: insightsResult.points,
  };

  const snapshot = await db.instagramSnapshot.create({
    data: {
      creatorId: creator.id,
      followers: snapshotData.followers,
      following: snapshotData.following,
      mediaCount: snapshotData.mediaCount,
      avgLikes: snapshotData.avgLikes,
      avgComments: snapshotData.avgComments,
      avgEngagement: snapshotData.avgEngagement,
      reach30d: BigInt(snapshotData.reach30d),
      impressions30d: BigInt(snapshotData.impressions30d),
      topPosts: snapshotData.topPosts as unknown as Prisma.InputJsonValue,
      insights: snapshotData.insights as unknown as Prisma.InputJsonValue,
    },
  });

  return { snapshot, cached: false };
}
