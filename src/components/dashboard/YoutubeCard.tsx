"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { YtDemographics } from "@/components/shared/YtDemographics";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Demographics, GrowthPoint } from "@/types/youtube";

interface TopVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt: string;
}

interface YoutubeCardProps {
  subscribers: string;
  totalViews: string;
  videoCount: number;
  avgViews: string;
  avgEngagement: number;
  topVideos: TopVideo[];
  demographics: Demographics | null;
  growthTrend: GrowthPoint[];
  fetchedAt: string;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function fmtBig(s: string): string {
  return fmt(Number(s));
}

function fmtDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function YoutubeCard({
  subscribers, totalViews, videoCount, avgViews, avgEngagement,
  topVideos, demographics, growthTrend, fetchedAt,
}: YoutubeCardProps) {
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/youtube/refresh");
      const data = (await res.json()) as { cached?: boolean; error?: string };
      if (data.error) toast.error(data.error);
      else if (data.cached) toast.info("Snapshot is fresh — refreshes every 6 hours");
      else { toast.success("YouTube snapshot updated"); window.location.reload(); }
    } catch {
      toast.error("Refresh failed");
    } finally {
      setRefreshing(false);
    }
  }

  const trendPoints = growthTrend.slice(-30).map((p) => ({
    ...p,
    label: p.date.slice(5), // MM-DD
  }));
  const hasTrend = trendPoints.some((p) => p.views > 0 || p.subscribers > 0);

  return (
    <Card className="border-border/50 bg-card/60">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <YoutubeIcon />
            <span className="font-semibold text-sm">YouTube</span>
            <Badge variant="outline" className="text-xs font-mono">
              {videoCount} videos
            </Badge>
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat label="Subscribers" value={fmtBig(subscribers)} accent />
          <Stat label="Total Views" value={fmtBig(totalViews)} />
          <Stat label="Avg Views" value={fmtBig(avgViews)} />
          <Stat label="Engagement" value={`${(avgEngagement * 100).toFixed(2)}%`} />
        </div>

        {/* 30-day view trend */}
        {hasTrend && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">30-day view trend</p>
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={trendPoints} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
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
                  formatter={(v) => [fmt(Number(v ?? 0)), "Views"]}
                  labelStyle={{ color: "oklch(0.556 0 0)", fontSize: 10 }}
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="var(--emerald)"
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top videos */}
        {topVideos.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Top Videos</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {topVideos.slice(0, 3).map((v) => (
                <a
                  key={v.videoId}
                  href={`https://youtube.com/watch?v=${v.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-lg overflow-hidden border border-border/40 hover:border-border transition-colors"
                >
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    {v.thumbnail ? (
                      <Image
                        src={v.thumbnail}
                        alt={v.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <YoutubeIcon className="h-8 w-8 opacity-20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <ExternalLink className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="p-2 space-y-1">
                    <p className="text-xs font-medium line-clamp-2 leading-snug">{v.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{fmt(v.views)} views</span>
                      <span>·</span>
                      <span>❤️ {fmt(v.likes)}</span>
                      <span>·</span>
                      <span>💬 {fmt(v.comments)}</span>
                    </div>
                    {v.publishedAt && (
                      <p className="text-xs text-muted-foreground/70">{fmtDate(v.publishedAt)}</p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Audience demographics */}
        {demographics && (
          <div className="pt-2 border-t border-border/30">
            <YtDemographics demographics={demographics} dark={true} />
          </div>
        )}
      </CardContent>
    </Card>
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

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className ?? "h-4 w-4 text-red-500"} fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
