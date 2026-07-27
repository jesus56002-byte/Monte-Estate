import Link from "next/link";
import { redirect } from "next/navigation";
import { hasSupabaseConfig } from "@/lib/env";
import { getAuthedUser } from "@/lib/supabase/server";
import { getAppHeaderData } from "@/lib/app-header";
import { Button } from "@/components/ui/button";
import { AppNavHeader } from "@/components/app/AppNavHeader";

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

  const headerData = await getAppHeaderData(supabase, user);

  return (
    <div className="flex flex-1 flex-col">
      <AppNavHeader {...headerData} />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
