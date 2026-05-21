import { useState } from 'react';
import {
  Eye, EyeOff, Loader2, AlertTriangle, CheckCircle2,
  ArrowRight, Microscope, Shield, Zap, Brain, Lock,
  Mail, User, Star, BadgeCheck, FileText, Building2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

/* ─── Google Icon ──────────────────────────────────────────── */
function GoogleIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.28c-.22-.66-.35-1.36-.35-2.08s.13-1.42.35-2.08V7.28H2.18C1.43 8.8 1 10.36 1 12s.43 3.2 1.18 4.72l2.52-1.96.14-1.48z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.28l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.74z" fill="#EA4335"/>
    </svg>
  );
}

/* ─── Styles ───────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,800;1,700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.auth-page {
  min-height: 100vh;
  display: flex;
  font-family: 'Poppins', sans-serif;
  -webkit-font-smoothing: antialiased;
  background: #f0f4f8;
  overflow: hidden;
}

/* ── LEFT PANEL ── */
.auth-left {
  width: 440px;
  flex-shrink: 0;
  background: #070e1f;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 44px 40px;
  position: relative;
  overflow: hidden;
}
.auth-left-grid {
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(56,189,248,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(56,189,248,0.04) 1px, transparent 1px);
  background-size: 44px 44px;
}
.auth-left-glow {
  position: absolute; top: -100px; left: -100px;
  width: 400px; height: 400px; border-radius: 50%;
  background: radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 65%);
  pointer-events: none;
}
.auth-left-glow2 {
  position: absolute; bottom: -80px; right: -60px;
  width: 280px; height: 280px; border-radius: 50%;
  background: radial-gradient(circle, rgba(45,212,191,0.07) 0%, transparent 65%);
  pointer-events: none;
}

