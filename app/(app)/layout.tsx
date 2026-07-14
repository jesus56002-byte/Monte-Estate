import Link from "next/link";
import { redirect } from "next/navigation";
import { hasSupabaseConfig } from "@/lib/env";
import { getAuthedUser } from "@/lib/supabase/server";
import { hasActiveAccess } from "@/lib/subscription";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { logout } from "@/app/(auth)/actions";
import { ManageBillingButton } from "@/components/billing/ManageBillingButton";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabaseConfig) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-xl font-semibold">Supabase is not configured yet</h1>
        <p className="max-w-md text-muted-foreground">
          Set <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in
          your environment to enable accounts and this section of the app.
        </p>
        <Button asChild variant="outline">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    );
  }

  const { supabase, user } = await getAuthedUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status")
    .eq("id", user.id)
    .single();

  if (!hasActiveAccess(profile?.subscription_status ?? null)) {
    redirect("/subscribe");
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <nav className="flex items-center gap-6">
          <Link href="/search" className="font-semibold tracking-tight">
            Monte Estate
          </Link>
          <Link href="/search" className="text-sm text-muted-foreground hover:text-foreground">
            Search
          </Link>
          <Link href="/deals" className="text-sm text-muted-foreground hover:text-foreground">
            Saved deals
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ManageBillingButton />
          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm">
              Log out
            </Button>
          </form>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
