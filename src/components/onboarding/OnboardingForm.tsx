"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { completeOnboarding } from "@/app/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

interface OnboardingFormProps {
  initialDisplayName: string;
  initialBio: string;
  initialNiche: string;
  initialSlug: string;
  ytConnected: boolean;
  ytSubscribers: string | null;
  igConnected: boolean;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function OnboardingForm({
  initialDisplayName,
  initialBio,
  initialNiche,
  initialSlug,
  ytConnected,
  ytSubscribers,
  igConnected,
}: OnboardingFormProps) {
  const [state, action, pending] = useActionState(completeOnboarding, null);
  const [slug, setSlug] = useState(initialSlug);
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (slug === initialSlug) { setSlugStatus("idle"); return; }
    if (!/^[a-z0-9-]{3,30}$/.test(slug)) { setSlugStatus("idle"); return; }
    setSlugStatus("checking");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/creator/slug-check?slug=${encodeURIComponent(slug)}`);
      const data = (await res.json()) as { available: boolean };
      setSlugStatus(data.available ? "available" : "taken");
    }, 400);
  }, [slug, initialSlug]);

  return (
    <div className="w-full max-w-xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--emerald)" }}>
            <span className="text-black font-black text-sm">M</span>
          </div>
          <span className="font-bold text-lg tracking-tight">metrify</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          Set up your creator profile
        </h1>
        <p className="text-sm text-muted-foreground">
          This is what brands will see when they visit your media kit.
        </p>
      </div>

      <form action={action} className="space-y-6">
        {/* Profile fields */}
        <div className="rounded-xl border border-border/50 bg-card/60 p-6 space-y-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Profile</p>

          <div className="space-y-1.5">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              name="displayName"
              defaultValue={initialDisplayName}
              placeholder="Your name or brand"
              required
              maxLength={60}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="niche">Niche</Label>
            <Input
              id="niche"
              name="niche"
              defaultValue={initialNiche}
              placeholder="e.g. Tech, Travel, Fitness"
              maxLength={40}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={initialBio}
              placeholder="Tell brands who you are and what you create..."
              className="resize-none"
              rows={3}
              maxLength={300}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug">Your public URL</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">metrify.app/c/</span>
              <div className="relative flex-1">
                <Input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="your-name"
                  required
                  maxLength={30}
                />
                {slugStatus === "checking" && (
                  <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
                )}
                {slugStatus === "available" && (
                  <CheckCircle2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-500" />
                )}
              </div>
            </div>
            {slugStatus === "taken" && (
              <p className="text-xs text-destructive">That URL is already taken.</p>
            )}
          </div>
        </div>

        {/* Platform status */}
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium px-1">Platforms</p>
          <div className="grid grid-cols-2 gap-3">
            {/* YouTube */}
            <div className="rounded-xl border border-border/50 bg-card/60 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <YoutubeIcon />
                <span className="text-sm font-medium">YouTube</span>
              </div>
              {ytConnected ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-xs text-emerald-500 font-medium">Connected</span>
                  </div>
                  {ytSubscribers && (
                    <p className="text-xs text-muted-foreground">
                      {fmt(Number(ytSubscribers))} subscribers
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Fetching data...</span>
                  </div>
                  <p className="text-xs text-muted-foreground/60">Connected via Google</p>
                </div>
              )}
            </div>

            {/* Instagram */}
            <div className="rounded-xl border border-border/50 bg-card/60 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <IgIcon />
                <span className="text-sm font-medium">Instagram</span>
              </div>
              {igConnected ? (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs text-emerald-500 font-medium">Connected</span>
                </div>
              ) : (
                <a
                  href="/api/instagram/connect"
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border/60 hover:border-border hover:bg-muted/40 transition-colors"
                >
                  Connect
                  <ArrowRight className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground px-1">
            You can connect Instagram later from Settings.
          </p>
        </div>

        {/* Error */}
        {state?.error && (
          <p className="text-sm text-destructive text-center">{state.error}</p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={pending || slugStatus === "taken"}
          className="w-full"
          style={{ background: "var(--emerald)", color: "black" }}
        >
          {pending ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</>
          ) : (
            <>Save & go to dashboard <ArrowRight className="h-4 w-4 ml-2" /></>
          )}
        </Button>
      </form>
    </div>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-red-500" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function IgIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}
