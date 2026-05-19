import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  Mic, MicOff, Wand2, Loader2, Copy, Download, Save,
  CheckCheck, ChevronDown, Zap, X, Volume2, AlertCircle,
  Stethoscope, SpellCheck, Eye, FileText,
  Activity, ClipboardCheck, AlertTriangle,
  ChevronRight, CheckSquare, TrendingUp,
  Layers, Clock, RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { CopilotPanel } from './CopilotPanel';
import { MistakeDetector } from './MistakeDetector';
import { buildReportHTML, openPDF } from './ReportHTML';
import { supabase } from '../../lib/supabase';
import {
  runFullPipeline, suggestImprovements, detectErrors, generateDifferential,
  generateDiseaseFormat, fixSpellingAndNegatives,
} from '../../lib/ai';
import type { Suggestion, ReportError, Differential, StructuredData, Report } from '../../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const SCAN_TYPES = [
  'CT Chest', 'CT Abdomen/Pelvis', 'CT Head', 'CT Spine', 'CT Extremity',
  'MRI Brain', 'MRI Spine', 'MRI Musculoskeletal', 'MRI Abdomen',
  'X-Ray Chest', 'X-Ray Abdomen', 'X-Ray Extremity', 'X-Ray Spine',
  'Ultrasound Abdomen', 'Ultrasound Pelvis', 'Ultrasound Thyroid',
  'Ultrasound Obstetric', 'Ultrasound Breast', 'Ultrasound Musculoskeletal',
  'Ultrasound Scrotal', 'Ultrasound Renal', 'Ultrasound Carotid Doppler',
  'PET-CT', 'Nuclear Medicine', 'Fluoroscopy', 'Mammography',
];

const COMMON_DISEASES = [
  'Lung Cancer', 'Pulmonary Nodule', 'Pulmonary Embolism', 'Pneumonia',
  'Kidney Stone', 'Nephrolithiasis', 'Gallstones', 'Cholecystitis',
  'Liver Cirrhosis', 'Hepatocellular Carcinoma', 'Pancreatitis',
  'Stroke', 'Intracranial Hemorrhage', 'Subdural Hematoma',
  'Multiple Sclerosis', 'Brain Tumor', 'Meningioma',
  'Rib Fracture', 'Pneumothorax', 'Pleural Effusion',
  'Aortic Aneurysm', 'Appendicitis', 'Diverticulitis',
  'Bowel Obstruction', 'Hydronephrosis', 'Renal Cell Carcinoma',
  'Thyroid Nodule', 'Ovarian Cyst', 'Fibroid',
  'Breast Cancer', 'Prostate Cancer', 'Bone Metastasis',
];

// Workflow steps
const WORKFLOW_STEPS = [
  { id: 1, label: 'Patient & Scan' },
  { id: 2, label: 'Dictation' },
  { id: 3, label: 'Generating' },
  { id: 4, label: 'Review' },
  { id: 5, label: 'Finalize' },
];

// Inline clinical hints triggered by keyword presence
const CLINICAL_HINTS: { keyword: string; hint: string; urgent?: boolean }[] = [
  { keyword: 'kidney stone', hint: 'Document stone size, UVJ level, and check for hydronephrosis.' },
  { keyword: 'nephrolithiasis', hint: 'Document stone size, UVJ level, and check for hydronephrosis.' },
  { keyword: 'pneumonia', hint: 'Assess for pleural effusion, cavitation, or abscess.' },
  { keyword: 'stroke', hint: 'ASPECT score, territory, midline shift, hemorrhagic transformation required.', urgent: true },
  { keyword: 'pulmonary nodule', hint: 'Apply Fleischner Society criteria. Document size, morphology, follow-up interval.' },
  { keyword: 'liver lesion', hint: 'Consider LI-RADS if cirrhotic background. Document arterial enhancement.' },
  { keyword: 'fracture', hint: 'Document displacement, angulation, alignment, joint surface involvement.' },
  { keyword: 'pulmonary embolism', hint: 'Assess right heart strain. Document as central/lobar/segmental/subsegmental.', urgent: true },
  { keyword: 'aortic', hint: 'Document maximal diameter, extent, and branch vessel involvement.', urgent: true },
  { keyword: 'intracranial hemorrhage', hint: 'Document hematoma volume, mass effect, midline shift, herniation.', urgent: true },
  { keyword: 'appendicitis', hint: 'Document appendix diameter, fat stranding, free fluid, perforation.' },
  { keyword: 'hydronephrosis', hint: 'Grade hydronephrosis. Identify obstructing cause. Document cortical thickness.' },
  { keyword: 'cerebral atrophy',
    hint: 'State whether atrophy is age-appropriate. For patients under 50, explicitly note if prominent for age. Apply GCA grading (Grade 0–3).',
    urgent: false },
  { keyword: 'white matter',
    hint: 'Apply Fazekas grading (Grade 0–3). For patients under 50 with Fazekas ≥1, provide differential (microvascular, demyelination, migraine). Document DWI restriction status.',
    urgent: false },
  { keyword: 'demyelination',
    hint: 'Document lesion distribution (periventricular, juxtacortical, infratentorial, spinal). Consider McDonald criteria applicability. Recommend neurology referral.',
    urgent: true },
  { keyword: 'fazekas',
    hint: 'Fazekas I: non-specific, usually benign. Fazekas II+: consider vascular risk factor workup. Always correlate with patient age.',
    urgent: false },
];

// Contradiction pairs for safety check
const CONTRADICTION_PAIRS = [
  { findingKw: 'hydronephrosis', impressionKw: 'no abnormality', label: 'Hydronephrosis vs No Abnormality' },
  { findingKw: 'pleural effusion', impressionKw: 'no pleural', label: 'Pleural Effusion vs No Pleural Effusion' },
  { findingKw: 'fracture', impressionKw: 'no fracture', label: 'Fracture vs No Fracture' },
  { findingKw: 'pneumothorax', impressionKw: 'no pneumothorax', label: 'Pneumothorax vs No Pneumothorax' },
  { findingKw: 'mass', impressionKw: 'no mass', label: 'Mass vs No Mass' },
  { findingKw: 'hemorrhage', impressionKw: 'no hemorrhage', label: 'Hemorrhage vs No Hemorrhage' },
  { findingKw: 'right', impressionKw: 'left', label: 'Laterality mismatch — Right vs Left' },
  { findingKw: 'mri', impressionKw: 'ct scan', label: 'Modality mismatch — MRI findings with CT in impression' },
  { findingKw: 'signal intensity', impressionKw: 'ct', label: 'MRI terminology in a CT-labelled report' },
  { findingKw: 'hounsfield', impressionKw: 'mri', label: 'CT terminology in an MRI-labelled report' },
  { findingKw: 'diffusion restriction', impressionKw: 'ct', label: 'DWI (MRI) finding in a CT report' },
];

// ─── Quality Engine ───────────────────────────────────────────────────────────

interface QualityResult {
  score: number;
  badge: 'Excellent' | 'Good' | 'Needs Review' | 'Incomplete';
  badgeColor: string;
  checks: { label: string; passed: boolean; critical: boolean }[];
  contradictions: string[];
  hints: { hint: string; urgent?: boolean }[];
}

