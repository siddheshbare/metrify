"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export interface OnboardingState {
  error?: string;
}

export async function completeOnboarding(
  _prev: OnboardingState | null,
  formData: FormData
): Promise<OnboardingState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const displayName = (formData.get("displayName") as string)?.trim();
  const bio = (formData.get("bio") as string)?.trim();
  const niche = (formData.get("niche") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim().toLowerCase();

  if (!displayName) return { error: "Display name is required." };
  if (!slug) return { error: "Public URL is required." };
  if (!/^[a-z0-9-]{3,30}$/.test(slug))
    return { error: "URL must be 3–30 characters: lowercase letters, numbers, hyphens only." };

  const creator = await db.creator.findUnique({
    where: { userId: session.user.id },
    select: { id: true, slug: true },
  });
  if (!creator) redirect("/sign-in");

  if (slug !== creator.slug) {
    const taken = await db.creator.findUnique({ where: { slug } });
    if (taken) return { error: "That URL is already taken — try another." };
  }

  await db.creator.update({
    where: { id: creator.id },
    data: {
      displayName,
      bio: bio || null,
      niche: niche || null,
      slug,
      onboardedAt: new Date(),
    },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
