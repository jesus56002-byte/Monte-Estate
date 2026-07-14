import { AuthForm } from "@/components/auth/AuthForm";
import { login } from "@/app/(auth)/actions";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Log in to Monte Estate</h1>
      <AuthForm mode="login" action={login} />
    </div>
  );
}