function computeQuality(technique: string, findings: string, impression: string, scanType: string): QualityResult {
  const f = findings.toLowerCase();
  const i = impression.toLowerCase();
  const t = technique.toLowerCase();
  const combined = f + ' ' + i;

  const checks = [
    { label: 'Technique documented', passed: t.trim().length > 20, critical: false },
    { label: 'Findings present', passed: f.trim().length > 50, critical: true },
    { label: 'Impression complete (min 3 numbered points)',
      passed: i.trim().length > 40 && (i.match(/^\d+\./gm) || []).length >= 2,
      critical: true },
    { label: 'Laterality specified (where relevant)',
      passed: /right|left|bilateral|midline|central/.test(combined), critical: false },
    { label: 'Measurements included (where relevant)',
      passed: /\d+(\.\d+)?\s*(mm|cm|x)/.test(combined), critical: false },
    { label: 'No contradictions', passed: true, critical: true },
    { label: 'Recommendations / follow-up stated',
      passed: /recommend|follow.up|suggest|advise|correlation|referral|repeat/.test(i), critical: false },
    { label: 'Report length adequate', passed: (f + i).split(/\s+/).length > 40, critical: false },
    { label: 'Differential provided for non-specific findings',
      passed: !/non.specific|uncertain|cannot exclude/.test(i) ||
              /differential|consider|include|vs\./.test(i), critical: false },
    { label: 'Grading used (Fazekas/GCA/Fleischner if applicable)',
      passed: !/white matter|ischaemic change|cerebral atro|nodule/i.test(combined) ||
              /fazekas|gca grade|fleischner|li-rads/i.test(combined), critical: false },
    { label: 'Age-appropriate comment for atrophy',
      passed: !/cerebral atro/i.test(combined) ||
              /age|appropriate|prominent for|years/i.test(i), critical: false },
    { label: 'Modality terminology consistent',
      passed: !(/\bmri\b/i.test(scanType) && /hounsfield|hypodense|hyperdense/i.test(combined)) &&
              !(/\bct\b/i.test(scanType) && /t2|flair|dwi|signal intensity/i.test(combined)), critical: true },
  ];

  const contradictions: string[] = [];
  for (const pair of CONTRADICTION_PAIRS) {
    if (f.includes(pair.findingKw) && i.includes(pair.impressionKw)) {
      contradictions.push(pair.label);
    }
  }
  if (contradictions.length > 0) checks[5].passed = false;

  const activeHints = CLINICAL_HINTS.filter(h => combined.includes(h.keyword));

  const passedCritical = checks.filter(c => c.critical).every(c => c.passed);
  // Critical checks = 12 pts each, non-critical = 6 pts each
  const totalScore = checks.reduce((sum, c) => sum + (c.passed ? (c.critical ? 12 : 6) : 0), 0);
  const maxScore = checks.reduce((sum, c) => sum + (c.critical ? 12 : 6), 0);
  const score = Math.round((totalScore / maxScore) * 100);

  let badge: QualityResult['badge'];
  let badgeColor: string;
  if (!passedCritical || score < 50) {
    badge = 'Incomplete';
    badgeColor = 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
  } else if (score < 70) {
    badge = 'Needs Review';
    badgeColor = 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800';
  } else if (score < 92) {
    badge = 'Good';
    badgeColor = 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
  } else {
    badge = 'Excellent';
    badgeColor = 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800';
  }

  return { score, badge, badgeColor, checks, contradictions, hints: activeHints };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Compact workflow progress bar */
function WorkflowBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-0 shrink-0 overflow-x-auto px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      {WORKFLOW_STEPS.map((step, idx) => (
        <div key={step.id} className="flex items-center">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all whitespace-nowrap
            ${currentStep === step.id
              ? 'bg-blue-600 text-white'
              : currentStep > step.id
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-400 dark:text-gray-600'}`}>
            {currentStep > step.id
              ? <CheckCheck size={9} />
              : <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold border
                  ${currentStep === step.id ? 'border-white/40 bg-white/20' : 'border-gray-300 dark:border-gray-700'}`}>
                  {step.id}
                </span>}
            {step.label}
          </div>
          {idx < WORKFLOW_STEPS.length - 1 && (
            <ChevronRight size={10} className="text-gray-200 dark:border-gray-700 mx-0.5 shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}

/** Lightweight inline contradiction alert — shown only when contradictions exist */
function ContradictionAlert({ contradictions }: { contradictions: string[] }) {
  if (!contradictions.length) return null;
  return (
    <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
      <AlertTriangle size={12} className="text-red-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-0.5">Impression Mismatch</p>
        {contradictions.map((c, i) => (
          <p key={i} className="text-[11px] text-red-600 dark:text-red-400">{c}</p>
        ))}
      </div>
    </div>
  );
}

/** Subtle clinical hint pill — non-blocking, dismissible */
function ClinicalHintPill({ hint, urgent }: { hint: string; urgent?: boolean }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className={`flex items-start gap-2 px-3 py-2 rounded-lg text-[11px] leading-snug
      ${urgent
        ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
        : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
      <Activity size={10} className="shrink-0 mt-0.5 opacity-60" />
      <span className="flex-1">{hint}</span>
      <button onClick={() => setDismissed(true)} className="shrink-0 opacity-40 hover:opacity-70 transition-opacity">
        <X size={10} />
      </button>
    </div>
  );
}

/** Quality badge — compact, shown in report title bar */
function QualityBadge({ quality, onClick }: { quality: QualityResult; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 transition-opacity hover:opacity-80 ${quality.badgeColor}`}>
      <CheckSquare size={9} />
      {quality.badge} · {quality.score}%
    </button>
  );
}

/** Collapsible quality checklist panel */
function QualityChecklist({ quality, visible }: { quality: QualityResult; visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
        <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[1.8px]">Report Checklist</p>
      </div>
      <div className="px-4 py-3 grid grid-cols-2 gap-1.5">
        {quality.checks.map((check, idx) => (
          <div key={idx} className={`flex items-center gap-1.5 text-[11px]
            ${check.passed ? 'text-gray-500 dark:text-gray-400' : check.critical ? 'text-red-600 dark:text-red-400 font-medium' : 'text-amber-600 dark:text-amber-400'}`}>
            {check.passed
              ? <CheckCheck size={9} className="text-emerald-500 shrink-0" />
              : <AlertCircle size={9} className={`shrink-0 ${check.critical ? 'text-red-500' : 'text-amber-500'}`} />}
            {check.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Final review / finalize modal */
function FinalizationModal({
  technique, findings, impression, quality,
  onConfirm, onClose,
}: {
  technique: string; findings: string; impression: string;
  quality: QualityResult;
  onConfirm: () => void; onClose: () => void;
}) {
  const [approved, setApproved] = useState(false);

  const { state } = useApp();
  const p = state?.profile ?? {};
  const regNumber = (p as Record<string, unknown>)?.registration_number as string | undefined;

  const checklist = [
    { label: 'Technique is present and appropriate', done: technique.trim().length > 10 },
    { label: 'Findings section is complete', done: findings.trim().length > 40 },
    { label: 'Impression is present and verified', done: impression.trim().length > 10 },
    { label: 'No critical contradictions', done: quality.contradictions.length === 0 },
    { label: 'Measurements documented where applicable', done: /\d+(\.\d+)?\s*(mm|cm)/.test(findings + impression) },
    { label: 'Laterality verified where applicable', done: /right|left|bilateral|midline/.test(findings + impression) },
    { label: 'Clinical recommendations included', done: /recommend|follow.up|suggest|advise|referral/.test(impression.toLowerCase()) },
    { label: 'MCI/NMC Reg. No. is set (legally required)',
      done: !!(regNumber && regNumber.trim() !== '') },
    { label: 'Grading applied (Fazekas/GCA if brain MRI)',
      done: !/white matter|cerebral atro/i.test(findings + impression) ||
            /fazekas|gca grade/i.test(findings + impression) },
    { label: 'Modality terminology consistent (no CT in MRI or vice versa)',
      done: quality.checks.find(c => c.label === 'Modality terminology consistent')?.passed ?? true },
    { label: 'Age-appropriate comment included for atrophy',
      done: !/cerebral atro/i.test(findings + impression) ||
            /age|prominent for|years/i.test(impression) },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-800"
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <ClipboardCheck size={15} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Final Report Review</h2>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">Verify before finalizing</p>
          </div>
          <span className={`text-[9px] font-bold px-2 py-1 rounded-full border shrink-0 ${quality.badgeColor}`}>
            {quality.badge}
          </span>
        </div>

        {/* Checklist */}
        <div className="px-6 py-4 space-y-1.5">
          {checklist.map((item, i) => (
            <div key={i} className={`flex items-center gap-2.5 py-1.5 px-3 rounded-lg
              ${item.done ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-red-50 dark:bg-red-950/30'}`}>
              {item.done
                ? <CheckCheck size={12} className="text-emerald-500 shrink-0" />
                : <AlertCircle size={12} className="text-red-400 shrink-0" />}
              <span className={`text-[12px] font-medium
                ${item.done ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600 dark:text-red-400'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Contradictions */}
        {quality.contradictions.length > 0 && (
          <div className="mx-6 mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1.5">
              Impression Safety Violations
            </p>
            {quality.contradictions.map((c, i) => (
              <p key={i} className="text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" /> {c}
              </p>
            ))}
          </div>
        )}

        {/* Radiologist confirmation */}
        <div className="px-6 pb-4">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <div
              onClick={() => setApproved(!approved)}
              className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0
                ${approved ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-600'}`}>
              {approved && <CheckCheck size={9} className="text-white" />}
            </div>
            <span className="text-[11px] text-gray-600 dark:text-gray-400 leading-snug">
              I confirm this report has been reviewed, is medically accurate, and is approved for finalization.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="px-6 pb-5 flex gap-2.5">
          <button onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Back to Edit
          </button>
          <button onClick={onConfirm} disabled={!approved}
            className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors">
            Finalize & Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}

/** Auto-expanding textarea */
function AutoTextarea({
  value, onChange, placeholder, minRows = 3, className = '', style,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  minRows?: number; className?: string; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = 'auto';
    ref.current.style.height = ref.current.scrollHeight + 'px';
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={minRows}
      className={className}
      style={{ resize: 'none', overflow: 'hidden', ...style }}
    />
  );
}

/** Report section — Technique / Findings / Impression */
function ReportSection({
  id, label, value, onChange, placeholder, variant = 'default', badge, minRows,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; variant?: 'default' | 'findings' | 'impression';
  badge?: string; minRows?: number;
}) {
  const styles = {
    default: {
      wrapper: 'border-gray-200 dark:border-gray-800',
      header: 'bg-gray-50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400',
      text: 'text-gray-700 dark:text-gray-300',
    },
    findings: {
      wrapper: 'border-gray-200 dark:border-gray-800',
      header: 'bg-gray-50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400',
      text: 'text-gray-800 dark:text-gray-200',
    },
    impression: {
      wrapper: 'border-blue-200 dark:border-blue-900 border-l-4 border-l-blue-500 dark:border-l-blue-600',
      header: 'bg-blue-50 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900 text-blue-700 dark:text-blue-400',
      text: 'text-gray-900 dark:text-gray-100 font-medium',
    },
  }[variant];

  const wordCount = value.trim() ? value.split(/\s+/).filter(Boolean).length : 0;

  return (
    <section id={id} className={`bg-white dark:bg-gray-900 rounded-xl border ${styles.wrapper} overflow-hidden`}>
      <div className={`flex items-center justify-between px-4 py-2 ${styles.header} sticky top-0 z-10`}>
        <div className="flex items-center gap-2">
          <h3 className="text-[9px] font-bold uppercase tracking-[2px]">{label}</h3>
          {badge && (
            <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded bg-white/50 dark:bg-black/20 border border-current/20 opacity-60">
              {badge}
            </span>
          )}
        </div>
        {wordCount > 0 && (
          <span className="text-[9px] opacity-40 font-mono">{wordCount}w</span>
        )}
      </div>
      <AutoTextarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        minRows={minRows ?? (variant === 'findings' ? 8 : variant === 'impression' ? 5 : 2)}
        className={`w-full px-4 py-4 text-[13px] bg-transparent focus:outline-none leading-[1.8] ${styles.text}`}
        style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
      />
    </section>
  );
}

// ─── Report Viewer Modal ──────────────────────────────────────────────────────

function ReportViewerModal({ report, onClose }: { report: Report; onClose: () => void }) {
  const { state } = useApp();
  const linkedCase = state.cases.find((c) => c.id === report.case_id);
  const p = state.profile ?? ({} as Record<string, unknown>);

  const handleDownload = () => {
    const today = new Date(report.created_at);
    const dateStr = today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = today.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const sections: { label: string; content: string }[] = [];
    if (report.technique) sections.push({ label: 'Technique', content: report.technique });
    if (report.findings) sections.push({ label: 'Findings', content: report.findings });
    if (report.impression) sections.push({ label: 'Impression', content: report.impression });
    const html = buildReportHTML({
      profile: p as Record<string, unknown>,
      patientName: linkedCase?.patient_name || '[Patient Name]',
      patientAge: linkedCase?.patient_age ? `${linkedCase.patient_age} yrs` : '-',
      patientGender: linkedCase?.patient_gender || '-',
      patientCR: linkedCase?.patient_cr_number || '-',
      referringDoc: linkedCase?.referring_doctor || '-',
      patientScan: linkedCase?.scan_type || report.title?.split(' ')[0] || '-',
      dateStr, timeStr,
      clinicalInfo: linkedCase?.notes || '-',
      sections,
      reportTitle: report.title,
    });
    openPDF(html, report.title || 'Radiology_Report');
  };

  const renderText = (text: string) =>
    text.split('\n').filter(l => l.trim()).map((line, i) => {
      const hasBold = line.includes('**');
      const parts = hasBold
        ? line.split(/(\*\*.*?\*\*)/g).map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j} className="text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>
            : <span key={j}>{part}</span>)
        : [line];
      return (
        <p key={i} className="text-[13px] leading-[1.8] whitespace-pre-wrap text-gray-700 dark:text-gray-300 mb-1">
          {parts}
        </p>
      );
    });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-800"
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText size={14} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">{report.title || 'Untitled Report'}</h2>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                {new Date(report.created_at).toLocaleString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit', hour12: true,
                })}
                {' '} · {report.word_count || 0} words ·{' '}
                <span className="capitalize">{report.status || 'draft'}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDownload}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
              <Download size={12} /> Download PDF
            </button>
            <button onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Patient info strip */}
        {linkedCase && (
          <div className="px-6 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div className="grid grid-cols-4 gap-4 text-[11px]">
              {[
                { label: 'Patient', value: linkedCase.patient_name },
                { label: 'Age / Sex', value: `${linkedCase.patient_age || '-'} / ${linkedCase.patient_gender || '-'}` },
                { label: 'CR No.', value: linkedCase.patient_cr_number || '-' },
                { label: 'Ref. Doctor', value: linkedCase.referring_doctor || '-' },
              ].map(item => (
                <div key={item.label}>
                  <span className="text-gray-400 dark:text-gray-500 block text-[10px] uppercase tracking-wide">{item.label}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Report body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
          {report.technique && (
            <section>
              <h3 className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[2.5px] border-b border-gray-100 dark:border-gray-800 pb-1.5 mb-3">
                Technique
              </h3>
              <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-[1.8] whitespace-pre-wrap">{report.technique}</p>
            </section>
          )}
          {report.findings && (
            <section>
              <h3 className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[2.5px] border-b border-gray-100 dark:border-gray-800 pb-1.5 mb-3">
                Findings
              </h3>
              {renderText(report.findings)}
            </section>
          )}
          {report.impression && (
            <section className="border border-blue-100 dark:border-blue-900/40 rounded-xl p-5 bg-blue-50/40 dark:bg-blue-950/20">
              <h3 className="text-[9px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-[2.5px] border-b border-blue-200 dark:border-blue-800 pb-1.5 mb-3">
                Impression
              </h3>
              {renderText(report.impression)}
            </section>
          )}
          {report.input_text && (
            <details className="bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <summary className="px-4 py-2.5 text-[9px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Original Dictation
              </summary>
              <p className="px-4 pb-4 pt-2 text-[12px] text-gray-500 dark:text-gray-400 whitespace-pre-wrap font-mono leading-relaxed">
                {report.input_text}
              </p>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main ReportWorkspace ─────────────────────────────────────────────────────

export function ReportWorkspace() {
  const { state, dispatch } = useApp();

  // Core report state
  const [inputText, setInputText] = useState('');
  const [scanType, setScanType] = useState('CT Chest');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [technique, setTechnique] = useState('');
  const [findings, setFindings] = useState('');
  const [impression, setImpression] = useState('');
  const [structured, setStructured] = useState<StructuredData>({});
  const [reportTitle, setReportTitle] = useState('');

  // AI / generation state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [errors, setErrors] = useState<ReportError[]>([]);
  const [differential, setDifferential] = useState<Differential[]>([]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingDisease, setGeneratingDisease] = useState(false);
  const [fixingSpelling, setFixingSpelling] = useState(false);
  const [error, setError] = useState<string>('');

  // Template / macro state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [templateSections, setTemplateSections] = useState<{ id: string; label: string; content: string }[]>([]);
  const [activeMacros, setActiveMacros] = useState(false);
  const [macroSearch, setMacroSearch] = useState('');
  const [showMacroDropdown, setShowMacroDropdown] = useState(false);

  // Disease picker
  const [diseaseSearch, setDiseaseSearch] = useState('');
  const [showDiseasePicker, setShowDiseasePicker] = useState(false);

  // UI state
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const [showSavedReports, setShowSavedReports] = useState(false);
  const [showQuality, setShowQuality] = useState(false);
  const [showFinalize, setShowFinalize] = useState(false);
  const [spellingResult, setSpellingResult] = useState<{
    corrected_report: string;
    spelling_fixes: Array<{ original: string; corrected: string }>;
    negatives_removed: Array<{ removed_text: string; reason: string }>;
    total_changes: number;
  } | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const macroRef = useRef<HTMLDivElement>(null);
  const diseaseRef = useRef<HTMLDivElement>(null);

  const hasReport = !!(technique || findings || impression);

  const buildLearningContext = useCallback((): string => '', []);

  const { isListening, transcript, interimText, start: startVoice, stop: stopVoice, reset: resetVoice, supported: voiceSupported } = useVoiceInput(
    (text) => setInputText(text)
  );

  const displayText = isListening && interimText
    ? (inputText ? inputText + ' ' + interimText : interimText)
    : inputText;

  // ── Workflow step ──────────────────────────────────────────────────────────
  const workflowStep = useMemo(() => {
    if (generating || generatingDisease) return 3;
    if (hasReport) return 4;
    if (inputText.trim()) return 2;
    return 1;
  }, [hasReport, generating, generatingDisease, inputText]);

  // ── Quality score ──────────────────────────────────────────────────────────
  const quality = useMemo(() =>
    hasReport ? computeQuality(technique, findings, impression, scanType) : null,
    [technique, findings, impression, scanType, hasReport]);

  // ── Clinical hints ─────────────────────────────────────────────────────────
  const activeHints = useMemo(() => {
    if (!hasReport) return [];
    const combined = (findings + ' ' + impression).toLowerCase();
    return CLINICAL_HINTS.filter(h => combined.includes(h.keyword));
  }, [findings, impression, hasReport]);

  // ── Macro detection ────────────────────────────────────────────────────────
  useEffect(() => {
    const slashIdx = inputText.lastIndexOf('/');
    if (slashIdx !== -1 && !inputText.slice(slashIdx).includes('\n')) {
      const query = inputText.slice(slashIdx + 1).toLowerCase().split(/\s/)[0];
      setMacroSearch(query);
      setShowMacroDropdown(true);
    } else {
      setShowMacroDropdown(false);
    }
  }, [inputText]);

  const allMacros = [...state.macros];
  const filteredMacros = allMacros.filter((m) =>
    m.trigger.toLowerCase().includes('/' + macroSearch) || m.expansion.toLowerCase().includes(macroSearch)
  ).slice(0, 8);

  const applyMacro = (macro: { trigger: string; expansion: string }) => {
    const slashIdx = inputText.lastIndexOf('/');
    const beforeSlash = inputText.slice(0, slashIdx);
    const afterSlashWord = inputText.slice(slashIdx).split(/\s/).slice(1).join(' ');
    setInputText(beforeSlash + macro.expansion + (afterSlashWord ? ' ' + afterSlashWord : ''));
    setShowMacroDropdown(false);
    inputRef.current?.focus();
  };

  // ── Template handling ──────────────────────────────────────────────────────
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) { setTemplateSections([]); return; }
    const tmpl = state.templates.find((t) => t.id === templateId);
    if (!tmpl) return;
    const sections = tmpl.structure.map((s) => ({ id: s.id, label: s.label, content: s.placeholder || '' }));
    setTemplateSections(sections);
    if (tmpl.scan_type && tmpl.scan_type !== 'General') setScanType(tmpl.scan_type);
  };

  const getTemplateString = (): string | null => {
    if (!selectedTemplateId) return null;
    const tmpl = state.templates.find((t) => t.id === selectedTemplateId);
    return tmpl ? JSON.stringify(tmpl.structure) : null;
  };

  const selectedTemplate = selectedTemplateId ? state.templates.find((t) => t.id === selectedTemplateId) : null;

  const getAllSections = (): { label: string; content: string }[] => {
    const sections: { label: string; content: string }[] = [];
    if (technique) sections.push({ label: 'Technique', content: technique });
    if (findings) sections.push({ label: 'Findings', content: findings });
    if (impression) sections.push({ label: 'Impression', content: impression });
    const standardLabels = ['technique', 'findings', 'impression'];
    for (const sec of templateSections) {
      if (!standardLabels.includes(sec.label.toLowerCase()) && sec.content.trim())
        sections.push({ label: sec.label, content: sec.content });
    }
    return sections;
  };

  // ── Generation ─────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    setGenerating(true); setSaved(false); setSpellingResult(null); setError('');
    try {
      const ctx = buildLearningContext();
      const templateStr = getTemplateString();
      const result = await runFullPipeline(inputText, scanType, templateStr, ctx);
      if (!result || !result.report) throw new Error('Invalid response from AI service');

      setStructured(result.structured || {});
      setTechnique(result.report.technique || '');
      setFindings(result.report.findings || '');
      setImpression(result.report.impression || '');
      setSuggestions(result.suggestions || []);
      setErrors(result.errors || []);
      setQuestions(result.questions || []);

      const reportData = result.report as Record<string, unknown>;
      const extraSections = reportData._extra_sections as Record<string, string> | undefined;
      if (selectedTemplateId && templateSections.length > 0 && extraSections) {
        setTemplateSections((prev) => prev.map((sec) => {
          const matchedValue = extraSections[sec.label];
          return matchedValue ? { ...sec, content: matchedValue } : sec;
        }));
      }

      if (selectedTemplate) {
        const fullText = (result.report.findings || '') + ' ' + (result.report.impression || '');
        const conditionSections: { id: string; label: string; content: string }[] = [];
        for (const cond of selectedTemplate.conditions ?? []) {
          if (cond.trigger_keyword && fullText.toLowerCase().includes(cond.trigger_keyword.toLowerCase())) {
            const alreadyExists = templateSections.some((s) => s.label === cond.add_section);
            if (!alreadyExists) conditionSections.push({ id: cond.id, label: cond.add_section, content: cond.section_content });
          }
        }
        if (conditionSections.length > 0) setTemplateSections((prev) => [...prev, ...conditionSections]);
      }

      if (result.structured?.body_part && result.structured?.modality) {
        try {
          const diff = await generateDifferential(result.report.findings || '', result.structured.body_part, result.structured.modality);
          setDifferential(diff);
        } catch { /* non-critical */ }
      }

      if (!reportTitle) {
        const linkedCase = selectedCaseId ? state.cases.find((c) => c.id === selectedCaseId) : null;
        setReportTitle(linkedCase ? `${scanType} - ${linkedCase.patient_name}` : `${scanType} Report - ${new Date().toLocaleDateString()}`);
      }

      setShowQuality(true);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to generate report. Please try again.';
      console.error('Generation failed:', err);
      setError(errMsg);
      alert(`Error: ${errMsg}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleDiseaseFormat = async (disease: string) => {
    setGeneratingDisease(true); setShowDiseasePicker(false); setDiseaseSearch('');
    try {
      const modality = scanType.split(' ')[0];
      const bodyPart = scanType.replace(/^(CT|MRI|X-Ray|Ultrasound|PET-CT|Nuclear)\s+/i, '');
      const diseaseLower = disease.toLowerCase();
      const matchingTemplate = state.templates.find((t) => t.scan_type === scanType && t.name.toLowerCase().includes(diseaseLower.split(' ')[0]));
      if (matchingTemplate && !selectedTemplateId) handleTemplateSelect(matchingTemplate.id);
      const result = await generateDiseaseFormat(disease, modality, bodyPart);
      if (result.report) {
        setTechnique(result.report.technique || '');
        setFindings(result.report.findings || '');
        setImpression(result.report.impression || '');
        setReportTitle(`${scanType} - ${disease}`);
        setStructured((prev) => ({ ...prev, diseases_detected: [disease], modality, body_part: bodyPart }));
        if (!inputText.trim()) setInputText(`Disease: ${disease}\nModality: ${modality}\nBody Part: ${bodyPart}`);
        setShowQuality(true);
      }
    } catch (err) { console.error('Disease format failed:', err); }
    finally { setGeneratingDisease(false); }
  };

  const handleFixSpelling = async () => {
    if (!hasReport) return;
    setFixingSpelling(true);
    try {
      const fullText = `TECHNIQUE:\n${technique}\n\nFINDINGS:\n${findings}\n\nIMPRESSION:\n${impression}`;
      const result = await fixSpellingAndNegatives(fullText);
      setSpellingResult(result);
      if (result.total_changes > 0 && result.corrected_report) {
        const techMatch = result.corrected_report.match(/TECHNIQUE:\s*([\s\S]*?)(?=FINDINGS:|$)/i);
        const findMatch = result.corrected_report.match(/FINDINGS:\s*([\s\S]*?)(?=IMPRESSION:|$)/i);
        const impMatch = result.corrected_report.match(/IMPRESSION:\s*([\s\S]*?)$/i);
        if (techMatch?.[1]) setTechnique(techMatch[1].trim());
        if (findMatch?.[1]) setFindings(findMatch[1].trim());
        if (impMatch?.[1]) setImpression(impMatch[1].trim());
      }
    } catch (err) { console.error('Spelling fix failed:', err); }
    finally { setFixingSpelling(false); }
  };

  const handleRefreshAnalysis = async () => {
    if (!hasReport) return;
    setRefreshing(true);
    try {
      const fullText = `TECHNIQUE:\n${technique}\n\nFINDINGS:\n${findings}\n\nIMPRESSION:\n${impression}`;
      const [newSuggestions, newErrors] = await Promise.all([
        suggestImprovements(fullText, structured),
        detectErrors(fullText, structured),
      ]);
      setSuggestions(newSuggestions);
      setErrors(newErrors);
    } catch (err) { console.error('Refresh failed:', err); }
    finally { setRefreshing(false); }
  };

  const handleApplySuggestion = (s: Suggestion) => {
    if (s.location === 'findings') setFindings((prev) => prev + '\n\n[Suggestion: ' + s.suggestion + ']');
    else if (s.location === 'impression') setImpression((prev) => prev + '\n\n[Suggestion: ' + s.suggestion + ']');
    else if (s.location === 'technique') setTechnique((prev) => prev + '\n\n[Suggestion: ' + s.suggestion + ']');
  };

  const handleQuestionClick = (q: string) => {
    setInputText((prev) => (prev ? prev + '\n\n' : '') + q + '\n');
    inputRef.current?.focus();
  };

  const fullReport = `TECHNIQUE:\n${technique}\n\nFINDINGS:\n${findings}\n\nIMPRESSION:\n${impression}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    const p = state.profile ?? ({} as Record<string, unknown>);
    const regNumber = (p as Record<string, unknown>)?.registration_number as string | undefined;

    // Pre-export validation
    const exportWarnings: string[] = [];
    if (!regNumber || String(regNumber).trim() === '') {
      exportWarnings.push(
        'MCI/NMC Registration Number is not set. ' +
        'Go to Settings → Profile to add it. ' +
        'Reports without a registration number are not legally valid in India.'
      );
    }
    const linkedCase = selectedCaseId ? state.cases.find((c) => c.id === selectedCaseId) : null;
    if (!linkedCase?.referring_doctor || linkedCase.referring_doctor === '-') {
      exportWarnings.push(
        'Referring Doctor is not linked. The PDF will show "Not provided" — consider adding it.'
      );
    }
    if (quality && quality.contradictions.length > 0) {
      exportWarnings.push(
        'Report has unresolved contradictions: ' + quality.contradictions.join('; ')
      );
    }

    if (exportWarnings.length > 0) {
      const proceed = window.confirm(
        'Export warnings:\n\n' + exportWarnings.map((w, i) => `${i + 1}. ${w}`).join('\n\n') +
        '\n\nExport anyway? (The PDF will include missing-field warnings.)'
      );
      if (!proceed) return;
    }

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = today.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const html = buildReportHTML({
      profile: p,
      patientName: linkedCase?.patient_name || '[Patient Name]',
      patientAge: linkedCase?.patient_age ? `${linkedCase.patient_age} yrs` : '-',
      patientGender: linkedCase?.patient_gender || '-',
      patientCR: linkedCase?.patient_cr_number || '-',
      referringDoc: linkedCase?.referring_doctor || '-',
      patientScan: linkedCase?.scan_type || scanType,
      dateStr, timeStr,
      clinicalInfo: linkedCase?.notes || '-',
      sections: getAllSections(),
      reportTitle: reportTitle || 'Radiology Report',
    });
    openPDF(html, reportTitle || 'Radiology_Report');
  };

  const handleSave = async () => {
    if (!hasReport || !state.user) return;
    setSaving(true);
    try {
      const wordCount = fullReport.split(/\s+/).filter(Boolean).length;
      const payload = {
        user_id: state.user.id,
        case_id: selectedCaseId || null,
        title: reportTitle || `${scanType} Report`,
        input_text: inputText,
        structured_data: structured,
        technique, findings, impression,
        generated_text: fullReport,
        edited_text: fullReport,
        suggestions, errors,
        status: 'draft' as const,
        word_count: wordCount,
      };
      const { data, error } = await supabase.from('reports').insert(payload).select().single();
      if (error) throw error;
      if (data) {
        dispatch({ type: 'ADD_REPORT', report: data });
        await supabase.from('profiles').update({
          reports_generated: (state.profile?.reports_generated ?? 0) + 1,
          time_saved_minutes: (state.profile?.time_saved_minutes ?? 0) + 18,
        }).eq('id', state.user.id);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error('Save failed:', err); }
    finally { setSaving(false); }
  };

  const handleClearReport = () => {
    setTechnique(''); setFindings(''); setImpression('');
    setStructured({}); setSuggestions([]); setErrors([]);
    setDifferential([]); setQuestions([]);
    setSaved(false); setReportTitle(''); setSpellingResult(null);
    setTemplateSections([]); setShowQuality(false); setError('');
  };

  const handleLoadReport = (report: Report) => {
    setReportTitle(report.title || '');
    setTechnique(report.technique || '');
    setFindings(report.findings || '');
    setImpression(report.impression || '');
    setInputText(report.input_text || '');
    setStructured(report.structured_data ?? {});
    setSuggestions(report.suggestions ?? []);
    setErrors(report.errors ?? []);
    setSelectedCaseId(report.case_id || '');
    setTemplateSections([]); setSaved(false); setSpellingResult(null);
    setShowSavedReports(false); setShowQuality(true);
  };

  const errorCount = errors.filter((e) => e.severity === 'error').length;
  const warningCount = errors.filter((e) => e.severity === 'warning').length;
  const filteredDiseases = COMMON_DISEASES.filter((d) => d.toLowerCase().includes(diseaseSearch.toLowerCase())).slice(0, 10);
  const standardLabels = ['technique', 'findings', 'impression'];
  const extraTemplateSections = templateSections.filter((s) => !standardLabels.includes(s.label.toLowerCase()));
  const linkedCase = selectedCaseId ? state.cases.find((c) => c.id === selectedCaseId) : null;
  const totalWords = (technique + findings + impression).split(/\s+/).filter(Boolean).length;

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-950">
      {viewingReport && <ReportViewerModal report={viewingReport} onClose={() => setViewingReport(null)} />}

      {showFinalize && quality && (
        <FinalizationModal
          technique={technique} findings={findings} impression={impression} quality={quality}
          onConfirm={() => { setShowFinalize(false); handleExportPDF(); }}
          onClose={() => setShowFinalize(false)}
        />
      )}

      {/* ── Saved Reports Drawer ─────────────────────────────────────────── */}
      {showSavedReports && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowSavedReports(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col border border-gray-200 dark:border-gray-800"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <FileText size={14} className="text-blue-600" />
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">Saved Reports</h2>
                <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full font-semibold">
                  {state.reports.length}
                </span>
              </div>
              <button onClick={() => setShowSavedReports(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
              {state.reports.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FileText size={20} className="text-gray-300 dark:text-gray-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-400 dark:text-gray-500">No saved reports yet</p>
                  <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">Generate and save your first report</p>
                </div>
              ) : (
                state.reports.map((r) => {
                  const rCase = state.cases.find((c) => c.id === r.case_id);
                  return (
                    <div key={r.id} className="px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-gray-900 dark:text-white truncate">{r.title || 'Untitled'}</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                            {rCase?.patient_name && (
                              <span className="font-medium text-gray-700 dark:text-gray-300">{rCase.patient_name} · </span>
                            )}
                            {new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            {' '} · {r.word_count || 0} words
                          </p>
                          {r.impression && (
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 line-clamp-1 italic">{r.impression}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setViewingReport(r)}
                            className="flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2.5 py-1.5 rounded-lg transition-colors">
                            <Eye size={11} /> View
                          </button>
                          <button onClick={() => handleLoadReport(r)}
                            className="flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 px-2.5 py-1.5 rounded-lg transition-colors">
                            <Wand2 size={11} /> Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Main Workspace ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* ── Top Toolbar ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 flex-wrap">
          {/* Scan type */}
          <div className="relative">
            <select
              value={scanType}
              onChange={(e) => setScanType(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 text-xs font-semibold bg-gray-100 dark:bg-gray-800 border border-transparent hover:border-gray-300 dark:hover:border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-gray-700 dark:text-gray-300 cursor-pointer transition-colors">
              {SCAN_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Template */}
          <div className="relative">
            <select
              value={selectedTemplateId}
              onChange={(e) => handleTemplateSelect(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 border border-transparent hover:border-gray-300 dark:hover:border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-gray-700 dark:text-gray-300 cursor-pointer max-w-44 transition-colors">
              <option value="">Template…</option>
              {state.templates.filter((t) => t.scan_type === scanType || t.scan_type === 'General').map((t) => (
                <option key={t.id} value={t.id}>{t.name}{t.is_default ? ' ★' : ''}</option>
              ))}
            </select>
            <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Case link */}
          <div className="relative">
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 border border-transparent hover:border-gray-300 dark:hover:border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-gray-700 dark:text-gray-300 cursor-pointer max-w-44 transition-colors">
              <option value="">Link Case…</option>
              {state.cases.map((c) => (
                <option key={c.id} value={c.id}>{c.patient_name} – {c.scan_type}</option>
              ))}
            </select>
            <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="flex-1" />

          {/* Inline error/warning count — small, subtle */}
          {errorCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-red-500 dark:text-red-400">
              <AlertCircle size={10} /> {errorCount} error{errorCount > 1 ? 's' : ''}
            </span>
          )}
          {warningCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-500 dark:text-amber-400">
              <AlertCircle size={10} /> {warningCount} warning{warningCount > 1 ? 's' : ''}
            </span>
          )}

          {/* MCI reg warning — show in toolbar */}
          {!((state.profile as Record<string, unknown> | null)?.registration_number as string) && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-red-500 dark:text-red-400
              bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-2 py-1 rounded-lg">
              <AlertCircle size={10} /> MCI Reg. missing — go to Settings
            </span>
          )}

          {/* Saved reports archive */}
          <button
            onClick={() => setShowSavedReports(true)}
            className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <FileText size={12} /> Reports ({state.reports.length})
          </button>

          {hasReport && (
            <>
              <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />

              {/* Fix & Clean */}
              <button
                onClick={handleFixSpelling}
                disabled={fixingSpelling}
                className="flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:text-amber-700 dark:hover:text-amber-400 px-2.5 py-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-50">
                {fixingSpelling ? <Loader2 size={10} className="animate-spin" /> : <SpellCheck size={10} />}
                Fix & Clean
              </button>

              {/* Copy */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                {copied ? <CheckCheck size={10} className="text-emerald-500" /> : <Copy size={10} />}
                {copied ? 'Copied' : 'Copy'}
              </button>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50">
                {saving ? <Loader2 size={10} className="animate-spin" /> : saved ? <CheckCheck size={10} /> : <Save size={10} />}
                {saved ? 'Saved' : 'Save'}
              </button>

              {/* Finalize */}
              <button
                onClick={() => setShowFinalize(true)}
                className="flex items-center gap-1 text-[11px] font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                <Download size={10} /> Finalize
              </button>

              {/* Clear */}
              <button
                onClick={handleClearReport}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Clear report">
                <X size={13} />
              </button>
            </>
          )}
        </div>

        {/* ── Workflow Bar ─────────────────────────────────────────────────── */}
        <WorkflowBar currentStep={workflowStep} />

        {/* ── Patient Context Strip ────────────────────────────────────────── */}
        {linkedCase && (
          <div className="flex items-center gap-4 px-4 py-2 bg-blue-50/50 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/30 shrink-0 overflow-x-auto">
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-5 h-5 bg-blue-600 rounded-md flex items-center justify-center">
                <Stethoscope size={10} className="text-white" />
              </div>
              <span className="text-xs font-bold text-blue-900 dark:text-blue-200 whitespace-nowrap">
                {linkedCase.patient_name}
              </span>
            </div>
            {[
              { label: 'Age/Sex', value: `${linkedCase.patient_age || '—'} / ${linkedCase.patient_gender || '—'}` },
              { label: 'CR No.', value: linkedCase.patient_cr_number || '—' },
              { label: 'Ref Dr.', value: linkedCase.referring_doctor || '—' },
              { label: 'Scan', value: linkedCase.scan_type || '—' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1 text-[11px] whitespace-nowrap shrink-0">
                <span className="text-blue-400 dark:text-blue-500">{item.label}:</span>
                <span className="font-semibold text-blue-800 dark:text-blue-300">{item.value}</span>
              </div>
            ))}
            {linkedCase.notes && (
              <div className="flex items-center gap-1 text-[11px] min-w-0">
                <span className="text-blue-400 dark:text-blue-500 shrink-0">Hx:</span>
                <span className="text-blue-700 dark:text-blue-400 truncate italic">{linkedCase.notes}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Context Banners: spelling, template ──────────────────────────── */}
        {spellingResult && spellingResult.total_changes > 0 && (
          <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/40 flex items-center gap-2 shrink-0">
            <SpellCheck size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 flex-1">
              <strong>{spellingResult.total_changes} correction{spellingResult.total_changes > 1 ? 's' : ''} applied.</strong>
              {spellingResult.spelling_fixes.length > 0 && (
                <> Spelling: {spellingResult.spelling_fixes.map(f => `${f.original}→${f.corrected}`).join(', ')}.</>
              )}
              {spellingResult.negatives_removed.length > 0 && <> Removed contradictory negatives.</>}
            </span>
            <button onClick={() => setSpellingResult(null)} className="shrink-0 text-emerald-400 hover:text-emerald-600 transition-colors">
              <X size={12} />
            </button>
          </div>
        )}

        {selectedTemplate && (
          <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/30 flex items-center gap-2 shrink-0">
            <Layers size={11} className="text-indigo-500 shrink-0" />
            <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">{selectedTemplate.name}</span>
            <span className="text-[10px] text-indigo-400 dark:text-indigo-500">
              {selectedTemplate.structure.length} sections: {selectedTemplate.structure.map(s => s.label).join(' · ')}
            </span>
            <button onClick={() => handleTemplateSelect('')}
              className="ml-auto text-[10px] font-medium text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors">
              Remove
            </button>
          </div>
        )}

        {/* ── Dictation Panel ──────────────────────────────────────────────── */}
        <div className="shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 pt-3 pb-3">
          <div className="flex items-start gap-3">
            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={displayText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={selectedTemplateId
                  ? `Dictate ${scanType} findings for "${selectedTemplate?.name}" template… (type / for macros)`
                  : `Dictate or type ${scanType} findings… (type / for macros)`}
                rows={3}
                className="w-full resize-none bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-[13px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all font-mono leading-relaxed"
              />

              {/* Listening indicator */}
              {isListening && (
                <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-2 py-1 rounded-lg">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <Volume2 size={10} className="text-red-500 shrink-0" />
                  <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold truncate max-w-40">
                    {interimText ? interimText.slice(-50) : 'Listening…'}
                  </span>
                </div>
              )}

              {/* Macro dropdown */}
              {showMacroDropdown && filteredMacros.length > 0 && (
                <div ref={macroRef}
                  className="absolute left-0 bottom-full mb-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-20 max-h-56 overflow-y-auto">
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Macros — type / to search</p>
                  </div>
                  {filteredMacros.map((m) => (
                    <button key={m.id} onMouseDown={(e) => { e.preventDefault(); applyMacro(m); }}
                      className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left">
                      <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400 shrink-0">{m.trigger}</span>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{m.expansion.slice(0, 80)}…</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Voice & macro controls */}
            <div className="flex flex-col gap-2 shrink-0">
              {voiceSupported && (
                <button
                  onClick={isListening ? stopVoice : startVoice}
                  title={isListening ? 'Stop recording' : 'Start voice dictation'}
                  className={`p-2.5 rounded-xl transition-all ${isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
              )}
              {isListening && (
                <button onClick={resetVoice} title="Reset voice"
                  className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <X size={16} />
                </button>
              )}
              <button
                onClick={() => setActiveMacros(!activeMacros)}
                title="Macros (type /)"
                className={`p-2.5 rounded-xl transition-colors ${activeMacros
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                <Zap size={16} />
              </button>
            </div>
          </div>

          {/* Action row */}
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            {/* Generate */}
            <button
              onClick={handleGenerate}
              disabled={generating || !inputText.trim()}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] font-bold px-5 py-1.5 rounded-lg transition-colors">
              {generating
                ? <><Loader2 size={12} className="animate-spin" /> Generating…</>
                : <><Wand2 size={12} /> {selectedTemplateId ? 'Fill Template & Generate' : 'Generate Report'}</>}
            </button>

            {/* Disease quick-format */}
            <div className="relative" ref={diseaseRef}>
              <button
                onClick={() => setShowDiseasePicker(!showDiseasePicker)}
                disabled={generatingDisease}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[11px] font-bold px-4 py-1.5 rounded-lg transition-colors">
                {generatingDisease ? <Loader2 size={12} className="animate-spin" /> : <Stethoscope size={12} />}
                Quick by Disease
              </button>
              {showDiseasePicker && (
                <div className="absolute left-0 top-full mt-1 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-30 overflow-hidden">
                  <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-2">Select disease / condition</p>
                    <input type="text" value={diseaseSearch} onChange={(e) => setDiseaseSearch(e.target.value)}
                      placeholder="e.g. Kidney Stone, Lung Cancer…"
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                      autoFocus />
                  </div>
                  <div className="max-h-52 overflow-y-auto py-1">
                    {filteredDiseases.map((d) => (
                      <button key={d} onClick={() => handleDiseaseFormat(d)}
                        className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-left">
                        <Stethoscope size={10} className="text-emerald-500 shrink-0" />
                        <span className="text-xs text-gray-700 dark:text-gray-300">{d}</span>
                      </button>
                    ))}
                    {diseaseSearch.trim() && !filteredDiseases.length && (
                      <button onClick={() => handleDiseaseFormat(diseaseSearch.trim())}
                        className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-left">
                        <Wand2 size={10} className="text-emerald-500 shrink-0" />
                        <span className="text-xs text-emerald-600 dark:text-emerald-400">Generate format for "{diseaseSearch.trim()}"</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Word count hint */}
            <span className="text-[11px] text-gray-400 dark:text-gray-500 ml-1">
              {inputText.length > 0
                ? `${inputText.split(/\s+/).filter(Boolean).length} words dictated`
                : selectedTemplateId
                  ? 'Template ready — dictate findings and generate'
                  : 'Select scan type, dictate findings, then generate'}
            </span>
          </div>
        </div>

        {/* ── Report Editor ───────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5">

          {/* ─── Empty state ─────────────────────────────────────────────── */}
          {!hasReport && !generating && !generatingDisease && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4 border border-gray-200 dark:border-gray-700">
                <Activity size={26} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-base font-bold text-gray-700 dark:text-gray-200 mb-1.5">Radiology Reporting Workspace</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500 max-w-sm leading-relaxed mb-6">
                {selectedTemplateId
                  ? `Template "${selectedTemplate?.name}" loaded. Dictate findings and click Generate.`
                  : 'Select a scan type, link a patient case, then dictate your findings.'}
              </p>
              {/* Progress checklist */}
              <div className="flex flex-wrap gap-2 justify-center mb-2">
                {[
                  { label: 'Scan & Template', done: !!selectedTemplateId },
                  { label: 'Patient Case', done: !!selectedCaseId },
                  { label: 'Dictate Findings', done: !!inputText.trim() },
                  { label: 'Generate', done: false },
                  { label: 'Review & Finalize', done: false },
                ].map((step, idx) => (
                  <span key={step.label}
                    className={`text-[10px] font-medium px-2.5 py-1 rounded-full border transition-colors
                      ${step.done
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
                        : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'}`}>
                    {step.done ? '✓ ' : `${idx + 1}. `}{step.label}
                  </span>
                ))}
              </div>
              {/* Template section preview */}
              {selectedTemplateId && extraTemplateSections.length > 0 && (
                <div className="mt-5 w-full max-w-md space-y-2 text-left">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center mb-2">Template Sections</p>
                  {extraTemplateSections.map((sec) => (
                    <div key={sec.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-2.5">
                      <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">{sec.label}</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 italic">{sec.content || 'AI will fill this section…'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── Generating state ─────────────────────────────────────────── */}
          {(generating || generatingDisease) && (
            <div className="flex flex-col items-center justify-center py-20 gap-5">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-4 border-blue-100 dark:border-blue-900/40 border-t-blue-600 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Wand2 size={14} className="text-blue-600" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {generatingDisease ? 'Generating disease format…' : 'Generating report…'}
                </p>
                <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-1">
                  {generatingDisease
                    ? 'Creating structured template for the condition'
                    : selectedTemplateId
                      ? `Filling template: ${selectedTemplate?.name}`
                      : 'Extracting findings · Structuring sections · Analysing quality'}
                </p>
              </div>
            </div>
          )}

          {/* ─── Report editor ────────────────────────────────────────────── */}
          {hasReport && !generating && !generatingDisease && (
            <>
              {/* Report title row */}
              <div className="flex items-center gap-2 pb-0.5">
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="Report title…"
                  className="flex-1 text-sm font-bold bg-transparent text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none border-b border-transparent focus:border-blue-400 dark:focus:border-blue-600 pb-0.5 transition-colors"
                />
                {quality && (
                  <QualityBadge quality={quality} onClick={() => setShowQuality(!showQuality)} />
                )}
              </div>

              {/* Quality checklist — collapsible */}
              {quality && <QualityChecklist quality={quality} visible={showQuality} />}

              {/* Contradiction alert — inline, non-blocking */}
              {quality && <ContradictionAlert contradictions={quality.contradictions} />}

              {/* ─ Technique */}
              <ReportSection
                id="technique" label="Technique" variant="default"
                value={technique} onChange={setTechnique}
                placeholder="Describe the imaging technique, contrast used, and scan parameters…"
                badge="Required" minRows={2}
              />

              {/* ─ Findings (primary workspace) */}
              <ReportSection
                id="findings" label="Findings" variant="findings"
                value={findings} onChange={setFindings}
                placeholder="Document all relevant imaging findings systematically, organ by organ…"
                badge="Primary" minRows={8}
              />

              {/* Inline clinical hints — shown only when relevant, dismissible */}
              {activeHints.length > 0 && (
                <div className="space-y-1.5">
                  {activeHints.map((h, i) => (
                    <ClinicalHintPill key={i} hint={h.hint} urgent={h.urgent} />
                  ))}
                </div>
              )}

              {/* Mistake detector */}
              {findings && impression && (
                <MistakeDetector
                  reportText={technique}
                  findings={findings}
                  impression={impression}
                  scanType={scanType}
                  onAutoClean={(cleaned) => setFindings(cleaned)}
                />
              )}

              {/* ─ Impression (strongest visual weight) */}
              <ReportSection
                id="impression" label="Impression" variant="impression"
                value={impression} onChange={setImpression}
                placeholder="State your clinical conclusions clearly. Prioritize actionable findings…"
                badge="Conclusion" minRows={5}
              />

              {/* Extra template sections */}
              {extraTemplateSections.map((sec) => (
                <section key={sec.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[2px]">{sec.label}</h3>
                    <button
                      onClick={() => setTemplateSections(prev => prev.filter(s => s.id !== sec.id))}
                      className="text-gray-300 hover:text-red-400 transition-colors">
                      <X size={11} />
                    </button>
                  </div>
                  <AutoTextarea
                    value={sec.content}
                    onChange={(v) => setTemplateSections(prev => prev.map(s => s.id === sec.id ? { ...s, content: v } : s))}
                    placeholder={`Enter ${sec.label.toLowerCase()} details…`}
                    minRows={3}
                    className="w-full px-4 py-3.5 text-[13px] text-gray-700 dark:text-gray-300 bg-transparent focus:outline-none leading-[1.8]"
                    style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                  />
                </section>
              ))}

              {/* Structured data extraction — collapsed by default */}
              {structured && Object.keys(structured).length > 0 && (
                <details className="bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <summary className="flex items-center gap-2 px-4 py-2.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <TrendingUp size={11} className="text-gray-400" />
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Extracted Structured Data</span>
                  </summary>
                  <div className="px-4 pb-4 grid grid-cols-3 gap-2 mt-2">
                    {Object.entries(structured).filter(([, v]) => v && typeof v !== 'object').map(([k, v]) => (
                      <div key={k} className="bg-white dark:bg-gray-900 rounded-lg p-2.5 border border-gray-100 dark:border-gray-800">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">{k.replace(/_/g, ' ')}</p>
                        <p className="text-[11px] text-gray-700 dark:text-gray-300 font-medium">{String(v)}</p>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {/* Bottom action row */}
              <div className="flex items-center justify-between pt-1 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRefreshAnalysis}
                    disabled={refreshing}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50">
                    {refreshing ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                    Re-analyse
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Download size={10} /> Quick PDF
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                  <Clock size={10} />
                  {totalWords} words
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Copilot Panel ────────────────────────────────────────────────── */}
      <div className="w-72 xl:w-80 shrink-0 overflow-hidden border-l border-gray-200 dark:border-gray-800">
        <CopilotPanel
          suggestions={suggestions}
          errors={errors}
          differential={differential}
          questions={questions}
          loading={refreshing}
          onRefresh={handleRefreshAnalysis}
          onApplySuggestion={handleApplySuggestion}
          onQuestionClick={handleQuestionClick}
        />
      </div>
    </div>
  );
}