"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SESSION_COOKIE = "me_sid";
const SESSION_MAX_AGE_SECONDS = 30 * 60; // 30-minute rolling window, the standard analytics "session" length

function getOrCreateSessionId(): string {
  const match = document.cookie.match(new RegExp(`(?:^|; )${SESSION_COOKIE}=([^;]+)`));
  const id = match?.[1] ?? crypto.randomUUID();
  // Re-set on every call (new or existing) so the window rolls forward with activity.
  document.cookie = `${SESSION_COOKIE}=${id}; path=/; max-age=${SESSION_MAX_AGE_SECONDS}; samesite=lax`;
  return id;
}

/** Mounted once in the root layout — logs a pageview on first load and every client-side navigation. */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/api/")) return;

    const sessionId = getOrCreateSessionId();
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, sessionId }),
      keepalive: true,
    }).catch(() => {
      // Best-effort — a dropped pageview beacon shouldn't affect the visitor.
    });
  }, [pathname]);

  return null;
}
