import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { SignOutButton } from "@/components/SignOutButton";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const creator = await db.creator.findUnique({
    where: { userId: session.user.id },
    select: { displayName: true, slug: true },
  });

  const latestSnapshot = await db.youTubeSnapshot.findFirst({
    where: { creator: { userId: session.user.id } },
    orderBy: { fetchedAt: "desc" },
    select: { subscribers: true, totalViews: true, videoCount: true, fetchedAt: true },
  });

  return (
    <main className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Signed in as <strong>{session.user.email}</strong>
        </p>
        <SignOutButton />
      </div>

      {creator && (
        <div className="rounded-lg border p-4 space-y-1">
          <p><span className="font-medium">Display name:</span> {creator.displayName}</p>
          <p><span className="font-medium">Public URL:</span> /c/{creator.slug}</p>
        </div>
      )}

{latestSnapshot ? (
        <div className="rounded-lg border p-4 space-y-1">
          <p className="font-medium">YouTube Snapshot</p>
          <p>Subscribers: {latestSnapshot.subscribers.toString()}</p>
          <p>Total views: {latestSnapshot.totalViews.toString()}</p>
          <p>Videos: {latestSnapshot.videoCount}</p>
          <p className="text-xs text-muted-foreground">
            Fetched: {latestSnapshot.fetchedAt.toISOString()}
          </p>
        </div>
      ) : (
        <p className="text-muted-foreground">
          No YouTube snapshot yet — sign out and sign back in to trigger one.
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Full dashboard UI builds in Phase 5.
      </p>
    </main>
  );
}
