import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Logo } from "@/components/brand/Logo";
import { publicAccessEnabled, hasSupabaseConfig } from "@/lib/env";
import { getAuthedUser } from "@/lib/supabase/server";
import { getAppHeaderData } from "@/lib/app-header";
import { AppNavHeader } from "@/components/app/AppNavHeader";

/**
 * Header for public marketing pages (homepage, pricing, how-it-works,
 * calculators). These pages are reachable both by anonymous visitors and by
 * signed-in users (e.g. the "Calculators" link in the authenticated app
 * nav), so a logged-in visitor gets the exact same AppNavHeader they see
 * everywhere else in the app — same tabs, same everything — rather than a
 * stripped-down header that makes the page feel disconnected from the rest
 * of the site. Anonymous visitors get the lightweight Log in/Sign up header.
 */
export async function MarketingHeader() {
  if (hasSupabaseConfig) {
    const { supabase, user } = await getAuthedUser();
    if (user) {
      const headerData = await getAppHeaderData(supabase, user);
      return <AppNavHeader {...headerData} />;
    }
  }

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
