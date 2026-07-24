import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, ArrowRight, ArrowUpRight, Brain, Check, CheckCircle2, ChevronDown,
  Clock, FileText, Layers3, Lock, Mail, Menu, Mic, MapPin, Phone, ShieldCheck,
  Sparkles, Stethoscope, X, Zap, AlertTriangle, BookOpen,
  Fingerprint, Search, FolderOpen, Type,
} from 'lucide-react';
import { PRICING, formatINR } from '../../lib/subscription';
import { SEO } from '../seo/SEO';
import { BLOG_POSTS } from '../../data/blogPosts';

/* ────────────────────────────────────────────────────────────────────────
   Content — grounded in what the product actually does. No invented
   customers, no fabricated review counts, no claimed integrations that
   don't exist yet. Confidence comes from precision, not inflated numbers.
   ──────────────────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: 'Platform', href: '#platform' },
  { label: 'How it works', href: '#workflow' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'FAQ', href: '#faq' },
];

const CAPABILITY_CHIPS = [
  { icon: Mic, label: 'Dictate in plain language' },
  { icon: Layers3, label: 'Structured, section-by-section output' },
  { icon: ShieldCheck, label: 'Encrypted, access-controlled workspace' },
];

const PAIN_POINTS = [
  {
    icon: Clock,
    title: 'The read takes five minutes. The report takes twenty.',
    body: 'Formatting, section headers, boilerplate normal findings — none of it is diagnosis, and all of it eats into a day that already has too many studies in the queue.',
  },
  {
    icon: AlertTriangle,
    title: 'One missed line is a medico-legal problem.',
    body: 'A tired 11 p.m. dictation is where inconsistencies creep in — a laterality slip, an omitted adjacent structure, an impression that does not match the findings.',
  },
  {
    icon: FileText,
    title: 'Every hospital wants its own format.',
    body: 'Letterhead here, a different section order there, a referring physician who prefers a short impression up top. Rebuilding that structure by hand, every time, is wasted skill.',
  },
];

const WORKFLOW_STEPS = [
  {
    step: '01',
    icon: Mic,
    title: 'Dictate or type the findings',
    desc: 'Speak naturally using the built-in voice input, or type shorthand the way you already think — "Lt kidney 8mm mid-ureteric stone" is enough to start from.',
  },
  {
    step: '02',
    icon: Brain,
    title: 'The copilot drafts a structured report',
    desc: 'Technique, clinical information, findings and impression are generated section by section, with adjacent structures addressed and normal findings stated — not skipped.',
  },
  {
    step: '03',
    icon: Search,
    title: 'Review, and let the mistake detector check your back',
    desc: 'Built-in consistency checks flag laterality mismatches, findings/impression conflicts and missing sections before you sign — a second pair of eyes on every report.',
  },
  {
    step: '04',
    icon: CheckCircle2,
    title: 'Finalize on your own letterhead',
    desc: 'Approve the report, apply your hospital letterhead and logo, and export a clean PDF — ready to hand to the referring physician.',
  },
];

const FEATURES = [
  {
    icon: Brain,
    title: 'Clinical drafting copilot',
    desc: 'Turns dictated or typed findings into a complete, structured report — technique, findings and impression drafted in the register a reporting radiologist actually writes in.',
  },
  {
    icon: Search,
    title: 'Mistake & consistency detector',
    desc: 'Flags laterality errors, findings-impression mismatches and missing sections before you finalize, so review time goes to judgment, not proofreading.',
  },
  {
    icon: Layers3,
    title: 'Reusable report templates',
    desc: 'Build modality- and protocol-specific templates once — CT KUB, HRCT chest, MRI knee — and start every matching case from a structured baseline.',
  },
  {
    icon: Zap,
    title: 'Macro library',
    desc: 'Type "/" and a trigger to drop in your own standard phrasing instantly. Built for radiologists who report the same normal anatomy hundreds of times a week.',
  },
  {
    icon: FolderOpen,
    title: 'Case & report tracking',
    desc: 'Every patient, study and report status — draft, final, amended — organized in one workspace, searchable when a referring physician calls back six weeks later.',
  },
  {
    icon: Type,
    title: 'Letterhead-ready PDF export',
    desc: 'Add your hospital or practice letterhead and logo once. Every finalized report exports as a clean, print-ready PDF carrying it automatically.',
  },
];

const SECURITY_POINTS = [
  { icon: Lock, title: 'Encrypted in transit and at rest', desc: 'All data moves over TLS and is stored encrypted on managed infrastructure — nothing sits in plain text.' },
  { icon: Fingerprint, title: 'Your data stays under your account', desc: 'Row-level access control means one radiologist\u2019s cases and reports are never visible to another account.' },
  { icon: ShieldCheck, title: 'Built with India\u2019s DPDP Act in mind', desc: 'Data handling is designed around the principles of the Digital Personal Data Protection Act, 2023 — purpose limitation and user control by default.' },
  { icon: BookOpen, title: 'Full report history, never overwritten', desc: 'Drafts, edits and finalized versions are all retained, so there is always a record of what was reported and when.' },
];

const FAQ_ITEMS = [
  {
    q: 'What exactly does RadAI Copilot generate for me?',
    a: 'You dictate or type the clinical findings; the copilot returns a structured draft report with technique, clinical information, findings and impression already organized. You review, edit anything that needs a human judgment call, and finalize — it drafts, you sign.',
  },
  {
    q: 'Do I still need to review the report before it goes out?',
    a: 'Yes, always. RadAI Copilot is a drafting and consistency-checking tool for the reporting radiologist — it is not a substitute for clinical judgment or final sign-off. Every report stays in "draft" until you review and approve it.',
  },
  {
    q: 'Which imaging types does it work with?',
    a: 'It is built around free-text findings, which makes it modality-agnostic in practice — radiologists use it for CT, MRI, X-ray, ultrasound, mammography and more. Templates can be tailored to whichever protocols your practice reports most.',
  },
  {
    q: 'Can I use my hospital\u2019s letterhead on the final report?',
    a: 'Yes. Add your hospital or practice letterhead and logo once in Settings, and every finalized PDF export carries it automatically.',
  },
  {
    q: 'Does it connect to my PACS or RIS?',
    a: 'Not yet as a direct integration — today RadAI Copilot is a standalone reporting workspace: you bring the findings (typed or dictated) and take away a finalized, letterhead-ready PDF. Structured, exportable report data means it fits alongside your existing systems rather than replacing them.',
  },
  {
    q: 'What happens after my free reports run out?',
    a: `Every account starts with 10 free AI-generated reports, no card required. After that, individual radiologists move to the Pro plan at ${formatINR(PRICING.monthly)} per month for unlimited reports, templates and macros. Practices and imaging centres needing multiple seats can reach out for a custom Enterprise arrangement.`,
  },
  {
    q: 'Who is behind RadAI Copilot?',
    a: 'RadAI Copilot is built and operated by Alottt.com. You can reach the team directly at hello@alottt.com or +91 70382 55944 for onboarding, billing or technical questions.',
  },
];

/* ── Small scroll-reveal hook — used sparingly ─────────────────────────── */
function useReveal() {
  const [items, setItems] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = (e.target as HTMLElement).dataset.reveal!;
            setItems((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return items;
}

function Reveal({ id, children, className = '' }: { id: string; children: ReactNode; className?: string }) {
  const items = useReveal();
  const visible = !!items[id];
  return (
    <div
      data-reveal={id}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${className}`}
    >
      {children}
    </div>
  );
}

/* ── FAQ accordion row ─────────────────────────────────────────────────── */
function FaqRow({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start gap-4 py-5 text-left group"
        aria-expanded={open}
      >
        <span className="shrink-0 mt-0.5 w-7 h-7 rounded-full border border-gold-400/30 bg-gold-400/5 flex items-center justify-center text-[11px] font-bold text-gold-300">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="flex-1 font-medium text-[0.98rem] text-slate-100 leading-snug pt-0.5">{q}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 mt-1 text-gold-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <p className="pb-5 pl-11 pr-6 text-[0.9rem] leading-relaxed text-slate-400">{a}</p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   Main component
   ══════════════════════════════════════════════════════════════════════ */
export function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200 antialiased overflow-x-hidden">
      <SEO
        path="/"
        title="RadAI Copilot | AI Radiology Reporting Software for Radiologists"
        description="AI radiology reporting software for radiologists — turn dictation into structured, letterhead-ready reports in minutes. Free trial, no card required."
      />
      {/* Structured data — honest: no invented reviews, no unverified partner claims */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'RadAI Copilot',
              applicationCategory: 'MedicalApplication',
              operatingSystem: 'Web',
              description:
                'AI-assisted radiology reporting workspace for radiologists and teleradiology practices. Dictate findings, get a structured draft report, catch inconsistencies before sign-off, and export on your own letterhead.',
              url: 'https://radai.alottt.com/',
              offers: {
                '@type': 'Offer',
                price: String(PRICING.monthly),
                priceCurrency: 'INR',
                description: `${PRICING.monthly} per user per month after 10 free AI-generated reports.`,
              },
              provider: {
                '@type': 'Organization',
                name: 'Alottt.com',
                email: 'hello@alottt.com',
                telephone: '+91-7038255944',
              },
            },
            {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'RadAI Copilot',
              alternateName: 'Alottt.com',
              url: 'https://radai.alottt.com/',
              email: 'hello@alottt.com',
              telephone: '+91-7038255944',
              sameAs: [],
            },
            {
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'RadAI Copilot',
              url: 'https://radai.alottt.com/',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://radai.alottt.com/blog?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            },
            {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: FAQ_ITEMS.map((f) => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
              })),
            },
          ]),
        }}
      />

      {/* Ambient background — one restrained gradient, not a stacked-effects wall */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0d1c36_0%,_#03070f_60%)]" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-gold-500/[0.05] blur-3xl" />
      </div>

      {/* ══════════════ NAV ══════════════ */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled ? 'bg-navy-950/95 backdrop-blur-xl border-b border-white/10' : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-2.5 shrink-0">
            <span className="w-9 h-9 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
              <Activity size={17} className="text-navy-950" strokeWidth={2.5} />
            </span>
            <span className="leading-tight">
              <span className="block font-display font-bold text-white text-[0.95rem] tracking-tight">RadAI Copilot</span>
              <span className="block text-[9px] font-medium text-gold-300/80 uppercase tracking-[0.14em]">Reporting workspace</span>
            </span>
          </a>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((n) =>
              n.href.startsWith('#') ? (
                <a
                  key={n.label}
                  href={n.href}
                  className="text-[0.8rem] font-medium text-slate-400 hover:text-gold-300 transition-colors tracking-wide"
                >
                  {n.label}
                </a>
              ) : (
                <Link
                  key={n.label}
                  to={n.href}
                  className="text-[0.8rem] font-medium text-slate-400 hover:text-gold-300 transition-colors tracking-wide"
                >
                  {n.label}
                </Link>
              )
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onGetStarted}
              className="hidden sm:inline-flex items-center gap-1.5 bg-gold-gradient text-navy-950 font-semibold text-[0.82rem] px-4 py-2.5 rounded-lg hover:shadow-gold hover:-translate-y-0.5 transition-all duration-200"
            >
              Start free <ArrowRight size={14} />
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -mr-2 text-slate-300 hover:text-white tap-target flex items-center justify-center"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu — single overlay, single close control */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!mobileOpen}
      >
        <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        <div
          className={`absolute right-0 top-0 h-full w-[86%] max-w-sm bg-navy-900 border-l border-white/10 flex flex-col transition-transform duration-300 safe-bottom ${
            mobileOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
            <span className="font-display font-bold text-white text-sm">RadAI Copilot</span>
            <button onClick={() => setMobileOpen(false)} className="p-2 text-slate-300 hover:text-white tap-target flex items-center justify-center" aria-label="Close menu">
              <X size={22} />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-1">
            {NAV_LINKS.map((n) =>
              n.href.startsWith('#') ? (
                <a
                  key={n.label}
                  href={n.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-3.5 rounded-lg text-slate-200 font-medium text-[0.95rem] hover:bg-white/5 tap-target flex items-center"
                >
                  {n.label}
                </a>
              ) : (
                <Link
                  key={n.label}
                  to={n.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-3.5 rounded-lg text-slate-200 font-medium text-[0.95rem] hover:bg-white/5 tap-target flex items-center"
                >
                  {n.label}
                </Link>
              )
            )}
          </nav>
          <div className="p-5 border-t border-white/10">
            <button
              onClick={() => { setMobileOpen(false); onGetStarted(); }}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-gold-gradient text-navy-950 font-semibold text-sm px-4 py-3 rounded-lg tap-target"
            >
              Start free — 10 reports <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════ HERO ══════════════ */}
      <section id="top" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-16 sm:pb-24">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold-400/30 bg-gold-400/[0.06] text-[0.68rem] font-bold uppercase tracking-[0.12em] text-gold-300 mb-6">
              <Sparkles size={12} /> AI reporting copilot for radiologists
            </div>

            <h1 className="font-display font-bold text-white leading-[1.08] tracking-tight text-[2.3rem] sm:text-[3.1rem] lg:text-[3.5rem]">
              Dictate the finding.
              <br />
              Not the <span className="italic font-serif font-normal text-gold-300">formatting.</span>
            </h1>

            <p className="mt-6 text-[1.02rem] leading-[1.8] text-slate-400 max-w-xl">
              RadAI Copilot turns your spoken or typed findings into a complete, structured
              report draft — technique, findings and impression organized the way a reporting
              radiologist actually writes them — so review time goes to judgment, not typing.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {CAPABILITY_CHIPS.map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.label} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 text-[0.78rem] text-slate-300">
                    <Icon size={13} className="text-gold-400 shrink-0" /> {c.label}
                  </div>
                );
              })}
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 bg-gold-gradient text-navy-950 font-semibold text-[0.9rem] px-6 py-3.5 rounded-lg hover:shadow-gold hover:-translate-y-0.5 transition-all duration-200"
              >
                Start free — 10 reports, no card <ArrowRight size={16} />
              </button>
              <a
                href="#workflow"
                className="inline-flex items-center gap-2 border border-white/15 hover:border-gold-400/50 text-slate-200 font-medium text-[0.9rem] px-6 py-3.5 rounded-lg hover:bg-white/5 transition-all duration-200"
              >
                See how it works
              </a>
            </div>

            <p className="mt-6 text-[0.78rem] text-slate-500">
              Built for radiologists reporting real volume — no credit card to try it, cancel anytime.
            </p>
          </div>

          {/* Signature visual — the actual dictation → structured report transformation */}
          <Reveal id="hero-card">
            <div className="relative max-w-md mx-auto lg:mx-0 lg:ml-auto">
              <div className="absolute -inset-6 bg-gold-500/[0.06] blur-3xl rounded-full pointer-events-none" />
              <div className="relative rounded-2xl border border-white/10 bg-navy-900/80 backdrop-blur-xl shadow-premium-lg overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gold-400/10 border border-gold-400/25 flex items-center justify-center">
                      <Brain size={15} className="text-gold-300" />
                    </div>
                    <div>
                      <p className="text-[0.82rem] font-semibold text-white leading-tight">Report Workspace</p>
                      <p className="text-[0.65rem] text-slate-500 leading-tight">CT KUB · draft</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-[0.65rem] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Drafting
                  </span>
                </div>

                <div className="p-5 space-y-3.5">
                  <div className="rounded-xl bg-black/25 border border-white/5 p-4">
                    <div className="flex items-center gap-2 mb-2.5">
                      <Mic size={13} className="text-gold-400" />
                      <span className="text-[0.65rem] font-bold text-gold-300 uppercase tracking-wider">Your dictation</span>
                    </div>
                    <p className="text-[0.83rem] leading-relaxed text-slate-300">
                      "5 mm right renal calculus, mild hydronephrosis, no ureteric extension seen..."
                    </p>
                  </div>

                  <div className="flex items-center justify-center py-0.5">
                    <ArrowRight size={14} className="text-gold-500 rotate-90" />
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-gold-400/[0.08] to-transparent border border-gold-400/20 p-4">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[0.65rem] font-bold text-gold-300 uppercase tracking-wider">Structured impression</span>
                      <span className="text-[0.6rem] font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">Consistent</span>
                    </div>
                    <p className="text-[0.82rem] leading-relaxed text-slate-200">
                      Right renal calculus (5 mm) with mild ipsilateral hydronephrosis. No ureteric
                      calculus identified. Clinical correlation and urological referral advised.
                    </p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button className="flex-1 py-2.5 rounded-lg bg-gold-gradient text-navy-950 text-[0.78rem] font-bold">
                      Approve &amp; finalize
                    </button>
                    <button className="flex-1 py-2.5 rounded-lg border border-white/15 text-slate-300 text-[0.78rem] font-medium">
                      Edit draft
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════ PAIN POINTS ══════════════ */}
      <section className="border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <Reveal id="pain-head" className="max-w-2xl mb-12">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-gold-400 mb-3">Every reporting radiologist knows this</p>
            <h2 className="font-display font-bold text-white text-[1.8rem] sm:text-[2.3rem] leading-tight">
              The report shouldn't take longer than the read.
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PAIN_POINTS.map((p, i) => {
              const Icon = p.icon;
              return (
                <Reveal id={`pain-${i}`} key={p.title}>
                  <div className="h-full rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:border-gold-400/25 transition-colors duration-300">
                    <div className="w-10 h-10 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center mb-4">
                      <Icon size={18} className="text-gold-400" />
                    </div>
                    <h3 className="font-display font-semibold text-white text-[1.02rem] leading-snug mb-2">{p.title}</h3>
                    <p className="text-[0.85rem] leading-relaxed text-slate-400">{p.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════ WORKFLOW ══════════════ */}
      <section id="workflow" className="border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <Reveal id="wf-head" className="max-w-2xl mb-14">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-gold-400 mb-3">How it works</p>
            <h2 className="font-display font-bold text-white text-[1.8rem] sm:text-[2.3rem] leading-tight">
              Four steps from dictation to a finalized, letterhead-ready PDF.
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WORKFLOW_STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal id={`wf-${i}`} key={s.step}>
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-display font-bold text-[1.6rem] text-gold-500/40 leading-none">{s.step}</span>
                      <div className="w-9 h-9 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center">
                        <Icon size={16} className="text-gold-400" />
                      </div>
                    </div>
                    <h3 className="font-display font-semibold text-white text-[0.98rem] leading-snug mb-2">{s.title}</h3>
                    <p className="text-[0.82rem] leading-relaxed text-slate-400">{s.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════ FEATURES ══════════════ */}
      <section id="platform" className="border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <Reveal id="feat-head" className="max-w-2xl mb-12">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-gold-400 mb-3">Inside the workspace</p>
            <h2 className="font-display font-bold text-white text-[1.8rem] sm:text-[2.3rem] leading-tight">
              Everything a busy reporting day actually needs.
            </h2>
            <Link to="/features" className="mt-4 inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-gold-300 hover:text-gold-200 transition-colors">
              See the full feature breakdown <ArrowUpRight size={14} />
            </Link>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal id={`feat-${i}`} key={f.title}>
                  <div className="h-full rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:border-gold-400/25 hover:-translate-y-0.5 transition-all duration-300">
                    <div className="w-11 h-11 rounded-xl bg-gold-gradient/10 bg-gold-400/10 border border-gold-400/20 flex items-center justify-center mb-4">
                      <Icon size={19} className="text-gold-400" />
                    </div>
                    <h3 className="font-display font-semibold text-white text-[1.02rem] mb-2">{f.title}</h3>
                    <p className="text-[0.85rem] leading-relaxed text-slate-400">{f.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════ SECURITY ══════════════ */}
      <section id="security" className="border-t border-white/[0.06] bg-white/[0.015]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
            <Reveal id="sec-head">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-gold-400 mb-3">Security &amp; data handling</p>
              <h2 className="font-display font-bold text-white text-[1.8rem] sm:text-[2.3rem] leading-tight mb-4">
                Patient data deserves a workspace that treats it that way.
              </h2>
              <p className="text-[0.9rem] leading-relaxed text-slate-400 max-w-md">
                RadAI Copilot is built on managed, encrypted infrastructure with strict per-account
                data isolation. We'd rather describe exactly what's in place than hand you a wall
                of compliance badges.
              </p>
            </Reveal>
            <div className="grid sm:grid-cols-2 gap-5">
              {SECURITY_POINTS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <Reveal id={`sec-${i}`} key={s.title}>
                    <div className="flex gap-4">
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-gold-400/10 border border-gold-400/20 flex items-center justify-center">
                        <Icon size={17} className="text-gold-400" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-white text-[0.94rem] mb-1">{s.title}</h3>
                        <p className="text-[0.82rem] leading-relaxed text-slate-400">{s.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ PRICING ══════════════ */}
      <section id="pricing" className="border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <Reveal id="price-head" className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-gold-400 mb-3">Pricing</p>
            <h2 className="font-display font-bold text-white text-[1.8rem] sm:text-[2.3rem] leading-tight mb-4">
              Simple pricing, per radiologist.
            </h2>
            <p className="text-[0.9rem] text-slate-400">No setup fees. No card required to start. Cancel anytime.</p>
            <Link to="/pricing" className="mt-4 inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-gold-300 hover:text-gold-200 transition-colors">
              See full plan comparison &amp; billing FAQs <ArrowUpRight size={14} />
            </Link>
          </Reveal>

          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-1 p-1 rounded-full border border-white/10 bg-white/[0.03]">
              {(['monthly', 'yearly'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className={`px-4 py-2 rounded-full text-[0.78rem] font-semibold transition-colors ${
                    billing === b ? 'bg-gold-gradient text-navy-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {b === 'monthly' ? 'Monthly' : `Yearly — save ${PRICING.yearlySavingsPct}%`}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free */}
            <Reveal id="plan-free">
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.02] p-7 flex flex-col">
                <h3 className="font-display font-bold text-white text-lg mb-1">Free</h3>
                <p className="text-[0.8rem] text-slate-400 mb-5">Try the full workflow, no commitment.</p>
                <div className="mb-6">
                  <span className="font-display font-bold text-white text-3xl">₹0</span>
                </div>
                <ul className="space-y-2.5 mb-7 flex-1">
                  {['10 AI-generated reports', 'Voice dictation & typed input', 'Mistake & consistency detector', 'PDF export'].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[0.83rem] text-slate-300">
                      <Check size={15} className="text-gold-400 shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={onGetStarted} className="w-full py-3 rounded-lg border border-white/15 text-white font-semibold text-[0.85rem] hover:bg-white/5 transition-colors">
                  Start free
                </button>
              </div>
            </Reveal>

            {/* Pro */}
            <Reveal id="plan-pro">
              <div className="h-full rounded-2xl border-2 border-gold-400/50 bg-gold-400/[0.04] p-7 flex flex-col relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gold-gradient text-navy-950 text-[0.65rem] font-bold uppercase tracking-wide">
                  Most popular
                </span>
                <h3 className="font-display font-bold text-white text-lg mb-1">Pro</h3>
                <p className="text-[0.8rem] text-slate-400 mb-5">For radiologists reporting real volume.</p>
                <div className="mb-6 flex items-baseline gap-1.5">
                  <span className="font-display font-bold text-white text-3xl">
                    {formatINR(billing === 'monthly' ? PRICING.monthly : PRICING.yearlyMonthlyEquivalent)}
                  </span>
                  <span className="text-[0.8rem] text-slate-400">/ user / month</span>
                </div>
                {billing === 'yearly' && (
                  <p className="text-[0.72rem] text-gold-300 -mt-4 mb-5">Billed {formatINR(PRICING.yearly)} yearly</p>
                )}
                <ul className="space-y-2.5 mb-7 flex-1">
                  {['Unlimited AI-generated reports', 'Unlimited templates & macros', 'Full case & report history', 'Hospital letterhead & logo on exports', 'Priority support'].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[0.83rem] text-slate-200">
                      <Check size={15} className="text-gold-400 shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onGetStarted}
                  className="w-full py-3 rounded-lg bg-gold-gradient text-navy-950 font-bold text-[0.85rem] hover:shadow-gold transition-all"
                >
                  Start free, upgrade anytime
                </button>
              </div>
            </Reveal>

            {/* Enterprise */}
            <Reveal id="plan-ent">
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.02] p-7 flex flex-col">
                <h3 className="font-display font-bold text-white text-lg mb-1">Enterprise</h3>
                <p className="text-[0.8rem] text-slate-400 mb-5">For practices and imaging centres.</p>
                <div className="mb-6">
                  <span className="font-display font-bold text-white text-2xl">Talk to us</span>
                </div>
                <ul className="space-y-2.5 mb-7 flex-1">
                  {['Multi-seat accounts', 'Shared templates across a team', 'Custom onboarding', 'Dedicated support contact'].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[0.83rem] text-slate-300">
                      <Check size={15} className="text-gold-400 shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:hello@alottt.com?subject=RadAI%20Copilot%20—%20Enterprise%20enquiry"
                  className="w-full py-3 rounded-lg border border-white/15 text-white font-semibold text-[0.85rem] hover:bg-white/5 transition-colors text-center"
                >
                  Contact us
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════ BLOG TEASER ══════════════ */}
      <section id="blog-teaser" className="border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <Reveal id="blog-head" className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div className="max-w-xl">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-gold-400 mb-3">From the blog</p>
              <h2 className="font-display font-bold text-white text-[1.8rem] sm:text-[2.3rem] leading-tight">
                Reporting workflow, written for radiologists.
              </h2>
            </div>
            <Link to="/blog" className="inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-gold-300 hover:text-gold-200 transition-colors">
              View all articles <ArrowUpRight size={14} />
            </Link>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-5">
            {BLOG_POSTS.map((post) => (
              <Reveal id={`blog-${post.slug}`} key={post.slug}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="group block h-full rounded-2xl border border-white/10 bg-white/[0.02] hover:border-gold-400/25 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-navy-900">
                    <img
                      src={post.heroImage}
                      alt={post.heroImageAlt}
                      width={400}
                      height={250}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-gold-300">{post.category}</span>
                    <h3 className="mt-1.5 font-display font-semibold text-white text-[0.95rem] leading-snug group-hover:text-gold-200 transition-colors">
                      {post.title}
                    </h3>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FAQ ══════════════ */}
      <section id="faq" className="border-t border-white/[0.06] bg-white/[0.015]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <Reveal id="faq-head" className="text-center mb-10">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-gold-400 mb-3">Questions</p>
            <h2 className="font-display font-bold text-white text-[1.8rem] sm:text-[2.3rem] leading-tight">
              Straight answers, before you sign up.
            </h2>
          </Reveal>
          <Reveal id="faq-list">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6">
              {FAQ_ITEMS.map((f, i) => (
                <FaqRow key={f.q} q={f.q} a={f.a} index={i} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════ FINAL CTA ══════════════ */}
      <section className="border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <Reveal id="cta">
            <Stethoscope size={30} className="mx-auto text-gold-400 mb-6" />
            <h2 className="font-display font-bold text-white text-[1.9rem] sm:text-[2.6rem] leading-tight mb-5">
              Report your next case in a fraction of the time.
            </h2>
            <p className="text-[0.98rem] text-slate-400 max-w-lg mx-auto mb-9">
              Ten free AI-generated reports, no card required. See the draft quality on your own
              dictation before you decide anything.
            </p>
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 bg-gold-gradient text-navy-950 font-bold text-[0.95rem] px-8 py-4 rounded-lg hover:shadow-gold hover:-translate-y-0.5 transition-all duration-200"
            >
              Start free — no card required <ArrowUpRight size={17} />
            </button>
          </Reveal>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="border-t border-white/[0.08] bg-navy-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div className="lg:col-span-2">
              <a href="#top" className="flex items-center gap-2.5 mb-4">
                <span className="w-9 h-9 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
                  <Activity size={17} className="text-navy-950" strokeWidth={2.5} />
                </span>
                <span className="font-display font-bold text-white text-[0.95rem]">RadAI Copilot</span>
              </a>
              <p className="text-[0.83rem] leading-relaxed text-slate-400 max-w-sm mb-5">
                An AI-assisted reporting workspace built for radiologists — dictate findings, review
                a structured draft, catch inconsistencies, and finalize on your own letterhead.
              </p>
              <div className="flex flex-col gap-2 text-[0.82rem] text-slate-400">
                <a href="mailto:hello@alottt.com" className="flex items-center gap-2 hover:text-gold-300 transition-colors w-fit">
                  <Mail size={13} className="text-gold-400 shrink-0" /> hello@alottt.com
                </a>
                <a href="tel:+917038255944" className="flex items-center gap-2 hover:text-gold-300 transition-colors w-fit">
                  <Phone size={13} className="text-gold-400 shrink-0" /> +91-7038255944
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-[0.72rem] font-bold uppercase tracking-wider text-gold-300 mb-4">Platform</h4>
              <ul className="space-y-2.5">
                <li><a href="#workflow" className="text-[0.83rem] text-slate-400 hover:text-white transition-colors">How it works</a></li>
                <li><Link to="/features" className="text-[0.83rem] text-slate-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="text-[0.83rem] text-slate-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/blog" className="text-[0.83rem] text-slate-400 hover:text-white transition-colors">Blog</Link></li>
                <li><a href="#security" className="text-[0.83rem] text-slate-400 hover:text-white transition-colors">Security</a></li>
                <li><a href="#faq" className="text-[0.83rem] text-slate-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[0.72rem] font-bold uppercase tracking-wider text-gold-300 mb-4">Contact us</h4>
              <ul className="space-y-3.5 text-[0.82rem] text-slate-400">
                <li className="flex items-start gap-2">
                  <MapPin size={14} className="text-gold-400 shrink-0 mt-0.5" />
                  <a
                    href="https://www.google.com/maps/place/20,+BPCL,+MIDC,+Jalgaon,+Maharashtra+425003/@20.9939296,75.5881622,73m"
                    target="_blank" rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    20-21, Near BPCL MIDC, Jalgaon, Maharashtra 425001
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin size={14} className="text-gold-400 shrink-0 mt-0.5" />
                  <a
                    href="https://www.google.com/maps?q=Kalpataru+Harmony,+Mont+Vertz+Road,+Wakad,+Pune,+411057"
                    target="_blank" rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    Kalpataru Harmony, Mont Vertz Road, Wakad, Pune 411057
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[0.76rem] text-slate-500 text-center sm:text-left">
              © {new Date().getFullYear()} RadAI Copilot. Powered by{' '}
              <a href="https://alottt.com" target="_blank" rel="noopener noreferrer" className="text-gold-400 hover:text-gold-300 font-medium">
                Alottt.com
              </a>.
            </p>
            <div className="flex items-center gap-2 text-[0.76rem] text-slate-500">
              <Lock size={12} className="text-gold-500" /> Encrypted workspace · India-first support
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
