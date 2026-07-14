/** Stripe subscription statuses that should grant access to the app. */
const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export function hasActiveAccess(subscriptionStatus: string | null): boolean {
  return subscriptionStatus !== null && ACTIVE_STATUSES.has(subscriptionStatus);
}

/**
 * Owner/admin bypass — checked against `ADMIN_EMAILS` (comma-separated),
 * a server-only env var. Deliberately not a database column: any such flag
 * on `profiles` would be writable by the owning user themselves (RLS scopes
 * *rows*, not columns, and `profiles_update_own` allows updating your own
 * row), so a DB flag would let a user grant themselves access for free.
 */
export function isAdminEmail(email: string | null | undefined, adminEmailsEnv: string | undefined): boolean {
  if (!email || !adminEmailsEnv) return false;
  const admins = adminEmailsEnv.split(",").map((e) => e.trim().toLowerCase());
  return admins.includes(email.toLowerCase());
}
