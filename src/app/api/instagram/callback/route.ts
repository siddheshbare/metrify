import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { db } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import {
  exchangeCodeForShortLivedToken,
  exchangeForLongLivedToken,
  findInstagramBusinessId,
} from "@/lib/instagram/oauth";
import { takeInstagramSnapshot } from "@/lib/instagram/snapshot";

const STATE_COOKIE = "ig_oauth_state";

function redirectWithError(origin: string, error: string): NextResponse {
  return NextResponse.redirect(`${origin}/connections?error=${error}`);
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin = request.nextUrl.origin;
  const { searchParams } = request.nextUrl;

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return redirectWithError(origin, error === "access_denied" ? "access_denied" : "oauth_error");
  }

  if (!code || !state) {
    return redirectWithError(origin, "missing_params");
  }

  // CSRF state check
  const cookieStore = await cookies();
  const savedState = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);

  if (!savedState || savedState !== state) {
    return redirectWithError(origin, "state_mismatch");
  }

  try {
    const shortLivedToken = await exchangeCodeForShortLivedToken(code);
    const { token: longLivedToken, expiresIn } = await exchangeForLongLivedToken(shortLivedToken);
    const igBusinessId = await findInstagramBusinessId(longLivedToken);

    const encryptedToken = encrypt(longLivedToken);
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

    await db.creator.update({
      where: { userId: session.user.id },
      data: {
        instagramBusinessId: igBusinessId,
        instagramLongLivedToken: encryptedToken,
        instagramTokenExpiresAt: tokenExpiresAt,
        instagramConnectedAt: new Date(),
      },
    });

    const userId = session.user.id;
    void takeInstagramSnapshot(userId).catch((e) =>
      console.error("[instagram/callback] snapshot trigger failed", { error: e, userId })
    );

    const creator = await db.creator.findUnique({
      where: { userId },
      select: { onboardedAt: true },
    });
    const redirectTo = creator?.onboardedAt ? "/connections?connected=instagram" : "/onboarding";
    return NextResponse.redirect(`${origin}${redirectTo}`);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[instagram/callback] connection failed", { error: message });

    const errorCode = ["no_business_account", "missing_scopes"].includes(message)
      ? message
      : "connection_failed";

    return redirectWithError(origin, errorCode);
  }
}
