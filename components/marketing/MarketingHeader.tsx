import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Logo } from "@/components/brand/Logo";
import { publicAccessEnabled, hasSupabaseConfig } from "@/lib/env";
import { getAuthedUser } from "@/lib/supabase/server";

/**
 * Shared header for public marketing pages (homepage, pricing, how-it-works,
 * calculators). These pages are reachable both by anonymous visitors and by
 * signed-in users (e.g. the "Calculators" link in the authenticated app
 * nav), so it checks auth itself rather than always showing Log in/Sign up —
 * otherwise an already-logged-in user lands here and it looks like they got
 * logged out, the same bug the "/" → "/home" redirect fixed elsewhere.
 */
export async function MarketingHeader() {
  const isLoggedIn = hasSupabaseConfig && Boolean((await getAuthedUser()).user);

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-card/70 px-6 py-4 backdrop-blur">
      <Link href={isLoggedIn ? "/home" : "/"}>
        <Logo />
      </Link>
      <div className="flex items-center gap-2">
        {isLoggedIn ? (
          <Button asChild size="sm">
            <Link href="/home">Back to app</Link>
          </Button>
        ) : (
          <>
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Log in</Link>
            </Button>
            {publicAccessEnabled && (
              <Button asChild variant="outline" size="sm">
                <Link href="/signup">Sign up</Link>
              </Button>
            )}
          </>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
