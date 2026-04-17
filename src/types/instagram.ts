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
  insights: InsightPoint[];
}
