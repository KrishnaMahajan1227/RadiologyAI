import { useState } from 'react';
import { Activity, Eye, EyeOff, Loader2, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.28c-.22-.66-.35-1.36-.35-2.08s.13-1.42.35-2.08V7.28H2.18C1.43 8.8 1 10.36 1 12s.43 3.2 1.18 4.72l2.52-1.96.14-1.48z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.28l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.74z" fill="#EA4335"/>
    </svg>
  );
}

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [success, setSuccess] = useState('');

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleError('');
    setSuccess('');
    setGoogleLoading(true);
    try {
      const redirectUrl = window.location.origin;

      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
        },
      });

      if (err) {
        const msg = err.message || '';
        if (msg.includes('refused to connect') || msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('net::ERR_CONNECTION_REFUSED')) {
          setGoogleError('Could not connect to Google Sign-In. This usually means Google OAuth is not yet enabled in the Supabase project. Please use email/password login for now.');
        } else if (msg.includes('provider is not enabled') || msg.includes('not enabled') || msg.includes('Provider google')) {
          setGoogleError('Google Sign-In is not enabled yet. Please use email/password to sign in, or enable Google OAuth in your Supabase dashboard under Authentication > Providers.');
        } else {
          setGoogleError(msg);
        }
        setGoogleLoading(false);
        return;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed';
      setGoogleError(msg);
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setGoogleError('');
    setSuccess('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (err) throw err;
        setSuccess('Account created! Signing you in...');
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        setSuccess('Signing you in...');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      if (msg.includes('refused to connect') || msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('net::ERR_CONNECTION_REFUSED')) {
        setError('Could not connect to the authentication server. Please check your internet connection and try again.');
      } else if (msg.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (msg.includes('User already registered')) {
        setError('An account with this email already exists. Try signing in instead.');
      } else if (msg.includes('Email not confirmed')) {
        setError('Please check your email and click the confirmation link before signing in.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-20 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-20 left-1/3 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Left Panel - Premium Branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-16 bg-gradient-to-br from-slate-900/80 to-slate-950/80 border-r border-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
            <Activity size={28} className="text-slate-950" />
          </div>
          <div>
            <p className="font-black text-2xl bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              RadAI Copilot
            </p>
            <p className="text-xs text-slate-400 font-semibold tracking-wide">ENTERPRISE RADIOLOGY PLATFORM</p>
          </div>
        </div>

        <div className="space-y-12">
          <div>
            <h2 className="text-5xl font-black leading-tight mb-6">
              Professional Radiology
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                AI Copilot
              </span>
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed font-light">
              Enterprise-grade AI assistant for radiologists. Generate clinical-accurate reports 10x faster with HIPAA compliance and clinical precision.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { stat: '10,000+', label: 'Reports Generated Monthly' },
              { stat: '95%', label: 'Clinical Accuracy Rate' },
              { stat: '50+', label: 'Healthcare Facilities Trust Us' },
            ].map((item) => (
              <div key={item.stat} className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30 hover:border-blue-500/30 transition-colors">
                <CheckCircle2 size={24} className="text-cyan-400 shrink-0" />
                <div>
                  <div className="font-bold text-cyan-400">{item.stat}</div>
                  <div className="text-sm text-slate-400">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {['HIPAA Compliant', 'SOC 2 Certified', '99.9% Uptime', 'Enterprise Support'].map((badge) => (
            <span
              key={badge}
              className="text-xs bg-slate-800/50 text-cyan-400 px-3 py-1.5 rounded-full border border-cyan-500/20 font-semibold"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-12 lg:hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
              <Activity size={24} className="text-slate-950" />
            </div>
            <p className="font-bold text-white text-lg">RadAI</p>
          </div>

          {/* Card */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 rounded-2xl border border-slate-700/50 p-10 backdrop-blur-sm">
            {/* Header */}
            <div className="mb-8">
              <h3 className="text-3xl font-black text-white mb-2">
                {mode === 'login' ? 'Welcome Back' : 'Get Started'}
              </h3>
              <p className="text-slate-400 text-sm font-light">
                {mode === 'login'
                  ? 'Sign in to access your RadAI account'
                  : 'Join 50+ healthcare facilities already using RadAI'
                }
              </p>
            </div>

            {/* Google Sign-In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full bg-white hover:bg-slate-50 active:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-3 border border-slate-200 shadow-lg hover:shadow-xl hover:shadow-white/20"
            >
              {googleLoading ? (
                <Loader2 size={20} className="animate-spin text-slate-700" />
              ) : (
                <GoogleIcon size={20} />
              )}
              <span className="font-semibold">
                {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
              </span>
            </button>

            {/* Google Error */}
            {googleError && (
              <div className="mt-4 bg-amber-900/30 border border-amber-700/50 rounded-lg px-4 py-3 text-amber-300 text-sm flex items-start gap-2">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <p>{googleError}</p>
                  <button
                    onClick={() => setGoogleError('')}
                    className="text-amber-400 hover:text-amber-300 text-xs mt-1 underline font-semibold"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/50"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-slate-800/60 text-slate-500 font-semibold uppercase tracking-wide">
                  or continue with email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Sarah Mitchell"
                    required
                    className="w-full bg-slate-900/60 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.com"
                  required
                  className="w-full bg-slate-900/60 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full bg-slate-900/60 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-3 pr-11 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Errors */}
              {error && (
                <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 text-red-300 text-sm flex items-start gap-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="bg-green-900/30 border border-green-700/50 rounded-lg px-4 py-3 text-green-300 text-sm flex items-start gap-2">
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 mt-6"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                <span>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </span>
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            {/* Toggle Auth Mode */}
            <div className="mt-8 text-center pt-8 border-t border-slate-700/50">
              <p className="text-slate-400 text-sm">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => {
                    setMode(mode === 'login' ? 'signup' : 'login');
                    setError('');
                    setGoogleError('');
                    setSuccess('');
                  }}
                  className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
                >
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>

            {/* Security Note */}
            <div className="mt-6 text-center text-xs text-slate-500">
              <p>Enterprise-grade security with HIPAA compliance and encryption</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
