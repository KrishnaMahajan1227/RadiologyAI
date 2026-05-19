import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile, Case, Report, Template, Macro, Page } from '../types';

interface AppState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  cases: Case[];
  reports: Report[];
  templates: Template[];
  macros: Macro[];
  currentPage: Page;
  selectedCaseId: string | null;
  selectedReportId: string | null;
  theme: 'light' | 'dark';
  loading: boolean;
  authLoading: boolean;
}

type Action =
  | { type: 'SET_AUTH'; user: User | null; session: Session | null }
  | { type: 'SET_PROFILE'; profile: Profile | null }
  | { type: 'SET_CASES'; cases: Case[] }
  | { type: 'SET_REPORTS'; reports: Report[] }
  | { type: 'SET_TEMPLATES'; templates: Template[] }
  | { type: 'SET_MACROS'; macros: Macro[] }
  | { type: 'ADD_CASE'; case: Case }
  | { type: 'UPDATE_CASE'; case: Case }
  | { type: 'DELETE_CASE'; id: string }
  | { type: 'ADD_REPORT'; report: Report }
  | { type: 'UPDATE_REPORT'; report: Report }
  | { type: 'ADD_TEMPLATE'; template: Template }
  | { type: 'UPDATE_TEMPLATE'; template: Template }
  | { type: 'DELETE_TEMPLATE'; id: string }
  | { type: 'ADD_MACRO'; macro: Macro }
  | { type: 'UPDATE_MACRO'; macro: Macro }
  | { type: 'DELETE_MACRO'; id: string }
  | { type: 'NAVIGATE'; page: Page; caseId?: string; reportId?: string }
  | { type: 'SET_THEME'; theme: 'light' | 'dark' }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_AUTH_LOADING'; loading: boolean };

