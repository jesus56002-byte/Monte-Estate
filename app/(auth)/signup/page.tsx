import { AuthForm } from "@/components/auth/AuthForm";
import { signup } from "@/app/(auth)/actions";
import { publicAccessEnabled } from "@/lib/env";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Create your account</CardTitle>
        </CardHeader>
        <CardContent>
          <AuthForm mode="signup" action={signup} />
        </CardContent>
      </Card>
    </div>
  );
}
