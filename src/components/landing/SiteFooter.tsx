import { Link } from 'react-router-dom';
import { Activity, Lock, Mail, MapPin, Phone } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-navy-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <span className="w-9 h-9 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
                <Activity size={17} className="text-navy-950" strokeWidth={2.5} />
              </span>
              <span className="font-display font-bold text-white text-[0.95rem]">RadAI Copilot</span>
            </Link>
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
              <li><Link to="/features" className="text-[0.83rem] text-slate-400 hover:text-white transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="text-[0.83rem] text-slate-400 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/blog" className="text-[0.83rem] text-slate-400 hover:text-white transition-colors">Blog</Link></li>
              <li><a href="/#security" className="text-[0.83rem] text-slate-400 hover:text-white transition-colors">Security</a></li>
              <li><a href="/#faq" className="text-[0.83rem] text-slate-400 hover:text-white transition-colors">FAQ</a></li>
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
  );
}
