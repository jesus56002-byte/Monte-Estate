import Link from "next/link";
import { redirect } from "next/navigation";
import { env, hasSupabaseConfig } from "@/lib/env";
import { getAuthedUser } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/subscription";
import { PLAN_ANALYSIS_LIMITS, PLAN_LABELS, isPlanId } from "@/lib/plans";
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

  const isAdmin = isAdminEmail(user.email, env.ADMIN_EMAILS);

  // Free tier is always allowed in — access isn't gated on a subscription
  // anymore, just on the per-plan analysis quota, enforced where an analysis
  // is actually performed (createAnalysis). This header badge is just a
  // status readout, not an access check.
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_analyses_used, bonus_analyses_remaining")
    .eq("id", user.id)
    .single();
  const plan = isPlanId(profile?.plan) ? profile.plan : "free";
  const used = profile?.plan_analyses_used ?? 0;
  const bonus = profile?.bonus_analyses_remaining ?? 0;
  const limit = PLAN_ANALYSIS_LIMITS[plan];

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
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <span className="text-xs text-muted-foreground">Admin access</span>
          ) : (
            <Link href="/subscribe" className="text-xs text-muted-foreground hover:text-foreground">
              {PLAN_LABELS[plan]} · {Math.max(0, limit - used)}/{limit} left
              {bonus > 0 ? ` +${bonus} bonus` : ""}
            </Link>
          )}
          <ThemeToggle />
          {!isAdmin && plan !== "free" && <ManageBillingButton />}
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
