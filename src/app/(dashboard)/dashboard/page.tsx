import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { YoutubeCard } from "@/components/dashboard/YoutubeCard";
import { InstagramCard } from "@/components/dashboard/InstagramCard";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TopVideo, Demographics, GrowthPoint } from "@/types/youtube";
import type { InstagramPost } from "@/types/instagram";
import { parseIgInsights } from "@/types/instagram";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const creator = await db.creator.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      displayName: true,
      slug: true,
      onboardedAt: true,
      instagramBusinessId: true,
      instagramTokenExpiresAt: true,
    },
  });
  if (!creator) redirect("/sign-in");
  if (!creator.onboardedAt) redirect("/onboarding");

  const [ytSnapshot, igSnapshot] = await Promise.all([
    db.youTubeSnapshot.findFirst({
      where: { creatorId: creator.id },
      orderBy: { fetchedAt: "desc" },
    }),
    creator.instagramBusinessId
      ? db.instagramSnapshot.findFirst({
          where: { creatorId: creator.id },
          orderBy: { fetchedAt: "desc" },
        })
      : null,
  ]);

  const igTokenExpired =
    creator.instagramTokenExpiresAt != null &&
    creator.instagramTokenExpiresAt < new Date();

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-3xl font-extrabold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your creator metrics at a glance
        </p>
      </div>

      {/* YouTube */}
      {ytSnapshot ? (
        <YoutubeCard
          subscribers={ytSnapshot.subscribers.toString()}
          totalViews={ytSnapshot.totalViews.toString()}
          videoCount={ytSnapshot.videoCount}
          avgViews={ytSnapshot.avgViews.toString()}
          avgEngagement={ytSnapshot.avgEngagement}
          topVideos={ytSnapshot.topVideos as unknown as TopVideo[]}
          demographics={(ytSnapshot.demographics as unknown as Demographics) ?? null}
          growthTrend={(ytSnapshot.growthTrend as unknown as GrowthPoint[]) ?? []}
          fetchedAt={ytSnapshot.fetchedAt.toISOString()}
        />
      ) : (
        <EmptyState
          title="No YouTube data yet"
          description="Sign out and sign back in to trigger your first snapshot."
        />
      )}

      {/* Instagram */}
      {igSnapshot ? (
        <InstagramCard
          followers={igSnapshot.followers}
          following={igSnapshot.following}
          mediaCount={igSnapshot.mediaCount}
          avgLikes={igSnapshot.avgLikes}
          avgComments={igSnapshot.avgComments}
          avgEngagement={igSnapshot.avgEngagement}
          reach30d={igSnapshot.reach30d.toString()}
          impressions30d={igSnapshot.impressions30d.toString()}
          topPosts={igSnapshot.topPosts as unknown as InstagramPost[]}
          insights={parseIgInsights(igSnapshot.insights)}
          fetchedAt={igSnapshot.fetchedAt.toISOString()}
          tokenExpired={igTokenExpired}
        />
      ) : creator.instagramBusinessId ? (
        <EmptyState
          title="No Instagram data yet"
          description="Visit /api/instagram/refresh to trigger a snapshot."
        />
      ) : (
        <div className="rounded-xl border border-dashed border-border/60 p-8 text-center space-y-3">
          <p className="text-sm font-medium">Instagram not connected</p>
          <p className="text-xs text-muted-foreground">
            Connect your Instagram Business account to show metrics to brands.
          </p>
          <Link
            href="/connections"
            className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
          >
            Connect Instagram
          </Link>
        </div>
      )}
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border/60 p-8 text-center space-y-1">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
