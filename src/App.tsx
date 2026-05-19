import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { AuthPage } from './components/auth/AuthPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { ReportWorkspace } from './components/reports/ReportWorkspace';
import { CasesPage } from './components/cases/CasesPage';
import { CaseDetail } from './components/cases/CaseDetail';
import { TemplatesPage } from './components/templates/TemplatesPage';
import { MacrosPage } from './components/macros/MacrosPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { LandingPage } from './components/landing/LandingPage';
import { Loader2 } from 'lucide-react';

function AppInner() {
  const { state, dispatch } = useApp();
  const [showLanding, setShowLanding] = useState(true);

  if (state.authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-blue-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading RadAI Copilot...</p>
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
      {renderPage()}
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
