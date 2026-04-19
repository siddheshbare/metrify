"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { updateCreatorProfile } from "@/app/actions/creator";

interface SettingsFormProps {
  displayName: string;
  bio: string | null;
  niche: string | null;
  isPublic: boolean;
  slug: string;
}

export function SettingsForm({ displayName, bio, niche, isPublic, slug }: SettingsFormProps) {
  const [pending, startTransition] = useTransition();
  const [currentSlug, setCurrentSlug] = useState(slug);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  async function checkSlug(value: string) {
    if (value === slug) { setSlugAvailable(null); return; }
    if (!value || !/^[a-z0-9-]+$/.test(value)) { setSlugAvailable(false); return; }
    setCheckingSlug(true);
    try {
      const res = await fetch(`/api/creator/slug-check?slug=${encodeURIComponent(value)}`);
      const data = (await res.json()) as { available: boolean };
      setSlugAvailable(data.available);
    } catch {
      setSlugAvailable(null);
    } finally {
      setCheckingSlug(false);
    }
  }

  function handleAction(formData: FormData) {
    startTransition(async () => {
      const result = await updateCreatorProfile(formData);
      if (result.error) toast.error(result.error);
      else toast.success("Profile saved");
    });
  }

  return (
    <form action={handleAction} className="space-y-6 max-w-lg">
      {/* Display name */}
      <div className="space-y-1.5">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={displayName}
          placeholder="Your name or channel name"
          required
        />
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={bio ?? ""}
          placeholder="Tell brands about your content and audience…"
          rows={3}
        />
      </div>

      {/* Niche */}
      <div className="space-y-1.5">
        <Label htmlFor="niche">Niche</Label>
        <Input
          id="niche"
          name="niche"
          defaultValue={niche ?? ""}
          placeholder="e.g. Tech, Gaming, Lifestyle, Beauty"
        />
      </div>

      <Separator className="bg-border/40" />

      {/* Public URL slug */}
      <div className="space-y-1.5">
        <Label htmlFor="slug">Public URL</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground shrink-0">metrify.app/c/</span>
          <div className="relative flex-1">
            <Input
              id="slug"
              name="slug"
              value={currentSlug}
              onChange={(e) => {
                const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                setCurrentSlug(val);
                checkSlug(val);
              }}
              placeholder="your-slug"
              className="pr-8"
            />
            {currentSlug !== slug && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">
                {checkingSlug ? "…" : slugAvailable === true ? "✓" : slugAvailable === false ? "✗" : ""}
              </span>
            )}
          </div>
        </div>
        {currentSlug !== slug && (
          <p className="text-xs text-muted-foreground">
            Your old URL will redirect for 30 days.
          </p>
        )}
      </div>

      {/* Visibility */}
      <div className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3">
        <div>
          <p className="text-sm font-medium">Public profile</p>
          <p className="text-xs text-muted-foreground">
            Brands can find and view your metrics page
          </p>
        </div>
        <Switch
          name="isPublic"
          defaultChecked={isPublic}
          onCheckedChange={(checked) => {
            const input = document.querySelector<HTMLInputElement>('input[name="isPublicHidden"]');
            if (input) input.value = checked ? "true" : "false";
          }}
        />
        <input type="hidden" name="isPublic" defaultValue={isPublic ? "true" : "false"} />
      </div>

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
