import { useState } from 'react';
import { Loader2, Lightbulb, AlertTriangle, GitBranch, MessageCircle, ChevronDown, ChevronUp, X, RefreshCw } from 'lucide-react';
import type { Suggestion, ReportError, Differential } from '../../types';

interface CopilotPanelProps {
  suggestions: Suggestion[];
  errors: ReportError[];
  differential: Differential[];
  questions: string[];
  loading: boolean;
  onRefresh: () => void;
  onApplySuggestion: (suggestion: Suggestion) => void;
  onQuestionClick: (q: string) => void;
}

export function CopilotPanel({
  suggestions, errors, differential, questions, loading,
  onRefresh, onApplySuggestion, onQuestionClick,
}: CopilotPanelProps) {
  const [activeTab, setActiveTab] = useState<'suggestions' | 'errors' | 'differential' | 'questions'>('suggestions');
  const [expandedDiff, setExpandedDiff] = useState<number | null>(null);

  const tabs = [
    { key: 'suggestions' as const, label: 'Suggest', count: suggestions.length, icon: <Lightbulb size={13} /> },
    { key: 'errors' as const, label: 'Issues', count: errors.filter((e) => e.severity === 'error' || e.severity === 'warning').length, icon: <AlertTriangle size={13} /> },
    { key: 'differential' as const, label: 'DDx', count: differential.length, icon: <GitBranch size={13} /> },
    { key: 'questions' as const, label: 'Follow-up', count: questions.length, icon: <MessageCircle size={13} /> },
  ];

  const priorityColor = (p: string) => {
    if (p === 'high') return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
    if (p === 'medium') return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400';
  };

  const severityColor = (s: string) => {
    if (s === 'error') return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    if (s === 'warning') return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
    return 'text-navy-600 dark:text-navy-400 bg-navy-50 dark:bg-navy-900/20 border-navy-200 dark:border-navy-800';
  };

  const likelihoodColor = (l: string) => {
    if (l === 'high') return 'text-emerald-600 dark:text-emerald-400';
    if (l === 'moderate') return 'text-amber-600 dark:text-amber-400';
    return 'text-slate-500 dark:text-slate-400';
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200/70 dark:border-white/[0.06]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/70 dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-navy-600 rounded-md flex items-center justify-center">
            <Lightbulb size={12} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">AI Copilot</span>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh analysis"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200/70 dark:border-white/[0.06] px-2 pt-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'text-navy-600 dark:text-navy-400 border-navy-600 dark:border-navy-400'
                : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count > 0 && (
              <span className={`rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-bold ${
                activeTab === tab.key ? 'bg-navy-100 dark:bg-navy-900/40 text-navy-600 dark:text-navy-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 size={24} className="animate-spin text-navy-500" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Analyzing report...</p>
          </div>
        )}

        {!loading && activeTab === 'suggestions' && (
          <div className="p-3 space-y-2">
            {suggestions.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                <Lightbulb size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                Generate a report to see AI suggestions
              </div>
            ) : (
              suggestions.map((s, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize shrink-0 mt-0.5 ${priorityColor(s.priority)}`}>
                      {s.priority}
                    </span>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{s.title}</p>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{s.suggestion}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 capitalize">{s.location}</span>
                    <button
                      onClick={() => onApplySuggestion(s)}
                      className="text-[10px] text-navy-600 dark:text-navy-400 hover:underline font-medium"
                    >
                      Apply hint
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {!loading && activeTab === 'errors' && (
          <div className="p-3 space-y-2">
            {errors.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                <AlertTriangle size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                No issues detected
              </div>
            ) : (
              errors.map((e, i) => (
                <div key={i} className={`rounded-xl p-3 border text-xs ${severityColor(e.severity)}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertTriangle size={11} />
                    <span className="font-medium capitalize">{e.severity}</span>
                    <X
                      size={11}
                      className="ml-auto cursor-pointer opacity-60 hover:opacity-100"
                    />
                  </div>
                  <p className="leading-relaxed">{e.message}</p>
                </div>
              ))
            )}
          </div>
        )}

        {!loading && activeTab === 'differential' && (
          <div className="p-3 space-y-2">
            {differential.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                <GitBranch size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                No differential diagnoses yet
              </div>
            ) : (
              differential.map((d, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">
                  <button
                    className="w-full flex items-start gap-2 text-left"
                    onClick={() => setExpandedDiff(expandedDiff === i ? null : i)}
                  >
                    <span className="shrink-0 text-xs font-bold text-slate-400 w-4">{d.rank}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{d.diagnosis}</p>
                      <p className={`text-[10px] font-medium capitalize ${likelihoodColor(d.likelihood)}`}>{d.likelihood} likelihood</p>
                    </div>
                    {expandedDiff === i ? <ChevronUp size={12} className="shrink-0 text-slate-400 mt-0.5" /> : <ChevronDown size={12} className="shrink-0 text-slate-400 mt-0.5" />}
                  </button>
                  {expandedDiff === i && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-white/10 space-y-1.5">
                      {d.supporting_features.length > 0 && (
                        <div>
                          <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mb-0.5">Supporting</p>
                          {d.supporting_features.map((f, j) => (
                            <p key={j} className="text-[10px] text-slate-600 dark:text-slate-400">· {f}</p>
                          ))}
                        </div>
                      )}
                      {d.against_features.length > 0 && (
                        <div>
                          <p className="text-[10px] font-medium text-red-500 dark:text-red-400 mb-0.5">Against</p>
                          {d.against_features.map((f, j) => (
                            <p key={j} className="text-[10px] text-slate-600 dark:text-slate-400">· {f}</p>
                          ))}
                        </div>
                      )}
                      {d.next_steps && (
                        <div className="bg-navy-50 dark:bg-navy-900/20 rounded-lg p-2">
                          <p className="text-[10px] font-medium text-navy-600 dark:text-navy-400 mb-0.5">Next Steps</p>
                          <p className="text-[10px] text-slate-600 dark:text-slate-400">{d.next_steps}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {!loading && activeTab === 'questions' && (
          <div className="p-3 space-y-2">
            {questions.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                <MessageCircle size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                Generate a report to see follow-up questions
              </div>
            ) : (
              questions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => onQuestionClick(q)}
                  className="w-full text-left bg-slate-50 dark:bg-slate-800/60 hover:bg-navy-50 dark:hover:bg-navy-900/20 rounded-xl p-3 transition-colors"
                >
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{q}</p>
                  <p className="text-[10px] text-navy-600 dark:text-navy-400 mt-1.5 font-medium">Click to answer →</p>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
