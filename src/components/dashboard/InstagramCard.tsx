"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink } from "lucide-react";
import { IgHashtags } from "@/components/shared/IgHashtags";
import { IgDemographics } from "@/components/shared/IgDemographics";
import { toast } from "sonner";
import Image from "next/image";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { IgInsightsData } from "@/types/instagram";

interface InstagramPost {
  mediaId: string;
  caption: string;
  mediaType: string;
  mediaUrl: string;
  permalink: string;
  likes: number;
  comments: number;
  timestamp: string;
}

interface InstagramCardProps {
  followers: number;
  following: number;
  mediaCount: number;
  avgLikes: number;
  avgComments: number;
  avgEngagement: number;
  reach30d: string;
  impressions30d: string;
  topPosts: InstagramPost[];
  insights: IgInsightsData;
  fetchedAt: string;
  tokenExpired?: boolean;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function fmtDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const MEDIA_TYPE_LABELS: Record<string, string> = {
  IMAGE: "Photo",
  VIDEO: "Video",
  CAROUSEL_ALBUM: "Carousel",
};

export function InstagramCard({
  followers, following, mediaCount, avgLikes, avgComments, avgEngagement,
  reach30d, impressions30d, topPosts, insights, fetchedAt, tokenExpired,
}: InstagramCardProps) {
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/instagram/refresh");
      const data = (await res.json()) as { cached?: boolean; error?: string };
      if (data.error) toast.error(data.error);
      else if (data.cached) toast.info("Snapshot is fresh — refreshes every 6 hours");
      else { toast.success("Instagram snapshot updated"); window.location.reload(); }
    } catch {
      toast.error("Refresh failed");
    } finally {
      setRefreshing(false);
    }
  }

  const trendPoints = insights.trend.slice(-30).map((p) => ({
    ...p,
    label: p.date.slice(5),
  }));
  const hasTrend = trendPoints.some((p) => p.reach > 0);

  return (
    <Card className="border-border/50 bg-card/60">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IgIcon />
            <span className="font-semibold text-sm">Instagram</span>
            <Badge variant="outline" className="text-xs font-mono">
              {mediaCount} posts
            </Badge>
            {tokenExpired && (
              <Badge variant="destructive" className="text-xs">Token expired</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {new Date(fetchedAt).toLocaleDateString()}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              disabled={refreshing}
              className="h-7 w-7 p-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Stat label="Followers" value={fmt(followers)} accent />
          <Stat label="Following" value={fmt(following)} />
          <Stat label="Engagement" value={`${(avgEngagement * 100).toFixed(2)}%`} />
          <Stat label="Avg Likes" value={fmt(avgLikes)} />
          <Stat label="Avg Comments" value={fmt(avgComments)} />
          <Stat label="Posts" value={fmt(mediaCount)} />
        </div>

        {/* Reach + Impressions */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-muted/30 border border-border/30">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">30d reach</span>
            <span className="stat-number text-xl ml-auto" style={{ color: "var(--emerald)" }}>
              {fmt(Number(reach30d))}
            </span>
          </div>
          <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-muted/30 border border-border/30">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">30d views</span>
            <span className="stat-number text-xl ml-auto text-foreground">
              {fmt(Number(impressions30d))}
            </span>
          </div>
        </div>

        {/* Daily reach trend */}
        {hasTrend && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">30-day reach trend</p>
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={trendPoints} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="igReachGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--emerald)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--emerald)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: "oklch(0.556 0 0)" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.205 0 0)",
                    border: "1px solid oklch(0.3 0 0 / 30%)",
                    borderRadius: 6,
                    fontSize: 11,
                  }}
                  formatter={(v) => [fmt(Number(v ?? 0)), "Reach"]}
                  labelStyle={{ color: "oklch(0.556 0 0)", fontSize: 10 }}
                />
                <Area
                  type="monotone"
                  dataKey="reach"
                  stroke="var(--emerald)"
                  strokeWidth={1.5}
                  fill="url(#igReachGrad)"
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top posts */}
        {topPosts.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Top Posts</p>
            <div className="grid grid-cols-3 gap-2">
              {topPosts.slice(0, 3).map((p) => (
                <a
                  key={p.mediaId}
                  href={p.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-lg overflow-hidden border border-border/40 hover:border-border transition-colors bg-muted"
                >
                  <div className="relative aspect-square">
                    {p.mediaUrl ? (
                      <Image
                        src={p.mediaUrl}
                        alt={p.caption.slice(0, 50)}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-20">
                        <IgIcon />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="text-white text-xs font-medium">❤️ {fmt(p.likes)}</span>
                      <ExternalLink className="h-3 w-3 text-white" />
                    </div>
                    {p.mediaType && p.mediaType !== "IMAGE" && (
                      <div className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[9px] px-1 py-0.5 rounded">
                        {MEDIA_TYPE_LABELS[p.mediaType] ?? p.mediaType}
                      </div>
                    )}
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span>❤️ {fmt(p.likes)}</span>
                      <span>·</span>
                      <span>💬 {fmt(p.comments)}</span>
                      {p.timestamp && (
                        <>
                          <span>·</span>
                          <span>{fmtDate(p.timestamp)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Hashtags */}
        {topPosts.length > 0 && (
          <IgHashtags captions={topPosts.map((p) => p.caption)} dark={true} />
        )}

        {/* Audience demographics */}
        {insights.demographics && (
          <div className="pt-2 border-t border-border/30">
            <IgDemographics demographics={insights.demographics} dark={true} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function IgIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p
        className="stat-number text-2xl"
        style={{ color: accent ? "var(--emerald)" : undefined }}
      >
        {value}
      </p>
    </div>
  );
}
