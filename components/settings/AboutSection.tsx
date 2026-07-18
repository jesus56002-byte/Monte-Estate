import { Bookmark, Building2, Calendar, Dices } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatFullDate, formatNumber } from "@/lib/utils/format";
import { Logo } from "@/components/brand/Logo";
import type { SettingsData } from "@/components/settings/types";

const APP_VERSION = "1.0.0";

function StatTile({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Building2;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border bg-background px-4 py-5 text-center">
      <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-4.5" />
      </span>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function AboutSection({ data }: { data: SettingsData }) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Account statistics</CardTitle>
          <CardDescription>A quick look at your activity.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile icon={Building2} value={formatNumber(data.stats.propertiesAnalyzed)} label="Properties analyzed" />
            <StatTile icon={Bookmark} value={formatNumber(data.stats.savedDeals)} label="Saved deals" />
            <StatTile icon={Dices} value={formatNumber(data.stats.totalSimulations)} label="Monte Carlo trials" />
            <StatTile icon={Calendar} value={formatFullDate(data.memberSince)} label="Member since" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>Monte Estate is built and maintained by Saguaro Digital Ventures LLC.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 py-4 text-center">
          <Logo />
          <p className="text-sm text-muted-foreground">Version {APP_VERSION}</p>
          <div className="text-sm text-muted-foreground">
            <p>Developed by</p>
            <p className="font-medium text-foreground">Saguaro Digital Ventures LLC</p>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Saguaro Digital Ventures LLC.</p>
        </CardContent>
      </Card>
    </div>
  );
}
