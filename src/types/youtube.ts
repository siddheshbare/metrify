export interface TopVideo {
  videoId: string;
  title: string;
  thumbnail: string; // maxres or high thumbnail URL
  views: number;
  likes: number;
  comments: number;
  publishedAt: string; // ISO 8601
}

export interface AgeGroupBreakdown {
  // Keys are YouTube Analytics ageGroup dimension values
  // e.g. "AGE_13_17", "AGE_18_24", "AGE_25_34", "AGE_35_44", "AGE_45_54", "AGE_55_64", "AGE_65_"
  [ageGroup: string]: number; // percentage of views
}

export interface GenderBreakdown {
  male: number;   // percentage
  female: number; // percentage
  userSpecified?: number;
}

export interface GeographyEntry {
  country: string; // ISO 3166-1 alpha-2 code
  views: number;
}

export interface Demographics {
  age: AgeGroupBreakdown;
  gender: GenderBreakdown;
  geography: GeographyEntry[]; // top 10 countries
}

export interface GrowthPoint {
  date: string;       // YYYY-MM-DD
  subscribers: number; // cumulative at that day (approximated from delta)
  views: number;       // views on that day
}

export interface YouTubeSnapshotData {
  channelId: string;
  subscribers: number;
  totalViews: number;
  videoCount: number;
  avgViews: number;
  avgEngagement: number; // (likes + comments) / views over last 30 days
  topVideos: TopVideo[];
  demographics: Demographics;
  growthTrend: GrowthPoint[];
}
