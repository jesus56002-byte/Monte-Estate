import { notFound, redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/supabase/server";
import { mapDealRow } from "@/lib/deals/mapRow";
import { DealWorkspace } from "@/components/deals/DealWorkspace";

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ dealId: string }>;
}) {
  const { dealId } = await params;
  const { supabase, user } = await getAuthedUser();
  if (!user) {
    redirect("/login");
  }

  const { data: row } = await supabase
    .from("deals")
    .select("*")
    .eq("id", dealId)
    .eq("user_id", user.id)
    .single();

  if (!row) {
    notFound();
  }

  return <DealWorkspace deal={mapDealRow(row)} />;
}
