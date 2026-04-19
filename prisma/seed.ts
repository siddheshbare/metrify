import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

// ── Helpers ────────────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function growthTrend(baseSubs: number, baseViews: number, days = 90) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    const jitter = () => Math.round((Math.random() - 0.3) * baseViews * 0.08);
    return {
      date: date.toISOString().slice(0, 10),
      subscribers: baseSubs + Math.round(i * (baseSubs * 0.01)),
      views: Math.max(0, baseViews + jitter()),
    };
  });
}

function reachTrend(baseReach: number, days = 30) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    const jitter = () => Math.round((Math.random() - 0.4) * baseReach * 0.3);
    return {
      date: date.toISOString().slice(0, 10),
      reach: Math.max(0, baseReach + jitter()),
      impressions: 0,
      profileViews: 0,
    };
  });
}

// ── Creator 1: Tech / Dev ──────────────────────────────────────────────────────

const creator1 = {
  user: {
    name: "Alex Chen",
    email: "alex.chen.dev@example.com",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=AlexChen",
  },
  creator: {
    slug: "alexchen",
    displayName: "Alex Chen",
    bio: "Full-stack developer building in public. TypeScript, React, system design.",
    niche: "Tech",
    profileImageUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=AlexChen",
    isPublic: true,
    youtubeChannelId: "UC_seed_alex",
    youtubeConnectedAt: daysAgo(120),
    instagramBusinessId: "ig_seed_alex",
    instagramConnectedAt: daysAgo(90),
  },
  yt: {
    subscribers: BigInt(142000),
    totalViews: BigInt(8_400_000),
    videoCount: 87,
    avgViews: BigInt(48000),
    avgEngagement: 0.048,
    topVideos: [
      { videoId: "yt_alex_1", title: "I built a SaaS in 7 days — here's what happened", thumbnail: "https://picsum.photos/seed/yt1/480/270", views: 312000, likes: 18400, comments: 942, publishedAt: daysAgo(45).toISOString() },
      { videoId: "yt_alex_2", title: "TypeScript tricks that changed how I code", thumbnail: "https://picsum.photos/seed/yt2/480/270", views: 198000, likes: 11200, comments: 634, publishedAt: daysAgo(72).toISOString() },
      { videoId: "yt_alex_3", title: "System Design: URL shortener (full walkthrough)", thumbnail: "https://picsum.photos/seed/yt3/480/270", views: 156000, likes: 9800, comments: 510, publishedAt: daysAgo(98).toISOString() },
    ],
    demographics: {
      age: { AGE_13_17: 3.2, AGE_18_24: 28.4, AGE_25_34: 41.6, AGE_35_44: 18.2, AGE_45_54: 6.1, AGE_55_64: 1.8, AGE_65_: 0.7 },
      gender: { male: 78.4, female: 19.2, userSpecified: 2.4 },
      geography: [
        { country: "US", views: 38200 }, { country: "IN", views: 24100 }, { country: "GB", views: 9800 },
        { country: "CA", views: 7400 }, { country: "DE", views: 5200 }, { country: "AU", views: 4600 },
        { country: "BR", views: 3900 }, { country: "PH", views: 3200 }, { country: "NG", views: 2800 }, { country: "FR", views: 2400 },
      ],
    },
    growthTrend: growthTrend(142000, 48000),
  },
  ig: {
    followers: 38400,
    following: 612,
    mediaCount: 143,
    avgLikes: 1840,
    avgComments: 94,
    avgEngagement: 0.051,
    reach30d: BigInt(284000),
    impressions30d: BigInt(412000),
    topPosts: [
      { mediaId: "ig_alex_1", caption: "Just shipped v2 of my side project 🚀 #buildinpublic #typescript #nextjs #react #webdev", mediaType: "IMAGE", mediaUrl: "https://picsum.photos/seed/ig1/600/600", permalink: "https://instagram.com/p/seed1", likes: 3200, comments: 148, timestamp: daysAgo(12).toISOString() },
      { mediaId: "ig_alex_2", caption: "My VS Code setup after 5 years of tweaking ⚙️ #vscode #developer #coding #productivity", mediaType: "CAROUSEL_ALBUM", mediaUrl: "https://picsum.photos/seed/ig2/600/600", permalink: "https://instagram.com/p/seed2", likes: 2840, comments: 112, timestamp: daysAgo(28).toISOString() },
      { mediaId: "ig_alex_3", caption: "100k YouTube subs milestone 🎉 Thank you! #milestone #youtube #developer #grateful", mediaType: "IMAGE", mediaUrl: "https://picsum.photos/seed/ig3/600/600", permalink: "https://instagram.com/p/seed3", likes: 4100, comments: 234, timestamp: daysAgo(41).toISOString() },
    ],
    insights: {
      trend: reachTrend(9400),
      demographics: {
        age: [{ range: "18-24", value: 9200 }, { range: "25-34", value: 16800 }, { range: "35-44", value: 7400 }, { range: "45-54", value: 3100 }, { range: "55+", value: 900 }],
        gender: [{ label: "M", value: 28400 }, { label: "F", value: 8600 }, { label: "U", value: 1400 }],
        country: [{ code: "US", value: 12400 }, { code: "IN", value: 8200 }, { code: "GB", value: 3400 }, { code: "CA", value: 2800 }, { code: "AU", value: 1900 }],
      },
    },
  },
};

