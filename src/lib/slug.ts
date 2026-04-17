import type { PrismaClient } from "@prisma/client";

const SUFFIX_LENGTH = 4;
const MAX_ATTEMPTS = 5;

function toSlugBase(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40); // cap so final slug stays reasonable length
}

function randomSuffix(): string {
  return Math.random().toString(16).slice(2, 2 + SUFFIX_LENGTH);
}

export async function generateSlug(
  displayName: string,
  db: PrismaClient
): Promise<string> {
  const base = toSlugBase(displayName) || "creator";

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const slug = `${base}-${randomSuffix()}`;
    const existing = await db.creator.findUnique({ where: { slug } });
    if (!existing) return slug;
  }

  throw new Error(`Failed to generate unique slug for "${displayName}" after ${MAX_ATTEMPTS} attempts`);
}

export async function isSlugAvailable(
  slug: string,
  db: PrismaClient,
  excludeCreatorId?: string
): Promise<boolean> {
  const existing = await db.creator.findUnique({ where: { slug } });
  if (!existing) return true;
  if (excludeCreatorId && existing.id === excludeCreatorId) return true;
  return false;
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]{3,50}$/.test(slug);
}
