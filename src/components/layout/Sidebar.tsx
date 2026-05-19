import React from 'react';
import {
  LayoutDashboard, FileText, FolderOpen, LayoutTemplate,
  Zap, Settings, ChevronLeft, ChevronRight, Activity,
  LogOut, Moon, Sun,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import type { Page } from '../../types';

interface NavItem {
  page: Page;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { state, navigate, dispatch } = useApp();

  const navItems: NavItem[] = [
    { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { page: 'report', label: 'New Report', icon: <FileText size={18} /> },
    { page: 'cases', label: 'Cases', icon: <FolderOpen size={18} />, badge: state.cases.filter((c) => c.status === 'active').length || undefined },
    { page: 'templates', label: 'Templates', icon: <LayoutTemplate size={18} /> },
    { page: 'macros', label: 'Macros', icon: <Zap size={18} /> },
    { page: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const toggleTheme = () => {
    dispatch({ type: 'SET_THEME', theme: state.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <aside
      className={`flex flex-col h-screen bg-gray-900 dark:bg-gray-950 text-white transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      } shrink-0`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
        <div className="shrink-0 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <Activity size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-sm text-white leading-tight">RadAI</p>
            <p className="text-[10px] text-gray-400 leading-tight">Copilot</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto shrink-0 text-gray-400 hover:text-white transition-colors p-0.5 rounded"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = state.currentPage === item.page;
          return (
            <button
              key={item.page}
              onClick={() => navigate(item.page)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.badge && item.badge > 0 && (
                <span className="ml-auto bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-4 border-t border-gray-800 pt-3 space-y-0.5">
        {/* User info */}
        {!collapsed && state.profile && (
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-medium text-white truncate">{state.profile.name || state.user?.email}</p>
            <p className="text-[10px] text-gray-500 capitalize">{state.profile.role}</p>
          </div>
        )}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
          title={collapsed ? 'Toggle theme' : undefined}
        >
          <span className="shrink-0">{state.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</span>
          {!collapsed && <span>{state.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-900/40 hover:text-red-400 transition-all"
          title={collapsed ? 'Sign out' : undefined}
        >
          <span className="shrink-0"><LogOut size={18} /></span>
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
