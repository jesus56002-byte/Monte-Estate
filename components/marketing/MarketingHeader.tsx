import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Logo } from "@/components/brand/Logo";
import { publicAccessEnabled } from "@/lib/env";

/** Shared logged-out header for public marketing pages (homepage, pricing, how-it-works). */
export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-card/70 px-6 py-4 backdrop-blur">
      <Link href="/">
        <Logo />
      </Link>
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">Log in</Link>
        </Button>
        {publicAccessEnabled && (
          <Button asChild variant="outline" size="sm">
            <Link href="/signup">Sign up</Link>
          </Button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
