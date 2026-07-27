import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Logo } from "@/components/brand/Logo";
import { logout } from "@/app/(auth)/actions";
import { PLAN_LABELS } from "@/lib/plans";
import type { AppHeaderData } from "@/lib/app-header";

/**
 * The signed-in nav — shared between app/(app)/layout.tsx (every
 * authenticated page) and MarketingHeader (public pages like /calculators,
 * viewed while logged in), so the nav never disappears or changes shape
 * just because a page happens to live outside the (app) route group.
 */
export function AppNavHeader({ isAdmin, plan, used, limit, bonus }: AppHeaderData) {
  return (
    <header className="flex items-center justify-between border-b bg-card/60 px-6 py-4 backdrop-blur">
      <nav className="flex items-center gap-6">
        <Link href="/home">
          <Logo />
        </Link>
        <Link href="/search" className="text-sm text-muted-foreground hover:text-foreground">
          Investment Property Analyzer
        </Link>
        <Link href="/deals" className="text-sm text-muted-foreground hover:text-foreground">
          Saved deals
        </Link>
        <Link href="/calculators" className="text-sm text-muted-foreground hover:text-foreground">
          Calculators
        </Link>
        {isAdmin && (
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
            Admin
          </Link>
        )}
      </nav>
      <div className="flex items-center gap-3">
        <Link
          href="/settings"
          className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground transition-colors duration-200 hover:bg-secondary/70"
        >
          {isAdmin
            ? "Admin access"
            : `${PLAN_LABELS[plan]} · ${Math.max(0, limit - used)}/${limit} left${bonus > 0 ? ` +${bonus} bonus` : ""}`}
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
    </header>
  );
}
