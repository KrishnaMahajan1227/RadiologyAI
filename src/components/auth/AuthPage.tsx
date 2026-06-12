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
@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;0,900;1,400&family=Roboto+Condensed:wght@700;900&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --navy-0:    #03070f;
  --navy-1:    #060d1c;
  --navy-2:    #091428;
  --navy-3:    #0d1c36;
  --gold:      #c8a84b;
  --gold-l:    #e0c578;
  --gold-pale: rgba(200,168,75,0.10);
  --platinum:  #d4dff0;
  --ice:       #a8c4e8;
  --muted:     #607a96;
  --border:    rgba(180,200,240,0.09);
  --border-g:  rgba(200,168,75,0.22);
  --emerald:   #00c48c;
}

.auth-page {
  min-height: 100vh;
  display: flex;
  font-family: 'Roboto', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  background: var(--navy-0);
  overflow: hidden;
}

/* ══════════════════════════════════════
   LEFT PANEL
══════════════════════════════════════ */
.auth-left {
  width: 460px;
  flex-shrink: 0;
  background: var(--navy-1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px 44px;
  position: relative;
  overflow: hidden;
  border-right: 1px solid rgba(200,168,75,0.1);
}

/* Subtle grid */
.auth-left-grid {
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(168,196,232,0.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(168,196,232,0.018) 1px, transparent 1px);
  background-size: 52px 52px;
}

/* Radial glows */
.auth-left-glow {
  position: absolute; top: -120px; left: -80px;
  width: 480px; height: 480px; border-radius: 50%;
  background: radial-gradient(circle, rgba(200,168,75,0.07) 0%, transparent 60%);
  pointer-events: none;
}
.auth-left-glow2 {
  position: absolute; bottom: -100px; right: -80px;
  width: 320px; height: 320px; border-radius: 50%;
  background: radial-gradient(circle, rgba(168,196,232,0.055) 0%, transparent 60%);
  pointer-events: none;
}

/* Gold top edge */
.auth-left::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
}

