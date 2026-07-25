import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Logo } from "@/components/brand/Logo";
import { HomeContent } from "@/components/marketing/HomeContent";
import { publicAccessEnabled, hasSupabaseConfig } from "@/lib/env";
import { getAuthedUser } from "@/lib/supabase/server";

export default async function Home() {
  // A signed-in visitor landing on the bare marketing URL would otherwise see
  // this page's logged-out nav (Log in/Sign up) with no way to tell they're
  // still signed in — it reads as having been logged out even though the
  // session is untouched. Send them to the identical-looking page inside the
  // app shell instead, with the real nav (Search/Saved deals/Settings/etc).
  if (hasSupabaseConfig) {
    const { user } = await getAuthedUser();
    if (user) {
      redirect("/home");
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-card/70 px-6 py-4 backdrop-blur">
        <Logo />
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

      <main className="flex flex-1 flex-col">
        <HomeContent />
      </main>
    </div>
  );
}
