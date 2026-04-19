import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const creator = await db.creator.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      displayName: true,
      bio: true,
      niche: true,
      slug: true,
      onboardedAt: true,
      instagramBusinessId: true,
    },
  });

  if (!creator) redirect("/sign-in");
  if (creator.onboardedAt) redirect("/dashboard");

  const ytSnapshot = await db.youTubeSnapshot.findFirst({
    where: { creatorId: creator.id },
    orderBy: { fetchedAt: "desc" },
    select: { subscribers: true },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-16">
      <OnboardingForm
        initialDisplayName={creator.displayName}
        initialBio={creator.bio ?? ""}
        initialNiche={creator.niche ?? ""}
        initialSlug={creator.slug}
        ytConnected={!!ytSnapshot}
        ytSubscribers={ytSnapshot ? ytSnapshot.subscribers.toString() : null}
        igConnected={!!creator.instagramBusinessId}
      />
    </div>
  );
}
