import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useApp } from '../../context/AppContext';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

interface AppLayoutProps {
  children: React.ReactNode;
  onHeaderAction?: (action: string) => void;
}

export function AppLayout({ children, onHeaderAction }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { navigate } = useApp();

  useKeyboardShortcuts([
    { key: 'n', ctrl: true, handler: () => navigate('report'), description: 'New Report' },
    { key: '1', ctrl: true, handler: () => navigate('dashboard'), description: 'Go to Dashboard' },
    { key: '2', ctrl: true, handler: () => navigate('report'), description: 'Go to Report' },
    { key: '3', ctrl: true, handler: () => navigate('cases'), description: 'Go to Cases' },
    { key: '4', ctrl: true, handler: () => navigate('templates'), description: 'Go to Templates' },
    { key: '5', ctrl: true, handler: () => navigate('macros'), description: 'Go to Macros' },
  ]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-navy-950">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onAction={onHeaderAction} onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