// ── Creator 2: Lifestyle / Travel ─────────────────────────────────────────────

const creator2 = {
  user: {
    name: "Maya Patel",
    email: "maya.patel.travel@example.com",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=MayaPatel",
  },
  creator: {
    slug: "mayapatel",
    displayName: "Maya Patel",
    bio: "Solo travel & slow living. 40+ countries, 1 carry-on. Sharing honest travel stories.",
    niche: "Travel",
    profileImageUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=MayaPatel",
    isPublic: true,
    youtubeChannelId: "UC_seed_maya",
    youtubeConnectedAt: daysAgo(200),
    instagramBusinessId: "ig_seed_maya",
    instagramConnectedAt: daysAgo(180),
  },
  yt: {
    subscribers: BigInt(389000),
    totalViews: BigInt(42_100_000),
    videoCount: 214,
    avgViews: BigInt(124000),
    avgEngagement: 0.062,
    topVideos: [
      { videoId: "yt_maya_1", title: "Living in Bali for 3 months: what I wish I knew", thumbnail: "https://picsum.photos/seed/yt4/480/270", views: 1_840_000, likes: 98000, comments: 4200, publishedAt: daysAgo(30).toISOString() },
      { videoId: "yt_maya_2", title: "$30/day budget travel in Southeast Asia (honest guide)", thumbnail: "https://picsum.photos/seed/yt5/480/270", views: 924000, likes: 61000, comments: 3100, publishedAt: daysAgo(65).toISOString() },
      { videoId: "yt_maya_3", title: "How I afford to travel full-time (no trust fund, no BS)", thumbnail: "https://picsum.photos/seed/yt6/480/270", views: 784000, likes: 54200, comments: 2800, publishedAt: daysAgo(110).toISOString() },
    ],
    demographics: {
      age: { AGE_13_17: 4.8, AGE_18_24: 34.2, AGE_25_34: 38.4, AGE_35_44: 14.6, AGE_45_54: 5.4, AGE_55_64: 1.9, AGE_65_: 0.7 },
      gender: { male: 42.1, female: 55.6, userSpecified: 2.3 },
      geography: [
        { country: "US", views: 48200 }, { country: "GB", views: 18400 }, { country: "AU", views: 14200 },
        { country: "CA", views: 11800 }, { country: "IN", views: 9200 }, { country: "DE", views: 7400 },
        { country: "FR", views: 6100 }, { country: "NL", views: 4800 }, { country: "SG", views: 3900 }, { country: "NZ", views: 3400 },
      ],
    },
    growthTrend: growthTrend(389000, 124000),
  },
  ig: {
    followers: 182000,
    following: 1240,
    mediaCount: 892,
    avgLikes: 8400,
    avgComments: 312,
    avgEngagement: 0.048,
    reach30d: BigInt(1_240_000),
    impressions30d: BigInt(2_180_000),
    topPosts: [
      { mediaId: "ig_maya_1", caption: "Sunrise at Angkor Wat. Worth the 4am alarm 🌅 #cambodia #angkorwat #travel #solotravel #wanderlust #sunrise", mediaType: "IMAGE", mediaUrl: "https://picsum.photos/seed/ig4/600/600", permalink: "https://instagram.com/p/seed4", likes: 14200, comments: 482, timestamp: daysAgo(8).toISOString() },
      { mediaId: "ig_maya_2", caption: "Everything I packed for 6 months in one carry-on 🎒 #packinglight #traveltips #minimalist #backpacking", mediaType: "CAROUSEL_ALBUM", mediaUrl: "https://picsum.photos/seed/ig5/600/600", permalink: "https://instagram.com/p/seed5", likes: 12800, comments: 614, timestamp: daysAgo(22).toISOString() },
      { mediaId: "ig_maya_3", caption: "My home for the next 30 days 🌊 Uluwatu, Bali #bali #digital nomad #travel #islandlife", mediaType: "VIDEO", mediaUrl: "https://picsum.photos/seed/ig6/600/600", permalink: "https://instagram.com/p/seed6", likes: 18600, comments: 728, timestamp: daysAgo(36).toISOString() },
    ],
    insights: {
      trend: reachTrend(41000),
      demographics: {
        age: [{ range: "18-24", value: 38400 }, { range: "25-34", value: 62800 }, { range: "35-44", value: 28400 }, { range: "45-54", value: 9200 }, { range: "55+", value: 2400 }],
        gender: [{ label: "F", value: 98400 }, { label: "M", value: 72800 }, { label: "U", value: 10800 }],
        country: [{ code: "US", value: 52400 }, { code: "GB", value: 18200 }, { code: "AU", value: 14800 }, { code: "CA", value: 12400 }, { code: "IN", value: 8200 }],
      },
    },
  },
};

