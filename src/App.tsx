import { useState, Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { AuthPage } from './components/auth/AuthPage';
import { LandingPage } from './components/landing/LandingPage';
import { Loader2 } from 'lucide-react';

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

function AppInner() {
  const { state, dispatch } = useApp();
  const [showLanding, setShowLanding] = useState(true);

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
    return showLanding ? (
      <LandingPage onGetStarted={() => setShowLanding(false)} />
    ) : (
      <AuthPage />
    );
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
