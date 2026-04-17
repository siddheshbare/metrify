import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { takeInstagramSnapshot } from "@/lib/instagram/snapshot";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await takeInstagramSnapshot(session.user.id);
    if (result.cached) {
      return NextResponse.json({ cached: true, message: "Snapshot is fresh" }, { status: 429 });
    }
    return NextResponse.json({ cached: false, fetchedAt: result.snapshot.fetchedAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[api/instagram/refresh] snapshot failed", { error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
