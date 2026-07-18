"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAuthedUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasStripeConfig } from "@/lib/env";
import { getStripeClient } from "@/lib/stripe/client";
import { profileSchema, defaultsSchema, feedbackSchema } from "@/lib/validation/settings";
import { changePasswordSchema } from "@/lib/validation/auth";

export type SettingsActionState = { error: string | null; success: string | null };

const initialState: SettingsActionState = { error: null, success: null };

export async function updateProfile(
  _prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const { supabase, user } = await getAuthedUser();
  if (!user) {
    return { ...initialState, error: "You must be signed in." };
  }

  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { ...initialState, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: parsed.data.displayName, phone: parsed.data.phone })
    .eq("id", user.id);

  if (error) {
    return { ...initialState, error: error.message };
  }

  revalidatePath("/settings");
  return { ...initialState, success: "Your changes have been saved." };
}

export async function updateDefaults(
  _prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const { supabase, user } = await getAuthedUser();
  if (!user) {
    return { ...initialState, error: "You must be signed in." };
  }

  const parsed = defaultsSchema.safeParse({
    appreciationPct: Number(formData.get("appreciationPct")),
    vacancyPct: Number(formData.get("vacancyPct")),
    maintenancePct: Number(formData.get("maintenancePct")),
    closingCostPct: Number(formData.get("closingCostPct")),
    insurancePct: Number(formData.get("insurancePct")),
  });
  if (!parsed.success) {
    return { ...initialState, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      default_appreciation_pct: parsed.data.appreciationPct,
      default_vacancy_pct: parsed.data.vacancyPct,
      default_maintenance_pct: parsed.data.maintenancePct,
      default_closing_cost_pct: parsed.data.closingCostPct,
      default_insurance_pct: parsed.data.insurancePct,
    })
    .eq("id", user.id);

  if (error) {
    return { ...initialState, error: error.message };
  }

  revalidatePath("/settings");
  return { ...initialState, success: "Your defaults will be used on your next property search." };
}

export async function changePassword(
  _prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const { supabase, user } = await getAuthedUser();
  if (!user) {
    return { ...initialState, error: "You must be signed in." };
  }

  const parsed = changePasswordSchema.safeParse({
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { ...initialState, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword });
  if (error) {
    return { ...initialState, error: error.message };
  }

  return { ...initialState, success: "Your password has been updated." };
}

export async function submitFeedback(
  _prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const { supabase, user } = await getAuthedUser();
  if (!user) {
    return { ...initialState, error: "You must be signed in." };
  }

  const parsed = feedbackSchema.safeParse({
    category: formData.get("category"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { ...initialState, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { error } = await supabase
    .from("feedback")
    .insert({ user_id: user.id, category: parsed.data.category, message: parsed.data.message });

  if (error) {
    return { ...initialState, error: error.message };
  }

  return { ...initialState, success: "Thanks — we read every message." };
}

export type DeleteAccountState = { error: string | null };

/**
 * Cancels any live Stripe subscription immediately (not at period end — the
 * account is going away, so there's no "end of period" to wait for) before
 * deleting the auth user, whose ON DELETE CASCADE takes the profile and every
 * saved deal with it.
 */
export async function deleteAccount(
  _prevState: DeleteAccountState,
  formData: FormData
): Promise<DeleteAccountState> {
  const { supabase, user } = await getAuthedUser();
  if (!user) {
    return { error: "You must be signed in." };
  }

  if (formData.get("confirm") !== "DELETE") {
    return { error: 'Type "DELETE" to confirm.' };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_subscription_id")
    .eq("id", user.id)
    .single();

  if (profile?.stripe_subscription_id && hasStripeConfig) {
    try {
      await getStripeClient().subscriptions.cancel(profile.stripe_subscription_id);
    } catch (error) {
      console.error("[deleteAccount] failed to cancel Stripe subscription:", error);
      return { error: "Couldn't cancel your subscription. Please contact support before deleting your account." };
    }
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return { error: error.message };
  }

  await supabase.auth.signOut();
  redirect("/");
}
