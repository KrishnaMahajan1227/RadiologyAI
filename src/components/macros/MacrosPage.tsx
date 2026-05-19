import { useState } from 'react';
import { Zap, Plus, Trash2, Loader2, X, CreditCard as Edit3, Save, Search, Copy, CheckCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
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
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {macro ? 'Edit Macro' : 'New Macro'}
          </h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Trigger *
                <span className="ml-1 text-gray-400 font-normal">(must start with /)</span>
              </label>
              <input
                type="text"
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                placeholder="/normal-chest"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm font-mono text-blue-600 dark:text-blue-400 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
              >
                {CATEGORIES.map((c) => <option key={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this macro..."
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Expansion Text *
                <span className="ml-1 text-gray-400 font-normal">({expansion.split(/\s+/).filter(Boolean).length} words)</span>
              </label>
              <textarea
                value={expansion}
                onChange={(e) => setExpansion(e.target.value)}
                rows={6}
                placeholder="Text to expand when the trigger is typed..."
                className="w-full resize-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono leading-relaxed"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-xl transition-colors"
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
  const [showForm, setShowForm] = useState(false);
  const [editingMacro, setEditingMacro] = useState<Macro | null>(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

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
    <div className="p-6 max-w-6xl mx-auto">
      {showForm && (
        <MacroForm
          macro={editingMacro}
          onClose={() => { setShowForm(false); setEditingMacro(null); }}
          onSaved={handleSaved}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Macros</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {state.macros.length} macros · Type / in report to use
          </p>
        </div>
        <button
          onClick={() => { setEditingMacro(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus size={16} />
          New Macro
        </button>
      </div>

      {/* How to use banner */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 mb-5 flex items-start gap-3">
        <Zap size={16} className="text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">How to use macros</p>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-0.5 leading-relaxed">
            In the Report Workspace input, type <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded font-mono">/</code> followed by your trigger name. A dropdown will appear — press Enter or click to expand the macro.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-48 max-w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search macros..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-blue-500 text-gray-700 dark:text-gray-300 placeholder-gray-400 transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCat('all')}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${filterCat === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize transition-colors ${filterCat === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Zap size={48} className="text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
            {state.macros.length === 0 ? 'No macros yet. Create shortcuts for common phrases.' : 'No macros match your search.'}
          </p>
          {state.macros.length === 0 && (
            <button onClick={() => setShowForm(true)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Create macro
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <div key={m.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
              <div className="flex items-start gap-4 p-4">
                <div className="shrink-0 bg-blue-50 dark:bg-blue-900/20 rounded-xl px-3 py-2">
                  <code className="text-sm font-bold text-blue-600 dark:text-blue-400">{m.trigger}</code>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {m.description && (
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{m.description}</p>
                    )}
                    <span className="text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full capitalize">
                      {m.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 font-mono">
                    {m.expansion}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                    {m.expansion.split(/\s+/).filter(Boolean).length} words · used {m.usage_count} times
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleCopyExpansion(m.id, m.expansion)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Copy expansion"
                  >
                    {copied === m.id ? <CheckCheck size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                  <button
                    onClick={() => { setEditingMacro(m); setShowForm(true); }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Edit macro"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    disabled={deleting === m.id}
                    className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
