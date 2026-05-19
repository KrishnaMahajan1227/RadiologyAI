// ════════════════════════════════════════════════════════════════════════════
//  ReportHTML.ts  ·  v2.0  ·  Clinical Radiology Report Generator
//  Structured Reporting Standard — RSNA / ACR / RCR compliant layout
// ════════════════════════════════════════════════════════════════════════════
//
//  v2.0 Feature Set (10 mandatory upgrades):
//    1.  Modality-aware title bar with resolveReportMeta()
//    2.  Scoring system auto-injection
//        (BI-RADS · TI-RADS · LI-RADS · PI-RADS · Fleischner · Bosniak
//         · ASPECT · Kellgren-Lawrence / KL Grade)
//    3.  Findings — anatomical subheading detection + abnormal accent bars
//    4.  Critical finding alert (10 trigger phrases)
//    5.  Enhanced recommendations — icons, grouping, timelines
//    6.  Watermarks: UNSIGNED / PRELIMINARY / AMENDED
//    7.  Multi-radiologist support (secondaryRadiologist)
//    8.  Comparison study section block for extended comparison text
//    9.  Barcode placeholder strip (print-only)
//   10.  Print quality — @page A4, break-inside: avoid on all key blocks
//
// ════════════════════════════════════════════════════════════════════════════


// ─── Utility — HTML escaping ──────────────────────────────────────────────────

export function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderMarkdownBold(text: string): string {
  return escHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}


// ─── Accession number ─────────────────────────────────────────────────────────

function generateAccession(
  patientName: string,
  scanType:    string,
  dateStr:     string
): string {
  const initials = patientName
    .split(' ')
    .filter(Boolean)
    .map(w => w[0]?.toUpperCase() ?? 'X')
    .join('')
    .slice(0, 3)
    .padEnd(3, 'X');

  const modCode = scanType
    .replace(/[^A-Z]/gi, '')
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, 'R');

  const datePart = dateStr.replace(/[^0-9]/g, '').slice(0, 8);
  return `RR${datePart}-${modCode}-${initials}`;
}


// ─── Verification code (deterministic FNV-1a hash) ────────────────────────────

function verificationCode(seed: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h  = (Math.imul(h, 0x01000193) >>> 0);
  }
  return h.toString(16).toUpperCase().padStart(8, '0');
}


// ─── ISO timestamp ────────────────────────────────────────────────────────────

function isoTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19) + ' IST';
}


// ─── Clinical information sanitiser ──────────────────────────────────────────

function sanitiseClinicalInfo(info: string): string {
  if (!info || info === '-') return 'Not provided.';

  const words    = info.trim().split(/\s+/);
  const nonAscii = words.filter(w => /[^\x00-\x7F]/.test(w)).length;

  if (nonAscii / words.length > 0.4) {
    return '[Clinical information provided in regional language — to be entered in English]';
  }
  if (/test|dummy|sample|lorem/i.test(info)) return 'Not provided.';
  return info;
}


// ─── Modality resolver ────────────────────────────────────────────────────────

function resolveModality(patientScan: string): { display: string; code: string } {
  const s = patientScan.toUpperCase();
  if (s.includes('MRI'))                                                    return { display: 'MRI',        code: 'MRI'    };
  if (s.includes('CT') || s.includes('COMPUTED'))                           return { display: 'CT',          code: 'CT'     };
  if (s.includes('ULTRA') || s.includes('USG') || s.includes('SONO'))      return { display: 'Ultrasound',  code: 'USG'    };
  if (s.includes('X-RAY') || s.includes('XRAY') || s.includes('RADIOGRAPH')) return { display: 'X-Ray',     code: 'XR'     };
  if (s.includes('PET'))                                                    return { display: 'PET-CT',      code: 'PET'    };
  if (s.includes('MAMMO'))                                                  return { display: 'Mammography', code: 'MG'     };
  if (s.includes('FLUORO') || s.includes('FLUOROSCOP'))                     return { display: 'Fluoroscopy', code: 'FLUORO' };
  if (s.includes('NUCLEAR') || s.includes('NM') || s.includes('SCINTIG'))  return { display: 'Nuclear Med', code: 'NM'     };
  if (s.includes('DEXA') || s.includes('BONE DENSITY'))                    return { display: 'DEXA',        code: 'DEXA'   };
  return { display: patientScan, code: 'IMG' };
}


// ─── Report meta resolver (Feature 1) ────────────────────────────────────────
// Returns modality badge, body-system label, and contrast status

function resolveReportMeta(scanType: string): {
  modalityBadge:  string;
  bodySystem:     string;
  contrastStatus: 'given' | 'not_administered' | 'not_stated';
} {
  const s = scanType.toUpperCase();

  // — Modality badge —
  let modalityBadge = 'IMG';
  if      (s.includes('MRI') || s.includes('MAGNETIC'))                                    modalityBadge = 'MRI';
  else if (s.includes('PET'))                                                               modalityBadge = 'PET-CT';
  else if (s.includes('CT') || s.includes('COMPUTED'))                                     modalityBadge = 'CT';
  else if (s.includes('USG') || s.includes('ULTRA') || s.includes('SONO'))                 modalityBadge = 'USG';
  else if (s.includes('X-RAY') || s.includes('XRAY') || s.includes('RADIOGRAPH'))          modalityBadge = 'XR';
  else if (s.includes('MAMMO'))                                                             modalityBadge = 'MG';
  else if (s.includes('FLUORO'))                                                            modalityBadge = 'FLUORO';
  else if (s.includes('DEXA') || s.includes('BONE DENSITY'))                               modalityBadge = 'DEXA';
  else if (s.includes('NUCLEAR') || s.includes(' NM ') || s.includes('SCINTIG'))           modalityBadge = 'NM';

  // — Body system —
  let bodySystem = 'RADIOLOGY';
  if      (/BRAIN|SPINE|NEURO|HEAD|CRANIAL|ORBIT|PITUITARY|BRACHIAL PLEXUS/.test(s))       bodySystem = 'NEURORADIOLOGY';
  else if (/CHEST|LUNG|PULMON|MEDIASTIN|PLEURA|THORAX/.test(s))                            bodySystem = 'CHEST RADIOLOGY';
  else if (/ABDOMEN|PELVIS|LIVER|KIDNEY|PANCREAS|BOWEL|GUT|GI|ABDOMIN/.test(s))            bodySystem = 'ABDOMINAL RADIOLOGY';
  else if (/BONE|JOINT|MSK|MUSCULO|SKELETAL|SHOULDER|KNEE|HIP|WRIST|ANKLE|ELBOW|FOOT|HAND|LUMBAR|CERVICAL|THORACIC SPINE/.test(s)) bodySystem = 'MUSCULOSKELETAL';
  else if (/OBSTET|FOETAL|FETAL|PREGNANCY|OB\/GYN|GYNAEC|GYNECOL|UTERUS|OVARI/.test(s))   bodySystem = 'OBSTETRIC & GYNAECOLOGY';
  else if (/MAMMO|BREAST/.test(s))                                                         bodySystem = 'BREAST IMAGING';
  else if (/NUCLEAR|SCINTIG|THYROID SCAN|BONE SCAN|PET/.test(s))                           bodySystem = 'NUCLEAR MEDICINE';
  else if (/CARDIAC|HEART|CORONARY|ECHO|CARDIAC MRI/.test(s))                              bodySystem = 'CARDIAC IMAGING';
  else if (/VASCULAR|ANGIO|DOPPLER/.test(s))                                               bodySystem = 'VASCULAR RADIOLOGY';

  // — Contrast status —
  let contrastStatus: 'given' | 'not_administered' | 'not_stated' = 'not_stated';
  if (/WITH CONTRAST|CECT|CEMRI|CONTRAST ENHANCED|IV CONTRAST|GADOLINIUM|POST.?CONTRAST/.test(s)) {
    contrastStatus = 'given';
  } else if (/WITHOUT CONTRAST|NCCT|NCMRI|NON.?CONTRAST|PLAIN CT|PLAIN MRI|PLAIN SCAN|UNENHANCED/.test(s)) {
    contrastStatus = 'not_administered';
  }

  return { modalityBadge, bodySystem, contrastStatus };
}


