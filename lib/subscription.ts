/** Stripe subscription statuses that should grant access to the app. */
const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export function hasActiveAccess(subscriptionStatus: string | null): boolean {
  return subscriptionStatus !== null && ACTIVE_STATUSES.has(subscriptionStatus);
}
