import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";
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
      <div className="flex w-full max-w-3xl items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Saved deals</h1>
        <Button asChild size="sm">
          <Link href="/search">Analyze a new property</Link>
        </Button>
      </div>

      {deals.length === 0 ? (
        <div className="flex w-full max-w-3xl flex-col items-center gap-4 rounded-2xl border border-dashed bg-card/40 px-6 py-16 text-center">
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
        <div className="flex w-full max-w-3xl flex-col gap-3">
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  );
}
