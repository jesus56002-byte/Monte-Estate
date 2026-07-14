import { redirect } from "next/navigation";
import Link from "next/link";
import { hasSupabaseConfig } from "@/lib/env";
import { getAuthedUser } from "@/lib/supabase/server";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { logout } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

/**
 * Auth-gated but deliberately NOT subscription-gated — this is where a
 * signed-in user without an active subscription lands, so it can't itself
 * require one.
 */
export default async function BillingLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabaseConfig) {
    redirect("/");
  }

  const { user } = await getAuthedUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <Link href="/" className="font-semibold tracking-tight">
          Monte Estate
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm">
              Log out
            </Button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
