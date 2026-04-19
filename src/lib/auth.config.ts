import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Edge-safe config: no Node.js-only imports (no Prisma, no crypto).
// Used in middleware.ts to protect routes without hitting the database.
export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/youtube.readonly",
            "https://www.googleapis.com/auth/yt-analytics.readonly",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const protectedPrefixes = ["/dashboard", "/connections", "/settings", "/onboarding"];
      const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

      if (isProtected && !isLoggedIn) {
        const redirectUrl = new URL("/sign-in", nextUrl.origin);
        redirectUrl.searchParams.set("callbackUrl", pathname);
        return Response.redirect(redirectUrl);
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
