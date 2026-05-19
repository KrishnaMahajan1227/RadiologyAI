import { Search, Plus, Bell } from 'lucide-react';
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

const PAGE_ACTIONS: Partial<Record<Page, { label: string; action: 'new-report' | 'new-case' | 'new-template' | 'new-macro' }>> = {
  cases: { label: 'New Case', action: 'new-case' },
  templates: { label: 'New Template', action: 'new-template' },
  macros: { label: 'New Macro', action: 'new-macro' },
  dashboard: { label: 'New Report', action: 'new-report' },
};

interface HeaderProps {
  onAction?: (action: string) => void;
}

export function Header({ onAction }: HeaderProps) {
  const { state, navigate } = useApp();
  const title = PAGE_TITLES[state.currentPage];
  const pageAction = PAGE_ACTIONS[state.currentPage];

  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-6 gap-4 shrink-0">
      <h1 className="font-semibold text-gray-900 dark:text-white text-base">{title}</h1>

      <div className="flex-1 max-w-xs ml-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports, cases..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 border border-transparent rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 text-gray-700 dark:text-gray-300 placeholder-gray-400 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <div className="text-xs text-gray-500 dark:text-gray-400 hidden md:flex items-center gap-1">
          <kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-[10px] font-mono">⌘N</kbd>
          <span>New Report</span>
        </div>

        <button className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <Bell size={16} />
        </button>

        {pageAction && (
          <button
            onClick={() => {
              if (pageAction.action === 'new-report') navigate('report');
              else onAction?.(pageAction.action);
            }}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={14} />
            {pageAction.label}
          </button>
        )}
      </div>
    </header>
  );
}
