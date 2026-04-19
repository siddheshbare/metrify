import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { SettingsForm } from "@/components/settings/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const creator = await db.creator.findUnique({
    where: { userId: session.user.id },
    select: {
      displayName: true,
      bio: true,
      niche: true,
      isPublic: true,
      slug: true,
    },
  });
  if (!creator) redirect("/sign-in");

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl font-extrabold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your public profile
        </p>
      </div>
      <SettingsForm
        displayName={creator.displayName}
        bio={creator.bio}
        niche={creator.niche}
        isPublic={creator.isPublic}
        slug={creator.slug}
      />
    </div>
  );
}
