import React from 'react';
import {
  LayoutDashboard, FileText, FolderOpen, LayoutTemplate,
  Zap, Settings, ChevronLeft, ChevronRight, Activity,
  LogOut, Moon, Sun, X,
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
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen = false, onMobileClose }: SidebarProps) {
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

  const handleNavigate = (page: Page) => {
    navigate(page);
    onMobileClose?.();
  };

  const railContent = (isMobile: boolean) => (
    <>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/[0.07] ${collapsed && !isMobile ? 'justify-center px-0' : ''}`}>
        <div className="shrink-0 w-9 h-9 bg-gold-gradient rounded-xl flex items-center justify-center shadow-gold">
          <Activity size={17} className="text-navy-950" strokeWidth={2.5} />
        </div>
        {(!collapsed || isMobile) && (
          <div className="overflow-hidden">
            <p className="font-display font-bold text-sm text-white leading-tight tracking-tight">RadAI</p>
            <p className="text-[10px] text-gold-300/80 leading-tight font-medium tracking-wide uppercase">Copilot</p>
          </div>
        )}
        {isMobile && (
          <button
            onClick={onMobileClose}
            className="ml-auto shrink-0 text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 tap-target flex items-center justify-center"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = state.currentPage === item.page;
          return (
            <button
              key={item.page}
              onClick={() => handleNavigate(item.page)}
              className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 tap-target ${
                active
                  ? 'bg-white/[0.08] text-white shadow-inner-gold'
                  : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
              }`}
              title={collapsed && !isMobile ? item.label : undefined}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-gold-gradient" />
              )}
              <span className={`shrink-0 transition-colors ${active ? 'text-gold-400' : 'group-hover:text-gold-300'}`}>
                {item.icon}
              </span>
              {(!collapsed || isMobile) && <span className="truncate">{item.label}</span>}
              {(!collapsed || isMobile) && item.badge && item.badge > 0 && (
                <span className="ml-auto bg-gold-gradient text-navy-950 text-[11px] font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center shrink-0">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2.5 pb-4 border-t border-white/[0.07] pt-3 space-y-1">
        {(!collapsed || isMobile) && state.profile && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 mb-1 rounded-xl bg-white/[0.04]">
            <div className="shrink-0 w-8 h-8 rounded-full bg-navy-gradient border border-gold-400/30 flex items-center justify-center text-gold-300 text-xs font-bold">
              {(state.profile.name || state.user?.email || '?').charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{state.profile.name || state.user?.email}</p>
              <p className="text-[10px] text-slate-400 capitalize">{state.profile.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-white/[0.05] hover:text-white transition-all tap-target"
          title={collapsed && !isMobile ? 'Toggle theme' : undefined}
        >
          <span className="shrink-0">{state.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</span>
          {(!collapsed || isMobile) && <span>{state.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all tap-target"
          title={collapsed && !isMobile ? 'Sign out' : undefined}
        >
          <span className="shrink-0"><LogOut size={18} /></span>
          {(!collapsed || isMobile) && <span>Sign out</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop / tablet rail */}
      <aside
        className={`hidden md:flex flex-col h-screen bg-navy-gradient text-white transition-all duration-300 relative ${
          collapsed ? 'w-[68px]' : 'w-64'
        } shrink-0 border-r border-white/[0.06]`}
      >
        {railContent(false)}

        {/* Always-visible collapse/expand handle — sits on the rail's edge so it
            never gets squeezed out, whether the rail is expanded or collapsed. */}
        <button
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute top-6 -right-3 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-navy-800 border border-gold-400/40 text-gold-300 shadow-premium hover:bg-navy-700 hover:border-gold-400/70 hover:scale-110 active:scale-95 transition-all duration-200"
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </aside>

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!mobileOpen}
      >
        <div
          className="absolute inset-0 bg-navy-950/70 backdrop-blur-sm"
          onClick={onMobileClose}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-[82%] max-w-[300px] bg-navy-gradient text-white flex flex-col shadow-premium-lg transition-transform duration-300 safe-bottom ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {railContent(true)}
        </aside>
      </div>
    </>
  );
}
