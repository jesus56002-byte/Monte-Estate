import { AuthForm } from "@/components/auth/AuthForm";
import { login } from "@/app/(auth)/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Log in to Monte Estate</CardTitle>
        </CardHeader>
        <CardContent>
          <AuthForm mode="login" action={login} />
        </CardContent>
      </Card>
    </div>
  );
}
