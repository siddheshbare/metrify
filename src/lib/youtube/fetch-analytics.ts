import { googleFetch } from "./client";
import type { Demographics, GrowthPoint } from "@/types/youtube";

const ANALYTICS_API = "https://youtubeanalytics.googleapis.com/v2/reports";

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return formatDate(d);
}

// AI-UNVERIFIED: YouTube Analytics API v2 response format — columnHeaders + rows tabular shape
// inferred from docs; verify field names and row ordering against live API responses
interface AnalyticsResponse {
  columnHeaders?: Array<{ name: string; columnType: string; dataType: string }>;
  rows?: Array<Array<string | number>>;
}

function rowsToObjects(
  data: AnalyticsResponse
): Record<string, string | number>[] {
  if (!data.columnHeaders || !data.rows) return [];
  const headers = data.columnHeaders.map((h) => h.name);
  return data.rows.map((row) => {
    const obj: Record<string, string | number> = {};
    headers.forEach((key, i) => { obj[key] = row[i] as string | number; });
    return obj;
  });
}

// Fetches age+gender demographics for the last 90 days
async function fetchAgeDemographics(
  accessToken: string
): Promise<{ age: Demographics["age"]; gender: Demographics["gender"] }> {
  // AI-UNVERIFIED: ageGroup + gender dimension combination query — verify this is supported as a single call
  const params = new URLSearchParams({
    ids: "channel==MINE",
    startDate: daysAgo(90),
    endDate: formatDate(new Date()),
    metrics: "viewerPercentage",
    dimensions: "ageGroup,gender",
  });

  const res = await googleFetch(`${ANALYTICS_API}?${params}`, accessToken);
  const data = (await res.json()) as AnalyticsResponse;
  const rows = rowsToObjects(data);

  const age: Demographics["age"] = {};
  let malePct = 0;
  let femalePct = 0;
  let userSpecifiedPct = 0;

  for (const row of rows) {
    const ageGroup = row["ageGroup"] as string;
    const gender = row["gender"] as string;
    const pct = row["viewerPercentage"] as number;

    if (!age[ageGroup]) age[ageGroup] = 0;
    age[ageGroup] += pct;

    if (gender === "male") malePct += pct;
    else if (gender === "female") femalePct += pct;
    else userSpecifiedPct += pct;
  }

  // Normalize age percentages (they are split by gender so sum is ~200)
  for (const key of Object.keys(age)) {
    age[key] = Math.round((age[key] / 2) * 10) / 10;
  }

  return {
    age,
    gender: {
      male: Math.round(malePct / 2 * 10) / 10,
      female: Math.round(femalePct / 2 * 10) / 10,
      ...(userSpecifiedPct > 0 && { userSpecified: Math.round(userSpecifiedPct / 2 * 10) / 10 }),
    },
  };
}

// Fetches top 10 countries by views in the last 90 days
async function fetchGeography(accessToken: string): Promise<Demographics["geography"]> {
  const params = new URLSearchParams({
    ids: "channel==MINE",
    startDate: daysAgo(90),
    endDate: formatDate(new Date()),
    metrics: "views",
    dimensions: "country",
    sort: "-views",
    maxResults: "10",
  });

  const res = await googleFetch(`${ANALYTICS_API}?${params}`, accessToken);
  const data = (await res.json()) as AnalyticsResponse;
  const rows = rowsToObjects(data);

  return rows.map((row) => ({
    country: row["country"] as string,
    views: row["views"] as number,
  }));
}

export async function fetchDemographics(accessToken: string): Promise<Demographics> {
  const [agGender, geography] = await Promise.all([
    fetchAgeDemographics(accessToken),
    fetchGeography(accessToken),
  ]);

  return { ...agGender, geography };
}

// Fetches daily views + subscriber deltas for the last 90 days
export async function fetchGrowthTrend(accessToken: string): Promise<GrowthPoint[]> {
  // AI-UNVERIFIED: subscribersGained/subscribersLost metrics availability — verify channel meets threshold
  const params = new URLSearchParams({
    ids: "channel==MINE",
    startDate: daysAgo(90),
    endDate: formatDate(new Date()),
    metrics: "views,subscribersGained,subscribersLost",
    dimensions: "day",
    sort: "day",
  });

  const res = await googleFetch(`${ANALYTICS_API}?${params}`, accessToken);
  const data = (await res.json()) as AnalyticsResponse;
  const rows = rowsToObjects(data);

  // Convert daily subscriber deltas to a running total offset from day-0
  let runningSubscribers = 0;
  return rows.map((row) => {
    const gained = (row["subscribersGained"] as number) ?? 0;
    const lost = (row["subscribersLost"] as number) ?? 0;
    runningSubscribers += gained - lost;
    return {
      date: row["day"] as string,
      subscribers: runningSubscribers,
      views: row["views"] as number,
    };
  });
}

// Fetches aggregate engagement metrics for the last 30 days
export async function fetchEngagement(accessToken: string): Promise<{
  views: number;
  likes: number;
  comments: number;
}> {
  // AI-UNVERIFIED: `likes` and `comments` metric names in Analytics API — verify these are correct
  const params = new URLSearchParams({
    ids: "channel==MINE",
    startDate: daysAgo(30),
    endDate: formatDate(new Date()),
    metrics: "views,likes,comments",
  });

  const res = await googleFetch(`${ANALYTICS_API}?${params}`, accessToken);
  const data = (await res.json()) as AnalyticsResponse;
  const rows = rowsToObjects(data);
  const row = rows[0] ?? {};

  return {
    views: (row["views"] as number) ?? 0,
    likes: (row["likes"] as number) ?? 0,
    comments: (row["comments"] as number) ?? 0,
  };
}
