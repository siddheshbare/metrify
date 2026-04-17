import type { InsightPoint } from "@/types/instagram";

const GRAPH_API = "https://graph.facebook.com/v21.0";

// AI-UNVERIFIED: metric/period/metric_type combinations — confirmed reach works as time-series,
// views+profile_views require metric_type=total_value (verified from live 400 errors)
interface InsightValue {
  value: number;
  end_time: string;
}

interface TimeSeriesMetric {
  name: string;
  values: InsightValue[];
}

interface TimeSeriesResponse {
  data: TimeSeriesMetric[];
}

interface TotalValueMetric {
  name: string;
  total_value: { value: number };
}

interface TotalValueResponse {
  data: TotalValueMetric[];
}

export async function fetchInsights(
  igUserId: string,
  accessToken: string
): Promise<{ points: InsightPoint[]; reach30d: number; impressions30d: number }> {
  const now = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

  // Fetch reach as daily time series for the trend chart
  const reachUrl = new URL(`${GRAPH_API}/${igUserId}/insights`);
  reachUrl.searchParams.set("metric", "reach");
  reachUrl.searchParams.set("period", "day");
  reachUrl.searchParams.set("since", String(thirtyDaysAgo));
  reachUrl.searchParams.set("until", String(now));
  reachUrl.searchParams.set("access_token", accessToken);

  // Fetch views + profile_views as totals
  const totalsUrl = new URL(`${GRAPH_API}/${igUserId}/insights`);
  totalsUrl.searchParams.set("metric", "views,profile_views");
  totalsUrl.searchParams.set("period", "day");
  totalsUrl.searchParams.set("metric_type", "total_value");
  totalsUrl.searchParams.set("since", String(thirtyDaysAgo));
  totalsUrl.searchParams.set("until", String(now));
  totalsUrl.searchParams.set("access_token", accessToken);

  const [reachRes, totalsRes] = await Promise.all([
    fetch(reachUrl.toString(), { next: { revalidate: 0 } }),
    fetch(totalsUrl.toString(), { next: { revalidate: 0 } }),
  ]);

  if (!reachRes.ok) {
    const body = await reachRes.text();
    throw new Error(`[instagram/fetch-insights] reach ${reachRes.status}: ${body}`);
  }
  if (!totalsRes.ok) {
    const body = await totalsRes.text();
    throw new Error(`[instagram/fetch-insights] totals ${totalsRes.status}: ${body}`);
  }

  const reachData = (await reachRes.json()) as TimeSeriesResponse;
  const totalsData = (await totalsRes.json()) as TotalValueResponse;

  const reachMetric = reachData.data.find((m) => m.name === "reach");
  const points: InsightPoint[] = (reachMetric?.values ?? []).map((v) => ({
    date: v.end_time.slice(0, 10),
    reach: v.value,
    impressions: 0,
    profileViews: 0,
  }));

  const reach30d = points.reduce((sum, p) => sum + p.reach, 0);
  const impressions30d =
    totalsData.data.find((m) => m.name === "views")?.total_value.value ?? 0;

  return { points, reach30d, impressions30d };
}
