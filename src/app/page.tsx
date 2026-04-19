import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="relative min-h-screen flex flex-col" style={{ background: "oklch(0.08 0 0)" }}>
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 35%, oklch(0.72 0.22 145 / 0.07) 0%, transparent 70%)",
        }}
      />

      {/* Nav */}
      <nav className="relative border-b border-white/5 px-6 h-14 flex items-center justify-between max-w-6xl mx-auto w-full">
        <span
          className="text-lg font-extrabold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          metrify
        </span>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in →
          </button>
        </form>
      </nav>

      {/* Hero */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="space-y-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 text-xs text-muted-foreground">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--emerald)" }}
            />
            Creator → Brand
          </div>

          <h1
            className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-none"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Share your metrics
            <br />
            <span style={{ color: "var(--emerald)" }}>with brands.</span>
          </h1>

          <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            One link. YouTube subscribers, Instagram reach, engagement rates — all
            verified, live, and ready for brand pitches.
          </p>

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <Button
              type="submit"
              size="lg"
              className="gap-2 px-8 rounded-full font-semibold text-black"
              style={{ background: "var(--emerald)" }}
            >
              <GoogleIcon />
              Continue with Google
            </Button>
          </form>
          <p className="text-xs text-muted-foreground/60">
            Free during beta · No brand sign-up required
          </p>
        </div>
      </div>

      {/* Feature strip */}
      <div className="relative border-t border-white/5 py-10 px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              icon: "▶",
              label: "YouTube metrics",
              desc: "Subscribers, views, engagement — pulled live from the Data API.",
            },
            {
              icon: "◈",
              label: "Instagram reach",
              desc: "Followers, avg likes, 30-day reach from your Business account.",
            },
            {
              icon: "⬡",
              label: "One shareable link",
              desc: "metrify.app/c/you — send it to any brand, no login needed.",
            },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="space-y-2">
              <div className="text-xl" style={{ color: "var(--emerald)" }}>{icon}</div>
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}
