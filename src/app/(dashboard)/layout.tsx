import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { DashboardNav } from "@/components/layout/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const creator = await db.creator.findUnique({
    where: { userId: session.user.id },
    select: { displayName: true, slug: true },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardNav
        displayName={creator?.displayName ?? session.user.name ?? "Creator"}
        email={session.user.email ?? ""}
        slug={creator?.slug ?? ""}
      />
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {children}
      </main>
    </div>
  );
}
