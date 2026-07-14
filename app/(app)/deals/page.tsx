import Link from "next/link";
import { redirect } from "next/navigation";
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
    <div className="flex flex-1 flex-col items-center gap-8 px-6 py-12">
      <div className="flex w-full max-w-3xl items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Saved deals</h1>
        <Button asChild size="sm">
          <Link href="/search">Analyze a new property</Link>
        </Button>
      </div>

      {deals.length === 0 ? (
        <p className="text-muted-foreground">
          No saved deals yet. Analyze a property and save it to see it here.
        </p>
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
