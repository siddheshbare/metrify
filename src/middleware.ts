import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Lightweight auth instance using only the edge-safe config.
// Does NOT import Prisma — safe to run on Vercel Edge Runtime.
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Run middleware on all routes except static files, images, and Next.js internals
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
