"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Link2, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems: { href: "/dashboard" | "/connections" | "/settings"; label: string; icon: React.ElementType }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/connections", label: "Connections", icon: Link2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface DashboardNavProps {
  displayName: string;
  email: string;
  slug: string;
}

export function DashboardNav({ displayName, email, slug }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-8">
        {/* Brand */}
        <Link href="/dashboard" className="font-display font-800 text-lg tracking-tight shrink-0"
          style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}>
          metrify
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                pathname === href
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Right: public link + sign out */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={`/c/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2.5 py-1 rounded-full border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-colors font-mono"
          >
            /c/{slug}
          </a>
          <button
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            title={email}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{displayName.split(" ")[0]}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
