"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/env";
import { loginSchema, signupSchema } from "@/lib/validation/auth";

export type AuthActionState = {
  error: string | null;
  info: string | null;
};

const initialState: AuthActionState = { error: null, info: null };

export async function login(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!hasSupabaseConfig) {
    return {
      ...initialState,
      error: "Supabase is not configured yet. Set the NEXT_PUBLIC_SUPABASE_* env vars.",
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ...initialState, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { ...initialState, error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/search");
}

export async function signup(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!hasSupabaseConfig) {
    return {
      ...initialState,
      error: "Supabase is not configured yet. Set the NEXT_PUBLIC_SUPABASE_* env vars.",
    };
  }

  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ...initialState, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });
  if (error) {
    return { ...initialState, error: error.message };
  }

  if (!data.session) {
    return {
      ...initialState,
      info: "Check your email to confirm your account before logging in.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/search");
}

export async function logout() {
  if (!hasSupabaseConfig) {
    redirect("/");
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
