"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import type { AuthActionState } from "@/app/(auth)/actions";

const initialState: AuthActionState = { error: null, info: null };

export function AuthForm({
  mode,
  action,
}: {
  mode: "login" | "signup";
  action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const isLogin = mode === "login";

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          minLength={isLogin ? undefined : 8}
          required
        />
      </div>

      {!isLogin && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
      )}

      {!isLogin && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Cell phone number</Label>
          <Input id="phone" name="phone" type="tel" autoComplete="tel" required />
        </div>
      )}

      {!isLogin && (
        <div className="flex items-start gap-2">
          <input
            id="termsAccepted"
            name="termsAccepted"
            type="checkbox"
            required
            className="mt-0.5 size-4 shrink-0 rounded border-input"
          />
          <Label htmlFor="termsAccepted" className="block text-sm font-normal leading-snug text-muted-foreground">
            I have read and agree to the{" "}
            <Link href="/terms" target="_blank" className="font-medium text-foreground underline underline-offset-4">
              Terms & Conditions
            </Link>
            , including that this tool is for educational purposes only, is not financial advice,
            and that Monte Carlo results are not a guarantee of any outcome.
          </Label>
        </div>
      )}

      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.info && <p className="text-sm text-success">{state.info}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Please wait…" : isLogin ? "Log in" : "Create account"}
      </Button>

      <SocialAuthButtons />

      <p className="text-center text-sm text-muted-foreground">
        {isLogin ? (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
