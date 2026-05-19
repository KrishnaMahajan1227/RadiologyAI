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
        <p className="text-gray-500 dark:text-gray-400">Case not found.</p>
        <button onClick={() => navigate('cases')} className="mt-2 text-blue-600 dark:text-blue-400 text-sm hover:underline">
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
    active: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    completed: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
    pending: 'text-gray-500 bg-gray-100 dark:bg-gray-800',
  }[caseItem.status];

  const statusIcon = {
    active: <AlertCircle size={14} />,
    completed: <CheckCircle2 size={14} />,
    pending: <Clock size={14} />,
  }[caseItem.status];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <button
          onClick={() => navigate('cases')}
          className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{caseItem.patient_name}</h2>
            <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${statusColor}`}>
              {statusIcon}
              <span className="capitalize">{caseItem.status}</span>
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {caseItem.scan_type}{caseItem.patient_age ? ` · Age ${caseItem.patient_age}` : ''}{caseItem.body_part ? ` · ${caseItem.body_part}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="text-sm text-gray-500 dark:text-gray-400 px-3 py-2 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setEditForm(caseItem); setEditing(true); }}
                className="text-sm text-gray-600 dark:text-gray-400 px-3 py-2 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded-xl transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => navigate('report')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
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
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Case Info</h3>
          {editing ? (
            <div className="space-y-3">
              {[
                { label: 'Patient Name', key: 'patient_name', type: 'text' },
                { label: 'Age', key: 'patient_age', type: 'number' },
                { label: 'Body Part', key: 'body_part', type: 'text' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={String(editForm[f.key as keyof Case] ?? '')}
                    onChange={(e) => setEditForm((p) => ({ ...p, [f.key]: f.type === 'number' ? parseInt(e.target.value) || '' : e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Priority</label>
                <select
                  value={editForm.priority ?? 'routine'}
                  onChange={(e) => setEditForm((p) => ({ ...p, priority: e.target.value as Case['priority'] }))}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="stat">STAT</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Status</label>
                <select
                  value={editForm.status ?? 'active'}
                  onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as Case['status'] }))}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Notes</label>
                <textarea
                  value={editForm.notes ?? ''}
                  onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
                  rows={4}
                  className="w-full resize-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
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
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">{item.label}</p>
                  <p className="text-sm text-gray-900 dark:text-white capitalize">{item.value}</p>
                </div>
              ))}
              {caseItem.notes && (
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Notes</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{caseItem.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reports */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Reports ({caseReports.length})</h3>
            <button
              onClick={() => navigate('report')}
              className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              <Plus size={12} /> Generate report
            </button>
          </div>
          {caseReports.length === 0 ? (
            <div className="py-16 text-center">
              <FileText size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No reports for this case yet</p>
              <button onClick={() => navigate('report')} className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                Generate first report
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {caseReports.map((r) => (
                <div key={r.id} className="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {new Date(r.created_at).toLocaleString()} · {r.word_count} words · {r.status}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        onClick={() => setViewingReport(r)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="View full report"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleDownloadReport(r)}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                        title="Download PDF"
                      >
                        <Download size={14} />
                      </button>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                        r.status === 'final' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                        'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                  {r.impression && (
                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                      <span className="font-medium text-gray-500 dark:text-gray-500">Impression: </span>
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
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-blue-600 dark:text-blue-400" />
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">{viewingReport.title}</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(viewingReport.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                    {' '} · {viewingReport.word_count} words · <span className="capitalize">{viewingReport.status}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDownloadReport(viewingReport)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                  <Download size={14} /> Download PDF
                </button>
                <button onClick={() => setViewingReport(null)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>
            {caseItem && (
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 shrink-0">
                <div className="grid grid-cols-4 gap-3 text-xs">
                  <div><span className="text-gray-400 dark:text-gray-500">Patient: </span><span className="font-medium text-gray-900 dark:text-white">{caseItem.patient_name}</span></div>
                  <div><span className="text-gray-400 dark:text-gray-500">Age/Sex: </span><span className="font-medium text-gray-900 dark:text-white">{caseItem.patient_age || '-'} / {caseItem.patient_gender || '-'}</span></div>
                  <div><span className="text-gray-400 dark:text-gray-500">CR No: </span><span className="font-medium text-gray-900 dark:text-white">{caseItem.patient_cr_number || '-'}</span></div>
                  <div><span className="text-gray-400 dark:text-gray-500">Ref Dr: </span><span className="font-medium text-gray-900 dark:text-white">{caseItem.referring_doctor || '-'}</span></div>
                </div>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <section>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Technique</h3>
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-serif whitespace-pre-wrap">{viewingReport.technique || '-'}</p>
              </section>
              <section>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Findings</h3>
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-serif whitespace-pre-wrap">{viewingReport.findings || '-'}</p>
              </section>
              <section className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 border border-blue-100 dark:border-blue-900/30">
                <h3 className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Impression</h3>
                <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-serif whitespace-pre-wrap">{viewingReport.impression || '-'}</p>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
