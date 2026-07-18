"use client";

import { useActionState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateProfile, type SettingsActionState } from "@/app/(app)/settings/actions";
import { formatFullDate } from "@/lib/utils/format";
import type { SettingsData } from "@/components/settings/types";

const initialState: SettingsActionState = { error: null, success: null };

export function GeneralSection({ data }: { data: SettingsData }) {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>General</CardTitle>
        <CardDescription>Basic account information.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="displayName">Name</Label>
              <Input id="displayName" name="displayName" defaultValue={data.displayName} placeholder="Your name" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={data.email} disabled readOnly />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" name="phone" type="tel" defaultValue={data.phone} placeholder="(555) 123-4567" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="memberSince">Member since</Label>
              <Input id="memberSince" value={formatFullDate(data.memberSince)} disabled readOnly />
            </div>
          </div>

          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}
          {state.success && <p className="text-sm text-success">{state.success}</p>}

          <Button type="submit" className="w-fit" disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