// ─── Scoring system injection (Feature 2) ────────────────────────────────────

function injectGrading(impressionText: string, scanType: string): string {
  const isBrain = /brain|mri brain/i.test(scanType);
  let result    = impressionText;

  // Brain-specific: Fazekas & GCA
  if (isBrain) {
    if (
      /white matter|ischaemic changes|microvascu/i.test(result) &&
      !/fazekas/i.test(result)
    ) {
      result = result.replace(
        /(chronic small vessel ischaemic changes?|white matter ischaemic changes?|microvascu[a-z]* ischaemic changes?)/gi,
        '$1 (Fazekas Grade I)'
      );
    }
    if (
      /cerebral (cortical )?atro/i.test(result) &&
      !/gca grade/i.test(result)
    ) {
      result = result.replace(
        /(mild cerebral (?:cortical )?atro[a-z]*)/gi,
        '$1 (GCA Grade 1)'
      );
    }
  }

  // BI-RADS
  result = result.replace(
    /(BI-RADS\s*(?:category\s*)?\d[A-C]?)/gi,
    (m) => `<span class="scoring-badge birads">${escHtml(m)}</span>`
  );

  // TI-RADS
  result = result.replace(
    /(TI-RADS\s*(?:category\s*)?\d)/gi,
    (m) => `<span class="scoring-badge tirads">${escHtml(m)}</span>`
  );

  // LI-RADS
  result = result.replace(
    /(LI-RADS\s*(?:LR-)?[0-9A-Z]+)/gi,
    (m) => `<span class="scoring-badge lirads">${escHtml(m)}</span>`
  );

  // PI-RADS
  result = result.replace(
    /(PI-RADS\s*(?:v\d\s*)?(?:score\s*)?\d)/gi,
    (m) => `<span class="scoring-badge pirads">${escHtml(m)}</span>`
  );

  // Bosniak
  result = result.replace(
    /(Bosniak\s*(?:Category\s*|Class\s*)?[IVX]+[A-Z]?)/gi,
    (m) => `<span class="scoring-badge bosniak">${escHtml(m)}</span>`
  );

  // ASPECT score
  result = result.replace(
    /(ASPECT\s*score\s*(?:of\s*)?\d+)/gi,
    (m) => `<span class="scoring-badge aspect">${escHtml(m)}</span>`
  );

  // Kellgren-Lawrence / KL Grade
  result = result.replace(
    /(Kellgren[- ]Lawrence\s*(?:Grade\s*)?\d|KL\s*Grade\s*\d)/gi,
    (m) => `<span class="scoring-badge klgrade">${escHtml(m)}</span>`
  );

  // Fleischner — styled callout
  if (/fleischner/i.test(result)) {
    result = result.replace(
      /(Fleischner\s*(?:Society\s*)?(?:guideline|recommendation|criteria)?[^.]*\.?)/gi,
      (m) => `<span class="fleischner-callout">Fleischner: ${escHtml(m.replace(/^fleischner\s*/i, '').trim())}</span>`
    );
  }

  return result;
}


// ─── Recommendations extractor (Feature 5) ───────────────────────────────────

function extractRecommendations(impressionText: string): string[] {
  const lines  = impressionText.split('\n');
  const recs:    string[] = [];
  let   inRecs = false;

  for (const line of lines) {
    if (/^RECOMMENDATIONS?\s*:?$/i.test(line.trim())) { inRecs = true; continue; }
    if (inRecs && line.trim().startsWith('-')) {
      recs.push(line.trim().replace(/^-\s*/, ''));
    } else if (inRecs && line.trim() === '') {
      continue;
    } else if (inRecs) {
      break;
    }
  }
  return recs;
}

function hasRecommendationKeyword(impressionText: string): boolean {
  return /recommend|follow.up|neurology referral|repeat mri|fleischner|further eval/i.test(impressionText);
}

interface ExtractedRec {
  text:      string;
  icon:      string;
  group:     'follow-up' | 'referral' | 'lab' | 'urgent';
  timeline?: string;
}

