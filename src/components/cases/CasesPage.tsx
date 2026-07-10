import { useState } from 'react';
import {
  FolderOpen, Plus, Search, Filter, Loader2, X,
  User, Calendar, AlertCircle, CheckCircle2, Clock,
  ChevronRight, Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import type { Case } from '../../types';

const SCAN_TYPES = [
  'CT Chest', 'CT Abdomen/Pelvis', 'CT Head', 'CT Spine',
  'MRI Brain', 'MRI Spine', 'MRI Musculoskeletal',
  'X-Ray Chest', 'X-Ray Abdomen', 'X-Ray Extremity',
  'Ultrasound Abdomen', 'Ultrasound Pelvis', 'PET-CT', 'Other',
];

interface CreateCaseModalProps {
  onClose: () => void;
  onCreated: (c: Case) => void;
}

function CreateCaseModal({ onClose, onCreated }: CreateCaseModalProps) {
  const { state } = useApp();
  const [form, setForm] = useState({
    patient_name: '',
    patient_age: '',
    patient_gender: '',
    patient_cr_number: '',
    referring_doctor: '',
    scan_type: 'CT Chest',
    modality: 'CT',
    body_part: '',
    notes: '',
    priority: 'routine' as 'routine' | 'urgent' | 'stat',
    status: 'active' as 'active' | 'pending' | 'completed',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patient_name.trim()) { setError('Patient name is required'); return; }
    setLoading(true);
    setError('');
    try {
      const payload = {
        user_id: state.user!.id,
        patient_name: form.patient_name.trim(),
        patient_age: form.patient_age ? parseInt(form.patient_age) : null,
        patient_gender: form.patient_gender,
        patient_cr_number: form.patient_cr_number.trim(),
        referring_doctor: form.referring_doctor.trim(),
        scan_type: form.scan_type,
        modality: form.modality,
        body_part: form.body_part,
        notes: form.notes,
        priority: form.priority,
        status: form.status,
      };
      const { data, error: err } = await supabase.from('cases').insert(payload).select().single();
      if (err) throw err;
      onCreated(data as Case);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200/70 dark:border-white/[0.06]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/70 dark:border-white/[0.06]">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">New Case</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Patient Name *</label>
              <input
                type="text"
                value={form.patient_name}
                onChange={(e) => set('patient_name', e.target.value)}
                placeholder="Last, First"
                className="w-full input-premium"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Age</label>
              <input
                type="number"
                value={form.patient_age}
                onChange={(e) => set('patient_age', e.target.value)}
                placeholder="Age"
                min="0"
                max="150"
                className="w-full input-premium"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Gender</label>
              <select
                value={form.patient_gender}
                onChange={(e) => set('patient_gender', e.target.value)}
                className="w-full input-premium"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">CR / IP Number</label>
              <input
                type="text"
                value={form.patient_cr_number}
                onChange={(e) => set('patient_cr_number', e.target.value)}
                placeholder="CR/IP No."
                className="w-full input-premium"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Referring Doctor</label>
              <input
                type="text"
                value={form.referring_doctor}
                onChange={(e) => set('referring_doctor', e.target.value)}
                placeholder="Dr. Referring Name"
                className="w-full input-premium"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => set('priority', e.target.value)}
                className="w-full input-premium"
              >
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="stat">STAT</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Scan Type</label>
              <select
                value={form.scan_type}
                onChange={(e) => set('scan_type', e.target.value)}
                className="w-full input-premium"
              >
                {SCAN_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Body Part</label>
              <input
                type="text"
                value={form.body_part}
                onChange={(e) => set('body_part', e.target.value)}
                placeholder="e.g. Chest, Abdomen"
                className="w-full input-premium"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className="w-full input-premium"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Clinical Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Clinical indication, relevant history..."
                rows={3}
                className="w-full resize-none input-premium"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-navy-600 hover:bg-navy-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-xl transition-colors"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Create Case
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CasesPage() {
  const { state, dispatch, navigate } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleCreated = (c: Case) => {
    dispatch({ type: 'ADD_CASE', case: c });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this case? This cannot be undone.')) return;
    setDeleting(id);
    await supabase.from('cases').delete().eq('id', id);
    dispatch({ type: 'DELETE_CASE', id });
    setDeleting(null);
  };

  const filtered = state.cases.filter((c) => {
    const matchSearch = c.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      c.scan_type.toLowerCase().includes(search.toLowerCase()) ||
      c.notes.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchPriority = filterPriority === 'all' || c.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const statusIcon = (s: string) => {
    if (s === 'completed') return <CheckCircle2 size={15} className="text-emerald-500" />;
    if (s === 'active') return <AlertCircle size={15} className="text-navy-500" />;
    return <Clock size={15} className="text-slate-400" />;
  };

  const priorityBadge = (p: string) => {
    const colors: Record<string, string> = {
      stat: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      urgent: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
      routine: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    };
    return (
      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${colors[p] ?? colors.routine}`}>
        {p}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto animate-fadeIn">
      {showCreate && (
        <CreateCaseModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cases</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{state.cases.length} total · {state.cases.filter((c) => c.status === 'active').length} active</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary w-full sm:w-auto justify-center"
        >
          <Plus size={16} />
          New Case
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-48 max-w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients, scan types..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-navy-500 text-slate-700 dark:text-slate-300 placeholder-slate-400 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-navy-500 transition-all"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-navy-500 transition-all"
          >
            <option value="all">All priorities</option>
            <option value="stat">STAT</option>
            <option value="urgent">Urgent</option>
            <option value="routine">Routine</option>
          </select>
        </div>
      </div>

      {/* Cases grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderOpen size={48} className="text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {state.cases.length === 0 ? 'No cases yet. Create your first case.' : 'No cases match your filters.'}
          </p>
          {state.cases.length === 0 && (
            <button onClick={() => setShowCreate(true)} className="mt-3 text-sm text-navy-600 dark:text-navy-400 hover:underline">
              Create case
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const caseReports = state.reports.filter((r) => r.case_id === c.id);
            return (
              <div
                key={c.id}
                className="card-premium hover:border-navy-300 dark:hover:border-navy-700 transition-all hover:shadow-md group"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {statusIcon(c.status)}
                      <span className="text-xs capitalize text-slate-500 dark:text-slate-400">{c.status}</span>
                    </div>
                    {priorityBadge(c.priority)}
                  </div>

                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-0.5 truncate">{c.patient_name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{c.scan_type}{c.body_part ? ` · ${c.body_part}` : ''}{c.patient_age ? ` · Age ${c.patient_age}` : ''}</p>

                  {c.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 mb-3 bg-slate-50 dark:bg-white/[0.04] rounded-lg p-2">
                      {c.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <User size={11} />
                        {caseReports.length} report{caseReports.length !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 border-t border-slate-100 dark:border-white/[0.06] flex items-center gap-2">
                  <button
                    onClick={() => navigate('case-detail', c.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs text-navy-600 dark:text-navy-400 hover:text-navy-700 dark:hover:text-navy-300 font-medium transition-colors"
                  >
                    View Case <ChevronRight size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={deleting === c.id}
                    className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    {deleting === c.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
