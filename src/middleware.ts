import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Edge-safe — only uses authConfig (no Prisma, no Node.js imports).
// previousSlug 301 redirect is handled in src/app/c/[slug]/page.tsx.
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
