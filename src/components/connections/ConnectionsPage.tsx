"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ERROR_MESSAGES: Record<string, string> = {
  no_business_account: "No Instagram Business account found on your Facebook Pages.",
  access_denied: "You denied access to Instagram.",
  state_mismatch: "OAuth state mismatch — possible CSRF. Please try again.",
  connection_failed: "Connection failed. Please try again.",
  oauth_error: "An error occurred during Instagram OAuth.",
  missing_scopes: "Required permissions were denied. Please try again and accept all scopes.",
};

interface ConnectionsPageProps {
  youtubeConnectedAt: string | null;
  youtubeChannelId: string | null;
  instagramConnected: boolean;
  instagramConnectedAt: string | null;
  instagramTokenExpiresAt: string | null;
}

export function ConnectionsPage({
  youtubeConnectedAt,
  youtubeChannelId,
  instagramConnected,
  instagramConnectedAt,
  instagramTokenExpiresAt,
}: ConnectionsPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    if (connected === "instagram") toast.success("Instagram connected successfully!");
    if (error) toast.error(ERROR_MESSAGES[error] ?? `Error: ${error}`);
    if (connected || error) {
      router.replace("/connections");
    }
  }, [searchParams, router]);

  const igTokenExpired =
    instagramTokenExpiresAt != null && new Date(instagramTokenExpiresAt) < new Date();

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      const res = await fetch("/api/instagram/disconnect", { method: "POST" });
      if (res.ok) {
        toast.success("Instagram disconnected");
        router.refresh();
      } else {
        toast.error("Failed to disconnect");
      }
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <div className="space-y-4 max-w-xl">
      {/* YouTube */}
      <Card className="border-border/50 bg-card/60">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <YtIcon />
            <span className="font-semibold text-sm">YouTube</span>
            <Badge
              variant="outline"
              className="ml-auto text-xs gap-1"
              style={{ color: "var(--emerald)", borderColor: "var(--emerald-dim)" }}
            >
              <CheckCircle2 className="h-3 w-3" />
              Connected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Connected via Google OAuth. YouTube access is always available while you&apos;re signed in.
          </p>
          {youtubeChannelId && (
            <p className="text-xs text-muted-foreground font-mono">
              Channel ID: {youtubeChannelId}
            </p>
          )}
          {youtubeConnectedAt && (
            <p className="text-xs text-muted-foreground">
              Since {new Date(youtubeConnectedAt).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>

      <Separator className="bg-border/40" />

      {/* Instagram */}
      <Card className="border-border/50 bg-card/60">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <IgIcon />
            <span className="font-semibold text-sm">Instagram</span>
            {instagramConnected && !igTokenExpired ? (
              <Badge
                variant="outline"
                className="ml-auto text-xs gap-1"
                style={{ color: "var(--emerald)", borderColor: "var(--emerald-dim)" }}
              >
                <CheckCircle2 className="h-3 w-3" />
                Connected
              </Badge>
            ) : igTokenExpired ? (
              <Badge variant="destructive" className="ml-auto text-xs gap-1">
                <AlertCircle className="h-3 w-3" />
                Token expired
              </Badge>
            ) : (
              <Badge variant="outline" className="ml-auto text-xs text-muted-foreground">
                Not connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {instagramConnected && !igTokenExpired ? (
            <>
              <p className="text-sm text-muted-foreground">
                Instagram Business account connected.
              </p>
              {instagramConnectedAt && (
                <p className="text-xs text-muted-foreground">
                  Connected {new Date(instagramConnectedAt).toLocaleDateString()}
                  {instagramTokenExpiresAt && (
                    <> · Token expires {new Date(instagramTokenExpiresAt).toLocaleDateString()}</>
                  )}
                </p>
              )}
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDisconnect}
                disabled={disconnecting}
              >
                {disconnecting ? "Disconnecting…" : "Disconnect Instagram"}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {igTokenExpired
                  ? "Your Instagram token has expired. Reconnect to restore access."
                  : "Connect your Instagram Business account to include it in your public profile."}
              </p>
              <a
                href="/api/instagram/connect"
                className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
              >
                {igTokenExpired ? "Reconnect Instagram" : "Connect Instagram"}
              </a>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function YtIcon() {
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
