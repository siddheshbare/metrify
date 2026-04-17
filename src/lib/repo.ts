import { db } from "@/lib/prisma";
import type { YouTubeSnapshot, InstagramSnapshot } from "@prisma/client";

export async function getLatestYouTubeSnapshot(
  creatorId: string
): Promise<YouTubeSnapshot | null> {
  return db.youTubeSnapshot.findFirst({
    where: { creatorId },
    orderBy: { fetchedAt: "desc" },
  });
}

export async function getLatestInstagramSnapshot(
  creatorId: string
): Promise<InstagramSnapshot | null> {
  return db.instagramSnapshot.findFirst({
    where: { creatorId },
    orderBy: { fetchedAt: "desc" },
  });
}

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

export function isSnapshotStale(fetchedAt: Date): boolean {
  return Date.now() - fetchedAt.getTime() > SIX_HOURS_MS;
}