/* ── Logo ── */
.auth-logo { display: flex; align-items: center; gap: 12px; position: relative; }
.auth-logo-mark {
  width: 44px; height: 44px; border-radius: 13px; flex-shrink: 0;
  background: linear-gradient(135deg, #7dd3fc, #38bdf8, #2dd4bf);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 20px rgba(56,189,248,0.2);
}
.auth-logo-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.4rem; font-weight: 800;
  color: #fff; line-height: 1;
}
.auth-logo-title span {
  background: linear-gradient(135deg, #7dd3fc, #2dd4bf);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.auth-logo-sub {
  font-size: 0.6rem; font-weight: 700;
  letter-spacing: 0.1em; color: #3a5a7a;
  margin-top: 3px;
}

/* ── Left headline ── */
.auth-left-headline { position: relative; }
.auth-left-headline h2 {
  font-family: 'Playfair Display', serif;
  font-size: 2.1rem; font-weight: 800;
  color: #e8f3ff; line-height: 1.12;
  margin-bottom: 12px;
}
.auth-left-headline h2 em {
  font-style: italic;
  background: linear-gradient(135deg, #7dd3fc, #38bdf8, #2dd4bf);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.auth-left-headline p {
  font-size: 0.82rem; color: #607a8f; line-height: 1.75;
}

/* ── Left stats ── */
.auth-stats { display: flex; flex-direction: column; gap: 9px; position: relative; }
.auth-stat {
  display: flex; align-items: center; gap: 13px;
  padding: 13px 15px; border-radius: 13px;
  background: rgba(255,255,255,0.025);
  border: 0.5px solid rgba(56,189,248,0.12);
  transition: border-color 0.2s, background 0.2s;
  cursor: default;
}
.auth-stat:hover {
  border-color: rgba(56,189,248,0.28);
  background: rgba(56,189,248,0.04);
}
.auth-stat-icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.auth-stat-val { font-size: 0.95rem; font-weight: 700; color: #c8e8ff; line-height: 1; }
.auth-stat-lbl { font-size: 0.7rem; color: #4a6a80; margin-top: 2px; }

/* ── Testimonial ── */
.auth-testimonial {
  padding: 18px 19px; border-radius: 14px;
  background: rgba(56,189,248,0.04);
  border: 0.5px solid rgba(56,189,248,0.14);
  position: relative;
}
.auth-stars { display: flex; gap: 2px; margin-bottom: 9px; }
.auth-testimonial-text {
  font-size: 0.77rem; color: #a0c0da; line-height: 1.7;
  font-style: italic; margin-bottom: 13px;
}
.auth-testimonial-author { display: flex; align-items: center; gap: 10px; }
.auth-testimonial-avatar {
  width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #38bdf8, #2dd4bf);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.65rem; font-weight: 800; color: #040e1e;
}
.auth-testimonial-name { font-size: 0.74rem; font-weight: 700; color: #c8e8ff; }
.auth-testimonial-role { font-size: 0.66rem; color: #4a6a80; margin-top: 1px; }

/* ── Left badges ── */
.auth-left-badges { display: flex; flex-wrap: wrap; gap: 7px; }
.auth-left-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 10px; border-radius: 100px;
  border: 0.5px solid rgba(56,189,248,0.15);
  background: rgba(56,189,248,0.04);
  font-size: 0.65rem; font-weight: 700;
  letter-spacing: 0.04em; color: #4a7a9a;
}

/* ── RIGHT PANEL ── */
.auth-right {
  flex: 1;
  display: flex; align-items: center; justify-content: center;
  padding: 40px 32px;
  background: #f0f4f8;
  position: relative;
}
.auth-right::before {
  content: '';
  position: absolute; top: -40%; left: -20%;
  width: 80%; height: 80%; border-radius: 50%;
  background: radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 65%);
  pointer-events: none;
}

/* ── Form card ── */
.auth-card {
  width: 100%; max-width: 420px;
  background: #fff;
  border: 0.5px solid rgba(0,0,0,0.08);
  border-radius: 20px;
  padding: 40px 36px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04);
  position: relative;
  overflow: hidden;
  animation: cardIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both;
}
.auth-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, #7dd3fc, #38bdf8, #2dd4bf);
}

/* ── Mobile logo ── */
.auth-mobile-logo {
  display: none;
  align-items: center; gap: 10px;
  margin-bottom: 28px;
}
.auth-mobile-logo-mark {
  width: 38px; height: 38px; border-radius: 11px;
  background: linear-gradient(135deg, #7dd3fc, #38bdf8, #2dd4bf);
  display: flex; align-items: center; justify-content: center;
}

/* ── Mode tabs ── */
.auth-tabs {
  display: flex;
  background: #f5f7fa;
  border: 0.5px solid rgba(0,0,0,0.08);
  border-radius: 12px; padding: 3px;
  margin-bottom: 28px;
}
.auth-tab {
  flex: 1; padding: 10px 12px;
  border-radius: 9px; border: none; cursor: pointer;
  font-family: 'Poppins', sans-serif;
  font-size: 0.82rem; font-weight: 600;
  transition: all 0.2s;
}
.auth-tab-active {
  background: #fff; color: #38bdf8;
  border: 0.5px solid rgba(56,189,248,0.22) !important;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
}
.auth-tab-inactive { background: transparent; color: #8a9ab0; }
.auth-tab-inactive:hover { color: #4a5a6a; }

/* ── Form heading ── */
.auth-form-heading { margin-bottom: 24px; }
.auth-form-heading h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.6rem; font-weight: 800;
  color: #0f172a; line-height: 1.15; margin-bottom: 6px;
}
.auth-form-heading h3 em { font-style: italic; }
.auth-form-heading p { font-size: 0.8rem; color: #6b7a8f; line-height: 1.6; }

/* ── Google button ── */
.auth-google-btn {
  width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 12px 16px; border-radius: 11px;
  background: #fff;
  border: 0.5px solid rgba(0,0,0,0.14);
  font-family: 'Poppins', sans-serif;
  font-size: 0.87rem; font-weight: 600;
  color: #1a2a3a; cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.auth-google-btn:hover:not(:disabled) {
  border-color: rgba(0,0,0,0.22);
  background: #fafafa;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.auth-google-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Divider ── */
.auth-divider {
  display: flex; align-items: center; gap: 10px;
  margin: 18px 0;
}
.auth-divider-line { flex: 1; height: 0.5px; background: rgba(0,0,0,0.1); }
.auth-divider-text {
  font-size: 0.68rem; font-weight: 700;
  letter-spacing: 0.07em; text-transform: uppercase;
  color: #a0afc0;
}

/* ── Form fields ── */
.auth-field { margin-bottom: 14px; }
.auth-label {
  display: block;
  font-size: 0.72rem; font-weight: 700;
  letter-spacing: 0.06em; text-transform: uppercase;
  color: #6b7a8f; margin-bottom: 6px;
}
.auth-label-row {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 6px;
}
.auth-input-wrap { position: relative; }
.auth-input-icon {
  position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
  color: #a0b0c0; pointer-events: none;
  display: flex; align-items: center;
}
.auth-input {
  width: 100%;
  padding: 12px 14px 12px 40px;
  background: #f8fafc;
  border: 0.5px solid rgba(0,0,0,0.12);
  border-radius: 11px;
  font-family: 'Poppins', sans-serif;
  font-size: 0.88rem; color: #0f172a;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}
.auth-input::placeholder { color: #b0bec8; }
.auth-input:focus {
  border-color: rgba(56,189,248,0.5);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(56,189,248,0.1);
}
.auth-pw-toggle {
  position: absolute; right: 11px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: #a0b0c0; padding: 4px; display: flex; align-items: center;
  transition: color 0.2s;
}
.auth-pw-toggle:hover { color: #6b7a8f; }
.auth-forgot {
  font-size: 0.72rem; font-weight: 600; color: #38bdf8;
  background: none; border: none; cursor: pointer;
  font-family: 'Poppins', sans-serif; padding: 0;
  transition: opacity 0.2s;
}
.auth-forgot:hover { opacity: 0.75; }

/* ── Alerts ── */
.auth-alert {
  display: flex; align-items: flex-start; gap: 9px;
  padding: 11px 14px; border-radius: 10px;
  font-size: 0.8rem; line-height: 1.55;
  margin-bottom: 12px;
  animation: fadeIn 0.25s ease;
}
.auth-alert-error   { background: #fff1f1; border: 0.5px solid #fca5a5; color: #b91c1c; }
.auth-alert-success { background: #f0fdf4; border: 0.5px solid #86efac; color: #15803d; }
.auth-alert-warn    { background: #fffbeb; border: 0.5px solid #fcd34d; color: #92400e; }
.auth-alert-dismiss {
  background: none; border: none; cursor: pointer;
  font-size: 0.7rem; font-weight: 700; text-decoration: underline;
  color: inherit; font-family: 'Poppins', sans-serif;
  display: block; margin-top: 3px; padding: 0; opacity: 0.8;
}

/* ── Submit button ── */
.auth-submit-btn {
  width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 13px 16px; border-radius: 11px; border: none;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
  font-size: 0.92rem; font-weight: 700;
  color: #040e1e;
  background: linear-gradient(135deg, #7dd3fc, #38bdf8, #2dd4bf);
  margin-top: 6px;
  transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 4px 16px rgba(56,189,248,0.3);
}
.auth-submit-btn:hover:not(:disabled) {
  opacity: 0.92; transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(56,189,248,0.4);
}
.auth-submit-btn:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }

/* ── Switch mode ── */
.auth-switch {
  margin-top: 20px; padding-top: 16px;
  border-top: 0.5px solid rgba(0,0,0,0.07);
  text-align: center;
  font-size: 0.78rem; color: #6b7a8f;
}
.auth-switch-btn {
  color: #38bdf8; font-weight: 700; background: none; border: none;
  cursor: pointer; font-family: 'Poppins', sans-serif; font-size: 0.78rem;
  transition: opacity 0.2s;
}
.auth-switch-btn:hover { opacity: 0.75; }

/* ── Bottom trust ── */
.auth-trust-row {
  display: flex; justify-content: center; gap: 16px;
  margin-top: 16px; flex-wrap: wrap;
}
.auth-trust-item {
  display: flex; align-items: center; gap: 5px;
  font-size: 0.68rem; color: #8a9aaa;
}

/* ── Animations ── */
@keyframes cardIn {
  from { opacity: 0; transform: translateY(22px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)   scale(1);    }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0);   }
}
@keyframes spin { to { transform: rotate(360deg); } }

.spin { animation: spin 0.7s linear infinite; }

/* ── Responsive ── */
@media (max-width: 860px) {
  .auth-left { display: none !important; }
  .auth-right { background: #f0f4f8; }
  .auth-mobile-logo { display: flex !important; }
}
@media (max-width: 480px) {
  .auth-right { padding: 24px 16px; }
  .auth-card  { padding: 32px 24px; }
}
`;

/* ─── Data ─────────────────────────────────────────────────── */
const leftStats = [
  { icon: FileText,   val: '10,000+', lbl: 'Reports generated monthly',    c: '#38bdf8', bg: 'rgba(56,189,248,0.1)',  border: 'rgba(56,189,248,0.2)'  },
  { icon: Shield,     val: '97%',     lbl: 'Clinical report accuracy',     c: '#2dd4bf', bg: 'rgba(45,212,191,0.1)', border: 'rgba(45,212,191,0.2)'  },
  { icon: Zap,        val: '< 3 min', lbl: 'Average report generation',    c: '#f4c55a', bg: 'rgba(244,197,90,0.1)', border: 'rgba(244,197,90,0.2)'  },
  { icon: Building2,  val: '50+',     lbl: 'Healthcare orgs trust RadAI',  c: '#a78bfa', bg: 'rgba(167,139,250,0.1)',border: 'rgba(167,139,250,0.2)' },
];
const leftBadges = ['HIPAA Ready', 'SOC 2 Aligned', '99.99% Uptime', 'HL7 FHIR', 'Enterprise API'];

/* ─── Component ────────────────────────────────────────────── */
export function AuthPage() {
  const [mode, setMode]         = useState<'login' | 'signup'>('login');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [gLoad, setGLoad]       = useState(false);
  const [error, setError]       = useState('');
  const [gError, setGError]     = useState('');
  const [success, setSuccess]   = useState('');

  const clear = () => { setError(''); setGError(''); setSuccess(''); };
  const switchMode = (m: 'login' | 'signup') => {
    setMode(m); clear();
    setName(''); setEmail(''); setPassword('');
  };

  const handleGoogle = async () => {
    clear(); setGLoad(true);
    try {
      const redirectUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:5173'
        : 'https://radiology-ai-psi.vercel.app';
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl, skipBrowserRedirect: false },
      });
      if (err) {
        const m = err.message || '';
        if (m.includes('refused') || m.includes('Failed to fetch') || m.includes('NetworkError'))
          setGError('Could not connect to Google Sign-In. Please use email/password for now.');
        else if (m.includes('not enabled') || m.includes('Provider google'))
          setGError('Google Sign-In is not enabled yet. Enable it in Supabase → Authentication → Providers, or use email/password.');
        else setGError(m);
        setGLoad(false);
      }
    } catch (err) {
      setGError(err instanceof Error ? err.message : 'Google sign-in failed');
      setGLoad(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); clear(); setLoading(true);
    try {
      if (mode === 'signup') {
        const { error: err } = await supabase.auth.signUp({
          email, password, options: { data: { name } },
        });
        if (err) throw err;
        setSuccess('Account created! Signing you in…');
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        setSuccess('Welcome back! Signing you in…');
      }
    } catch (err) {
      const m = err instanceof Error ? err.message : 'Authentication failed';
      if (m.includes('refused') || m.includes('Failed to fetch'))
        setError('Cannot connect to server. Check your connection and try again.');
      else if (m.includes('Invalid login credentials'))
        setError('Invalid email or password. Please try again.');
      else if (m.includes('User already registered'))
        setError('An account with this email already exists. Try signing in instead.');
      else if (m.includes('Email not confirmed'))
        setError('Please confirm your email before signing in.');
      else setError(m);
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="auth-page">

        {/* ══ LEFT PANEL ══════════════════════════════ */}
        <div className="auth-left">
          <div className="auth-left-grid" />
          <div className="auth-left-glow"  />
          <div className="auth-left-glow2" />

          {/* Logo */}
          <div className="auth-logo">
            <div className="auth-logo-mark">
              <Microscope size={22} color="#040e1e" />
            </div>
            <div>
              <div className="auth-logo-title">
                Rad<span>AI</span>
              </div>
              <div className="auth-logo-sub">AI RADIOLOGY INTELLIGENCE</div>
            </div>
          </div>

          {/* Headline */}
          <div className="auth-left-headline">
            <h2>
              Professional<br />
              <em>Radiology AI</em><br />
              Copilot
            </h2>
            <p>
              Enterprise AI assistant built for radiologists. Generate
              clinically-accurate, HIPAA-compliant reports in under 3 minutes.
            </p>
          </div>

          {/* Stats */}
          <div className="auth-stats">
            {leftStats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="auth-stat">
                  <div className="auth-stat-icon" style={{ background: s.bg, border: `0.5px solid ${s.border}` }}>
                    <Icon size={17} color={s.c} />
                  </div>
                  <div>
                    <div className="auth-stat-val">{s.val}</div>
                    <div className="auth-stat-lbl">{s.lbl}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Testimonial */}
          <div className="auth-testimonial">
            <div className="auth-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} fill="#f4c55a" color="#f4c55a" />
              ))}
            </div>
            <p className="auth-testimonial-text">
              "RadAI reduced our reporting turnaround by 89% in the first week. Nothing else comes close."
            </p>
            <div className="auth-testimonial-author">
              <div className="auth-testimonial-avatar">AM</div>
              <div>
                <div className="auth-testimonial-name">Dr. Ananya Mehta</div>
                <div className="auth-testimonial-role">Chief of Radiology · Apollo Hospitals</div>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="auth-left-badges">
            {leftBadges.map((b) => (
              <span key={b} className="auth-left-badge">
                <BadgeCheck size={11} color="#38bdf8" />
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* ══ RIGHT PANEL ═════════════════════════════ */}
        <div className="auth-right">
          <div style={{ width: '100%', maxWidth: '420px' }}>

            {/* Mobile logo */}
            <div className="auth-mobile-logo">
              <div className="auth-mobile-logo-mark">
                <Microscope size={20} color="#040e1e" />
              </div>
              <div className="auth-logo-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                Rad<span style={{ background: 'linear-gradient(135deg,#38bdf8,#2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AI</span>
              </div>
            </div>

            {/* Card */}
            <div className="auth-card">

              {/* Mode tabs */}
              <div className="auth-tabs">
                {(['login', 'signup'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => switchMode(m)}
                    className={`auth-tab ${mode === m ? 'auth-tab-active' : 'auth-tab-inactive'}`}
                    style={{ border: 'none' }}
                  >
                    {m === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>

              {/* Heading */}
              <div className="auth-form-heading">
                <h3>
                  {mode === 'login'
                    ? <>Welcome <em>Back</em></>
                    : <>Get <em>Started</em></>}
                </h3>
                <p>
                  {mode === 'login'
                    ? 'Sign in to access your RadAI reporting suite.'
                    : 'Join 50+ healthcare facilities already using RadAI.'}
                </p>
              </div>

              {/* Google */}
              <button
                type="button"
                className="auth-google-btn"
                onClick={handleGoogle}
                disabled={gLoad}
              >
                {gLoad
                  ? <Loader2 size={17} className="spin" color="#6b7a8f" />
                  : <GoogleIcon size={17} />}
                <span>{gLoad ? 'Connecting to Google…' : 'Continue with Google'}</span>
              </button>

              {gError && (
                <div className="auth-alert auth-alert-warn" style={{ marginTop: '10px' }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <div>
                    {gError}
                    <button className="auth-alert-dismiss" onClick={() => setGError('')}>Dismiss</button>
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="auth-divider">
                <div className="auth-divider-line" />
                <span className="auth-divider-text">or continue with email</span>
                <div className="auth-divider-line" />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {/* Name — signup only */}
                {mode === 'signup' && (
                  <div className="auth-field">
                    <label className="auth-label">Full name</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon"><User size={15} /></span>
                      <input
                        type="text"
                        className="auth-input"
                        placeholder="Dr. Sarah Mitchell"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoComplete="name"
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className="auth-field">
                  <label className="auth-label">Email address</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"><Mail size={15} /></span>
                    <input
                      type="email"
                      className="auth-input"
                      placeholder="doctor@hospital.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="auth-field">
                  <div className="auth-label-row">
                    <label className="auth-label" style={{ margin: 0 }}>Password</label>
                    {mode === 'login' && (
                      <button type="button" className="auth-forgot">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon"><Lock size={15} /></span>
                    <input
                      type={showPw ? 'text' : 'password'}
                      className="auth-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      className="auth-pw-toggle"
                      onClick={() => setShowPw(!showPw)}
                      aria-label="Toggle password visibility"
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Alerts */}
                {error && (
                  <div className="auth-alert auth-alert-error">
                    <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="auth-alert auth-alert-success">
                    <CheckCircle2 size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                    <span>{success}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={loading}
                >
                  {loading && <Loader2 size={16} className="spin" />}
                  <span>
                    {mode === 'login' ? 'Sign In to RadAI' : 'Create My Account'}
                  </span>
                  {!loading && <ArrowRight size={16} />}
                </button>
              </form>

              {/* Switch mode */}
              <div className="auth-switch">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  className="auth-switch-btn"
                  onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                >
                  {mode === 'login' ? 'Sign Up Free' : 'Sign In'}
                </button>
              </div>
            </div>

            {/* Trust row under card */}
            <div className="auth-trust-row">
              {[
                { Icon: Shield,     label: 'HIPAA Secure'   },
                { Icon: Lock,       label: 'End-to-End Encrypted' },
                { Icon: BadgeCheck, label: 'SOC 2 Aligned'  },
              ].map(({ Icon, label }, i) => (
                <span key={i} className="auth-trust-item">
                  <Icon size={12} color="#38bdf8" />
                  {label}
                </span>
              ))}
            </div>

            {/* Legal */}
            <p style={{
              marginTop: '12px', textAlign: 'center',
              fontSize: '0.67rem', color: '#a0b0c0', lineHeight: 1.6,
            }}>
              By continuing, you agree to RadAI's{' '}
              <a href="#" style={{ color: '#7ab8d0', textDecoration: 'none' }}>Terms of Service</a>
              {' '}and{' '}
              <a href="#" style={{ color: '#7ab8d0', textDecoration: 'none' }}>Privacy Policy</a>.
            </p>
          </div>
        </div>

      </div>
    </>
  );
}