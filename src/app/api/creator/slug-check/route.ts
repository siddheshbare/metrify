import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = request.nextUrl.searchParams.get("slug")?.toLowerCase().trim();
  if (!slug) return NextResponse.json({ available: false });

  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(slug)) {
    return NextResponse.json({ available: false, reason: "invalid_format" });
  }

  const creator = await db.creator.findUnique({
    where: { slug },
    select: { userId: true },
  });

  const available = !creator || creator.userId === session.user.id;
  return NextResponse.json({ available });
}
