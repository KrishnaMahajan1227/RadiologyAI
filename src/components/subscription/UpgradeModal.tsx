import { useState } from 'react';
import { X, CheckCircle2, Sparkles, Building2, Copy, CheckCheck, Mail, MessageCircle } from 'lucide-react';
import { PRICING, formatINR } from '../../lib/subscription';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  reportsUsed?: number;
  reportsLimit?: number;
}

const UPI_ID = 'mahajankrishna2212@oksbi';
const SUPPORT_EMAIL = 'hello@radai.health';

const FREE_FEATURES = [
  '10 free AI report generations',
  'Full report workspace & editing',
  'Preview & download every report you generate',
  'Case management',
];

const PRO_FEATURES = [
  'Unlimited AI report generations',
  'Unlimited macros & quick-insert phrases',
  'Unlimited custom templates',
  'Priority AI processing',
  'PDF export with hospital letterhead',
  'Email support',
];

const ENTERPRISE_FEATURES = [
  'Everything in Pro, for your whole team',
  'Multi-radiologist / multi-department accounts',
  'PACS, RIS & EMR integrations',
  'Custom onboarding & training',
  'Dedicated account manager',
  'Custom billing & invoicing',
];

export function UpgradeModal({ open, onClose, reportsUsed, reportsLimit }: UpgradeModalProps) {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [showPayInfo, setShowPayInfo] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const price = billing === 'monthly' ? PRICING.monthly : PRICING.yearlyMonthlyEquivalent;

  const handleCopyUPI = async () => {
    await navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-navy-900 rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-200/70 dark:border-white/[0.08] my-4 sm:my-8 animate-fadeIn">
        {/* Header */}
        <div className="flex items-start justify-between px-5 sm:px-8 pt-6 pb-2">
          <div>
            <p className="badge-gold mb-2 w-fit"><Sparkles size={11} /> Upgrade RadAI Copilot</p>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 dark:text-white">
              {reportsLimit
                ? `You've used all ${reportsLimit} free reports`
                : 'Choose the plan that fits you'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              {reportsLimit
                ? `You generated ${reportsUsed ?? reportsLimit} of ${reportsLimit} free reports. Upgrade to keep generating, use macros and unlock everything — unlimited.`
                : 'Start free with 10 reports. Upgrade any time for unlimited AI-assisted reporting.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-2 -mt-1 -mr-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Billing toggle */}
        <div className="px-5 sm:px-8 pt-2 pb-1">
          <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                billing === 'monthly' ? 'bg-white dark:bg-navy-800 text-navy-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                billing === 'yearly' ? 'bg-white dark:bg-navy-800 text-navy-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Yearly
              <span className="badge-gold !py-0.5 !px-1.5">Save {PRICING.yearlySavingsPct}%</span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="px-5 sm:px-8 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Free */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-5 flex flex-col">
            <p className="font-display font-bold text-slate-900 dark:text-white">Free</p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-display font-bold text-slate-900 dark:text-white">₹0</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">10 reports, forever free</p>
            <ul className="space-y-2 flex-1">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={14} className="text-slate-400 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-4 text-xs font-semibold text-center text-slate-400 border border-slate-200 dark:border-white/10 rounded-xl py-2.5">
              Your current plan
            </div>
          </div>

          {/* Pro (monthly/yearly) */}
          <div className="rounded-2xl border-2 border-gold-400 dark:border-gold-500/60 p-5 flex flex-col relative bg-gold-50/40 dark:bg-gold-500/[0.04]">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge-gold whitespace-nowrap">Most Popular</span>
            <p className="font-display font-bold text-slate-900 dark:text-white">Pro</p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-display font-bold text-slate-900 dark:text-white">{formatINR(price)}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">/ user / month</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              {billing === 'yearly' ? `Billed ${formatINR(PRICING.yearly)} / year` : 'Billed monthly, cancel anytime'}
            </p>
            <ul className="space-y-2 flex-1">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200">
                  <CheckCircle2 size={14} className="text-gold-500 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button onClick={() => setShowPayInfo((v) => !v)} className="btn-primary w-full justify-center mt-4">
              Upgrade Now
            </button>
          </div>

          {/* Enterprise */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-5 flex flex-col">
            <p className="font-display font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><Building2 size={15} /> Enterprise</p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-display font-bold text-slate-900 dark:text-white">Custom</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">For hospitals & imaging networks</p>
            <ul className="space-y-2 flex-1">
              {ENTERPRISE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={14} className="text-slate-400 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=Enterprise%20plan%20enquiry%20-%20RadAI%20Copilot`}
              className="btn-secondary w-full justify-center mt-4"
            >
              Contact Sales
            </a>
          </div>
        </div>

        {/* Manual payment info (shown once "Upgrade Now" is clicked — gateway integration coming soon) */}
        {showPayInfo && (
          <div className="mx-5 sm:mx-8 mb-5 rounded-2xl border border-gold-200 dark:border-gold-500/25 bg-gold-50 dark:bg-gold-500/[0.06] p-4 sm:p-5">
            <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1">Complete your upgrade</p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
              Online checkout is launching shortly. For now, pay via UPI and email/WhatsApp us your payment
              screenshot with your account email — we'll activate your Pro plan within a few hours.
            </p>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="flex items-center gap-2 bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2">
                <span className="text-xs font-mono text-slate-700 dark:text-slate-200">{UPI_ID}</span>
                <button onClick={handleCopyUPI} className="text-slate-400 hover:text-gold-500 transition-colors" aria-label="Copy UPI ID">
                  {copied ? <CheckCheck size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Amount: {formatINR(billing === 'yearly' ? PRICING.yearly : PRICING.monthly)}
                {billing === 'yearly' ? ' / year' : ' / month'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=Pro%20plan%20payment%20confirmation`}
                className="btn-secondary text-xs !px-3 !py-2"
              >
                <Mail size={13} /> Email confirmation
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs !px-3 !py-2"
              >
                <MessageCircle size={13} /> WhatsApp us
              </a>
            </div>
          </div>
        )}

        <div className="px-5 sm:px-8 pb-6 pt-1 text-center">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Prices in Indian Rupees, per user. Cancel anytime. Need a custom quote or bulk seats? Use Contact Sales above.
          </p>
        </div>
      </div>
    </div>
  );
}
