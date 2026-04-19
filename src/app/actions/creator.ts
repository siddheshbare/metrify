"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { generateSlug } from "@/lib/slug";
import { revalidatePath } from "next/cache";

interface UpdateProfileResult {
  success?: boolean;
  error?: string;
}

export async function updateCreatorProfile(
  formData: FormData
): Promise<UpdateProfileResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const displayName = (formData.get("displayName") as string)?.trim();
  const bio = (formData.get("bio") as string)?.trim() || null;
  const niche = (formData.get("niche") as string)?.trim() || null;
  const isPublic = formData.get("isPublic") === "true";
  const newSlug = (formData.get("slug") as string)?.trim().toLowerCase();

  if (!displayName) return { error: "Display name is required" };

  const creator = await db.creator.findUnique({
    where: { userId: session.user.id },
    select: { id: true, slug: true },
  });
  if (!creator) return { error: "Creator not found" };

  const slugChanged = newSlug && newSlug !== creator.slug;

  if (slugChanged) {
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(newSlug)) {
      return { error: "Slug can only contain lowercase letters, numbers, and hyphens" };
    }
    const existing = await db.creator.findUnique({ where: { slug: newSlug } });
    if (existing && existing.id !== creator.id) {
      return { error: "That URL is already taken" };
    }
  }

  await db.creator.update({
    where: { id: creator.id },
    data: {
      displayName,
      bio,
      niche,
      isPublic,
      ...(slugChanged && {
        previousSlug: creator.slug,
        previousSlugExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        slug: newSlug,
      }),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  revalidatePath(`/c/${slugChanged ? newSlug : creator.slug}`);

  return { success: true };
}

export async function generateNewSlug(): Promise<{ slug?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  try {
    const slug = await generateSlug(
      session.user.name ?? "creator",
      db
    );
    return { slug };
  } catch {
    return { error: "Failed to generate slug" };
  }
}
