import { useState } from 'react';
import { LayoutTemplate, Plus, Trash2, Loader2, X, CreditCard as Edit3, Save, GripVertical, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import type { Template, TemplateSection, TemplateCondition } from '../../types';

const SCAN_TYPES = [
  'CT Chest', 'CT Abdomen/Pelvis', 'CT Head', 'CT Spine',
  'MRI Brain', 'MRI Spine', 'MRI Musculoskeletal',
  'X-Ray Chest', 'X-Ray Abdomen', 'Ultrasound Abdomen',
  'PET-CT', 'General',
];

function newSection(): TemplateSection {
  return {
    id: crypto.randomUUID(),
    label: 'New Section',
    placeholder: 'Enter details here...',
    required: false,
    type: 'text',
    options: [],
  };
}

function newCondition(): TemplateCondition {
  return {
    id: crypto.randomUUID(),
    trigger_keyword: '',
    add_section: '',
    section_content: '',
  };
}

interface TemplateEditorProps {
  template?: Template | null;
  onClose: () => void;
  onSaved: (t: Template) => void;
}

function TemplateEditor({ template, onClose, onSaved }: TemplateEditorProps) {
  const { state } = useApp();
  const [name, setName] = useState(template?.name ?? '');
  const [description, setDescription] = useState(template?.description ?? '');
  const [scanType, setScanType] = useState(template?.scan_type ?? 'CT Chest');
  const [sections, setSections] = useState<TemplateSection[]>(
    template?.structure?.length ? template.structure : [
      { id: crypto.randomUUID(), label: 'Technique', placeholder: 'Imaging technique details...', required: true, type: 'text' },
      { id: crypto.randomUUID(), label: 'Findings', placeholder: 'Imaging findings...', required: true, type: 'text' },
      { id: crypto.randomUUID(), label: 'Impression', placeholder: 'Clinical impression...', required: true, type: 'text' },
    ]
  );
  const [conditions, setConditions] = useState<TemplateCondition[]>(template?.conditions ?? []);
  const [saving, setSaving] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const updateSection = (id: string, update: Partial<TemplateSection>) => {
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, ...update } : s));
  };

  const removeSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (direction === 'up' && idx === 0) return prev;
      if (direction === 'down' && idx === prev.length - 1) return prev;
      const newArr = [...prev];
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      [newArr[idx], newArr[swapIdx]] = [newArr[swapIdx], newArr[idx]];
      return newArr;
    });
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        user_id: state.user!.id,
        name: name.trim(),
        description: description.trim(),
        scan_type: scanType,
        structure: sections,
        conditions,
        is_default: false,
      };

      let data: Template;
      if (template) {
        const res = await supabase.from('templates').update(payload).eq('id', template.id).select().single();
        if (res.error) throw res.error;
        data = res.data as Template;
      } else {
        const res = await supabase.from('templates').insert(payload).select().single();
        if (res.error) throw res.error;
        data = res.data as Template;
      }
      onSaved(data);
      onClose();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {template ? 'Edit Template' : 'New Template'}
          </h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Template Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Standard CT Chest"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Scan Type</label>
              <select
                value={scanType}
                onChange={(e) => setScanType(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
              >
                {SCAN_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description..."
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Sections */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                Sections ({sections.length})
              </label>
              <button
                onClick={() => setSections((p) => [...p, newSection()])}
                className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                <Plus size={12} /> Add Section
              </button>
            </div>
            <div className="space-y-2">
              {sections.map((section, idx) => (
                <div key={section.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <GripVertical size={14} className="text-gray-300 dark:text-gray-600 cursor-grab" />
                    <input
                      type="text"
                      value={section.label}
                      onChange={(e) => updateSection(section.id, { label: e.target.value })}
                      className="flex-1 bg-transparent text-sm font-medium text-gray-900 dark:text-white focus:outline-none"
                    />
                    <div className="flex items-center gap-1">
                      <button onClick={() => moveSection(section.id, 'up')} disabled={idx === 0} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 transition-colors">
                        <ChevronUp size={13} />
                      </button>
                      <button onClick={() => moveSection(section.id, 'down')} disabled={idx === sections.length - 1} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-30 transition-colors">
                        <ChevronDown size={13} />
                      </button>
                      <button
                        onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button onClick={() => removeSection(section.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  {expandedSection === section.id && (
                    <div className="px-3 pb-3 border-t border-gray-200 dark:border-gray-700 pt-2.5 space-y-2">
                      <div>
                        <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase">Placeholder</label>
                        <input
                          type="text"
                          value={section.placeholder}
                          onChange={(e) => updateSection(section.id, { placeholder: e.target.value })}
                          className="w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:border-blue-500 transition-all"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase">Type</label>
                          <select
                            value={section.type}
                            onChange={(e) => updateSection(section.id, { type: e.target.value as TemplateSection['type'] })}
                            className="mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 focus:outline-none transition-all"
                          >
                            <option value="text">Text</option>
                            <option value="select">Select</option>
                            <option value="checkbox">Checkbox</option>
                            <option value="measurement">Measurement</option>
                          </select>
                        </div>
                        <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer mt-3">
                          <input
                            type="checkbox"
                            checked={section.required}
                            onChange={(e) => updateSection(section.id, { required: e.target.checked })}
                            className="rounded"
                          />
                          Required
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Conditions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                Conditional Logic
              </label>
              <button
                onClick={() => setConditions((p) => [...p, newCondition()])}
                className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                <Plus size={12} /> Add Condition
              </button>
            </div>
            {conditions.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No conditions. Add rules like: if "nodule" detected → add nodule detail section.</p>
            ) : (
              <div className="space-y-2">
                {conditions.map((cond, i) => (
                  <div key={cond.id} className="bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 shrink-0">IF keyword:</span>
                      <input
                        type="text"
                        value={cond.trigger_keyword}
                        onChange={(e) => setConditions((p) => p.map((c, j) => j === i ? { ...c, trigger_keyword: e.target.value } : c))}
                        placeholder="e.g. lung nodule"
                        className="flex-1 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
                      />
                      <button onClick={() => setConditions((p) => p.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 transition-colors">
                        <X size={13} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 shrink-0">THEN add:</span>
                      <input
                        type="text"
                        value={cond.section_content}
                        onChange={(e) => setConditions((p) => p.map((c, j) => j === i ? { ...c, section_content: e.target.value } : c))}
                        placeholder="Section content to add..."
                        className="flex-1 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-xl transition-colors"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {template ? 'Update Template' : 'Save Template'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TemplatesPage() {
  const { state, dispatch } = useApp();
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleSaved = (t: Template) => {
    if (editingTemplate) {
      dispatch({ type: 'UPDATE_TEMPLATE', template: t });
    } else {
      dispatch({ type: 'ADD_TEMPLATE', template: t });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    setDeleting(id);
    await supabase.from('templates').delete().eq('id', id);
    dispatch({ type: 'DELETE_TEMPLATE', id });
    setDeleting(null);
  };

  const handleEdit = (t: Template) => {
    setEditingTemplate(t);
    setShowEditor(true);
  };

  const openNew = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {showEditor && (
        <TemplateEditor
          template={editingTemplate}
          onClose={() => { setShowEditor(false); setEditingTemplate(null); }}
          onSaved={handleSaved}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Templates</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{state.templates.length} templates</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus size={16} />
          New Template
        </button>
      </div>

      {state.templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <LayoutTemplate size={48} className="text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">No templates yet. Create your first template.</p>
          <button onClick={openNew} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Create template
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {state.templates.map((t) => (
            <div key={t.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-md">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <LayoutTemplate size={15} className="text-blue-500" />
                    </div>
                    {t.is_default && <Star size={13} className="text-amber-400 fill-amber-400" />}
                  </div>
                  <span className="text-[10px] font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                    {t.scan_type}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-0.5 truncate">{t.name}</h3>
                {t.description && <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{t.description}</p>}
                <div className="flex flex-wrap gap-1 mt-2">
                  {t.structure?.slice(0, 4).map((s) => (
                    <span key={s.id} className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                      {s.label}{s.required ? ' *' : ''}
                    </span>
                  ))}
                  {(t.structure?.length ?? 0) > 4 && (
                    <span className="text-[10px] text-gray-400 px-1">+{t.structure.length - 4} more</span>
                  )}
                </div>
                {t.conditions?.length > 0 && (
                  <p className="text-[10px] text-blue-500 dark:text-blue-400 mt-2">
                    {t.conditions.length} conditional rule{t.conditions.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <button
                  onClick={() => handleEdit(t)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  <Edit3 size={12} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={deleting === t.id}
                  className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  {deleting === t.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
