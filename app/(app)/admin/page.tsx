import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { getAuthedUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/subscription";
import { isPlanId } from "@/lib/plans";
import { AdminDashboard, type AdminUserRow } from "@/components/admin/AdminDashboard";

function monthStartIso(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export default async function AdminPage() {
  const { user } = await getAuthedUser();
  if (!user || !isAdminEmail(user.email, env.ADMIN_EMAILS)) {
    redirect("/search");
  }

  const admin = createAdminClient();
  const monthStart = monthStartIso();
  const now = new Date().toISOString();

  const [
    { data: profileRows },
    { data: authUsers },
    { count: totalSubscribers },
    { count: analysesThisMonth },
    { count: rentcastRequestsThisMonth },
    { data: pageViewStatsRows },
  ] = await Promise.all([
    admin
      .from("profiles")
      .select(
        "id, plan, subscription_status, plan_analyses_used, bonus_analyses_remaining, cancel_at_period_end, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(500),
    // Supabase's admin listUsers caps at 1000/page — plenty of headroom for
    // this app's current scale; revisit with pagination if that changes.
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .neq("plan", "free")
      .in("subscription_status", ["active", "trialing"]),
    admin.from("deals").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
    admin.from("rentcast_request_log").select("id", { count: "exact", head: true }).gte("created_at", monthStart),
    admin.rpc("get_page_view_stats", { p_start: monthStart, p_end: now }),
  ]);

  const emailById = new Map(authUsers?.users.map((u) => [u.id, u.email ?? "—"]) ?? []);
  const users: AdminUserRow[] = (profileRows ?? []).map((row) => ({
    id: row.id,
    email: emailById.get(row.id) ?? "—",
    plan: isPlanId(row.plan) ? row.plan : "free",
    subscriptionStatus: row.subscription_status,
    analysesUsed: row.plan_analyses_used,
    bonusAnalyses: row.bonus_analyses_remaining,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    createdAt: row.created_at,
  }));

  const stats = pageViewStatsRows?.[0];
  const totalSessions = stats?.total_sessions ?? 0;
  const bouncedSessions = stats?.bounced_sessions ?? 0;

  return (
    <AdminDashboard
      data={{
        users,
        totalSubscribers: totalSubscribers ?? 0,
        analysesThisMonth: analysesThisMonth ?? 0,
        rentcastRequestsThisMonth: rentcastRequestsThisMonth ?? 0,
        visitors: stats?.unique_visitors ?? 0,
        pageViews: stats?.total_views ?? 0,
        bounceRate: totalSessions > 0 ? bouncedSessions / totalSessions : 0,
      }}
    />
  );
}
