import { useState } from 'react';
import { ArrowRight, Check, HelpCircle } from 'lucide-react';
import { SiteHeader } from '../components/landing/SiteHeader';
import { SiteFooter } from '../components/landing/SiteFooter';
import { SEO } from '../components/seo/SEO';
import { PRICING, FREE_REPORT_LIMIT, formatINR } from '../lib/subscription';

const PLAN_FEATURES = {
  free: [
    `${FREE_REPORT_LIMIT} AI-generated reports, no card required`,
    'Structured drafting from dictation or typed findings',
    'Mistake & consistency detector',
    'Case tracking workspace',
  ],
  pro: [
    'Unlimited AI-generated reports',
    'Unlimited custom templates',
    'Unlimited personal macros',
    'Mistake & consistency detector',
    'Hospital letterhead + logo on every export',
    'Full report history — draft, edited, finalized',
    'Priority email support',
  ],
  enterprise: [
    'Everything in Pro, per seat',
    'Multiple radiologists / diagnostic centre seats',
    'Shared template & macro libraries across a practice',
    'Multiple hospital letterheads per account',
    'Dedicated onboarding',
    'Custom billing arrangement',
  ],
};

const PRICING_FAQS = [
  {
    q: 'What happens after my 10 free reports run out?',
    a: `Every account starts with ${FREE_REPORT_LIMIT} free AI-generated reports, no card required. After that, generating new AI drafts and creating templates or macros needs a Pro plan — but you keep full access to every report and case you already created, either way.`,
  },
  {
    q: 'Is billing monthly or yearly, and can I switch?',
    a: `Pro is billed at ${formatINR(PRICING.monthly)} per month, or ${formatINR(PRICING.yearly)} billed yearly (about ${formatINR(PRICING.yearlyMonthlyEquivalent)}/month — roughly ${PRICING.yearlySavingsPct}% less than paying monthly). You can switch between monthly and yearly billing from Settings.`,
  },
  {
    q: 'Is there a contract or can I cancel anytime?',
    a: 'No contract. Cancel anytime from Settings — your plan stays active until the end of the period you already paid for, and your account simply reverts to the free tier\u2019s limits afterward.',
  },
  {
    q: 'How does Enterprise pricing work for practices and diagnostic centres?',
    a: 'Enterprise is a custom, per-seat arrangement for practices or diagnostic centres that need multiple radiologist accounts, shared templates across the team, and multiple hospital letterheads on one account. Reach out at hello@alottt.com or +91-7038255944 and we\u2019ll work out seat count and pricing directly.',
  },
  {
    q: 'Do you offer a discount for solo radiologists versus large practices?',
    a: 'Pro is already priced per individual radiologist at a flat rate regardless of practice size. Larger practices needing multiple seats and shared libraries fall under Enterprise, priced by seat count rather than a fixed per-radiologist rate.',
  },
];

