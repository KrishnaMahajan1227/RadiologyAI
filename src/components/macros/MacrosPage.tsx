import { useState } from 'react';
import { Zap, Plus, Trash2, Loader2, X, CreditCard as Edit3, Save, Search, Copy, CheckCheck, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import { getUsageStatus } from '../../lib/subscription';
import { UpgradeModal } from '../subscription/UpgradeModal';
import type { Macro } from '../../types';

const CATEGORIES = ['general', 'chest', 'neuro', 'musculoskeletal', 'abdomen', 'vascular', 'nuclear', 'pediatric'];

interface MacroFormProps {
  macro?: Macro | null;
  onClose: () => void;
  onSaved: (m: Macro) => void;
}

function MacroForm({ macro, onClose, onSaved }: MacroFormProps) {
  const { state } = useApp();
  const [trigger, setTrigger] = useState(macro?.trigger ?? '/');
  const [expansion, setExpansion] = useState(macro?.expansion ?? '');
  const [category, setCategory] = useState(macro?.category ?? 'general');
  const [description, setDescription] = useState(macro?.description ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!trigger.startsWith('/')) { setError('Trigger must start with /'); return; }
    if (!expansion.trim()) { setError('Expansion text is required'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        user_id: state.user!.id,
        trigger: trigger.trim(),
        expansion: expansion.trim(),
        category,
        description: description.trim(),
      };

      let data: Macro;
      if (macro) {
        const res = await supabase.from('macros').update(payload).eq('id', macro.id).select().single();
        if (res.error) throw res.error;
        data = res.data as Macro;
      } else {
        const res = await supabase.from('macros').insert(payload).select().single();
        if (res.error) throw res.error;
        data = res.data as Macro;
      }
      onSaved(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save macro');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200/70 dark:border-white/[0.06]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/70 dark:border-white/[0.06]">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            {macro ? 'Edit Macro' : 'New Macro'}
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Trigger *
                <span className="ml-1 text-slate-400 font-normal">(must start with /)</span>
              </label>
              <input
                type="text"
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                placeholder="/normal-chest"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm font-mono text-navy-600 dark:text-navy-400 placeholder-slate-400 focus:outline-none focus:border-navy-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full input-premium"
              >
                {CATEGORIES.map((c) => <option key={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this macro..."
                className="w-full input-premium"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Expansion Text *
                <span className="ml-1 text-slate-400 font-normal">({expansion.split(/\s+/).filter(Boolean).length} words)</span>
              </label>
              <textarea
                value={expansion}
                onChange={(e) => setExpansion(e.target.value)}
                rows={6}
                placeholder="Text to expand when the trigger is typed..."
                className="w-full resize-none input-premium font-mono leading-relaxed"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-navy-600 hover:bg-navy-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-xl transition-colors"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {macro ? 'Update' : 'Save Macro'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MacrosPage() {
  const { state, dispatch } = useApp();
  const usage = getUsageStatus(state.user, state.profile);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMacro, setEditingMacro] = useState<Macro | null>(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const openNewMacro = () => {
    if (usage.limitReached) { setShowUpgrade(true); return; }
    setEditingMacro(null);
    setShowForm(true);
  };

  const handleSaved = (m: Macro) => {
    if (editingMacro) {
      dispatch({ type: 'UPDATE_MACRO', macro: m });
    } else {
      dispatch({ type: 'ADD_MACRO', macro: m });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this macro?')) return;
    setDeleting(id);
    await supabase.from('macros').delete().eq('id', id);
    dispatch({ type: 'DELETE_MACRO', id });
    setDeleting(null);
  };

  const handleCopyExpansion = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = state.macros.filter((m) => {
    const matchSearch = m.trigger.toLowerCase().includes(search.toLowerCase()) ||
      m.expansion.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || m.category === filterCat;
    return matchSearch && matchCat;
  });

  const categories = Array.from(new Set(state.macros.map((m) => m.category)));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto animate-fadeIn">
      {showForm && (
        <MacroForm
          macro={editingMacro}
          onClose={() => { setShowForm(false); setEditingMacro(null); }}
          onSaved={handleSaved}
        />
      )}

      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} reportsUsed={usage.used} reportsLimit={usage.limit} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Macros</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {state.macros.length} macros · Type / in report to use
          </p>
        </div>
        <button
          onClick={openNewMacro}
          className="btn-primary w-full sm:w-auto justify-center"
        >
          {usage.limitReached ? <Lock size={16} /> : <Plus size={16} />}
          New Macro
        </button>
      </div>

      {/* How to use banner */}
      <div className="bg-navy-50 dark:bg-navy-900/10 border border-navy-100 dark:border-navy-900/30 rounded-2xl p-4 mb-5 flex items-start gap-3">
        <Zap size={16} className="text-navy-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-navy-800 dark:text-navy-300">How to use macros</p>
          <p className="text-xs text-navy-700 dark:text-navy-400 mt-0.5 leading-relaxed">
            In the Report Workspace input, type <code className="bg-navy-100 dark:bg-navy-900/40 px-1 rounded font-mono">/</code> followed by your trigger name. A dropdown will appear — press Enter or click to expand the macro.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-48 max-w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search macros..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:border-navy-500 text-slate-700 dark:text-slate-300 placeholder-slate-400 transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCat('all')}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${filterCat === 'all' ? 'bg-navy-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize transition-colors ${filterCat === cat ? 'bg-navy-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Zap size={48} className="text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">
            {state.macros.length === 0 ? 'No macros yet. Create shortcuts for common phrases.' : 'No macros match your search.'}
          </p>
          {state.macros.length === 0 && (
            <button onClick={openNewMacro} className="text-sm text-navy-600 dark:text-navy-400 hover:underline">
              Create macro
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <div key={m.id} className="card-premium hover:border-navy-300 dark:hover:border-navy-700 transition-all">
              <div className="flex items-start gap-4 p-4">
                <div className="shrink-0 bg-navy-50 dark:bg-navy-900/20 rounded-xl px-3 py-2">
                  <code className="text-sm font-bold text-navy-600 dark:text-navy-400">{m.trigger}</code>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {m.description && (
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{m.description}</p>
                    )}
                    <span className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full capitalize">
                      {m.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 font-mono">
                    {m.expansion}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    {m.expansion.split(/\s+/).filter(Boolean).length} words · used {m.usage_count} times
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleCopyExpansion(m.id, m.expansion)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Copy expansion"
                  >
                    {copied === m.id ? <CheckCheck size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                  <button
                    onClick={() => { setEditingMacro(m); setShowForm(true); }}
                    className="p-1.5 text-slate-400 hover:text-navy-600 dark:hover:text-navy-400 hover:bg-navy-50 dark:hover:bg-navy-900/20 rounded-lg transition-colors"
                    title="Edit macro"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    disabled={deleting === m.id}
                    className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete macro"
                  >
                    {deleting === m.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
