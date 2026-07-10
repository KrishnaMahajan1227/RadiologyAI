import { Search, Bell, Menu } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Page } from '../../types';

const PAGE_TITLES: Record<Page, string> = {
  dashboard: 'Dashboard',
  report: 'Report Workspace',
  cases: 'Case Management',
  'case-detail': 'Case Detail',
  templates: 'Template Builder',
  macros: 'Macro Library',
  settings: 'Settings',
};

const PAGE_SUBTITLES: Partial<Record<Page, string>> = {
  dashboard: 'Your clinical workspace at a glance',
  report: 'Dictate, review and finalize with AI assistance',
  cases: 'Track and manage patient cases',
  templates: 'Build and reuse structured reporting templates',
  macros: 'Quick-insert phrases for faster reporting',
  settings: 'Account, preferences and letterhead',
};

interface HeaderProps {
  onAction?: (action: string) => void;
  onMenuClick?: () => void;
}

/**
 * Global top bar. Intentionally has no page-level "New …" action button —
 * each page already owns a single, correctly-wired creation button, so a
 * second one here would duplicate it. This bar stays lean: navigation,
 * search and notifications only.
 */
export function Header({ onMenuClick }: HeaderProps) {
  const { state } = useApp();
  const title = PAGE_TITLES[state.currentPage];
  const subtitle = PAGE_SUBTITLES[state.currentPage];

  return (
    <header className="h-16 bg-white/90 dark:bg-navy-900/90 backdrop-blur-md border-b border-slate-200/70 dark:border-white/[0.06] flex items-center px-3 sm:px-5 lg:px-6 gap-2 sm:gap-4 shrink-0 sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="md:hidden shrink-0 p-2 -ml-1 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg tap-target flex items-center justify-center"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="min-w-0 shrink-0">
        <h1 className="font-display font-bold text-slate-900 dark:text-white text-base sm:text-lg truncate leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="hidden md:block text-[11px] text-slate-400 dark:text-slate-500 truncate leading-tight -mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex-1 max-w-xs ml-2 sm:ml-4 hidden sm:block">
        <div className="relative group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-gold-500 transition-colors" />
          <input
            type="text"
            placeholder="Search reports, cases..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 dark:bg-white/5 border border-transparent rounded-xl focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/15 focus:bg-white dark:focus:bg-navy-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
        <button
          className="sm:hidden shrink-0 p-2 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg tap-target flex items-center justify-center"
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        <div className="text-xs text-slate-500 dark:text-slate-400 hidden lg:flex items-center gap-1.5 pr-1 mr-1 border-r border-slate-200/70 dark:border-white/10">
          <kbd className="bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 px-1.5 py-0.5 rounded-md text-[10px] font-mono">⌘N</kbd>
          <span>New Report</span>
        </div>

        <button
          className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-gold-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors tap-target flex items-center justify-center"
          aria-label="Notifications"
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-gold-400" />
        </button>
      </div>
    </header>
  );
}
