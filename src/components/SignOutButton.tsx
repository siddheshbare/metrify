"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/sign-in" })}
      className="text-sm underline text-muted-foreground hover:text-foreground"
    >
      Sign out
    </button>
  );
}
