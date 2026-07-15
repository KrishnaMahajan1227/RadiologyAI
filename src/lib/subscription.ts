import type { Profile } from '../types';
import type { User } from '@supabase/supabase-js';

/**
 * ── Subscription / Freemium configuration ────────────────────────────────
 * Free plan: FREE_REPORT_LIMIT report generations, then the account is
 * locked into "upgrade to continue" mode for AI generation + macros/templates
 * creation (viewing, editing profile, existing saved reports/cases stays
 * available either way).
 *
 * DEMO_ACCOUNT_EMAIL is fully unrestricted regardless of usage — used for
 * sales demos. Keep this in sync with the matching check in the
 * add_subscription_plan_fields migration if you ever change it.
 */
export const FREE_REPORT_LIMIT = 10;

export const DEMO_ACCOUNT_EMAIL = 'mahajankrishna2212@gmail.com';

export const PRICING = {
  currency: 'INR',
  symbol: '₹',
  monthly: 780,
  yearly: 7800, // 12 x 780 = 9360 → ~2 months free when billed yearly
  get yearlyMonthlyEquivalent() {
    return Math.round(this.yearly / 12);
  },
  get yearlySavingsPct() {
    return Math.round((1 - this.yearly / (this.monthly * 12)) * 100);
  },
};

export function isDemoAccount(email?: string | null): boolean {
  return !!email && email.trim().toLowerCase() === DEMO_ACCOUNT_EMAIL.toLowerCase();
}

export function isPlanCurrentlyActive(profile?: Profile | null): boolean {
  if (!profile?.plan || profile.plan === 'free') return false;
  // Enterprise / manually-provisioned plans may have no expiry (null = never expires)
  if (!profile.plan_expires_at) return true;
  return new Date(profile.plan_expires_at).getTime() > Date.now();
}

/** True if this account should never see usage limits. */
export function isUnlimitedAccount(user?: User | null, profile?: Profile | null): boolean {
  if (isDemoAccount(user?.email)) return true;
  if (profile?.is_unlimited) return true;
  if (isPlanCurrentlyActive(profile)) return true;
  return false;
}

export interface UsageStatus {
  used: number;
  limit: number;
  remaining: number;
  limitReached: boolean;
  isUnlimited: boolean;
}

export function getUsageStatus(user?: User | null, profile?: Profile | null): UsageStatus {
  const unlimited = isUnlimitedAccount(user, profile);
  const used = profile?.reports_generated ?? 0;
  const remaining = Math.max(0, FREE_REPORT_LIMIT - used);
  return {
    used,
    limit: FREE_REPORT_LIMIT,
    remaining,
    limitReached: !unlimited && used >= FREE_REPORT_LIMIT,
    isUnlimited: unlimited,
  };
}

export function formatINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}
