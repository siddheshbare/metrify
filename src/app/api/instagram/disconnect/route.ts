import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.creator.update({
    where: { userId: session.user.id },
    data: {
      instagramBusinessId: null,
      instagramLongLivedToken: null,
      instagramTokenExpiresAt: null,
      instagramConnectedAt: null,
    },
  });

  return NextResponse.json({ disconnected: true });
}
