import {
  ArrowRight, Brain, Search, Layers3, Zap, FolderOpen, Type, Mic,
  CheckCircle2, ShieldCheck,
} from 'lucide-react';
import { SiteHeader } from '../components/landing/SiteHeader';
import { SiteFooter } from '../components/landing/SiteFooter';
import { SEO } from '../components/seo/SEO';

const DEEP_FEATURES = [
  {
    icon: Brain,
    title: 'Clinical drafting copilot',
    tag: 'Core',
    body: 'Dictate or type findings the way you naturally think through a case — "Lt kidney 8mm mid-ureteric stone" is enough to start from. The copilot expands that into a complete structured draft: technique, clinical information, findings organized by anatomy, and an impression that summarizes rather than repeats. It is built around your language, not a rigid form you have to fill in first.',
  },
  {
    icon: Search,
    title: 'Mistake & consistency detector',
    tag: 'Quality',
    body: 'Before you sign, the copilot runs a consistency pass across the draft: does the laterality in the impression match findings, is every section present, does the impression actually answer what the clinical information asked. It flags issues for your review rather than silently editing anything — you stay the final authority on every line of every report.',
  },
  {
    icon: Layers3,
    title: 'Reusable report templates',
    tag: 'Speed',
    body: 'Build a template once per modality and protocol — CT KUB, HRCT chest, MRI knee, obstetric ultrasound — and every matching case starts from that structured baseline instead of a blank page. Templates can be shared across a practice so every radiologist in a department reports in a consistent format.',
  },
  {
    icon: Zap,
    title: 'Macro library',
    tag: 'Speed',
    body: 'Type "/" followed by a trigger word to drop in your own standard phrasing instantly — the normal-anatomy language you type hundreds of times a week. Macros are personal to your account, so your phrasing stays yours even in a shared workspace.',
  },
  {
    icon: FolderOpen,
    title: 'Case & report tracking',
    tag: 'Organization',
    body: 'Every patient, study and report status — draft, final, amended — lives in one searchable workspace. When a referring physician calls back six weeks later asking about a specific study, you are not digging through folders or old emails to find it.',
  },
  {
    icon: Type,
    title: 'Letterhead-ready PDF export',
    tag: 'Delivery',
    body: 'Add your hospital or practice letterhead and logo once in Settings. Every finalized report exports as a clean, print-ready PDF carrying it automatically — no manual header-and-footer assembly per report, and no risk of sending out a report on the wrong letterhead.',
  },
  {
    icon: Mic,
    title: 'Voice dictation input',
    tag: 'Input',
    body: 'Speak your findings using the built-in voice input instead of typing, then let the copilot structure what you said. Useful for radiologists who think out loud through a case, or simply prefer dictating to typing during a long reporting list.',
  },
  {
    icon: ShieldCheck,
    title: 'Encrypted, access-controlled workspace',
    tag: 'Security',
    body: 'Data moves over TLS and is stored encrypted at rest, with row-level access control ensuring one radiologist\u2019s cases and reports are never visible to another account — the baseline any clinical software handling patient data should meet.',
  },
];

const WORKFLOW_COMPARISON = [
  { without: 'Rebuild section headers and formatting by hand, every case', with: 'Draft arrives pre-structured — technique, findings, impression already organized' },
  { without: 'Laterality and findings/impression mismatches caught only on a careful re-read (or missed)', with: 'Consistency detector flags mismatches before you sign' },
  { without: 'Retype the same normal-anatomy phrasing hundreds of times a week', with: 'Macro library inserts your standard phrasing in one keystroke' },
  { without: 'Assemble hospital letterhead and header manually on every export', with: 'Letterhead applied automatically on every finalized PDF' },
];

