import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, ArrowRight, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Features', to: '/features' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Blog', to: '/blog' },
  { label: 'FAQ', to: '/#faq' },
];

export function SiteHeader({ onGetStarted }: { onGetStarted: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

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
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled ? 'bg-navy-950/95 backdrop-blur-xl border-b border-white/10' : 'bg-navy-950/80 backdrop-blur-xl border-b border-white/[0.06]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <span className="w-9 h-9 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
              <Activity size={17} className="text-navy-950" strokeWidth={2.5} />
            </span>
            <span className="leading-tight">
              <span className="block font-display font-bold text-white text-[0.95rem] tracking-tight">RadAI Copilot</span>
              <span className="block text-[9px] font-medium text-gold-300/80 uppercase tracking-[0.14em]">Reporting workspace</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((n) => {
              const isPageLink = !n.to.startsWith('/#');
              const isActive = isPageLink && location.pathname === n.to;
              const className = `text-[0.8rem] font-medium tracking-wide transition-colors ${
                isActive ? 'text-gold-300' : 'text-slate-400 hover:text-gold-300'
              }`;
              return isPageLink ? (
                <Link key={n.label} to={n.to} className={className}>{n.label}</Link>
              ) : (
                <a key={n.label} href={n.to} className={className}>{n.label}</a>
              );
            })}
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
            {NAV_LINKS.map((n) => {
              const isPageLink = !n.to.startsWith('/#');
              return isPageLink ? (
                <Link
                  key={n.label}
                  to={n.to}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-3.5 rounded-lg text-slate-200 font-medium text-[0.95rem] hover:bg-white/5 tap-target flex items-center"
                >
                  {n.label}
                </Link>
              ) : (
                <a
                  key={n.label}
                  href={n.to}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-3.5 rounded-lg text-slate-200 font-medium text-[0.95rem] hover:bg-white/5 tap-target flex items-center"
                >
                  {n.label}
                </a>
              );
            })}
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
    </>
  );
}
