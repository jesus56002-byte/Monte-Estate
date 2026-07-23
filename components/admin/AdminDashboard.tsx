import { Activity, Building2, Eye, LogOut, Search, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PLAN_LABELS, type PlanId } from "@/lib/plans";
import { formatFullDate, formatNumber, formatPercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

export interface AdminUserRow {
  id: string;
  email: string;
  plan: PlanId;
  subscriptionStatus: string | null;
  analysesUsed: number;
  bonusAnalyses: number;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

export interface AdminDashboardData {
  users: AdminUserRow[];
  totalSubscribers: number;
  analysesThisMonth: number;
  rentcastRequestsThisMonth: number;
  visitors: number;
  pageViews: number;
  bounceRate: number;
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Users;
  value: string;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  trialing: "Trialing",
  canceled: "Canceled",
  past_due: "Past due",
  unpaid: "Unpaid",
  incomplete: "Incomplete",
  incomplete_expired: "Expired",
};

function StatusBadge({ status, cancelAtPeriodEnd }: { status: string | null; cancelAtPeriodEnd: boolean }) {
  if (!status) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  const isActive = status === "active" || status === "trialing";
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium",
        isActive ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
      )}
    >
      {STATUS_LABEL[status] ?? status}
      {cancelAtPeriodEnd && isActive ? " (canceling)" : ""}
    </span>
  );
}

export function AdminDashboard({ data }: { data: AdminDashboardData }) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Admin dashboard</h1>
        <p className="text-sm text-muted-foreground">Monte Estate at a glance, this calendar month.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <StatCard icon={Users} value={formatNumber(data.visitors)} label="Visitors" />
        <StatCard icon={Eye} value={formatNumber(data.pageViews)} label="Page views" />
        <StatCard icon={LogOut} value={formatPercent(data.bounceRate)} label="Bounce rate" />
        <StatCard icon={Building2} value={formatNumber(data.totalSubscribers)} label="Total subscribers" />
        <StatCard icon={Activity} value={formatNumber(data.analysesThisMonth)} label="Analyses this month" />
        <StatCard icon={Search} value={formatNumber(data.rentcastRequestsThisMonth)} label="RentCast requests" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {data.users.length} account{data.users.length === 1 ? "" : "s"}, most recently joined first.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Email</th>
                <th className="py-2 pr-4 font-medium">Plan</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Analyses used</th>
                <th className="py-2 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="max-w-[220px] truncate py-2.5 pr-4">{row.email}</td>
                  <td className="py-2.5 pr-4">{PLAN_LABELS[row.plan]}</td>
                  <td className="py-2.5 pr-4">
                    <StatusBadge status={row.subscriptionStatus} cancelAtPeriodEnd={row.cancelAtPeriodEnd} />
                  </td>
                  <td className="py-2.5 pr-4 whitespace-nowrap">
                    {row.analysesUsed}
                    {row.bonusAnalyses > 0 ? ` (+${row.bonusAnalyses} bonus)` : ""}
                  </td>
                  <td className="py-2.5 whitespace-nowrap text-muted-foreground">{formatFullDate(row.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.users.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">No users yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
