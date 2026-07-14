import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapDealRow } from "@/lib/deals/mapRow";
import { DealWorkspace } from "@/components/deals/DealWorkspace";

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ dealId: string }>;
}) {
  const { dealId } = await params;
  const supabase = await createClient();

  const { data: row } = await supabase.from("deals").select("*").eq("id", dealId).single();

  if (!row) {
    notFound();
  }

  return <DealWorkspace deal={mapDealRow(row)} />;
}
