import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { ConnectionsPage } from "@/components/connections/ConnectionsPage";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function ConnectionsRoute() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const creator = await db.creator.findUnique({
    where: { userId: session.user.id },
    select: {
      youtubeChannelId: true,
      youtubeConnectedAt: true,
      instagramBusinessId: true,
      instagramConnectedAt: true,
      instagramTokenExpiresAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl font-extrabold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Connections
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your connected platforms
        </p>
      </div>
      <Suspense>
        <ConnectionsPage
          youtubeChannelId={creator?.youtubeChannelId ?? null}
          youtubeConnectedAt={creator?.youtubeConnectedAt?.toISOString() ?? null}
          instagramConnected={!!creator?.instagramBusinessId}
          instagramConnectedAt={creator?.instagramConnectedAt?.toISOString() ?? null}
          instagramTokenExpiresAt={creator?.instagramTokenExpiresAt?.toISOString() ?? null}
        />
      </Suspense>
    </div>
  );
}
