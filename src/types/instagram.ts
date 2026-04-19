export interface InstagramProfile {
  igUserId: string;
  username: string;
  name: string;
  profilePictureUrl: string;
  biography: string;
  website: string;
  followersCount: number;
  followsCount: number;
  mediaCount: number;
}

export interface InstagramPost {
  mediaId: string;
  caption: string;
  mediaType: string;
  mediaUrl: string;
  permalink: string;
  likes: number;
  comments: number;
  timestamp: string;
}

export interface InsightPoint {
  date: string;
  reach: number;
  impressions: number;
  profileViews: number;
}

export interface IgAudienceDemographics {
  age: { range: string; value: number }[];
  gender: { label: string; value: number }[];
  country: { code: string; value: number }[];
}

// Stored in InstagramSnapshot.insights JSON column.
// Old snapshots may have InsightPoint[] directly — normalise with parseIgInsights().
export interface IgInsightsData {
  trend: InsightPoint[];
  demographics?: IgAudienceDemographics;
}

export function parseIgInsights(raw: unknown): IgInsightsData {
  if (Array.isArray(raw)) return { trend: raw as InsightPoint[] };
  if (raw && typeof raw === "object" && "trend" in raw) return raw as IgInsightsData;
  return { trend: [] };
}

export interface InstagramSnapshotData {
  igUserId: string;
  followers: number;
  following: number;
  mediaCount: number;
  avgLikes: number;
  avgComments: number;
  avgEngagement: number;
  reach30d: number;
  impressions30d: number;
  topPosts: InstagramPost[];
  insights: IgInsightsData;
}
