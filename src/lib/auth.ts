import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { generateSlug } from "@/lib/slug";
import { takeYouTubeSnapshot } from "@/lib/youtube/snapshot";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
  }
}

// Extended token shape — stored in JWT cookie, not in the DB
interface ExtendedToken {
  sub?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  providerAccountId?: string;
  error?: string;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  debug: process.env.NODE_ENV === "development",
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,

    // AI-UNVERIFIED: NextAuth v5 jwt callback shape — `account` is populated only on first sign-in
    async jwt({ token, account }) {
      const t = token as unknown as ExtendedToken;

      if (account) {
        t.accessToken = account.access_token ?? undefined;
        t.refreshToken = account.refresh_token ?? undefined;
        t.expiresAt = account.expires_at ?? undefined;
        t.providerAccountId = account.providerAccountId;
      }

      // Refresh access token if expired or within 60s of expiry
      // AI-UNVERIFIED: Google token refresh endpoint and response shape — verify against Google OAuth docs
      if (t.expiresAt && Date.now() / 1000 > t.expiresAt - 60 && t.refreshToken) {
        try {
          const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: process.env.AUTH_GOOGLE_ID!,
              client_secret: process.env.AUTH_GOOGLE_SECRET!,
              grant_type: "refresh_token",
              refresh_token: t.refreshToken,
            }),
          });

          const refreshed = (await response.json()) as {
            access_token?: string;
            expires_in?: number;
            error?: string;
          };

          if (!response.ok || refreshed.error) {
            throw new Error(refreshed.error ?? "Token refresh failed");
          }

          t.accessToken = refreshed.access_token;
          t.expiresAt = Math.floor(Date.now() / 1000 + (refreshed.expires_in ?? 3600));

          await db.account.update({
            where: {
              provider_providerAccountId: {
                provider: "google",
                providerAccountId: t.providerAccountId!,
              },
            },
            data: {
              access_token: refreshed.access_token,
              expires_at: t.expiresAt,
            },
          });
        } catch (error) {
          console.error("[auth] token refresh failed", { error });
          t.error = "RefreshTokenError";
        }
      }

      return token;
    },

    async session({ session, token }) {
      const t = token as unknown as ExtendedToken;
      session.user.id = t.sub!;
      session.accessToken = t.accessToken;
      if (t.error) session.error = t.error;
      return session;
    },
  },

  events: {
    // Fires on every sign-in — trigger YouTube snapshot non-blocking if stale
    async signIn({ user }) {
      if (!user.id) return;
      void takeYouTubeSnapshot(user.id).catch((e) =>
        console.error("[auth] snapshot trigger failed on signIn", { error: e, userId: user.id })
      );
    },

    // Fires once when a brand-new User row is created (first Google sign-in)
    async createUser({ user }) {
      if (!user.id) return;
      try {
        const slug = await generateSlug(user.name ?? "creator", db);
        await db.creator.create({
          data: {
            userId: user.id,
            slug,
            displayName: user.name ?? "Creator",
            profileImageUrl: user.image ?? null,
          },
        });
      } catch (error) {
        console.error("[auth] failed to create creator record", {
          error,
          userId: user.id,
        });
      }
    },
  },
});
