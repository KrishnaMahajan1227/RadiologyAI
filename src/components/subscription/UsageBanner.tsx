import { useState } from 'react';
import { Sparkles, ArrowUpRight, Crown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getUsageStatus, PRICING, formatINR } from '../../lib/subscription';
import { UpgradeModal } from './UpgradeModal';

/**
 * Shown at the top of the Dashboard so every free-plan user sees, from the
 * very first visit, exactly how many free reports they get and what the
 * paid plan unlocks — before they ever hit the wall.
 */
export function UsageBanner() {
  const { state } = useApp();
  const [showModal, setShowModal] = useState(false);
  const usage = getUsageStatus(state.user, state.profile);

  if (usage.isUnlimited) {
    // Still give paid/unlimited users a subtle confirmation of their plan.
    if (state.profile?.plan && state.profile.plan !== 'free') {
      return (
        <div className="flex items-center gap-2 text-xs font-semibold text-gold-700 dark:text-gold-300 bg-gold-50 dark:bg-gold-500/10 border border-gold-200 dark:border-gold-500/25 rounded-xl px-3.5 py-2 w-fit">
          <Crown size={13} /> {state.profile.plan.charAt(0).toUpperCase() + state.profile.plan.slice(1)} plan — unlimited reports
        </div>
      );
    }
    return null;
  }

  const pct = Math.min(100, Math.round((usage.used / usage.limit) * 100));
  const atLimit = usage.limitReached;

  return (
    <>
      <div
        className={`rounded-2xl border p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 ${
          atLimit
            ? 'border-red-200 dark:border-red-500/25 bg-red-50 dark:bg-red-500/[0.06]'
            : 'border-gold-200 dark:border-gold-500/25 bg-gold-50 dark:bg-gold-500/[0.06]'
        }`}
      >
        <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${atLimit ? 'bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-300' : 'bg-gold-100 dark:bg-gold-500/15 text-gold-600 dark:text-gold-300'}`}>
          <Sparkles size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-white">
            {atLimit
              ? "You've used all 10 free reports"
              : `Free plan — ${usage.used} of ${usage.limit} reports used`}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {atLimit
              ? `Upgrade to keep generating reports and unlock macros & templates — from ${formatINR(PRICING.monthly)}/month.`
              : `Every account gets ${usage.limit} free AI report generations. Upgrade any time for unlimited reports, macros & templates — from ${formatINR(PRICING.monthly)}/month.`}
          </p>
          <div className="mt-2 h-1.5 w-full max-w-xs rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full ${atLimit ? 'bg-red-400' : 'bg-gold-gradient'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary shrink-0 w-full sm:w-auto justify-center">
          Upgrade <ArrowUpRight size={14} />
        </button>
      </div>
      <UpgradeModal open={showModal} onClose={() => setShowModal(false)} reportsUsed={usage.used} reportsLimit={atLimit ? usage.limit : undefined} />
    </>
  );
}