const initialState: AppState = {
  user: null,
  session: null,
  profile: null,
  cases: [],
  reports: [],
  templates: [],
  macros: [],
  currentPage: 'dashboard',
  selectedCaseId: null,
  selectedReportId: null,
  theme: 'light',
  loading: false,
  authLoading: true,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_AUTH':
      return { ...state, user: action.user, session: action.session, authLoading: false };
    case 'SET_PROFILE':
      return { ...state, profile: action.profile };
    case 'SET_CASES':
      return { ...state, cases: action.cases };
    case 'SET_REPORTS':
      return { ...state, reports: action.reports };
    case 'SET_TEMPLATES':
      return { ...state, templates: action.templates };
    case 'SET_MACROS':
      return { ...state, macros: action.macros };
    case 'ADD_CASE':
      return { ...state, cases: [action.case, ...state.cases] };
    case 'UPDATE_CASE':
      return { ...state, cases: state.cases.map((c) => (c.id === action.case.id ? action.case : c)) };
    case 'DELETE_CASE':
      return { ...state, cases: state.cases.filter((c) => c.id !== action.id) };
    case 'ADD_REPORT':
      return { ...state, reports: [action.report, ...state.reports] };
    case 'UPDATE_REPORT':
      return { ...state, reports: state.reports.map((r) => (r.id === action.report.id ? action.report : r)) };
    case 'ADD_TEMPLATE':
      return { ...state, templates: [action.template, ...state.templates] };
    case 'UPDATE_TEMPLATE':
      return { ...state, templates: state.templates.map((t) => (t.id === action.template.id ? action.template : t)) };
    case 'DELETE_TEMPLATE':
      return { ...state, templates: state.templates.filter((t) => t.id !== action.id) };
    case 'ADD_MACRO':
      return { ...state, macros: [action.macro, ...state.macros] };
    case 'UPDATE_MACRO':
      return { ...state, macros: state.macros.map((m) => (m.id === action.macro.id ? action.macro : m)) };
    case 'DELETE_MACRO':
      return { ...state, macros: state.macros.filter((m) => m.id !== action.id) };
    case 'NAVIGATE':
      return {
        ...state,
        currentPage: action.page,
        selectedCaseId: action.caseId ?? state.selectedCaseId,
        selectedReportId: action.reportId ?? state.selectedReportId,
      };
    case 'SET_THEME':
      return { ...state, theme: action.theme };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_AUTH_LOADING':
      return { ...state, authLoading: action.loading };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  navigate: (page: Page, caseId?: string, reportId?: string) => void;
  loadUserData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadUserData = useCallback(async () => {
    if (!state.user) return;
    dispatch({ type: 'SET_LOADING', loading: true });
    try {
      const [casesRes, reportsRes, userTemplatesRes, systemTemplatesRes, userMacrosRes, systemMacrosRes, profileRes] = await Promise.all([
        supabase.from('cases').select('*').order('created_at', { ascending: false }),
        supabase.from('reports').select('*').order('created_at', { ascending: false }),
        supabase.from('templates').select('*').eq('user_id', state.user.id).order('created_at', { ascending: false }),
        supabase.from('templates').select('*').eq('user_id', '00000000-0000-0000-0000-000000000000').order('name', { ascending: true }),
        supabase.from('macros').select('*').eq('user_id', state.user.id).order('created_at', { ascending: false }),
        supabase.from('macros').select('*').eq('user_id', '00000000-0000-0000-0000-000000000000').order('trigger', { ascending: true }),
        supabase.from('profiles').select('*').eq('id', state.user.id).maybeSingle(),
      ]);
      if (casesRes.data) dispatch({ type: 'SET_CASES', cases: casesRes.data as Case[] });
      if (reportsRes.data) dispatch({ type: 'SET_REPORTS', reports: reportsRes.data as Report[] });
      // Merge user + system templates, dedup by id
      const allTemplates = [...(userTemplatesRes.data ?? []), ...(systemTemplatesRes.data ?? [])];
      dispatch({ type: 'SET_TEMPLATES', templates: allTemplates as Template[] });
      // Merge user + system macros, dedup by id
      const allMacros = [...(userMacrosRes.data ?? []), ...(systemMacrosRes.data ?? [])];
      dispatch({ type: 'SET_MACROS', macros: allMacros as Macro[] });
      if (profileRes.data) dispatch({ type: 'SET_PROFILE', profile: profileRes.data as Profile });
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, [state.user]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch({ type: 'SET_AUTH', user: session?.user ?? null, session });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch({ type: 'SET_AUTH', user: session?.user ?? null, session });
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (state.user) {
      loadUserData();
      // Seed default macros for new users
      seedDefaultMacros(state.user.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.user]);

  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  const navigate = useCallback((page: Page, caseId?: string, reportId?: string) => {
    dispatch({ type: 'NAVIGATE', page, caseId, reportId });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, navigate, loadUserData }}>
      {children}
    </AppContext.Provider>
  );
}

async function seedDefaultMacros(userId: string) {
  const { data } = await supabase.from('macros').select('id').eq('user_id', userId).limit(1);
  if (data && data.length > 0) return;

  const defaults = [
    { trigger: '/normal-cxr', expansion: 'The lungs are clear bilaterally without focal consolidation, pleural effusion, or pneumothorax. The cardiac silhouette is within normal limits. The mediastinal contour is unremarkable. Osseous structures are intact.', category: 'chest', description: 'Normal chest X-ray' },
    { trigger: '/no-pe', expansion: 'No pulmonary embolism identified. No filling defects are seen within the pulmonary arteries to the segmental level bilaterally.', category: 'chest', description: 'No PE finding' },
    { trigger: '/normal-brain', expansion: 'No intracranial hemorrhage, mass effect, or midline shift. The gray-white matter differentiation is preserved. The ventricles and sulci are normal in size and configuration. No acute territorial infarction.', category: 'neuro', description: 'Normal brain CT' },
    { trigger: '/clinical-correlation', expansion: 'Clinical correlation is recommended.', category: 'general', description: 'Clinical correlation statement' },
    { trigger: '/follow-up', expansion: 'Short-interval follow-up imaging is recommended to assess for stability.', category: 'general', description: 'Follow-up recommendation' },
  ];

  await supabase.from('macros').insert(defaults.map((m) => ({ ...m, user_id: userId })));
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