// ── Creator 3: Fitness ─────────────────────────────────────────────────────────

const creator3 = {
  user: {
    name: "Jordan Lee",
    email: "jordan.lee.fit@example.com",
    image: "https://api.dicebear.com/9.x/avataaars/svg?seed=JordanLee",
  },
  creator: {
    slug: "jordanlee",
    displayName: "Jordan Lee",
    bio: "Strength coach & certified nutritionist. No fluff, no supplements, just science-backed training.",
    niche: "Fitness",
    profileImageUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=JordanLee",
    isPublic: true,
    youtubeChannelId: "UC_seed_jordan",
    youtubeConnectedAt: daysAgo(365),
    instagramBusinessId: "ig_seed_jordan",
    instagramConnectedAt: daysAgo(300),
  },
  yt: {
    subscribers: BigInt(724000),
    totalViews: BigInt(89_200_000),
    videoCount: 412,
    avgViews: BigInt(218000),
    avgEngagement: 0.074,
    topVideos: [
      { videoId: "yt_jordan_1", title: "The truth about protein timing (science says...)", thumbnail: "https://picsum.photos/seed/yt7/480/270", views: 3_240_000, likes: 198000, comments: 8400, publishedAt: daysAgo(18).toISOString() },
      { videoId: "yt_jordan_2", title: "Full body home workout — no equipment needed", thumbnail: "https://picsum.photos/seed/yt8/480/270", views: 2_180_000, likes: 142000, comments: 6200, publishedAt: daysAgo(44).toISOString() },
      { videoId: "yt_jordan_3", title: "Why your squat is wrong (and how to fix it)", thumbnail: "https://picsum.photos/seed/yt9/480/270", views: 1_840_000, likes: 124000, comments: 5800, publishedAt: daysAgo(78).toISOString() },
    ],
    demographics: {
      age: { AGE_13_17: 8.2, AGE_18_24: 38.4, AGE_25_34: 32.6, AGE_35_44: 13.8, AGE_45_54: 5.2, AGE_55_64: 1.4, AGE_65_: 0.4 },
      gender: { male: 64.2, female: 33.8, userSpecified: 2.0 },
      geography: [
        { country: "US", views: 92400 }, { country: "GB", views: 28400 }, { country: "CA", views: 22800 },
        { country: "AU", views: 18200 }, { country: "IN", views: 14400 }, { country: "DE", views: 9800 },
        { country: "BR", views: 8200 }, { country: "MX", views: 6400 }, { country: "FR", views: 5200 }, { country: "ZA", views: 4100 },
      ],
    },
    growthTrend: growthTrend(724000, 218000),
  },
  ig: {
    followers: 412000,
    following: 892,
    mediaCount: 1840,
    avgLikes: 18400,
    avgComments: 742,
    avgEngagement: 0.047,
    reach30d: BigInt(2_840_000),
    impressions30d: BigInt(4_920_000),
    topPosts: [
      { mediaId: "ig_jordan_1", caption: "Your gym doesn't need to be fancy. Consistency > equipment 💪 #fitness #gym #motivation #workout #strength", mediaType: "IMAGE", mediaUrl: "https://picsum.photos/seed/ig7/600/600", permalink: "https://instagram.com/p/seed7", likes: 28400, comments: 984, timestamp: daysAgo(5).toISOString() },
      { mediaId: "ig_jordan_2", caption: "What I eat in a day as a strength coach 🥩 #nutrition #mealprep #protein #fitness #healthyfood", mediaType: "CAROUSEL_ALBUM", mediaUrl: "https://picsum.photos/seed/ig8/600/600", permalink: "https://instagram.com/p/seed8", likes: 24200, comments: 1120, timestamp: daysAgo(16).toISOString() },
      { mediaId: "ig_jordan_3", caption: "3 mobility drills every lifter needs (swipe for demo) 🔥 #mobility #flexibility #lifting #squat #deadlift", mediaType: "CAROUSEL_ALBUM", mediaUrl: "https://picsum.photos/seed/ig9/600/600", permalink: "https://instagram.com/p/seed9", likes: 31800, comments: 1340, timestamp: daysAgo(29).toISOString() },
    ],
    insights: {
      trend: reachTrend(94000),
      demographics: {
        age: [{ range: "18-24", value: 98400 }, { range: "25-34", value: 142800 }, { range: "35-44", value: 64200 }, { range: "45-54", value: 22400 }, { range: "55+", value: 6800 }],
        gender: [{ label: "M", value: 248400 }, { label: "F", value: 148200 }, { label: "U", value: 15400 }],
        country: [{ code: "US", value: 142400 }, { code: "GB", value: 48200 }, { code: "CA", value: 38800 }, { code: "AU", value: 28400 }, { code: "IN", value: 22800 }],
      },
    },
  },
};

