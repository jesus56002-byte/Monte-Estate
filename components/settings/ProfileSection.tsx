"use client";

import { useActionState, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { changePassword, deleteAccount, type SettingsActionState, type DeleteAccountState } from "@/app/(app)/settings/actions";
import type { SettingsData } from "@/components/settings/types";

const initialActionState: SettingsActionState = { error: null, success: null };
const initialDeleteState: DeleteAccountState = { error: null };

function DeleteAccountDialog() {
  const [state, formAction, pending] = useActionState(deleteAccount, initialDeleteState);
  const [confirmText, setConfirmText] = useState("");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Delete account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete your account?</DialogTitle>
          <DialogDescription>
            This permanently deletes your account, every saved deal, and cancels any active subscription
            immediately. This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm">
              Type <span className="font-semibold text-foreground">DELETE</span> to confirm
            </Label>
            <Input
              id="confirm"
              name="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoComplete="off"
            />
          </div>
          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" variant="destructive" disabled={confirmText !== "DELETE" || pending}>
              {pending ? "Deleting…" : "Permanently delete account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ProfileSection({ data }: { data: SettingsData }) {
  const [passwordState, passwordAction, passwordPending] = useActionState(changePassword, initialActionState);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your account identity.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profileName">Name</Label>
            <Input id="profileName" value={data.displayName || "—"} disabled readOnly />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profileEmail">Email</Label>
            <Input id="profileEmail" value={data.email} disabled readOnly />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Change your password.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={passwordAction} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="newPassword">New password</Label>
                <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" minLength={8} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
            </div>

            {passwordState.error && (
              <p role="alert" className="text-sm text-destructive">
                {passwordState.error}
              </p>
            )}
            {passwordState.success && <p className="text-sm text-success">{passwordState.success}</p>}

            <Button type="submit" className="w-fit" disabled={passwordPending}>
              {passwordPending ? "Updating…" : "Change password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>Permanently delete your account and all of your data.</CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountDialog />
        </CardContent>
      </Card>
    </div>
  );
}
