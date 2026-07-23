"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { GoogleIcon, FacebookIcon, AppleIcon } from "@/components/auth/BrandIcons";

type Provider = "google" | "facebook" | "apple";

const PROVIDERS: { id: Provider; label: string; icon: typeof GoogleIcon; enabled: boolean }[] = [
  { id: "google", label: "Continue with Google", icon: GoogleIcon, enabled: true },
  { id: "facebook", label: "Continue with Facebook", icon: FacebookIcon, enabled: true },
  // Apple requires a paid Apple Developer account + Services ID/key setup
  // that hasn't been done yet. The click handler below already supports
  // "apple" as a provider — once the Apple Developer + Supabase provider
  // setup is done, flip this back to `true`, no other changes needed.
  { id: "apple", label: "Continue with Apple", icon: AppleIcon, enabled: false },
];

export function SocialAuthButtons() {
  const [pendingProvider, setPendingProvider] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick(provider: Provider) {
    setError(null);
    setPendingProvider(provider);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setError(error.message);
      setPendingProvider(null);
    }
    // On success, Supabase redirects the browser away — no further action here.
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <p className="text-center text-xs text-muted-foreground">
        By continuing, you agree to Monte Estate&apos;s{" "}
        <Link href="/terms" target="_blank" className="underline underline-offset-4">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" target="_blank" className="underline underline-offset-4">
          Privacy Policy
        </Link>
        .
      </p>

      <div className="flex flex-col gap-2">
        {PROVIDERS.filter((provider) => provider.enabled).map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            type="button"
            variant="outline"
            className="justify-center"
            onClick={() => handleClick(id)}
            disabled={pendingProvider !== null}
          >
            {pendingProvider === id ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Icon className="size-4 shrink-0" />
            )}
            {label}
          </Button>
        ))}
      </div>

      {error && (
        <p role="alert" className="text-center text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