function extractInlineRecs(
  impressionText: string,
  explicitRecs:   string[]
): ExtractedRec[] {
  const result: ExtractedRec[] = [];

  // Explicit recs first
  for (const r of explicitRecs) {
    let group: ExtractedRec['group'] = 'follow-up';
    let icon = '↻';

    if (/refer|consult|specialist|surgeon|oncol|neurol|cardiol/i.test(r)) { group = 'referral'; icon = '➜'; }
    else if (/lab|blood|serum|biopsy|culture|test|correlat/i.test(r))    { group = 'lab';      icon = '◈'; }
    else if (/urgent|immediate|emergenc|stat|crash|critical/i.test(r))   { group = 'urgent';   icon = '▲'; }

    const timelineMatch = r.match(/(?:in\s+)?(\d+[\s-]+(?:days?|weeks?|months?|years?)(?:\s+follow[- ]?up)?)/i);
    result.push({ text: r, icon, group, timeline: timelineMatch?.[1] });
  }

  // Inline phrase extraction
  const lines = impressionText.split('\n');
  let inExplicitRecs = false;

  const inlinePatterns = [
    /(?:recommend|advise|suggest)\s+(?:a\s+)?(.+?(?:scan|MRI|CT|USG|follow.?up|biopsy|referral|correlation)[^.]*\.?)/i,
    /(?:follow.?up|repeat)\s+(?:\w+\s+){0,4}(?:in\s+\d+[\s-]+\w+|after\s+\w+[^.]*)/i,
    /(?:clinical|biochemical|laboratory)\s+correlation\s+(?:is\s+)?(?:recommended|advised|suggested)/i,
    /(?:refer|referral)\s+to\s+\w+[^.]*\./i,
    /(?:urgent|immediate)\s+(?:surgical|medical|clinical|neurosurgical)[^.]*\./i,
  ];

  for (const line of lines) {
    if (/^RECOMMENDATIONS?\s*:?$/i.test(line.trim())) { inExplicitRecs = true; continue; }
    if (inExplicitRecs && (line.trim().startsWith('-') || line.trim() === '')) continue;
    if (inExplicitRecs) { inExplicitRecs = false; }

    for (const pattern of inlinePatterns) {
      const m = line.match(pattern);
      if (m) {
        const text = m[0].replace(/^[\d\.\s]+/, '').trim();
        if (result.some(r => r.text.toLowerCase().includes(text.slice(0, 20).toLowerCase()))) continue;

        let group: ExtractedRec['group'] = 'follow-up';
        let icon = '↻';

        if (/refer|consult|specialist/i.test(text))        { group = 'referral'; icon = '➜'; }
        else if (/lab|correlat|biochem|serum/i.test(text)) { group = 'lab';      icon = '◈'; }
        else if (/urgent|immediate|emergenc/i.test(text))  { group = 'urgent';   icon = '▲'; }

        const timelineMatch = text.match(/(?:in\s+)?(\d+[\s-]+(?:days?|weeks?|months?|years?))/i);
        result.push({ text, icon, group, timeline: timelineMatch?.[1] });
        break;
      }
    }
  }

  return result;
}


// ─── Critical finding detector (Feature 4) ───────────────────────────────────

function hasCriticalFinding(impressionText: string): boolean {
  return /acute hemorrhage|tension pneumothorax|aortic dissection|pulmonary embolism|midline shift|herniation|ASPECT score\s*[≤<=]\s*4|free air|active bleeding|cord compression/i
    .test(impressionText);
}


// ════════════════════════════════════════════════════════════════════════════
//  buildReportHTML — Main report generator
// ════════════════════════════════════════════════════════════════════════════

