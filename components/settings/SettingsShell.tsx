"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { CreditCard, HelpCircle, Info, Settings2, SlidersHorizontal, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SettingsData, SettingsTab } from "@/components/settings/types";
import { GeneralSection } from "@/components/settings/GeneralSection";
import { SubscriptionSection } from "@/components/settings/SubscriptionSection";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { DefaultsSection } from "@/components/settings/DefaultsSection";
import { HelpSection } from "@/components/settings/HelpSection";
import { AboutSection } from "@/components/settings/AboutSection";

const TABS: { id: SettingsTab; label: string; icon: LucideIcon }[] = [
  { id: "general", label: "General", icon: Settings2 },
  { id: "subscription", label: "Subscription", icon: CreditCard },
  { id: "profile", label: "Profile", icon: User },
  { id: "defaults", label: "Defaults", icon: SlidersHorizontal },
  { id: "help", label: "Help", icon: HelpCircle },
  { id: "about", label: "About", icon: Info },
];

function isSettingsTab(value: string | null): value is SettingsTab {
  return TABS.some((tab) => tab.id === value);
}

export function SettingsShell(data: SettingsData) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramTab = searchParams.get("tab");
  const [tab, setTab] = useState<SettingsTab>(isSettingsTab(paramTab) ? paramTab : "general");

  function selectTab(next: SettingsTab) {
    setTab(next);
    router.replace(`/settings?tab=${next}`, { scroll: false });
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-12 lg:flex-row lg:items-start lg:gap-10">
      <div className="flex flex-col gap-1">
        <h1 className="px-1 text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mb-4 px-1 text-sm text-muted-foreground">Manage your account and preferences.</p>

        <nav className="flex gap-1.5 overflow-x-auto pb-2 lg:sticky lg:top-20 lg:w-52 lg:flex-col lg:overflow-visible lg:pb-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => selectTab(id)}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors duration-200",
                tab === id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="min-w-0 flex-1">
        {tab === "general" && <GeneralSection data={data} />}
        {tab === "subscription" && <SubscriptionSection data={data} />}
        {tab === "profile" && <ProfileSection data={data} />}
        {tab === "defaults" && <DefaultsSection data={data} />}
        {tab === "help" && <HelpSection />}
        {tab === "about" && <AboutSection data={data} />}
      </div>
    </div>
  );
}
