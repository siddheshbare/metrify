import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { buildFBAuthUrl } from "@/lib/instagram/oauth";

const STATE_COOKIE = "ig_oauth_state";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = crypto.randomUUID();

  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes — long enough for user to complete FB OAuth
    path: "/",
  });

  return NextResponse.redirect(buildFBAuthUrl(state));
}
