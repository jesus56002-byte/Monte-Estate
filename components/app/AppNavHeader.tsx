"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Logo } from "@/components/brand/Logo";
import { logout } from "@/app/(auth)/actions";
import { PLAN_LABELS } from "@/lib/plans";
import type { AppHeaderData } from "@/lib/app-header";

const NAV_LINKS = [
  { href: "/search", label: "Investment Property Analyzer" },
  { href: "/deals", label: "Saved deals" },
  { href: "/calculators", label: "Calculators" },
];

/**
 * The signed-in nav — shared between app/(app)/layout.tsx (every
 * authenticated page) and MarketingHeader (public pages like /calculators,
 * viewed while logged in), so the nav never disappears or changes shape
 * just because a page happens to live outside the (app) route group.
 *
 * Collapses into a hamburger menu below `lg`: the full link list plus the
 * plan badge easily exceeds a phone's viewport width laid out in one row,
 * which was forcing the whole page to scroll/zoom horizontally on mobile.
 */
export function AppNavHeader({ isAdmin, plan, used, limit, bonus }: AppHeaderData) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const badgeText = isAdmin
    ? "Admin access"
    : `${PLAN_LABELS[plan]} · ${Math.max(0, limit - used)}/${limit} left${bonus > 0 ? ` +${bonus} bonus` : ""}`;

  return (
    <header className="relative z-50 border-b bg-card/60 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-6 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/settings"
            className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground transition-colors duration-200 hover:bg-secondary/70"
          >
            {badgeText}
          </Link>
          <Link href="/settings" className="text-sm text-muted-foreground hover:text-foreground">
            Settings
          </Link>
          <ThemeToggle />
          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm">
              Log out
            </Button>
          </form>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="flex size-9 items-center justify-center rounded-full text-foreground lg:hidden"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-background/40 lg:hidden"
          />
          <div className="absolute inset-x-0 top-full z-50 flex flex-col gap-1 border-b bg-card p-4 shadow-soft-lg lg:hidden">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-secondary/60"
              >
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-secondary/60"
              >
                Admin
              </Link>
            )}
            <div className="my-1 border-t" />
            <Link
              href="/settings"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-secondary/60"
            >
              {badgeText}
            </Link>
            <Link
              href="/settings"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-secondary/60"
            >
              Settings
            </Link>
            <div className="flex items-center justify-between px-3 py-2.5">
              <span className="text-sm text-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <form action={logout}>
              <Button type="submit" variant="ghost" size="sm" className="w-full justify-start px-3">
                Log out
              </Button>
            </form>
          </div>
        </>
      )}
    </header>
  );
}
