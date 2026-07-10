import { useState } from 'react';
import { ArrowLeft, FileText, Plus, Clock, CheckCircle2, AlertCircle, Loader2, Save, Eye, Download, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { buildReportHTML, openPDF } from '../reports/ReportHTML';
import type { Case, Report } from '../../types';

export function CaseDetail() {
  const { state, dispatch, navigate } = useApp();
  const caseItem = state.cases.find((c) => c.id === state.selectedCaseId);
  const caseReports = state.reports.filter((r) => r.case_id === state.selectedCaseId);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Case>>(caseItem ?? {});
  const [saving, setSaving] = useState(false);
  const [viewingReport, setViewingReport] = useState<Report | null>(null);

  const handleDownloadReport = (report: Report) => {
    const p = state.profile;
    const today = new Date(report.created_at);
    const dateStr = today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = today.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const sections: { label: string; content: string }[] = [];
    if (report.technique) sections.push({ label: 'Technique', content: report.technique });
    if (report.findings) sections.push({ label: 'Findings', content: report.findings });
    if (report.impression) sections.push({ label: 'Impression', content: report.impression });

    const html = buildReportHTML({
      profile: p ?? ({} as Record<string, unknown>),
      patientName: caseItem.patient_name,
      patientAge: caseItem.patient_age ? `${caseItem.patient_age} yrs` : '-',
      patientGender: caseItem.patient_gender || '-',
      patientCR: caseItem.patient_cr_number || '-',
      referringDoc: caseItem.referring_doctor || '-',
      patientScan: caseItem.scan_type,
      dateStr, timeStr,
      clinicalInfo: caseItem.notes || '-',
      sections,
      reportTitle: report.title || 'Radiology Report',
    });
    openPDF(html, report.title || 'Radiology_Report');
  };

  if (!caseItem) {
    return (
      <div className="p-6 text-center py-20">
        <p className="text-slate-500 dark:text-slate-400">Case not found.</p>
        <button onClick={() => navigate('cases')} className="mt-2 text-navy-600 dark:text-navy-400 text-sm hover:underline">
          Back to cases
        </button>
      </div>
    );
  }

  const handleSaveEdit = async () => {
    if (!caseItem) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('cases')
        .update(editForm)
        .eq('id', caseItem.id)
        .select()
        .single();
      if (error) throw error;
      if (data) dispatch({ type: 'UPDATE_CASE', case: data as Case });
      setEditing(false);
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const statusColor = {
    active: 'text-navy-500 bg-navy-50 dark:bg-navy-900/20',
    completed: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
    pending: 'text-slate-500 bg-slate-100 dark:bg-white/10',
  }[caseItem.status];

  const statusIcon = {
    active: <AlertCircle size={14} />,
    completed: <CheckCircle2 size={14} />,
    pending: <Clock size={14} />,
  }[caseItem.status];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 mb-6">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('cases')}
            className="shrink-0 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors tap-target"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900 dark:text-white truncate">{caseItem.patient_name}</h2>
              <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${statusColor}`}>
                {statusIcon}
                <span className="capitalize">{caseItem.status}</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {caseItem.scan_type}{caseItem.patient_age ? ` · Age ${caseItem.patient_age}` : ''}{caseItem.body_part ? ` · ${caseItem.body_part}` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="text-sm text-slate-500 dark:text-slate-400 px-3 py-2 hover:text-slate-700 dark:hover:text-slate-200 transition-colors tap-target">
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="btn-primary flex-1 sm:flex-initial justify-center"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setEditForm(caseItem); setEditing(true); }}
                className="btn-secondary flex-1 sm:flex-initial justify-center"
              >
                Edit
              </button>
              <button
                onClick={() => navigate('report')}
                className="btn-primary flex-1 sm:flex-initial justify-center"
              >
                <Plus size={14} />
                New Report
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Case info */}
        <div className="card-premium p-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Case Info</h3>
          {editing ? (
            <div className="space-y-3">
              {[
                { label: 'Patient Name', key: 'patient_name', type: 'text' },
                { label: 'Age', key: 'patient_age', type: 'number' },
                { label: 'Body Part', key: 'body_part', type: 'text' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={String(editForm[f.key as keyof Case] ?? '')}
                    onChange={(e) => setEditForm((p) => ({ ...p, [f.key]: f.type === 'number' ? parseInt(e.target.value) || '' : e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-navy-500 transition-all"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Priority</label>
                <select
                  value={editForm.priority ?? 'routine'}
                  onChange={(e) => setEditForm((p) => ({ ...p, priority: e.target.value as Case['priority'] }))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-navy-500 transition-all"
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="stat">STAT</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Status</label>
                <select
                  value={editForm.status ?? 'active'}
                  onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as Case['status'] }))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-navy-500 transition-all"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Notes</label>
                <textarea
                  value={editForm.notes ?? ''}
                  onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={4}
                  className="w-full resize-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-navy-500 transition-all"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Patient', value: caseItem.patient_name },
                { label: 'Age / Sex', value: caseItem.patient_age ? `${caseItem.patient_age} years / ${caseItem.patient_gender || 'N/A'}` : `N/A / ${caseItem.patient_gender || 'N/A'}` },
                { label: 'CR / IP Number', value: caseItem.patient_cr_number || 'Not specified' },
                { label: 'Referring Doctor', value: caseItem.referring_doctor || 'Not specified' },
                { label: 'Scan Type', value: caseItem.scan_type },
                { label: 'Body Part', value: caseItem.body_part || 'Not specified' },
                { label: 'Modality', value: caseItem.modality || 'Not specified' },
                { label: 'Priority', value: caseItem.priority },
                { label: 'Created', value: new Date(caseItem.created_at).toLocaleDateString() },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">{item.label}</p>
                  <p className="text-sm text-slate-900 dark:text-white capitalize">{item.value}</p>
                </div>
              ))}
              {caseItem.notes && (
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Notes</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{caseItem.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reports */}
        <div className="lg:col-span-2 card-premium">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.06]">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Reports ({caseReports.length})</h3>
            <button
              onClick={() => navigate('report')}
              className="flex items-center gap-1.5 text-xs text-navy-600 dark:text-navy-400 hover:text-navy-700 dark:hover:text-navy-300 font-medium transition-colors"
            >
              <Plus size={12} /> Generate report
            </button>
          </div>
          {caseReports.length === 0 ? (
            <div className="py-16 text-center">
              <FileText size={40} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No reports for this case yet</p>
              <button onClick={() => navigate('report')} className="mt-2 text-xs text-navy-600 dark:text-navy-400 hover:underline">
                Generate first report
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-white/[0.05]">
              {caseReports.map((r) => (
                <div key={r.id} className="px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{r.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {new Date(r.created_at).toLocaleString()} · {r.word_count} words · {r.status}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        onClick={() => setViewingReport(r)}
                        className="p-1.5 text-slate-400 hover:text-navy-600 dark:hover:text-navy-400 rounded-lg hover:bg-navy-50 dark:hover:bg-navy-900/20 transition-colors"
                        title="View full report"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleDownloadReport(r)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                        title="Download PDF"
                      >
                        <Download size={14} />
                      </button>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                        r.status === 'final' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                  {r.impression && (
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 bg-slate-50 dark:bg-white/[0.04] rounded-lg p-2">
                      <span className="font-medium text-slate-500 dark:text-slate-500">Impression: </span>
                      {r.impression}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report Viewer Modal */}
      {viewingReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-slate-200/70 dark:border-white/[0.06]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/70 dark:border-white/[0.06] shrink-0">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-navy-600 dark:text-navy-400" />
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">{viewingReport.title}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(viewingReport.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                    {' '} · {viewingReport.word_count} words · <span className="capitalize">{viewingReport.status}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDownloadReport(viewingReport)} className="flex items-center gap-1.5 bg-navy-600 hover:bg-navy-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                  <Download size={14} /> Download PDF
                </button>
                <button onClick={() => setViewingReport(null)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>
            {caseItem && (
              <div className="px-6 py-3 bg-slate-50 dark:bg-white/[0.04] border-b border-slate-200/70 dark:border-white/[0.06] shrink-0">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div><span className="text-slate-400 dark:text-slate-500">Patient: </span><span className="font-medium text-slate-900 dark:text-white">{caseItem.patient_name}</span></div>
                  <div><span className="text-slate-400 dark:text-slate-500">Age/Sex: </span><span className="font-medium text-slate-900 dark:text-white">{caseItem.patient_age || '-'} / {caseItem.patient_gender || '-'}</span></div>
                  <div><span className="text-slate-400 dark:text-slate-500">CR No: </span><span className="font-medium text-slate-900 dark:text-white">{caseItem.patient_cr_number || '-'}</span></div>
                  <div><span className="text-slate-400 dark:text-slate-500">Ref Dr: </span><span className="font-medium text-slate-900 dark:text-white">{caseItem.referring_doctor || '-'}</span></div>
                </div>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <section>
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Technique</h3>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-serif whitespace-pre-wrap">{viewingReport.technique || '-'}</p>
              </section>
              <section>
                <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Findings</h3>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-serif whitespace-pre-wrap">{viewingReport.findings || '-'}</p>
              </section>
              <section className="bg-navy-50 dark:bg-navy-900/10 rounded-xl p-4 border border-navy-100 dark:border-navy-900/30">
                <h3 className="text-xs font-semibold text-navy-600 dark:text-navy-400 uppercase tracking-widest mb-2">Impression</h3>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-serif whitespace-pre-wrap">{viewingReport.impression || '-'}</p>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