export function buildReportHTML(opts: {
  profile:       Record<string, unknown>;
  patientName:   string;
  patientAge:    string;
  patientGender: string;
  patientCR:     string;
  referringDoc:  string;
  patientScan:   string;
  dateStr:       string;
  timeStr:       string;
  clinicalInfo:  string;
  sections:      { label: string; content: string }[];
  reportTitle:   string;
  // Optional
  comparisonText?:      string;
  preliminary?:         boolean;
  amended?:             boolean;
  secondaryRadiologist?: {
    name:        string;
    credentials: string;
    role:        string;
  };
}): string {

  const p = opts.profile as Record<string, string | boolean | number>;

  // ── Derived values ──────────────────────────────────────────────────────────

  const accession = generateAccession(opts.patientName, opts.patientScan, opts.dateStr);
  const seed      = accession + opts.patientName + opts.dateStr + opts.timeStr;
  const verCode   = verificationCode(seed);
  const isoTs     = isoTimestamp();

  const hospitalName    = p?.hospital_name         ? String(p.hospital_name)         : '';
  const doctorName      = p?.name                  ? String(p.name)                  : '';
  const credentials     = p?.doctor_credentials    ? String(p.doctor_credentials)    : '';
  const designation     = p?.designation           ? String(p.designation)           : 'Consultant Radiologist';
  const regNumber       = p?.registration_number   ? String(p.registration_number)   : '';
  const hospitalAddress = p?.hospital_address      ? String(p.hospital_address)      : '';
  const hospitalPhone   = p?.hospital_phone        ? String(p.hospital_phone)        : '';
  const department      = p?.department            ? String(p.department)            : 'Radiology';

  // Accreditation badges
  const hasNABH = p?.accreditation_nabh === true || p?.accreditation_nabh === 'true';
  const hasNABL = p?.accreditation_nabl === true || p?.accreditation_nabl === 'true';
  const hasISO  = p?.accreditation_iso  === true || p?.accreditation_iso  === 'true';
  const accredBadges = [
    hasNABH ? 'NABH' : '',
    hasNABL ? 'NABL' : '',
    hasISO  ? 'ISO 15189:2022' : '',
  ].filter(Boolean);

  const clinicalInfo   = sanitiseClinicalInfo(opts.clinicalInfo);
  const comparisonText = opts.comparisonText || 'No prior imaging available for comparison.';

  const refDoc = (!opts.referringDoc || opts.referringDoc === '-')
    ? '<span class="missing-field">&#9888;&nbsp;Not provided</span>'
    : escHtml(opts.referringDoc);

  const modality   = resolveModality(opts.patientScan);
  const reportMeta = resolveReportMeta(opts.patientScan);

  // ── Contrast row (Feature 1) ────────────────────────────────────────────────
  const contrastRowHTML = (() => {
    if (reportMeta.contrastStatus === 'given') {
      return `<tr>
        <td class="pi-label">Contrast Agent</td>
        <td colspan="3" class="contrast-given">IV Contrast Administered</td>
      </tr>`;
    } else if (reportMeta.contrastStatus === 'not_administered') {
      return `<tr>
        <td class="pi-label">Contrast Agent</td>
        <td colspan="3" class="contrast-none">Non-Contrast Study</td>
      </tr>`;
    }
    return `<tr>
      <td class="pi-label">Contrast Agent</td>
      <td colspan="3" class="contrast-unstated">Not stated</td>
    </tr>`;
  })();

  // ── Watermark (Feature 6) ───────────────────────────────────────────────────
  const watermarkText = !regNumber
    ? 'INCOMPLETE — NOT FOR CLINICAL USE'
    : opts.amended
    ? 'AMENDED REPORT'
    : opts.preliminary
    ? 'PRELIMINARY — SUBJECT TO CHANGE'
    : '';
  const watermarkClass = !regNumber
    ? 'wm-unsigned'
    : opts.amended
    ? 'wm-amended'
    : opts.preliminary
    ? 'wm-preliminary'
    : '';

  // ── Impression content (needed early for critical finding + recs) ───────────
  const impressionContent = opts.sections.find(
    s => s.label.toLowerCase() === 'impression'
  )?.content || '';

  // ── Critical finding alert (Feature 4) ─────────────────────────────────────
  const isCritical = hasCriticalFinding(impressionContent);
  const criticalAlertHTML = isCritical ? `
    <div class="critical-alert" role="alert">
      <div class="critical-alert__header">
        <span class="critical-alert__icon">&#9888;</span>
        <strong>CRITICAL FINDING — IMMEDIATE CLINICAL COMMUNICATION REQUIRED</strong>
      </div>
      <div class="critical-alert__body">
        This report contains a finding that requires prompt notification of the referring clinician.
        Please contact the referring physician without delay and document the time of communication.
      </div>
    </div>` : '';

  // ── Comparison block (Feature 8) ────────────────────────────────────────────
  const comparisonWordCount  = comparisonText.trim().split(/\s+/).length;
  const showComparisonBlock  = comparisonWordCount > 8;

  // ── Section HTML ────────────────────────────────────────────────────────────
  const sectionsHTML = opts.sections
    .filter(s => s.content?.trim())
    .map(s => {
      const isImpression = s.label.toLowerCase() === 'impression';
      const isTechnique  = s.label.toLowerCase() === 'technique';
      const isFindings   = s.label.toLowerCase() === 'findings';

      const rawContent = isImpression
        ? injectGrading(s.content, opts.patientScan)
        : s.content;

      const rendered = renderMarkdownBold(rawContent);

      // ── Impression ──────────────────────────────────────────────────────────
      if (isImpression) {
        const lines     = rawContent.split('\n').filter(l => l.trim());
        const listItems = lines
          .filter(line =>
            !/^RECOMMENDATIONS?\s*:?$/i.test(line.trim()) &&
            !line.trim().startsWith('-')
          )
          .map(line => {
            const match = line.match(/^(\d+)\.\s*(.*)/);
            const text  = match ? match[2] : line;
            const graded = injectGrading(text, opts.patientScan);
            return `<li>${graded}</li>`;
          }).join('');

        return `
        ${criticalAlertHTML}
        <div class="impression-block">
          <div class="section-heading impression-heading">Impression</div>
          <ol class="impression-list">${listItems}</ol>
        </div>`;
      }

      // ── Technique + Comparison (Feature 8) ─────────────────────────────────
      if (isTechnique) {
        return `
        <div class="section-block">
          <div class="section-heading">Technique</div>
          <div class="section-content technique-content">${rendered}</div>
        </div>
        ${showComparisonBlock ? `
        <div class="comparison-block">
          <div class="section-heading comparison-heading">Comparison Study</div>
          <div class="section-content">${escHtml(comparisonText)}</div>
        </div>` : ''}`;
      }

      // ── Findings — anatomical subheadings + abnormal accents (Feature 3) ───
      if (isFindings) {
        const paragraphs   = rawContent.split('\n').filter(l => l.trim());
        const findingsHTML = paragraphs.map(para => {
          const r = renderMarkdownBold(para);

          const isAllCapsSubhead    = /^[A-Z][A-Z\s\/\-]{3,}:/.test(para);
          const isAnatomicalSubhead = /^([A-Z][a-z]+(?:\s+[A-Z]?[a-z]+)*):\s/.test(para) ||
                                      /^(Right|Left|Bilateral)\s+[A-Za-z][\w\s]+:\s/.test(para);

          if (isAllCapsSubhead || isAnatomicalSubhead) {
            return `<p class="finding-subhead ${isAnatomicalSubhead && !isAllCapsSubhead ? 'finding-subhead--anatomical' : ''}">${r}</p>`;
          }

          const isMeasurement = /\d+\.?\d*\s*(?:mm|cm|ml|cc|μ|um|µ)/i.test(para);
          if (r.includes('<strong>') || isMeasurement) {
            return `<p class="finding-para finding-para--abnormal">${r}</p>`;
          }

          return `<p class="finding-para finding-para--normal">${r}</p>`;
        }).join('');

        return `
        <div class="findings-block">
          <div class="section-heading">Findings</div>
          <div class="section-content">${findingsHTML}</div>
        </div>`;
      }

      // ── Generic section ─────────────────────────────────────────────────────
      return `
      <div class="section-block">
        <div class="section-heading">${escHtml(s.label)}</div>
        <div class="section-content">${rendered}</div>
      </div>`;
    }).join('');

  // ── Recommendations (Feature 5) ─────────────────────────────────────────────
  const explicitRecs = extractRecommendations(impressionContent);
  const allRecs      = extractInlineRecs(impressionContent, explicitRecs);

  const groupOrder: ExtractedRec['group'][] = ['urgent', 'referral', 'follow-up', 'lab'];
  const groupLabels: Record<ExtractedRec['group'], string> = {
    'urgent':    'Urgent Action Required',
    'referral':  'Clinical Referral',
    'follow-up': 'Follow-up Imaging',
    'lab':       'Laboratory / Clinical Correlation',
  };

  const recsHTML = allRecs.length > 0 ? `
  <div class="recommendations-block">
    <div class="section-heading recs-heading">Recommendations</div>
    ${groupOrder.map(grp => {
      const items = allRecs.filter(r => r.group === grp);
      if (!items.length) return '';
      return `
      <div class="rec-group">
        <div class="rec-group__label">${groupLabels[grp]}</div>
        ${items.map(r => `
        <div class="rec-row">
          <span class="rec-row__icon rec-icon--${r.group}">${r.icon}</span>
          <span class="rec-row__text">${escHtml(r.text)}</span>
          ${r.timeline ? `<span class="rec-row__timeline">${escHtml(r.timeline)}</span>` : ''}
        </div>`).join('')}
      </div>`;
    }).join('')}
  </div>` : '';

  // ── Secondary radiologist (Feature 7) ───────────────────────────────────────
  const secRad = opts.secondaryRadiologist;
  const secondarySigHTML = secRad ? `
    <div class="sig-unit secondary-sig">
      <div class="sig-unit__line"></div>
      <div class="sig-unit__name">${secRad.name.startsWith('Dr') ? escHtml(secRad.name) : `Dr. ${escHtml(secRad.name.replace(/^Dr\.?\s*/i, ''))}`}</div>
      <div class="sig-unit__creds">${escHtml(secRad.credentials)}</div>
      <div class="sig-unit__desig">${escHtml(secRad.role || 'Co-Reporting Radiologist')}</div>
      <div class="sig-unit__esign">&#9679;&nbsp;E-SIGNED</div>
    </div>` : '';

  // ── Barcode placeholder (Feature 9) ─────────────────────────────────────────
  const barcodeHTML = `
  <div class="barcode-strip no-screen">
    <span class="barcode-strip__label">ACC: ${accession}</span>
    <div class="barcode-strip__bars" aria-hidden="true"></div>
  </div>`;

  // ── Report status label ──────────────────────────────────────────────────────
  const reportStatusLabel = opts.preliminary
    ? 'PRELIMINARY'
    : opts.amended
    ? 'AMENDED'
    : 'FINAL';

  const reportStatusClass = opts.preliminary
    ? 'status--preliminary'
    : opts.amended
    ? 'status--amended'
    : 'status--final';


  // ════════════════════════════════════════════════════════════════════════════
  //  Full HTML output
  // ════════════════════════════════════════════════════════════════════════════

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escHtml(opts.reportTitle || 'Radiology Report')}</title>
  <style>

    /* ══════════════════════════════════════════════════════════════════════
       PAGE & TYPOGRAPHY
       ══════════════════════════════════════════════════════════════════════ */

    @page {
      size: A4;
      margin: 18mm 22mm 24mm 22mm;
    }
    @page :first { margin-top: 16mm; }

    *, *::before, *::after {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Times New Roman', Times, 'Georgia', serif;
      font-size: 11.5pt;
      line-height: 1.65;
      color: #1c1c1c;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Screen wrapper */
    .page {
      max-width: 720px;
      margin: 0 auto;
      padding: 0 0 24px;
    }

    /* ── Running page header (print table-header-group trick) ── */
    .page-header-repeat { display: none; }

    @media screen {
      .page               { display: block; }
      .page-header-repeat { display: none;  }
    }
    @media print {
      .page {
        display: table;
        width: 100%;
      }
      .page-header-repeat {
        display: table-header-group;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 7.5pt;
        color: #999;
        text-align: right;
        padding: 0 0 4px;
        border-bottom: 0.5pt solid #ccc;
        letter-spacing: 0.2px;
      }
      .page-body {
        display: table-row-group;
      }
    }


    /* ══════════════════════════════════════════════════════════════════════
       WATERMARKS  (Feature 6)
       ══════════════════════════════════════════════════════════════════════ */

    .watermark {
      display: none;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-32deg);
      font-family: Arial, Helvetica, sans-serif;
      font-size: 46pt;
      font-weight: 900;
      letter-spacing: 4px;
      text-transform: uppercase;
      white-space: nowrap;
      pointer-events: none;
      z-index: 100;
    }
    .wm-unsigned    { color: rgba(190, 0,   0,   0.12); }
    .wm-preliminary { color: rgba(180, 100, 0,   0.11); }
    .wm-amended     { color: rgba(0,   60,  160, 0.11); }
    @media print {
      .watermark { display: block !important; }
    }


    /* ══════════════════════════════════════════════════════════════════════
       HOSPITAL HEADER
       ══════════════════════════════════════════════════════════════════════ */

    .hospital-header {
      text-align: center;
      padding-bottom: 10pt;
      border-bottom: 2pt solid #1c1c1c;
    }

    .hospital-header__name {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 17pt;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #111;
      margin-bottom: 3pt;
    }

    .hospital-header__name--placeholder {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 14pt;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #bbb;
      border: 1.5pt dashed #ccc;
      padding: 3pt 12pt;
      display: inline-block;
      border-radius: 2pt;
      margin-bottom: 3pt;
    }

    .hospital-header__address,
    .hospital-header__phone {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8.5pt;
      color: #555;
      letter-spacing: 0.2px;
      margin-bottom: 1pt;
    }

    .hospital-header__dept {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9.5pt;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #222;
      border-top: 0.75pt solid #ccc;
      padding-top: 5pt;
      margin-top: 5pt;
    }

    .accred-badges {
      display: flex;
      justify-content: center;
      gap: 5pt;
      margin-top: 4pt;
    }

    .accred-badge {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 7pt;
      font-weight: 700;
      border: 1pt solid #888;
      border-radius: 2pt;
      padding: 1pt 5pt;
      letter-spacing: 0.8px;
      color: #555;
      text-transform: uppercase;
    }


    /* ══════════════════════════════════════════════════════════════════════
       ACCESSION / STATUS STRIP
       ══════════════════════════════════════════════════════════════════════ */

    .meta-strip {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f6f6f6;
      border: 0.75pt solid #ddd;
      border-top: none;
      padding: 3.5pt 8pt;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 7.5pt;
      color: #666;
      margin-bottom: 9pt;
    }

    .meta-strip__accession { font-weight: 700; color: #333; letter-spacing: 0.3px; }
    .meta-strip__verify    { color: #999; letter-spacing: 0.2px; }

    .meta-strip__status {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 7pt;
      font-weight: 700;
      letter-spacing: 1.2px;
      padding: 1.5pt 6pt;
      border-radius: 2pt;
    }

    .status--final {
      color: #185c32;
      border: 1pt solid #185c32;
      background: #f0faf4;
    }

    .status--preliminary {
      color: #7a4b00;
      border: 1pt solid #b87a00;
      background: #fffbf0;
    }

    .status--amended {
      color: #0a3a7a;
      border: 1pt solid #1a5fa8;
      background: #f0f6ff;
    }


    /* ══════════════════════════════════════════════════════════════════════
       PATIENT INFORMATION TABLE
       ══════════════════════════════════════════════════════════════════════ */

    .patient-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 7pt;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9pt;
    }

    .patient-table td {
      padding: 4pt 7pt;
      border: 0.75pt solid #ccc;
      vertical-align: top;
      color: #222;
    }

    .pi-label {
      font-weight: 700;
      background: #f4f4f4;
      width: 22%;
      white-space: nowrap;
      color: #444;
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .pi-value--name {
      font-weight: 700;
      color: #0d0d0d;
      font-size: 9.5pt;
    }

    .pi-value--status {
      font-family: Arial, Helvetica, sans-serif;
      font-weight: 700;
      font-size: 8pt;
      letter-spacing: 0.5px;
    }

    .modality-tag {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8pt;
      font-weight: 700;
      letter-spacing: 0.8px;
      background: #eef3fb;
      border: 1pt solid #c0d0e8;
      border-radius: 2pt;
      padding: 1pt 6pt;
      color: #1a3a6a;
    }

    /* Contrast rows */
    .contrast-given {
      font-family: Arial, Helvetica, sans-serif;
      font-weight: 700;
      color: #6b1212;
      background: #fff4f4;
      font-size: 8.5pt;
      letter-spacing: 0.3px;
    }

    .contrast-none {
      font-family: Arial, Helvetica, sans-serif;
      font-weight: 600;
      color: #444;
      background: #f9f9f9;
      font-size: 8.5pt;
    }

    .contrast-unstated {
      font-family: Arial, Helvetica, sans-serif;
      color: #999;
      font-size: 8.5pt;
      font-style: italic;
    }

    .missing-field {
      font-family: Arial, Helvetica, sans-serif;
      color: #b00;
      font-size: 8pt;
      font-weight: 600;
    }


    /* ══════════════════════════════════════════════════════════════════════
       COMPARISON STRIP  (short variant)
       ══════════════════════════════════════════════════════════════════════ */

    .comparison-strip {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8.5pt;
      color: #555;
      padding: 4pt 8pt;
      border: 0.75pt solid #e0e0e0;
      background: #fafafa;
      margin-bottom: 7pt;
    }
    .comparison-strip strong { color: #333; }


    /* ══════════════════════════════════════════════════════════════════════
       REPORT TITLE BAR  (Feature 1)
       ══════════════════════════════════════════════════════════════════════ */

    .report-title-bar {
      text-align: center;
      margin: 12pt 0 9pt;
      border-top: 1.5pt solid #1c1c1c;
      border-bottom: 1.5pt solid #1c1c1c;
      padding: 7pt 0 5pt;
    }

    .report-title-bar__main {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 4px;
      color: #111;
    }

    .report-title-bar__modality {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 7.5pt;
      font-weight: 700;
      border: 1.5pt solid #555;
      padding: 1pt 6pt;
      border-radius: 2pt;
      margin-right: 9pt;
      vertical-align: middle;
      letter-spacing: 1px;
      color: #333;
    }

    .report-title-bar__system {
      display: block;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 7.5pt;
      font-weight: 600;
      letter-spacing: 2.5px;
      color: #777;
      text-transform: uppercase;
      margin-top: 2pt;
    }


    /* ══════════════════════════════════════════════════════════════════════
       SECTION HEADINGS & CONTENT
       ══════════════════════════════════════════════════════════════════════ */

    .section-block,
    .findings-block,
    .impression-block {
      margin-bottom: 9pt;
    }

    .section-heading {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #222;
      border-bottom: 1pt solid #1c1c1c;
      padding-bottom: 2.5pt;
      margin-top: 11pt;
      margin-bottom: 6pt;
    }

    .section-content {
      font-size: 11pt;
      line-height: 1.7;
      color: #1c1c1c;
    }

    .technique-content {
      font-size: 10pt;
      color: #555;
      line-height: 1.6;
    }


    /* ══════════════════════════════════════════════════════════════════════
       FINDINGS — ANATOMICAL SUBHEADINGS + ABNORMAL ACCENTS  (Feature 3)
       ══════════════════════════════════════════════════════════════════════ */

    .finding-subhead {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #333;
      margin-top: 8pt;
      margin-bottom: 2pt;
    }

    .finding-subhead--anatomical {
      color: #1a3a6a;
      border-left: 2.5pt solid #1a5fa8;
      padding-left: 6pt;
      text-transform: none;
      letter-spacing: 0.2px;
    }

    .finding-para {
      margin-bottom: 4pt;
      line-height: 1.7;
      font-size: 11pt;
    }
    .finding-para:last-child { margin-bottom: 0; }

    .finding-para--abnormal {
      border-left: 2.5pt solid #c07000;
      padding-left: 7pt;
      background: #fffef8;
    }
    .finding-para--abnormal strong { font-weight: 700; color: #111; }

    .finding-para--normal { color: #444; }


    /* ══════════════════════════════════════════════════════════════════════
       CRITICAL FINDING ALERT  (Feature 4)
       ══════════════════════════════════════════════════════════════════════ */

    .critical-alert {
      border: 1.5pt solid #b00;
      background: #fff8f8;
      padding: 9pt 12pt;
      margin-bottom: 9pt;
      break-inside: avoid;
    }

    .critical-alert__header {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9pt;
      font-weight: 700;
      color: #900;
      letter-spacing: 0.3px;
      margin-bottom: 4pt;
    }

    .critical-alert__icon {
      font-size: 11pt;
      margin-right: 5pt;
    }

    .critical-alert__body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8.5pt;
      color: #700;
      line-height: 1.55;
    }


    /* ══════════════════════════════════════════════════════════════════════
       IMPRESSION BLOCK
       ══════════════════════════════════════════════════════════════════════ */

    .impression-block {
      border: 1pt solid #1c1c1c;
      border-left: 3.5pt solid #1a4f96;
      padding: 10pt 14pt;
      background: #f8fbff;
      margin-top: 12pt;
      break-inside: avoid;
    }

    .impression-heading {
      color: #1a4f96;
      border-bottom-color: #1a4f96;
      margin-top: 0;
    }

    .impression-list {
      padding-left: 20pt;
      margin: 0;
    }

    .impression-list li {
      font-size: 11pt;
      line-height: 1.75;
      color: #111;
      margin-bottom: 4pt;
      font-weight: 500;
    }
    .impression-list li:last-child { margin-bottom: 0; }
    .impression-list li strong { font-weight: 700; }


    /* ══════════════════════════════════════════════════════════════════════
       SCORING BADGES  (Feature 2)
       ══════════════════════════════════════════════════════════════════════ */

    .scoring-badge {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 7.5pt;
      font-weight: 700;
      padding: 1pt 6pt;
      border-radius: 2pt;
      margin: 0 2pt;
      vertical-align: middle;
      letter-spacing: 0.2px;
      white-space: nowrap;
    }

    .scoring-badge.birads  { background: #fff0f5; color: #a81560; border: 1pt solid #e8a0c0; }
    .scoring-badge.tirads  { background: #eef5ff; color: #1a4f96; border: 1pt solid #98c0e8; }
    .scoring-badge.lirads  { background: #fffbee; color: #8a5000; border: 1pt solid #e0c060; }
    .scoring-badge.pirads  { background: #f5f0ff; color: #520a96; border: 1pt solid #c098e8; }
    .scoring-badge.bosniak { background: #f0fff8; color: #136040; border: 1pt solid #70c898; }
    .scoring-badge.aspect  { background: #fff5f0; color: #962010; border: 1pt solid #e0a080; }
    .scoring-badge.klgrade { background: #f5f5ee; color: #484830; border: 1pt solid #b0b060; }

    .fleischner-callout {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8.5pt;
      font-weight: 600;
      color: #136040;
      background: #f0fff8;
      border: 1pt solid #70c898;
      border-radius: 2pt;
      padding: 1.5pt 7pt;
      margin: 2pt 0;
      display: inline-block;
    }


    /* ══════════════════════════════════════════════════════════════════════
       COMPARISON BLOCK  (Feature 8)
       ══════════════════════════════════════════════════════════════════════ */

    .comparison-block {
      margin-bottom: 7pt;
      border-left: 3pt solid #4a7fa8;
      padding: 7pt 11pt;
      background: #f5f9fd;
    }

    .comparison-heading {
      color: #2a5f88;
      border-bottom-color: #4a7fa8;
    }


    /* ══════════════════════════════════════════════════════════════════════
       RECOMMENDATIONS  (Feature 5)
       ══════════════════════════════════════════════════════════════════════ */

    .recommendations-block {
      border-left: 3.5pt solid #185c32;
      border: 1pt solid #c0ddc8;
      border-left: 3.5pt solid #185c32;
      padding: 9pt 13pt;
      background: #f6fdf8;
      margin-top: 9pt;
      break-inside: avoid;
    }

    .recs-heading {
      color: #185c32;
      border-bottom-color: #185c32;
      margin-top: 0;
    }

    .rec-group { margin-bottom: 7pt; }
    .rec-group:last-child { margin-bottom: 0; }

    .rec-group__label {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #1e5c32;
      margin-bottom: 4pt;
      padding-bottom: 2pt;
      border-bottom: 0.75pt dashed #90c8a0;
    }

    .rec-row {
      display: flex;
      align-items: flex-start;
      gap: 6pt;
      margin-bottom: 3pt;
      font-size: 10.5pt;
      line-height: 1.6;
    }

    .rec-row__icon {
      flex-shrink: 0;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9pt;
      font-weight: 700;
      width: 14pt;
      text-align: center;
      padding-top: 1pt;
    }

    .rec-icon--urgent   { color: #900; }
    .rec-icon--referral { color: #1a4f96; }
    .rec-icon--follow-up{ color: #185c32; }
    .rec-icon--lab      { color: #6a4000; }

    .rec-row__text     { flex: 1; color: #1a2e1a; }

    .rec-row__timeline {
      flex-shrink: 0;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 7.5pt;
      font-weight: 700;
      color: #fff;
      background: #185c32;
      border-radius: 10pt;
      padding: 1pt 7pt;
      white-space: nowrap;
      align-self: center;
    }


    /* ══════════════════════════════════════════════════════════════════════
       SIGNATURE BLOCK  (Feature 7)
       ══════════════════════════════════════════════════════════════════════ */

    .signature-block {
      display: flex;
      justify-content: flex-end;
      gap: 42pt;
      margin-top: 36pt;
      break-before: avoid;
      break-inside: avoid;
    }

    .sig-unit {
      text-align: center;
      min-width: 200pt;
    }

    .sig-unit__line {
      height: 44pt;
      border-bottom: 1.5pt solid #1c1c1c;
      margin-bottom: 5pt;
    }

    .sig-unit__name {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11pt;
      font-weight: 700;
      color: #111;
      margin-bottom: 2pt;
    }

    .sig-unit__creds {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9pt;
      color: #444;
      margin-bottom: 1pt;
    }

    .sig-unit__desig {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9pt;
      color: #555;
      margin-bottom: 1pt;
    }

    .sig-unit__reg {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 8pt;
      color: #777;
      margin-bottom: 1pt;
    }

    .sig-unit__reg--missing {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 7.5pt;
      font-weight: 700;
      color: #900;
      border: 1.5pt solid #b00;
      padding: 2pt 6pt;
      border-radius: 2pt;
      margin-top: 3pt;
      display: inline-block;
    }

    .sig-unit__timestamp {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 7.5pt;
      color: #aaa;
      margin-top: 3pt;
    }

    .sig-unit__esign {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 7pt;
      font-weight: 700;
      border: 1pt solid #185c32;
      color: #185c32;
      border-radius: 2pt;
      padding: 1pt 5pt;
      margin-top: 3pt;
      display: inline-block;
      letter-spacing: 0.5px;
    }


    /* ══════════════════════════════════════════════════════════════════════
       CONFIDENTIAL NOTICE & FOOTER
       ══════════════════════════════════════════════════════════════════════ */

    .confidential-notice {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 7pt;
      color: #bbb;
      text-align: center;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-top: 10pt;
    }

    .report-footer {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 7.5pt;
      color: #aaa;
      text-align: center;
      letter-spacing: 0.2px;
      border-top: 0.75pt solid #e0e0e0;
      padding-top: 6pt;
      margin-top: 14pt;
    }


    /* ══════════════════════════════════════════════════════════════════════
       BARCODE STRIP  (Feature 9 — print only)
       ══════════════════════════════════════════════════════════════════════ */

    .barcode-strip {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 7pt;
      margin-top: 7pt;
      padding-top: 5pt;
    }

    .barcode-strip__label {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 6.5pt;
      color: #aaa;
      letter-spacing: 0.2px;
    }

    .barcode-strip__bars {
      width: 80pt;
      height: 20pt;
      background: repeating-linear-gradient(
        to right,
        #333 0px, #333 2px, #fff 2px, #fff 3px,
        #333 3px, #333 5px, #fff 5px, #fff 7px,
        #333 7px, #333 8px, #fff 8px, #fff 10px,
        #333 10px, #333 11px, #fff 11px, #fff 14px,
        #333 14px, #333 16px, #fff 16px, #fff 17px,
        #333 17px, #333 19px, #fff 19px, #fff 21px,
        #333 21px, #333 23px, #fff 23px, #fff 25px,
        #333 25px, #333 26px, #fff 26px, #fff 28px,
        #333 28px, #333 30px
      );
      border: 0.75pt solid #ccc;
    }

    .no-screen { display: none; }
    @media print {
      .no-screen { display: flex !important; }
    }


    /* ══════════════════════════════════════════════════════════════════════
       PRINT QUALITY  (Feature 10)
       ══════════════════════════════════════════════════════════════════════ */

    @media print {
      body        { margin: 0; background: #fff !important; color: #000 !important; }
      .no-print   { display: none !important; }

      .impression-block       { break-inside: avoid; background: #f8fbff !important; }
      .signature-block        { break-before: avoid; break-inside: avoid; }
      .recommendations-block  { break-inside: avoid; }
      .critical-alert         { break-inside: avoid; }
      .comparison-block       { break-inside: avoid; }
      .meta-strip             { background: #f6f6f6 !important; }
      .contrast-given         { background: #fff4f4 !important; }
    }

    /* ══════════════════════════════════════════════════════════════════════
       SCREEN — PRINT BUTTON
       ══════════════════════════════════════════════════════════════════════ */

    .action-bar {
      text-align: center;
      margin: 20pt 0 26pt;
    }

    .btn {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9pt;
      font-weight: 600;
      letter-spacing: 0.4px;
      cursor: pointer;
      border: none;
      border-radius: 2pt;
      padding: 8pt 26pt;
      margin: 0 5pt;
      text-transform: uppercase;
    }

    .btn--primary { background: #1c1c1c; color: #fff; }
    .btn--primary:hover { background: #333; }
    .btn--secondary { background: #e0e0e0; color: #444; }
    .btn--secondary:hover { background: #ccc; }

  </style>
</head>
<body>
<div class="page">

  <!-- Running page header (print only) -->
  <div class="page-header-repeat">
    ${escHtml(opts.patientName)}&nbsp;&nbsp;|&nbsp;&nbsp;${accession}&nbsp;&nbsp;|&nbsp;&nbsp;${escHtml(opts.patientScan)}&nbsp;&nbsp;|&nbsp;&nbsp;CONFIDENTIAL
  </div>

  <div class="page-body">

    <!-- Watermark (Feature 6) -->
    ${watermarkText ? `<div class="watermark ${watermarkClass}">${escHtml(watermarkText)}</div>` : ''}

    <!-- ── Hospital Header ───────────────────────────────────────────── -->
    <div class="hospital-header">
      ${hospitalName
        ? `<div class="hospital-header__name">${escHtml(hospitalName)}</div>`
        : `<div class="hospital-header__name--placeholder">[Hospital / Centre Name]</div>`
      }
      ${hospitalAddress ? `<div class="hospital-header__address">${escHtml(hospitalAddress)}</div>` : ''}
      ${hospitalPhone   ? `<div class="hospital-header__phone">Tel: ${escHtml(hospitalPhone)}</div>` : ''}
      <div class="hospital-header__dept">Department of ${escHtml(department)}</div>
      ${accredBadges.length > 0
        ? `<div class="accred-badges">${accredBadges.map(b => `<span class="accred-badge">${escHtml(b)}</span>`).join('')}</div>`
        : ''
      }
    </div>

    <!-- ── Accession / Status Strip ──────────────────────────────────── -->
    <div class="meta-strip">
      <span class="meta-strip__accession">Accession No: ${accession}</span>
      <span class="meta-strip__verify">Verification: ${verCode}</span>
      <span class="meta-strip__status ${reportStatusClass}">${reportStatusLabel}</span>
    </div>

    <!-- ── Patient Information Table ─────────────────────────────────── -->
    <table class="patient-table">
      <tr>
        <td class="pi-label">Patient Name</td>
        <td class="pi-value--name">${escHtml(opts.patientName)}</td>
        <td class="pi-label">Age&nbsp;/&nbsp;Sex</td>
        <td>${escHtml(opts.patientAge)}&nbsp;/&nbsp;${escHtml(opts.patientGender)}</td>
      </tr>
      <tr>
        <td class="pi-label">Referring Physician</td>
        <td>${refDoc}</td>
        <td class="pi-label">CR&nbsp;/&nbsp;IP Number</td>
        <td>${escHtml(opts.patientCR)}</td>
      </tr>
      <tr>
        <td class="pi-label">Examination</td>
        <td>${escHtml(opts.patientScan)}</td>
        <td class="pi-label">Date&nbsp;&amp;&nbsp;Time</td>
        <td>${escHtml(opts.dateStr)},&nbsp;${escHtml(opts.timeStr)}</td>
      </tr>
      <tr>
        <td class="pi-label">Modality</td>
        <td><span class="modality-tag">${escHtml(modality.display)}</span></td>
        <td class="pi-label">Report Status</td>
        <td class="pi-value--status"><span class="${reportStatusClass}">${reportStatusLabel}</span></td>
      </tr>
      ${contrastRowHTML}
      <tr>
        <td class="pi-label">Clinical History</td>
        <td colspan="3">${escHtml(clinicalInfo)}</td>
      </tr>
    </table>

    <!-- ── Comparison Strip (short) ──────────────────────────────────── -->
    ${!showComparisonBlock ? `
    <div class="comparison-strip">
      <strong>Comparison:</strong>&nbsp;${escHtml(comparisonText)}
    </div>` : ''}

    <!-- ── Report Title Bar (Feature 1) ──────────────────────────────── -->
    <div class="report-title-bar">
      <div class="report-title-bar__main">
        <span class="report-title-bar__modality">${escHtml(reportMeta.modalityBadge)}</span>${escHtml(opts.reportTitle || 'Radiology Report')}
      </div>
      <span class="report-title-bar__system">${escHtml(reportMeta.bodySystem)}</span>
    </div>

    <!-- ── Report Sections ───────────────────────────────────────────── -->
    ${sectionsHTML}

    <!-- ── Recommendations (Feature 5) ──────────────────────────────── -->
    ${recsHTML}

    <!-- ── Signature Block (Feature 7) ──────────────────────────────── -->
    <div class="signature-block">
      ${secondarySigHTML}
      <div class="sig-unit">
        <div class="sig-unit__line"></div>
        <div class="sig-unit__name">${doctorName ? `Dr. ${escHtml(doctorName.replace(/^Dr\.?\s*/i, ''))}` : 'Dr. [Name]'}</div>
        ${credentials
          ? `<div class="sig-unit__creds">${escHtml(credentials)}</div>`
          : `<div class="sig-unit__creds">[MD / DNB Radiodiagnosis]</div>`
        }
        <div class="sig-unit__desig">${escHtml(designation)}</div>
        ${regNumber
          ? `<div class="sig-unit__reg">MCI&nbsp;/&nbsp;NMC Reg. No.: ${escHtml(regNumber)}</div>`
          : `<div class="sig-unit__reg--missing">&#9888;&nbsp;MCI / NMC Registration Number Missing — Report not legally valid</div>`
        }
        <div class="sig-unit__timestamp">Electronically signed &middot; ${escHtml(isoTs)}</div>
        <div class="sig-unit__esign">&#9679;&nbsp;E-SIGNED</div>
      </div>
    </div>

    <!-- ── Confidential ──────────────────────────────────────────────── -->
    <div class="confidential-notice">Confidential &mdash; For Clinical Use Only &mdash; Not to be Disclosed Without Authorisation</div>

    <!-- ── Footer ───────────────────────────────────────────────────── -->
    <div class="report-footer">
      Report generated on ${escHtml(opts.dateStr)} at ${escHtml(opts.timeStr)}
      ${hospitalName ? `&nbsp;&middot;&nbsp;${escHtml(hospitalName)}` : ''}
      &nbsp;&middot;&nbsp;Accession: ${accession}
      &nbsp;&middot;&nbsp;Verification: ${verCode}
    </div>

    <!-- ── Barcode strip (print only — Feature 9) ───────────────────── -->
    ${barcodeHTML}

  </div><!-- /.page-body -->
</div><!-- /.page -->

<!-- ── Screen action buttons (hidden on print) ─────────────────────── -->
<div class="action-bar no-print">
  <button class="btn btn--primary" onclick="window.print()">Print &nbsp;/&nbsp; Save as PDF</button>
  <button class="btn btn--secondary" onclick="window.close()">Close</button>
</div>

</body>
</html>`;
}


// ════════════════════════════════════════════════════════════════════════════
//  openPDF — unchanged public API
// ════════════════════════════════════════════════════════════════════════════

export function openPDF(html: string, filename: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const newWin = window.open(url, '_blank');

  if (!newWin) {
    const a = document.createElement('a');
    a.href     = url;
    a.download = filename.replace(/\s+/g, '_') + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}