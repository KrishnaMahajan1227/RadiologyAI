import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { AuthPage } from './components/auth/AuthPage';
import { LandingPage } from './components/landing/LandingPage';
import { Loader2 } from 'lucide-react';

// Public marketing pages — each is a real, indexable route (not just an
// anchor on one long landing page), which is what lets Google crawl and
// rank them individually.
const FeaturesPage = lazy(() => import('./pages/FeaturesPage').then(m => ({ default: m.FeaturesPage })));
const PricingPage = lazy(() => import('./pages/PricingPage').then(m => ({ default: m.PricingPage })));
const BlogIndexPage = lazy(() => import('./pages/BlogIndexPage').then(m => ({ default: m.BlogIndexPage })));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage').then(m => ({ default: m.BlogPostPage })));

// Authenticated-app-only screens are code-split out of the initial bundle.
// The public landing page (what search engines crawl, and what Core Web
// Vitals are measured against for anonymous visitors) stays lightweight;
// this extra JS only downloads once someone actually logs in.
const Dashboard = lazy(() => import('./components/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const ReportWorkspace = lazy(() => import('./components/reports/ReportWorkspace').then(m => ({ default: m.ReportWorkspace })));
const CasesPage = lazy(() => import('./components/cases/CasesPage').then(m => ({ default: m.CasesPage })));
const CaseDetail = lazy(() => import('./components/cases/CaseDetail').then(m => ({ default: m.CaseDetail })));
const TemplatesPage = lazy(() => import('./components/templates/TemplatesPage').then(m => ({ default: m.TemplatesPage })));
const MacrosPage = lazy(() => import('./components/macros/MacrosPage').then(m => ({ default: m.MacrosPage })));
const SettingsPage = lazy(() => import('./components/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-gold-400" />
    </div>
  );
}

/** Everything a signed-out visitor (and every search engine crawler) can
 *  reach. Each of these is a distinct URL with its own <title>, meta
 *  description and canonical tag — see src/components/seo/SEO.tsx — so it
 *  can be indexed on its own instead of every visitor and every crawl only
 *  ever seeing "/". */
function PublicSite() {
  const navigate = useNavigate();
  const goToSignIn = () => navigate('/signin');

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage onGetStarted={goToSignIn} />} />
        <Route path="/signin" element={<AuthPage />} />
        <Route path="/features" element={<FeaturesPage onGetStarted={goToSignIn} />} />
        <Route path="/pricing" element={<PricingPage onGetStarted={goToSignIn} />} />
        <Route path="/blog" element={<BlogIndexPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage onGetStarted={goToSignIn} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function AppInner() {
  const { state, dispatch } = useApp();

  if (state.authLoading) {
    return (
      <div className="min-h-screen bg-navy-gradient flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold animate-fadeIn">
            <Loader2 size={24} className="animate-spin text-navy-950" />
          </div>
          <div className="text-center">
            <p className="text-white font-display font-semibold text-sm tracking-tight">RadAI Copilot</p>
            <p className="text-xs text-slate-400 mt-1">Loading your clinical workspace…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!state.user) {
    return <PublicSite />;
  }

  const handleHeaderAction = (action: string) => {
    if (action === 'new-case') dispatch({ type: 'NAVIGATE', page: 'cases' });
    if (action === 'new-template') dispatch({ type: 'NAVIGATE', page: 'templates' });
    if (action === 'new-macro') dispatch({ type: 'NAVIGATE', page: 'macros' });
    if (action === 'new-report') dispatch({ type: 'NAVIGATE', page: 'report' });
  };

  const renderPage = () => {
    switch (state.currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'report': return <ReportWorkspace />;
      case 'cases': return <CasesPage />;
      case 'case-detail': return <CaseDetail />;
      case 'templates': return <TemplatesPage />;
      case 'macros': return <MacrosPage />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <AppLayout onHeaderAction={handleHeaderAction}>
      <Suspense fallback={<PageLoader />}>{renderPage()}</Suspense>
    </AppLayout>
  );
}

function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}

export default App;
