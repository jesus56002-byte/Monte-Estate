import { AuthForm } from "@/components/auth/AuthForm";
import { signup } from "@/app/(auth)/actions";

export default function SignupPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
      <AuthForm mode="signup" action={signup} />
    </div>
  );
}
