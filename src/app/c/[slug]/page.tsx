import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import Image from "next/image";
import type { TopVideo, Demographics } from "@/types/youtube";
import type { InstagramPost } from "@/types/instagram";
import { parseIgInsights } from "@/types/instagram";
import type { Metadata } from "next";
import { YtDemographics } from "@/components/shared/YtDemographics";
import { IgHashtags } from "@/components/shared/IgHashtags";
import { IgDemographics } from "@/components/shared/IgDemographics";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const creator = await db.creator.findUnique({
    where: { slug },
    select: { displayName: true, bio: true },
  });
  if (!creator) return { title: "Creator not found" };
  return {
    title: `${creator.displayName} — metrify`,
    description: creator.bio ?? `${creator.displayName}'s creator metrics`,
  };
}

export default async function PublicCreatorPage({ params }: Props) {
  const { slug } = await params;

  let creator = await db.creator.findUnique({
    where: { slug },
    select: {
      id: true,
      displayName: true,
      bio: true,
      niche: true,
      profileImageUrl: true,
      isPublic: true,
      slug: true,
    },
  });

  if (!creator) {
    const byPrevious = await db.creator.findFirst({
      where: { previousSlug: slug, previousSlugExpiresAt: { gt: new Date() } },
      select: { slug: true },
    });
    if (byPrevious) redirect(`/c/${byPrevious.slug}`);
    notFound();
  }

  if (!creator.isPublic) notFound();

  const [ytSnapshot, igSnapshot] = await Promise.all([
    db.youTubeSnapshot.findFirst({
      where: { creatorId: creator.id },
      orderBy: { fetchedAt: "desc" },
    }),
    db.instagramSnapshot.findFirst({
      where: { creatorId: creator.id },
      orderBy: { fetchedAt: "desc" },
    }),
  ]);

  const topVideos = ytSnapshot ? (ytSnapshot.topVideos as unknown as TopVideo[]) : [];
  const topPosts = igSnapshot ? (igSnapshot.topPosts as unknown as InstagramPost[]) : [];
  const ytDemographics = ytSnapshot ? (ytSnapshot.demographics as unknown as Demographics) : null;
  const igInsights = igSnapshot ? parseIgInsights(igSnapshot.insights) : null;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <div
        className="border-b border-gray-100"
        style={{
          background: "linear-gradient(135deg, oklch(0.98 0 0) 0%, oklch(0.96 0.01 145) 100%)",
        }}
      >
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="flex items-start gap-5">
            {creator.profileImageUrl ? (
              <Image
                src={creator.profileImageUrl}
                alt={creator.displayName}
                width={72}
                height={72}
                className="rounded-full ring-2 ring-white shadow"
                unoptimized
              />
            ) : (
              <div
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-2xl font-bold text-white shadow"
                style={{ background: "var(--emerald)" }}
              >
                {creator.displayName[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1
                  className="text-2xl font-extrabold tracking-tight text-gray-900"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {creator.displayName}
                </h1>
                {creator.niche && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                    {creator.niche}
                  </span>
                )}
              </div>
              {creator.bio && (
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{creator.bio}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-12">
        {/* YouTube */}
        {ytSnapshot && (
          <section>
            <SectionHeading icon={<YoutubeIcon />} title="YouTube" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <PublicStat
                label="Subscribers"
                value={fmt(Number(ytSnapshot.subscribers))}
                accent
              />
              <PublicStat label="Total Views" value={fmt(Number(ytSnapshot.totalViews))} />
              <PublicStat label="Avg Views" value={fmt(Number(ytSnapshot.avgViews))} />
              <PublicStat
                label="Engagement"
                value={`${(ytSnapshot.avgEngagement * 100).toFixed(2)}%`}
              />
            </div>
            {topVideos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {topVideos.slice(0, 3).map((v) => (
                  <a
                    key={v.videoId}
                    href={`https://youtube.com/watch?v=${v.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
                  >
                    <div className="relative aspect-video bg-gray-50">
                      {v.thumbnail && (
                        <Image
                          src={v.thumbnail}
                          alt={v.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                      )}
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="text-xs font-medium line-clamp-2 text-gray-800">{v.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{fmt(v.views)} views</span>
                        {v.likes > 0 && <><span>·</span><span>❤️ {fmt(v.likes)}</span></>}
                        {v.comments > 0 && <><span>·</span><span>💬 {fmt(v.comments)}</span></>}
                      </div>
                      {v.publishedAt && (
                        <p className="text-xs text-gray-400">
                          {new Date(v.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            )}
            {ytDemographics && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <YtDemographics demographics={ytDemographics} dark={false} />
              </div>
            )}
          </section>
        )}

        {/* Instagram */}
        {igSnapshot && (
          <section>
            <SectionHeading icon={<InstagramIcon />} title="Instagram" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <PublicStat label="Followers" value={fmt(igSnapshot.followers)} accent />
              <PublicStat label="Following" value={fmt(igSnapshot.following)} />
              <PublicStat label="Avg Likes" value={fmt(igSnapshot.avgLikes)} />
              <PublicStat
                label="Engagement"
                value={`${(igSnapshot.avgEngagement * 100).toFixed(2)}%`}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-xs text-gray-500 uppercase tracking-wide">30-day reach</span>
                <span className="stat-number text-2xl ml-auto" style={{ color: "var(--emerald)" }}>
                  {fmt(Number(igSnapshot.reach30d))}
                </span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-xs text-gray-500 uppercase tracking-wide">30-day views</span>
                <span className="stat-number text-2xl ml-auto text-gray-900">
                  {fmt(Number(igSnapshot.impressions30d))}
                </span>
              </div>
            </div>
            {topPosts.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {topPosts.slice(0, 3).map((p) => (
                  <a
                    key={p.mediaId}
                    href={p.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50 hover:shadow-sm transition-all"
                  >
                    {p.mediaUrl && (
                      <Image
                        src={p.mediaUrl}
                        alt={p.caption.slice(0, 40)}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="text-white text-xs font-medium">❤️ {fmt(p.likes)}</span>
                      {p.comments > 0 && (
                        <span className="text-white text-xs">💬 {fmt(p.comments)}</span>
                      )}
                    </div>
                    {p.mediaType && p.mediaType !== "IMAGE" && (
                      <div className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[9px] px-1 py-0.5 rounded">
                        {p.mediaType === "CAROUSEL_ALBUM" ? "Carousel" : p.mediaType === "VIDEO" ? "Video" : p.mediaType}
                      </div>
                    )}
                  </a>
                ))}
              </div>
            )}
            {topPosts.length > 0 && (
              <div className="mt-6">
                <IgHashtags captions={topPosts.map((p) => p.caption)} dark={false} />
              </div>
            )}
            {igInsights?.demographics && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <IgDemographics demographics={igInsights.demographics} dark={false} />
              </div>
            )}
          </section>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 py-6 text-center">
        <p className="text-xs text-gray-400">
          Powered by{" "}
          <span className="font-semibold" style={{ color: "var(--emerald)" }}>
            metrify
          </span>
        </p>
      </div>
    </div>
  );
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function PublicStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p
        className="stat-number text-2xl text-gray-900"
        style={{ color: accent ? "var(--emerald)" : undefined }}
      >
        {value}
      </p>
    </div>
  );
}

function SectionHeading({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
      {icon}
      <h2 className="font-semibold text-gray-800">{title}</h2>
    </div>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-red-500" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}
