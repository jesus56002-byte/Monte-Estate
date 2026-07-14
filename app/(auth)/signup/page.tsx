import { AuthForm } from "@/components/auth/AuthForm";
import { signup } from "@/app/(auth)/actions";
import { publicAccessEnabled } from "@/lib/env";

export default function SignupPage() {
  if (!publicAccessEnabled) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Signups are currently closed</h1>
        <p className="max-w-sm text-muted-foreground">
          Monte Estate isn&apos;t open to new accounts right now. Check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
      <AuthForm mode="signup" action={signup} />
    </div>
  );
}
