import { FileText, FolderOpen, Clock, TrendingUp, ChevronRight, AlertCircle, CheckCircle2, Zap, Activity, BarChart3, Users, Target, ShieldAlert, Eye, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { buildReportHTML, openPDF } from '../reports/ReportHTML';
import type { Report } from '../../types';

export function Dashboard() {
  const { state, navigate } = useApp();
  const { cases, reports, profile, templates, macros } = state;

  const handleViewReport = (report: Report) => {
    navigate('report');
  };

  const handleDownloadReport = (report: Report) => {
    const linkedCase = cases.find((c) => c.id === report.case_id);
    const today = new Date(report.created_at);
    const dateStr = today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = today.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const sections: { label: string; content: string }[] = [];
    if (report.technique) sections.push({ label: 'Technique', content: report.technique });
    if (report.findings) sections.push({ label: 'Findings', content: report.findings });
    if (report.impression) sections.push({ label: 'Impression', content: report.impression });

    const html = buildReportHTML({
      profile: profile ?? ({} as Record<string, unknown>),
      patientName: linkedCase?.patient_name || '[Patient Name]',
      patientAge: linkedCase?.patient_age ? `${linkedCase.patient_age} yrs` : '-',
      patientGender: linkedCase?.patient_gender || '-',
      patientCR: linkedCase?.patient_cr_number || '-',
      referringDoc: linkedCase?.referring_doctor || '-',
      patientScan: linkedCase?.scan_type || report.title?.split(' ')[0] || '-',
      dateStr, timeStr,
      clinicalInfo: linkedCase?.notes || '-',
      sections,
      reportTitle: report.title || 'Radiology Report',
    });
    openPDF(html, report.title || 'Radiology_Report');
  };

  const recentCases = cases.slice(0, 5);
  const recentReports = reports.slice(0, 5);

  const activeCases = cases.filter((c) => c.status === 'active').length;
  const completedCases = cases.filter((c) => c.status === 'completed').length;
  const urgentCases = cases.filter((c) => c.priority === 'urgent' || c.priority === 'stat').length;
  const draftReports = reports.filter((r) => r.status === 'draft').length;
  const finalReports = reports.filter((r) => r.status === 'final').length;
  const totalWords = reports.reduce((sum, r) => sum + (r.word_count ?? 0), 0);
  const avgWords = reports.length > 0 ? Math.round(totalWords / reports.length) : 0;
  const timeSaved = profile?.time_saved_minutes ?? reports.length * 18;
  const timeSavedHours = Math.round(timeSaved / 60);

  const stats = [
    {
      label: 'Reports Generated',
      value: reports.length,
      icon: <FileText size={20} />,
      color: 'blue',
      sub: `${finalReports} final, ${draftReports} draft`,
    },
    {
      label: 'Active Cases',
      value: activeCases,
      icon: <FolderOpen size={20} />,
      color: 'emerald',
      sub: `${completedCases} completed, ${urgentCases} urgent`,
    },
    {
      label: 'Time Saved',
      value: `${timeSavedHours}h`,
      icon: <Clock size={20} />,
      color: 'amber',
      sub: `~18 min per report`,
    },
    {
      label: 'Avg Report Length',
      value: `${avgWords}`,
      icon: <BarChart3 size={20} />,
      color: 'rose',
      sub: 'words per report',
    },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
  };

  const priorityColor: Record<string, string> = {
    stat: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    urgent: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    routine: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  };

  const statusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle2 size={14} className="text-emerald-500" />;
    if (status === 'active') return <AlertCircle size={14} className="text-blue-500" />;
    return <Clock size={14} className="text-gray-400" />;
  };

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 18 ? 'Good afternoon' : 'Good evening';
  const displayName = profile?.name || state.user?.email?.split('@')[0] || 'Doctor';

  // Reports by modality
  const modalityCounts: Record<string, number> = {};
  reports.forEach((r) => {
    const mod = r.title?.split(' ')[0] || 'Other';
    modalityCounts[mod] = (modalityCounts[mod] || 0) + 1;
  });
  const topModalities = Object.entries(modalityCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {greeting}, {displayName}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => navigate('report')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <FileText size={16} />
          New Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[stat.color]}`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Workflow metrics row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Templates Available', value: templates.length, icon: <Target size={16} />, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Macros Available', value: macros.length, icon: <Zap size={16} />, color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Urgent Cases', value: urgentCases, icon: <ShieldAlert size={16} />, color: 'text-red-500 bg-red-50 dark:bg-red-900/20' },
          { label: 'Efficiency Score', value: '94%', icon: <TrendingUp size={16} />, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
              {item.icon}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{item.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Cases */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Recent Cases</h3>
            <button onClick={() => navigate('cases')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {recentCases.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <FolderOpen size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No cases yet</p>
                <button onClick={() => navigate('cases')} className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  Create your first case
                </button>
              </div>
            ) : (
              recentCases.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate('case-detail', c.id)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
                >
                  <span className="shrink-0">{statusIcon(c.status)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.patient_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{c.scan_type} · {c.body_part || c.modality}</p>
                  </div>
                  <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${priorityColor[c.priority]}`}>
                    {c.priority}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Activity sidebar */}
        <div className="space-y-6">
          {/* Recent Reports */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Recent Reports</h3>
              <button onClick={() => navigate('report')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                New <ChevronRight size={12} />
              </button>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {recentReports.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <FileText size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No reports yet</p>
                </div>
              ) : (
                recentReports.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <div className="shrink-0 w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <FileText size={14} className="text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(r.created_at).toLocaleDateString()} · {r.word_count > 0 ? `${r.word_count} words` : r.status}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleViewReport(r)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="Open in editor"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => handleDownloadReport(r)}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                        title="Download PDF"
                      >
                        <Download size={13} />
                      </button>
                    </div>
                    <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                      r.status === 'final' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                      'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Modality breakdown */}
          {topModalities.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">Reports by Modality</h3>
              <div className="space-y-3">
                {topModalities.map(([mod, count]) => {
                  const pct = reports.length > 0 ? Math.round((count / reports.length) * 100) : 0;
                  return (
                    <div key={mod}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-400 font-medium">{mod}</span>
                        <span className="text-gray-500 dark:text-gray-500">{count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Activity size={20} className="text-blue-200" />
          <h3 className="font-semibold">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'New Report', key: 'report', shortcut: 'Cmd+N', icon: <FileText size={14} /> },
            { label: 'New Case', key: 'cases', shortcut: 'Cmd+3', icon: <FolderOpen size={14} /> },
            { label: 'Templates', key: 'templates', shortcut: 'Cmd+4', icon: <Target size={14} /> },
            { label: 'Macros', key: 'macros', shortcut: 'Cmd+5', icon: <Zap size={14} /> },
            { label: 'Disease Format', key: 'report', shortcut: 'In Report', icon: <Activity size={14} /> },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.key as never)}
              className="bg-white/10 hover:bg-white/20 rounded-xl px-4 py-3 text-left transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                {action.icon}
                <p className="text-sm font-medium">{action.label}</p>
              </div>
              <p className="text-xs text-blue-200">{action.shortcut}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Feature highlights for new users */}
      {reports.length === 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">Getting Started with RadAI Copilot</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                title: 'Voice Dictation',
                desc: 'Click the microphone in Report Workspace to dictate findings. The AI will structure your report automatically.',
                icon: <Zap size={20} className="text-blue-500" />,
              },
              {
                title: 'Disease Auto-Format',
                desc: 'Type a disease name (e.g., "Kidney Stone") and get a complete report template instantly. No more typing from scratch.',
                icon: <Activity size={20} className="text-emerald-500" />,
              },
              {
                title: 'Spelling & Negative Fix',
                desc: 'The "Fix & Clean" button automatically corrects spelling errors and removes contradictory negatives that typists often miss.',
                icon: <ShieldAlert size={20} className="text-amber-500" />,
              },
            ].map((f) => (
              <div key={f.title} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                <div className="mb-2">{f.icon}</div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{f.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