export function PricingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200 antialiased overflow-x-hidden">
      <SEO
        path="/pricing"
        title="Pricing | RadAI Copilot — AI Radiology Reporting Software"
        description={`Simple, per-radiologist pricing for RadAI Copilot: ${FREE_REPORT_LIMIT} free AI-generated reports, then ${formatINR(PRICING.monthly)}/month or ${formatINR(PRICING.yearly)}/year. No card required to start, cancel anytime.`}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: 'RadAI Copilot Pro',
            description: 'AI-assisted radiology reporting workspace subscription for radiologists.',
            offers: [
              {
                '@type': 'Offer',
                name: 'Pro — Monthly',
                price: String(PRICING.monthly),
                priceCurrency: 'INR',
                availability: 'https://schema.org/InStock',
              },
              {
                '@type': 'Offer',
                name: 'Pro — Yearly',
                price: String(PRICING.yearly),
                priceCurrency: 'INR',
                availability: 'https://schema.org/InStock',
              },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://radai.alottt.com/' },
              { '@type': 'ListItem', position: 2, name: 'Pricing', item: 'https://radai.alottt.com/pricing' },
            ],
          },
        ]}
      />

      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0d1c36_0%,_#03070f_60%)]" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-gold-500/[0.05] blur-3xl" />
      </div>

      <SiteHeader onGetStarted={onGetStarted} />

      {/* Hero */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-10 text-center">
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-gold-400 mb-3">Pricing</p>
        <h1 className="font-display font-bold text-white leading-[1.1] tracking-tight text-[2.1rem] sm:text-[2.8rem]">
          Simple pricing, per radiologist.
        </h1>
        <p className="mt-5 text-[1rem] leading-[1.8] text-slate-400 max-w-xl mx-auto">
          No setup fees. No card required to start. Cancel anytime — you only pay for the reporting
          workspace, nothing else.
        </p>

        <div className="mt-8 inline-flex items-center gap-1 p-1 rounded-full border border-white/10 bg-white/[0.03]">
          {(['monthly', 'yearly'] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className={`px-4 py-2 rounded-full text-[0.8rem] font-semibold capitalize transition-all ${
                billing === b ? 'bg-gold-gradient text-navy-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              {b} {b === 'yearly' && <span className="ml-1 text-emerald-400">save {PRICING.yearlySavingsPct}%</span>}
            </button>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {/* Free */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 flex flex-col">
            <h2 className="font-display font-semibold text-white text-[1.1rem] mb-1">Free</h2>
            <p className="text-[0.82rem] text-slate-400 mb-5">Try it on real cases</p>
            <div className="mb-6">
              <span className="font-display font-bold text-white text-[2.2rem]">₹0</span>
              <span className="text-slate-500 text-[0.85rem]"> forever</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {PLAN_FEATURES.free.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[0.85rem] text-slate-300">
                  <Check size={15} className="text-gold-400 shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            <button onClick={onGetStarted} className="w-full py-3 rounded-lg border border-white/15 text-white font-semibold text-[0.85rem] hover:bg-white/5 transition-colors">
              Start free
            </button>
          </div>

          {/* Pro */}
          <div className="relative rounded-2xl border-2 border-gold-400/40 bg-gradient-to-b from-gold-400/[0.06] to-transparent p-7 flex flex-col shadow-gold">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[0.65rem] font-bold uppercase tracking-wider text-navy-950 bg-gold-gradient px-3 py-1 rounded-full">
              Most popular
            </span>
            <h2 className="font-display font-semibold text-white text-[1.1rem] mb-1">Pro</h2>
            <p className="text-[0.82rem] text-slate-400 mb-5">For individual radiologists</p>
            <div className="mb-6">
              <span className="font-display font-bold text-white text-[2.2rem]">
                {billing === 'monthly' ? formatINR(PRICING.monthly) : formatINR(PRICING.yearlyMonthlyEquivalent)}
              </span>
              <span className="text-slate-500 text-[0.85rem]">/month</span>
              {billing === 'yearly' && (
                <p className="text-[0.76rem] text-emerald-400 mt-1">{formatINR(PRICING.yearly)} billed yearly</p>
              )}
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {PLAN_FEATURES.pro.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[0.85rem] text-slate-200">
                  <Check size={15} className="text-gold-400 shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            <button onClick={onGetStarted} className="w-full py-3 rounded-lg bg-gold-gradient text-navy-950 font-bold text-[0.85rem] hover:shadow-gold transition-all">
              Start free, upgrade anytime
            </button>
          </div>

          {/* Enterprise */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-7 flex flex-col">
            <h2 className="font-display font-semibold text-white text-[1.1rem] mb-1">Enterprise</h2>
            <p className="text-[0.82rem] text-slate-400 mb-5">For practices &amp; diagnostic centres</p>
            <div className="mb-6">
              <span className="font-display font-bold text-white text-[1.6rem]">Custom</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {PLAN_FEATURES.enterprise.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[0.85rem] text-slate-300">
                  <Check size={15} className="text-gold-400 shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            <a href="mailto:hello@alottt.com" className="w-full text-center py-3 rounded-lg border border-white/15 text-white font-semibold text-[0.85rem] hover:bg-white/5 transition-colors">
              Talk to us
            </a>
          </div>
        </div>
      </section>

      {/* Pricing FAQ */}
      <section className="border-t border-white/[0.06] bg-white/[0.015]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-10">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-gold-400 mb-3">Pricing questions</p>
            <h2 className="font-display font-bold text-white text-[1.7rem] sm:text-[2.1rem] leading-tight">
              Billing, cancellation, and Enterprise seats.
            </h2>
          </div>
          <div className="space-y-3">
            {PRICING_FAQS.map((item, i) => (
              <div key={item.q} className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="flex items-center gap-2.5 font-display font-semibold text-white text-[0.92rem]">
                    <HelpCircle size={15} className="text-gold-400 shrink-0" /> {item.q}
                  </span>
                  <span className={`text-gold-400 text-lg shrink-0 transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <p className="px-5 pb-4 text-[0.85rem] leading-relaxed text-slate-400">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h2 className="font-display font-bold text-white text-[1.7rem] sm:text-[2.1rem] leading-tight mb-4">
            Start with 10 free reports.
          </h2>
          <p className="text-[0.95rem] text-slate-400 mb-8 max-w-lg mx-auto">No card required. Upgrade only if it earns a place in your reporting day.</p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 bg-gold-gradient text-navy-950 font-semibold text-[0.9rem] px-7 py-3.5 rounded-lg hover:shadow-gold hover:-translate-y-0.5 transition-all duration-200"
          >
            Start free <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
