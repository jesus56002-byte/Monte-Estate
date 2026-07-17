import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark, Plus, ShieldCheck } from "lucide-react";
import { getAuthedUser } from "@/lib/supabase/server";
import { mapDealRow } from "@/lib/deals/mapRow";
import { DealCard } from "@/components/deals/DealCard";
import { Button } from "@/components/ui/button";

export default async function DealsPage() {
  const { supabase, user } = await getAuthedUser();
  if (!user) {
    redirect("/login");
  }

  const { data: rows } = await supabase
    .from("deals")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  const deals = (rows ?? []).map(mapDealRow);

  return (
    <div className="flex flex-1 flex-col items-center gap-8 px-6 py-16">
      <div className="flex w-full max-w-4xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Saved deals</h1>
          <p className="text-muted-foreground">
            Quick access to the properties you&apos;ve analyzed and want to revisit.
          </p>
        </div>
        <Button asChild size="lg" className="rounded-full">
          <Link href="/search">
            <Plus className="size-4" />
            Analyze a new property
          </Link>
        </Button>
      </div>

      {deals.length === 0 ? (
        <div className="flex w-full max-w-4xl flex-col items-center gap-4 rounded-2xl border border-dashed bg-card/40 px-6 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
            <Bookmark className="size-6" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="font-medium">No saved deals yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Analyze a property and it&apos;ll show up here automatically — every search is saved.
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/search">Analyze a property</Link>
          </Button>
        </div>
      ) : (
        <div className="flex w-full max-w-4xl flex-col gap-4">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}

      <div className="flex w-full max-w-4xl items-start gap-4 rounded-2xl border border-secondary bg-secondary/50 px-6 py-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
          <ShieldCheck className="size-5" />
        </span>
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-semibold">This is not financial advice.</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Monte Estate provides educational investment analysis tools. Always do your own research
            and consult a professional advisor.
          </p>
        </div>
      </div>
    </div>
  );
}
