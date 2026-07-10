import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Wand2,
  ShieldAlert,
} from 'lucide-react';
import {
  validateReport,
  cleanTemplateText,
  validateLaterality,
  detectCommonMistakes,
} from '../../lib/validators';
import type { Suggestion } from '../../types';
import { useMemo, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MistakeDetectorProps {
  reportText: string;
  findings: string;
  impression: string;
  scanType: string;
  onAutoClean?: (cleanedFindings: string) => void;
  onApplySuggestion?: (suggestion: Suggestion) => void;
}

type SeverityLevel = 'critical' | 'major' | 'moderate' | 'minor';

interface QAIssue {
  id: string;
  title: string;
  severity: SeverityLevel;
  recommendation: string;
}

// ─── Severity styling — minimal, professional ─────────────────────────────────

const severityStyle: Record<SeverityLevel, {
  dot: string;
  text: string;
  row: string;
  score: number;
}> = {
  critical: {
    dot: 'bg-red-500',
    text: 'text-red-600 dark:text-red-400',
    row: 'border-l-2 border-red-400 dark:border-red-600 bg-red-50/60 dark:bg-red-950/20',
    score: 30,
  },
  major: {
    dot: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    row: 'border-l-2 border-amber-400 dark:border-amber-600 bg-amber-50/60 dark:bg-amber-950/20',
    score: 18,
  },
  moderate: {
    dot: 'bg-yellow-400',
    text: 'text-yellow-600 dark:text-yellow-400',
    row: 'border-l-2 border-yellow-300 dark:border-yellow-700 bg-yellow-50/40 dark:bg-yellow-950/10',
    score: 10,
  },
  minor: {
    dot: 'bg-navy-400',
    text: 'text-navy-500 dark:text-navy-400',
    row: 'border-l-2 border-navy-200 dark:border-navy-800 bg-navy-50/30 dark:bg-navy-950/10',
    score: 5,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, ' ').trim();

const hasMeasurement = (text: string) =>
  /\d+(\.\d+)?\s?(mm|cm)/i.test(text);

const hasSeverity = (text: string) =>
  /(mild|moderate|severe|minimal|marked|significant|extensive)/i.test(text);

const hasComparison = (text: string) =>
  /(compared to|comparison|previous|prior|unchanged|interval)/i.test(text);

const extractLaterality = (text: string): string[] => {
  const matches = text.match(/\b(left|right|bilateral)\b/gi);
  return matches?.map(v => v.toLowerCase()) ?? [];
};

// ─── Filler phrases that auto-clean removes from findings ─────────────────────

const FILLER_PHRASES = [
  /\bthere is seen\b/gi,
  /\bit is noted that\b/gi,
  /\bappears to be\b/gi,
  /\bkindly correlate\b/gi,
  /\bplease correlate clinically\b/gi,
  /\bclinical correlation is advised\b/gi,
  /\bclinical correlation advised\b/gi,
  /\bclinical correlation is suggested\b/gi,
  /\bclinical correlation suggested\b/gi,
  /\bas described above\b/gi,
  /\bas mentioned above\b/gi,
];

// ─── Issue detection logic ────────────────────────────────────────────────────

function detectRadiologyIssues(
  findings: string,
  impression: string,
  scanType: string,
): QAIssue[] {
  const issues: QAIssue[] = [];
  const normF = normalize(findings);
  const normI = normalize(impression);
  const normFull = normF + ' ' + normI;
  const normModality = normalize(scanType);

  const addIssue = (issue: QAIssue) => {
    if (!issues.find(e => e.id === issue.id)) {
      issues.push(issue);
    }
  };

  // 1. Findings ↔ Impression contradictions
  const contradictions: [string, string, string][] = [
    ['no fracture', 'fracture', 'Fracture vs No Fracture'],
    ['no hemorrhage', 'hemorrhage', 'Hemorrhage vs No Hemorrhage'],
    ['normal appendix', 'appendicitis', 'Appendicitis vs Normal Appendix'],
    ['no infarct', 'acute infarct', 'Infarct vs No Infarct'],
    ['no pneumothorax', 'pneumothorax', 'Pneumothorax vs No Pneumothorax'],
    ['no pleural effusion', 'pleural effusion', 'Pleural Effusion vs None'],
    ['no mass', 'mass identified', 'Mass vs No Mass'],
    ['no hydronephrosis', 'hydronephrosis', 'Hydronephrosis vs None'],
  ];

  for (const [negative, positive, label] of contradictions) {
    if (normF.includes(negative) && normI.includes(positive)) {
      addIssue({
        id: `contradiction-${negative}`,
        title: `Contradiction: ${label}`,
        severity: 'critical',
        recommendation: 'Findings and impression state opposite conclusions. Verify and correct before sign-off.',
      });
    }
  }

  // 2. Laterality mismatch between findings and impression
  const findingsLat = extractLaterality(findings);
  const impressionLat = extractLaterality(impression);

  if (
    findingsLat.length > 0 &&
    impressionLat.length > 0 &&
    findingsLat.some(side => side !== 'bilateral' && !impressionLat.includes(side))
  ) {
    addIssue({
      id: 'laterality-mismatch',
      title: 'Laterality mismatch — left/right differ between sections',
      severity: 'critical',
      recommendation: 'Verify left/right labeling throughout the report.',
    });
  }

  // 3. Lesion described without any measurement
  const lesionKeywords = ['lesion', 'mass', 'nodule', 'stone', 'calculus', 'hematoma', 'collection', 'aneurysm', 'cyst'];
  for (const kw of lesionKeywords) {
    if (normFull.includes(kw) && !hasMeasurement(normFull)) {
      addIssue({
        id: 'measurement-missing',
        title: 'Lesion described without measurement',
        severity: 'major',
        recommendation: 'Include size in mm or cm for all focal lesions, stones, and collections.',
      });
      break; // one measurement issue is enough
    }
  }

  // 4. Weak or absent impression
  if (findings.trim().length > 100 && impression.trim().length < 15) {
    addIssue({
      id: 'weak-impression',
      title: 'Impression is absent or too brief',
      severity: 'major',
      recommendation: 'Add a numbered impression summarizing the key clinical conclusions.',
    });
  }

  // 5. Modality terminology mismatch
  if (normModality.includes('ct') && /echogenicity|echogenic|doppler|echotexture/i.test(normFull)) {
    addIssue({
      id: 'ct-us-terminology',
      title: 'Ultrasound terminology used in CT report',
      severity: 'moderate',
      recommendation: 'Replace echogenicity/Doppler terminology with CT-appropriate attenuation descriptors.',
    });
  }

  if (normModality.includes('mri') && /hounsfield/i.test(normFull)) {
    addIssue({
      id: 'mri-ct-terminology',
      title: 'CT terminology (Hounsfield) used in MRI report',
      severity: 'moderate',
      recommendation: 'Replace Hounsfield units with MRI signal intensity descriptors.',
    });
  }

  // 6. Non-standard / vague terminology
  const vagueTerms: [string, string][] = [
    ['shadow', '"shadow" is non-standard — use opacity, density, or lesion'],
    ['spot on lung', '"spot on lung" is non-standard — describe as pulmonary nodule or opacity'],
    ['normal study?', 'Avoid uncertainty punctuation — state conclusion definitively'],
    ['??' , 'Remove double question marks — state findings definitively or note limitation professionally'],
  ];

  for (const [term, fix] of vagueTerms) {
    if (normFull.includes(term.toLowerCase())) {
      addIssue({
        id: `vague-term-${term}`,
        title: `Non-standard terminology: "${term}"`,
        severity: 'moderate',
        recommendation: fix,
      });
    }
  }

  // 7. Abnormality without severity grading
  if (
    /(hydronephrosis|stenosis|effusion|edema|spondylosis|atrophy|splenomegaly)/i.test(normFull) &&
    !hasSeverity(normFull)
  ) {
    addIssue({
      id: 'missing-severity',
      title: 'Abnormality reported without severity grading',
      severity: 'moderate',
      recommendation: 'Add mild / moderate / severe grading where applicable.',
    });
  }

  // 8. Follow-up context without comparison mention
  if (
    /(follow-up|known lesion|metastasis|postoperative|surveillance|interval)/i.test(normFull) &&
    !hasComparison(normFull)
  ) {
    addIssue({
      id: 'missing-comparison',
      title: 'Follow-up context without comparison to prior imaging',
      severity: 'moderate',
      recommendation: 'State whether prior imaging was reviewed and describe interval change.',
    });
  }

  // 9. Stroke / intracranial hemorrhage without mass effect comment
  if (
    /(stroke|infarct|intracranial hemorrhage)/i.test(normFull) &&
    !/mass effect|midline shift|herniation/i.test(normFull)
  ) {
    addIssue({
      id: 'stroke-mass-effect',
      title: 'Intracranial pathology without mass effect assessment',
      severity: 'critical',
      recommendation: 'Document presence or absence of mass effect, midline shift, and herniation.',
    });
  }

  // 10. Pulmonary embolism without right heart strain mention
  if (
    /\b(pulmonary embolism|pe)\b/i.test(normFull) &&
    !/right heart strain|rv.lv|rv enlargement/i.test(normFull)
  ) {
    addIssue({
      id: 'pe-rhs',
      title: 'Pulmonary embolism without right heart strain assessment',
      severity: 'critical',
      recommendation: 'Comment on RV size / RV:LV ratio to assess right heart strain.',
    });
  }

  // 11. Appendicitis without complication assessment
  if (
    /appendicitis/i.test(normFull) &&
    !/perforation|abscess|free fluid|periappendiceal/i.test(normFull)
  ) {
    addIssue({
      id: 'appendicitis-complication',
      title: 'Appendicitis without complication assessment',
      severity: 'major',
      recommendation: 'Comment on perforation, abscess formation, and periappendiceal free fluid.',
    });
  }

  // 12. Fracture without characterization
  if (
    /fracture/i.test(normFull) &&
    !/displaced|nondisplaced|undisplaced|angulation|comminuted|impacted/i.test(normFull)
  ) {
    addIssue({
      id: 'fracture-characterization',
      title: 'Fracture without displacement/alignment description',
      severity: 'major',
      recommendation: 'Describe as displaced/nondisplaced, angulation, comminution, and joint involvement.',
    });
  }

  return issues;
}

// ─── Confidence score (internal only — not shown in UI) ───────────────────────

function calculateScore(issues: QAIssue[]): number {
  let score = 100;
  for (const issue of issues) {
    score -= severityStyle[issue.severity].score;
  }
  return Math.max(score, 5);
}

// ─── Auto-clean: fixes only the findings string ───────────────────────────────

function cleanFindings(raw: string): string {
  let cleaned = raw;

  // Remove filler AI phrases
  for (const pattern of FILLER_PHRASES) {
    cleaned = cleaned.replace(pattern, '');
  }

  // Fix double question marks
  cleaned = cleaned.replace(/\?\?+/g, '');

  // Replace "normal study?" with proper phrasing
  cleaned = cleaned.replace(/normal study\?/gi, 'No acute abnormality identified.');

  // Fix spacing artifacts
  cleaned = cleaned
    .replace(/\s{2,}/g, ' ')
    .replace(/\.\s*\./g, '.')
    .replace(/,\s*\./g, '.')
    .trim();

  return cleaned;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MistakeDetector({
  reportText,
  findings,
  impression,
  scanType,
  onAutoClean,
}: MistakeDetectorProps) {
  const [expanded, setExpanded] = useState(false);

  // Run all detection — memoized on findings + impression + scanType
  const analysis = useMemo(() => {
    if (!findings.trim() && !impression.trim()) return null;

    // Advanced detection (our custom logic above)
    const advancedIssues = detectRadiologyIssues(findings, impression, scanType);

    // Legacy validator layer — map to our QAIssue shape, deduplicate
    const fullText = `${reportText}\n${findings}\n${impression}`;
    const legacyRaw = [
      ...(validateReport(fullText)?.allIssues ?? []),
      ...(validateLaterality(fullText, scanType) ?? []),
      ...(detectCommonMistakes(fullText) ?? []),
    ];

    const legacyIssues: QAIssue[] = legacyRaw.map((issue: any, idx: number) => ({
      id: `legacy-${idx}`,
      title: issue.title ?? issue.message ?? 'Reporting issue detected',
      severity: (
        issue.priority === 'high' ? 'major' :
        issue.priority === 'medium' ? 'moderate' : 'minor'
      ) as SeverityLevel,
      recommendation: issue.suggestion ?? issue.recommendation ?? '',
    }));

    // Merge, deduplicate by title
    const allIssues = [...advancedIssues, ...legacyIssues].filter(
      (issue, idx, arr) => idx === arr.findIndex(i => i.title === issue.title),
    );

    // Only show critical and major issues — minor noise is suppressed
    const significant = allIssues.filter(
      i => i.severity === 'critical' || i.severity === 'major'
    );
    const advisory = allIssues.filter(
      i => i.severity === 'moderate' || i.severity === 'minor'
    );

    return {
      significant,
      advisory,
      total: allIssues.length,
      score: calculateScore(allIssues),
    };
  }, [reportText, findings, impression, scanType]);

  // Nothing to show
  if (!analysis) return null;

  const { significant, advisory, total, score } = analysis;
  const hasCritical = significant.some(i => i.severity === 'critical');
  const allClear = total === 0;

  // ── Handle auto-clean: only cleans the findings string ───────────────────
  const handleAutoClean = () => {
    if (!onAutoClean) return;
    const cleaned = cleanFindings(findings);
    if (cleaned !== findings) {
      onAutoClean(cleaned);
    }
  };

  // ── Collapsed bar ─────────────────────────────────────────────────────────
  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-colors text-left
          ${allClear
            ? 'border-slate-200/70 dark:border-white/[0.06] bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            : hasCritical
              ? 'border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/30'
              : 'border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/10 hover:bg-amber-50/60 dark:hover:bg-amber-950/20'
          }`}
      >
        <div className="flex items-center gap-2.5">
          {allClear
            ? <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
            : hasCritical
              ? <ShieldAlert size={13} className="text-red-500 shrink-0" />
              : <AlertTriangle size={13} className="text-amber-500 shrink-0" />
          }
          <span className={`text-[11px] font-semibold
            ${allClear ? 'text-slate-600 dark:text-slate-400' : hasCritical ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}`}>
            {allClear
              ? 'Report checks passed'
              : `${significant.length} issue${significant.length !== 1 ? 's' : ''} detected — click to review`}
          </span>
          {!allClear && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full
              ${hasCritical
                ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300'
                : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300'}`}>
              {score}/100
            </span>
          )}
        </div>
        <ChevronDown size={12} className="text-slate-400 shrink-0" />
      </button>
    );
  }

  // ── Expanded panel ────────────────────────────────────────────────────────
  return (
    <div className="card-premium rounded-xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50 dark:bg-slate-800/40">
        <div className="flex items-center gap-2">
          {allClear
            ? <CheckCircle2 size={12} className="text-emerald-500" />
            : hasCritical
              ? <ShieldAlert size={12} className="text-red-500" />
              : <AlertTriangle size={12} className="text-amber-500" />
          }
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[1.8px]">
            Report Checks
          </span>
          {!allClear && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full
              ${hasCritical
                ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'}`}>
              {score}/100
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Auto-clean button — subtle text style */}
          {onAutoClean && (
            <button
              onClick={handleAutoClean}
              className="flex items-center gap-1 text-[10px] font-medium text-slate-400 dark:text-slate-500 hover:text-navy-600 dark:hover:text-navy-400 transition-colors px-2 py-1 rounded hover:bg-navy-50 dark:hover:bg-navy-900/20"
              title="Remove filler phrases from findings"
            >
              <Wand2 size={10} />
              Auto-clean
            </button>
          )}
          <button
            onClick={() => setExpanded(false)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded transition-colors"
          >
            <ChevronUp size={13} />
          </button>
        </div>
      </div>

      {/* All clear state */}
      {allClear && (
        <div className="flex items-center gap-2 px-4 py-3">
          <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
          <p className="text-[12px] text-slate-500 dark:text-slate-400">
            No significant issues detected. Report is consistent.
          </p>
        </div>
      )}

      {/* Issues list */}
      {!allClear && (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">

          {/* Critical + Major issues */}
          {significant.map(issue => {
            const style = severityStyle[issue.severity];
            return (
              <div
                key={issue.id}
                className={`flex items-start gap-3 px-4 py-3 ${style.row}`}
              >
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
                <div className="min-w-0 flex-1">
                  <p className={`text-[12px] font-semibold leading-snug ${style.text}`}>
                    {issue.title}
                  </p>
                  {issue.recommendation && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      {issue.recommendation}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Advisory (moderate/minor) — collapsed under a toggle */}
          {advisory.length > 0 && (
            <AdvisorySection advisory={advisory} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Advisory sub-section (moderate/minor) ────────────────────────────────────

function AdvisorySection({ advisory }: { advisory: QAIssue[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
      >
        <ChevronDown
          size={11}
          className={`text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
        />
        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {advisory.length} advisory note{advisory.length !== 1 ? 's' : ''}
        </span>
      </button>
      {open && (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {advisory.map(issue => {
            const style = severityStyle[issue.severity];
            return (
              <div
                key={issue.id}
                className={`flex items-start gap-3 px-4 py-2.5 ${style.row}`}
              >
                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
                <div className="min-w-0 flex-1">
                  <p className={`text-[11px] font-medium leading-snug ${style.text}`}>
                    {issue.title}
                  </p>
                  {issue.recommendation && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-snug">
                      {issue.recommendation}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}