/* ── Logo ── */
.auth-logo { display: flex; align-items: center; gap: 14px; position: relative; }
.auth-logo-mark {
  width: 46px; height: 46px; border-radius: 8px; flex-shrink: 0;
  background: linear-gradient(135deg, #e0c578, #c8a84b, #b8923e);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 22px rgba(200,168,75,0.28);
}
.auth-logo-title {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: 1.45rem; font-weight: 900;
  color: #e8f3ff; line-height: 1;
  letter-spacing: 0.04em; text-transform: uppercase;
}
.auth-logo-title span {
  background: linear-gradient(120deg, #e0c578, #c8a84b);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.auth-logo-sub {
  font-size: 0.56rem; font-weight: 500;
  letter-spacing: 0.1em; color: var(--muted);
  margin-top: 3px; text-transform: uppercase;
}

/* ── Left headline ── */
.auth-left-headline { position: relative; }
.auth-left-headline h2 {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: 2.2rem; font-weight: 900;
  color: var(--platinum); line-height: 1.08;
  margin-bottom: 14px; text-transform: uppercase; letter-spacing: -0.01em;
}
.auth-left-headline h2 span {
  background: linear-gradient(120deg, #e0c578 0%, #c8a84b 60%, #b8923e 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
/* gold rule under headline */
.auth-left-headline::after {
  content: '';
  display: block;
  width: 48px; height: 2px;
  background: linear-gradient(90deg, var(--gold), transparent);
  border-radius: 2px; margin-top: 14px;
}
.auth-left-headline p {
  font-size: 0.84rem; color: var(--muted); line-height: 1.78; margin-top: 18px;
}

/* ── Left stats ── */
.auth-stats { display: flex; flex-direction: column; gap: 9px; position: relative; }
.auth-stat {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px; border-radius: 8px;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border);
  transition: border-color 0.22s, background 0.22s;
  cursor: default;
}
.auth-stat:hover {
  border-color: var(--border-g);
  background: rgba(200,168,75,0.04);
}
.auth-stat-icon {
  width: 36px; height: 36px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.auth-stat-val {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: 1rem; font-weight: 700; color: var(--platinum); line-height: 1;
  letter-spacing: 0.02em;
}
.auth-stat-lbl { font-size: 0.7rem; color: var(--muted); margin-top: 3px; font-weight: 400; }

/* ── Testimonial ── */
.auth-testimonial {
  padding: 20px 20px; border-radius: 8px;
  background: rgba(200,168,75,0.04);
  border: 1px solid rgba(200,168,75,0.16);
  position: relative;
}
.auth-testimonial::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(200,168,75,0.3), transparent);
}
.auth-stars { display: flex; gap: 2px; margin-bottom: 10px; }
.auth-testimonial-text {
  font-size: 0.79rem; color: #a8c4d8; line-height: 1.72;
  font-style: italic; margin-bottom: 14px; font-weight: 400;
}
.auth-testimonial-author { display: flex; align-items: center; gap: 10px; }
.auth-testimonial-avatar {
  width: 34px; height: 34px; border-radius: 6px; flex-shrink: 0;
  background: linear-gradient(135deg, #c8a84b, #e0c578);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.62rem; font-weight: 700; color: #0a0e18;
  font-family: 'Roboto Condensed', sans-serif; letter-spacing: 0.04em;
}
.auth-testimonial-name {
  font-size: 0.74rem; font-weight: 700; color: var(--platinum);
  font-family: 'Roboto Condensed', sans-serif; text-transform: uppercase; letter-spacing: 0.04em;
}
.auth-testimonial-role { font-size: 0.66rem; color: var(--muted); margin-top: 2px; }

/* ── Left badges ── */
.auth-left-badges { display: flex; flex-wrap: wrap; gap: 7px; }
.auth-left-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 11px; border-radius: 4px;
  border: 1px solid rgba(200,168,75,0.18);
  background: rgba(200,168,75,0.05);
  font-size: 0.64rem; font-weight: 700;
  letter-spacing: 0.06em; color: rgba(224,197,120,0.72);
  text-transform: uppercase;
}

/* ══════════════════════════════════════
   RIGHT PANEL
══════════════════════════════════════ */
.auth-right {
  flex: 1;
  display: flex; align-items: center; justify-content: center;
  padding: 40px 32px;
  background: var(--navy-0);
  position: relative;
}

/* subtle glow */
.auth-right::before {
  content: '';
  position: absolute; top: -30%; left: -10%;
  width: 70%; height: 70%; border-radius: 50%;
  background: radial-gradient(circle, rgba(200,168,75,0.04) 0%, transparent 65%);
  pointer-events: none;
}
.auth-right::after {
  content: '';
  position: absolute; bottom: -20%; right: -10%;
  width: 50%; height: 50%; border-radius: 50%;
  background: radial-gradient(circle, rgba(168,196,232,0.035) 0%, transparent 65%);
  pointer-events: none;
}

/* ── Form card ── */
.auth-card {
  width: 100%; max-width: 430px;
  background: rgba(9,20,40,0.82);
  border: 1px solid rgba(200,168,75,0.14);
  border-radius: 12px;
  padding: 40px 38px;
  box-shadow:
    0 0 0 1px rgba(168,196,232,0.04),
    0 8px 48px rgba(0,0,0,0.44),
    0 2px 8px rgba(0,0,0,0.24);
  position: relative;
  overflow: hidden;
  animation: cardIn 0.45s cubic-bezier(0.34,1.28,0.64,1) both;
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
}

/* Gold top bar */
.auth-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, #e0c578, #c8a84b, transparent);
}

/* ── Mobile logo ── */
.auth-mobile-logo {
  display: none;
  align-items: center; gap: 12px;
  margin-bottom: 32px;
}
.auth-mobile-logo-mark {
  width: 40px; height: 40px; border-radius: 8px;
  background: linear-gradient(135deg, #e0c578, #c8a84b, #b8923e);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 16px rgba(200,168,75,0.28);
}

/* ── Mode tabs ── */
.auth-tabs {
  display: flex;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(200,168,75,0.12);
  border-radius: 8px; padding: 3px;
  margin-bottom: 28px;
}
.auth-tab {
  flex: 1; padding: 10px 12px;
  border-radius: 6px; border: none; cursor: pointer;
  font-family: 'Roboto', sans-serif;
  font-size: 0.8rem; font-weight: 700;
  letter-spacing: 0.05em; text-transform: uppercase;
  transition: all 0.22s;
}
.auth-tab-active {
  background: rgba(200,168,75,0.12);
  color: var(--gold-l);
  border: 1px solid rgba(200,168,75,0.28) !important;
  box-shadow: 0 1px 6px rgba(0,0,0,0.2);
}
.auth-tab-inactive { background: transparent; color: var(--muted); }
.auth-tab-inactive:hover { color: var(--platinum); }

/* ── Form heading ── */
.auth-form-heading { margin-bottom: 26px; }
.auth-form-heading h3 {
  font-family: 'Roboto Condensed', sans-serif;
  font-size: 1.65rem; font-weight: 900;
  color: var(--platinum); line-height: 1.1;
  margin-bottom: 7px; text-transform: uppercase; letter-spacing: 0.01em;
}
.auth-form-heading h3 span {
  background: linear-gradient(120deg, #e0c578, #c8a84b);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.auth-form-heading p {
  font-size: 0.8rem; color: var(--muted); line-height: 1.6;
}

/* ── Google button ── */
.auth-google-btn {
  width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 12px 16px; border-radius: 8px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(180,200,240,0.14);
  font-family: 'Roboto', sans-serif;
  font-size: 0.85rem; font-weight: 600;
  color: var(--platinum); cursor: pointer;
  transition: all 0.22s;
  letter-spacing: 0.02em;
}
.auth-google-btn:hover:not(:disabled) {
  border-color: rgba(180,200,240,0.28);
  background: rgba(255,255,255,0.07);
  box-shadow: 0 2px 12px rgba(0,0,0,0.2);
}
.auth-google-btn:disabled { opacity: 0.45; cursor: not-allowed; }

/* ── Divider ── */
.auth-divider {
  display: flex; align-items: center; gap: 12px;
  margin: 20px 0;
}
.auth-divider-line { flex: 1; height: 1px; background: rgba(180,200,240,0.08); }
.auth-divider-text {
  font-size: 0.66rem; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: rgba(144,168,192,0.6);
}

/* ── Form fields ── */
.auth-field { margin-bottom: 15px; }
.auth-label {
  display: block;
  font-size: 0.68rem; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--muted); margin-bottom: 7px;
}
.auth-label-row {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 7px;
}
.auth-input-wrap { position: relative; }
.auth-input-icon {
  position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
  color: rgba(144,168,192,0.5); pointer-events: none;
  display: flex; align-items: center;
}
.auth-input {
  width: 100%;
  padding: 12px 14px 12px 42px;
  background: rgba(0,0,0,0.28);
  border: 1px solid rgba(168,196,232,0.1);
  border-radius: 8px;
  font-family: 'Roboto', sans-serif;
  font-size: 0.88rem; color: var(--platinum);
  outline: none;
  transition: border-color 0.22s, box-shadow 0.22s, background 0.22s;
}
.auth-input::placeholder { color: rgba(144,168,192,0.38); }
.auth-input:focus {
  border-color: rgba(200,168,75,0.45);
  background: rgba(0,0,0,0.38);
  box-shadow: 0 0 0 3px rgba(200,168,75,0.08);
}
.auth-pw-toggle {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: rgba(144,168,192,0.5); padding: 4px;
  display: flex; align-items: center;
  transition: color 0.2s;
}
.auth-pw-toggle:hover { color: var(--muted); }
.auth-forgot {
  font-size: 0.7rem; font-weight: 600; color: var(--gold-l);
  background: none; border: none; cursor: pointer;
  font-family: 'Roboto', sans-serif; padding: 0;
  transition: opacity 0.2s; letter-spacing: 0.03em;
}
.auth-forgot:hover { opacity: 0.72; }

/* ── Alerts ── */
.auth-alert {
  display: flex; align-items: flex-start; gap: 9px;
  padding: 11px 14px; border-radius: 8px;
  font-size: 0.79rem; line-height: 1.55;
  margin-bottom: 12px;
  animation: fadeIn 0.25s ease;
}
.auth-alert-error   { background: rgba(180,40,40,0.1);  border: 1px solid rgba(200,80,80,0.25);   color: #f87171; }
.auth-alert-success { background: rgba(0,196,140,0.08); border: 1px solid rgba(0,196,140,0.22);   color: #00c48c; }
.auth-alert-warn    { background: rgba(200,168,75,0.08); border: 1px solid rgba(200,168,75,0.25); color: var(--gold-l); }
.auth-alert-dismiss {
  background: none; border: none; cursor: pointer;
  font-size: 0.68rem; font-weight: 700; text-decoration: underline;
  color: inherit; font-family: 'Roboto', sans-serif;
  display: block; margin-top: 3px; padding: 0; opacity: 0.8;
}

/* ── Submit button ── */
.auth-submit-btn {
  width: 100%;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 14px 16px; border-radius: 8px; border: none;
  cursor: pointer;
  font-family: 'Roboto', sans-serif;
  font-size: 0.88rem; font-weight: 700;
  letter-spacing: 0.06em; text-transform: uppercase;
  color: #0a0e18;
  background: linear-gradient(130deg, #e0c578 0%, #c8a84b 60%, #b8923e 100%);
  margin-top: 8px;
  transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 4px 20px rgba(200,168,75,0.3);
  position: relative; overflow: hidden;
}
.auth-submit-btn::after {
  content: '';
  position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent);
  transition: left 0s;
}
.auth-submit-btn:hover:not(:disabled) {
  opacity: 0.93; transform: translateY(-1px);
  box-shadow: 0 8px 28px rgba(200,168,75,0.38);
}
.auth-submit-btn:hover:not(:disabled)::after { left: 100%; transition: left 0.45s ease; }
.auth-submit-btn:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }

/* ── Switch mode ── */
.auth-switch {
  margin-top: 22px; padding-top: 18px;
  border-top: 1px solid rgba(168,196,232,0.07);
  text-align: center;
  font-size: 0.78rem; color: var(--muted);
}
.auth-switch-btn {
  color: var(--gold-l); font-weight: 700; background: none; border: none;
  cursor: pointer; font-family: 'Roboto', sans-serif; font-size: 0.78rem;
  transition: opacity 0.2s;
}
.auth-switch-btn:hover { opacity: 0.72; }

/* ── Bottom trust ── */
.auth-trust-row {
  display: flex; justify-content: center; gap: 18px;
  margin-top: 18px; flex-wrap: wrap;
}
.auth-trust-item {
  display: flex; align-items: center; gap: 5px;
  font-size: 0.67rem; color: rgba(144,168,192,0.55);
  letter-spacing: 0.03em;
}

/* ── Animations ── */
@keyframes cardIn {
  from { opacity: 0; transform: translateY(24px) scale(0.97); }
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
  .auth-right { background: var(--navy-0); }
  .auth-mobile-logo { display: flex !important; }
}
@media (max-width: 480px) {
  .auth-right { padding: 24px 16px; }
  .auth-card  { padding: 32px 24px; }
}
`;

/* ─── Data ─────────────────────────────────────────────────── */
const leftStats = [
  { icon: FileText,  val: '10,000+', lbl: 'Reports generated monthly',   c: '#a8c4e8', bg: 'rgba(168,196,232,0.1)',  border: 'rgba(168,196,232,0.2)' },
  { icon: Shield,    val: '97%',     lbl: 'Clinical report accuracy',    c: '#00c48c', bg: 'rgba(0,196,140,0.1)',    border: 'rgba(0,196,140,0.2)'   },
  { icon: Zap,       val: '< 3 min', lbl: 'Average report generation',   c: '#c8a84b', bg: 'rgba(200,168,75,0.1)',  border: 'rgba(200,168,75,0.2)'  },
  { icon: Building2, val: '50+',     lbl: 'Healthcare orgs trust RadAI', c: '#e0c578', bg: 'rgba(224,197,120,0.1)', border: 'rgba(224,197,120,0.2)' },
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
              <Microscope size={22} color="#0a0e18" />
            </div>
            <div>
              <div className="auth-logo-title">
                Rad<span>AI</span>
              </div>
              <div className="auth-logo-sub">AI Radiology Intelligence</div>
            </div>
          </div>

          {/* Headline */}
          <div className="auth-left-headline">
            <h2>
              Professional<br />
              <span>Radiology AI</span><br />
              Copilot
            </h2>
            <p>
              Enterprise AI assistant built for radiologists. Generate
              clinically-accurate, HIPAA-compliant structured reports in under 3 minutes.
              Trusted by Apollo, Fortis, Medanta &amp; more.
            </p>
          </div>

          {/* Stats */}
          <div className="auth-stats">
            {leftStats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="auth-stat">
                  <div className="auth-stat-icon" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                    <Icon size={16} color={s.c} />
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
                <Star key={i} size={12} fill="#c8a84b" color="#c8a84b" />
              ))}
            </div>
            <p className="auth-testimonial-text">
              "RadAI reduced our reporting turnaround by 89% in the first week. Nothing else comes close."
            </p>
            <div className="auth-testimonial-author">
              <div className="auth-testimonial-avatar">AM</div>
              <div>
                <div className="auth-testimonial-name">Dr. Ananya Mehta</div>
                <div className="auth-testimonial-role">Chief of Radiology · Apollo Hospitals, Mumbai</div>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="auth-left-badges">
            {leftBadges.map((b) => (
              <span key={b} className="auth-left-badge">
                <BadgeCheck size={11} color="#c8a84b" />
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* ══ RIGHT PANEL ═════════════════════════════ */}
        <div className="auth-right">
          <div style={{ width: '100%', maxWidth: '430px' }}>

            {/* Mobile logo */}
            <div className="auth-mobile-logo">
              <div className="auth-mobile-logo-mark">
                <Microscope size={20} color="#0a0e18" />
              </div>
              <div
                className="auth-logo-title"
                style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: '1.3rem', fontWeight: 900, color: '#d4dff0' }}
              >
                Rad<span style={{ background: 'linear-gradient(120deg,#e0c578,#c8a84b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AI</span>
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
                    ? <>Welcome <span>Back</span></>
                    : <>Get <span>Started</span></>}
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
                  ? <Loader2 size={17} className="spin" color="#607a96" />
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
                        placeholder="Dr. Ananya Mehta"
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
                      style={{ paddingRight: '42px' }}
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
                { Icon: Shield,     label: 'HIPAA Secure'        },
                { Icon: Lock,       label: 'End-to-End Encrypted' },
                { Icon: BadgeCheck, label: 'SOC 2 Aligned'        },
              ].map(({ Icon, label }, i) => (
                <span key={i} className="auth-trust-item">
                  <Icon size={11} color="#c8a84b" />
                  {label}
                </span>
              ))}
            </div>

            {/* Legal */}
            <p style={{
              marginTop: '12px', textAlign: 'center',
              fontSize: '0.66rem', color: 'rgba(144,168,192,0.45)', lineHeight: 1.6,
            }}>
              By continuing, you agree to RadAI's{' '}
              <a href="#" style={{ color: 'rgba(200,168,75,0.6)', textDecoration: 'none' }}>Terms of Service</a>
              {' '}and{' '}
              <a href="#" style={{ color: 'rgba(200,168,75,0.6)', textDecoration: 'none' }}>Privacy Policy</a>.
            </p>
          </div>
        </div>

      </div>
    </>
  );
}