export function FeaturesPage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-200 antialiased overflow-x-hidden">
      <SEO
        path="/features"
        title="Features | AI Radiology Reporting Software — RadAI Copilot"
        description="A full breakdown of RadAI Copilot's radiology reporting features: dictation-to-structured-draft, mistake detection, templates, macros, case tracking and letterhead PDF export."
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'RadAI Copilot Features',
          url: 'https://radai.alottt.com/features',
          description:
            "A full breakdown of RadAI Copilot's radiology reporting features: dictation-to-structured-draft, mistake detection, templates, macros, case tracking and letterhead PDF export.",
          isPartOf: { '@type': 'WebSite', name: 'RadAI Copilot', url: 'https://radai.alottt.com/' },
        }}
      />

      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0d1c36_0%,_#03070f_60%)]" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-gold-500/[0.05] blur-3xl" />
      </div>

      <SiteHeader onGetStarted={onGetStarted} />

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-12">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <div>
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-gold-400 mb-3">Inside the workspace</p>
            <h1 className="font-display font-bold text-white leading-[1.1] tracking-tight text-[2.1rem] sm:text-[2.8rem]">
              Everything a busy reporting day actually needs.
            </h1>
            <p className="mt-5 text-[1rem] leading-[1.8] text-slate-400 max-w-xl">
              RadAI Copilot's features are built around one goal: move the mechanical parts of
              reporting — formatting, consistency checks, letterhead assembly — out of your way,
              so review time goes to judgment instead of typing.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 bg-gold-gradient text-navy-950 font-semibold text-[0.9rem] px-6 py-3.5 rounded-lg hover:shadow-gold hover:-translate-y-0.5 transition-all duration-200"
              >
                Start free — 10 reports <ArrowRight size={16} />
              </button>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-premium-lg">
            <img
              src="https://images.pexels.com/photos/7089630/pexels-photo-7089630.jpeg?auto=compress&cs=tinysrgb&w=1000&h=750&fit=crop"
              alt="Healthcare professional working at a CT scanner console in a radiology suite"
              width={1000}
              height={750}
              loading="eager"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-5">
            {DEEP_FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:border-gold-400/25 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center">
                      <Icon size={18} className="text-gold-400" />
                    </div>
                    <h2 className="font-display font-semibold text-white text-[1.02rem]">{f.title}</h2>
                    <span className="ml-auto text-[0.62rem] font-bold uppercase tracking-wider text-gold-300/80 bg-gold-400/[0.08] border border-gold-400/20 px-2 py-0.5 rounded-full shrink-0">{f.tag}</span>
                  </div>
                  <p className="text-[0.87rem] leading-relaxed text-slate-400">{f.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Before / after */}
      <section className="border-t border-white/[0.06] bg-white/[0.015]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-2xl mb-10">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-gold-400 mb-3">The difference in practice</p>
            <h2 className="font-display font-bold text-white text-[1.7rem] sm:text-[2.1rem] leading-tight">
              What changes on a real reporting day.
            </h2>
          </div>
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <div className="grid grid-cols-2 bg-white/[0.03] border-b border-white/10">
              <div className="px-5 py-3 text-[0.75rem] font-bold uppercase tracking-wider text-slate-400">Without a reporting copilot</div>
              <div className="px-5 py-3 text-[0.75rem] font-bold uppercase tracking-wider text-gold-300">With RadAI Copilot</div>
            </div>
            {WORKFLOW_COMPARISON.map((row, i) => (
              <div key={i} className={`grid grid-cols-2 ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                <div className="px-5 py-4 text-[0.83rem] text-slate-400 border-r border-white/[0.06] leading-relaxed">{row.without}</div>
                <div className="px-5 py-4 text-[0.83rem] text-slate-200 leading-relaxed flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-gold-400 shrink-0 mt-0.5" /> {row.with}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h2 className="font-display font-bold text-white text-[1.7rem] sm:text-[2.1rem] leading-tight mb-4">
            See it against your own cases.
          </h2>
          <p className="text-[0.95rem] text-slate-400 mb-8 max-w-lg mx-auto">
            10 free AI-generated reports, no card required. Try it on the modality and protocols you actually report.
          </p>
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