// ── Seed runner ────────────────────────────────────────────────────────────────

async function seedCreator(data: typeof creator1) {
  const existingUser = await db.user.findUnique({ where: { email: data.user.email } });
  if (existingUser) {
    console.log(`  ⚠ Skipping ${data.creator.displayName} — already exists`);
    return;
  }

  const user = await db.user.create({ data: data.user });
  const creator = await db.creator.create({
    data: { ...data.creator, userId: user.id },
  });

  await db.youTubeSnapshot.create({
    data: {
      creatorId: creator.id,
      subscribers: data.yt.subscribers,
      totalViews: data.yt.totalViews,
      videoCount: data.yt.videoCount,
      avgViews: data.yt.avgViews,
      avgEngagement: data.yt.avgEngagement,
      topVideos: data.yt.topVideos as never,
      demographics: data.yt.demographics as never,
      growthTrend: data.yt.growthTrend as never,
    },
  });

  await db.instagramSnapshot.create({
    data: {
      creatorId: creator.id,
      followers: data.ig.followers,
      following: data.ig.following,
      mediaCount: data.ig.mediaCount,
      avgLikes: data.ig.avgLikes,
      avgComments: data.ig.avgComments,
      avgEngagement: data.ig.avgEngagement,
      reach30d: data.ig.reach30d,
      impressions30d: data.ig.impressions30d,
      topPosts: data.ig.topPosts as never,
      insights: data.ig.insights as never,
    },
  });

  console.log(`  ✓ Created ${data.creator.displayName} → /c/${data.creator.slug}`);
}

async function main() {
  console.log("Seeding metrify...");
  await seedCreator(creator1);
  await seedCreator(creator2);
  await seedCreator(creator3);
  console.log("Done.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
