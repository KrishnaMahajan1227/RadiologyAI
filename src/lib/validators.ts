import type { Suggestion, ReportError } from '../types';

interface ValidationResult {
  mistakes: Suggestion[];
  lateralityIssues: Suggestion[];
  templateLeftovers: Suggestion[];
  allIssues: Suggestion[];
}

const TEMPLATE_LEFTOVERS = [
  'template',
  'please describe',
  'fill in',
  'add your',
  'describe the',
  'findings:',
  'impression:',
  'technique:',
  'tbd',
  '[finding]',
  '[impression]',
  '[technique]',
  'xxx',
  'click here',
  'edit this',
  'complete this',
];

const COMMON_NEGATIVES = [
  'no evidence of',
  'no sign of',
  'no acute',
  'no significant',
  'no abnormal',
  'without evidence',
  'unremarkable',
  'normal',
  'clear',
  'unchanged',
];

const ANATOMY_BY_SIDE = {
  left: ['left kidney', 'left lung', 'left breast', 'left adnexa', 'left sided'],
  right: ['right kidney', 'right lung', 'right breast', 'right adnexa', 'right sided'],
};

export function validateReport(report: string): ValidationResult {
  const reportLower = report.toLowerCase();
  const mistakes: Suggestion[] = [];
  const lateralityIssues: Suggestion[] = [];
  const templateLeftovers: Suggestion[] = [];

  // 1. Detect template leftovers
  for (const leftover of TEMPLATE_LEFTOVERS) {
    if (reportLower.includes(leftover)) {
      templateLeftovers.push({
        type: 'template_leftover',
        priority: 'high',
        title: 'Template Text Found',
        suggestion: `Remove template text: "${leftover}". Replace with actual findings.`,
        location: 'general',
      });
    }
  }

  // 2. Detect contradictory negatives
  for (const negative of COMMON_NEGATIVES) {
    // Check if there's a finding right after a negative statement
    const negativePattern = new RegExp(`${negative}[.\\s]*([a-z]+)\\s+(measure|size|shows|demonstrate|present)`, 'i');
    if (negativePattern.test(reportLower)) {
      mistakes.push({
        type: 'contradiction',
        priority: 'high',
        title: 'Contradictory Statement',
        suggestion: `Found "${negative}" but also found an actual finding. Remove the negative if finding is present.`,
        location: 'findings',
      });
    }
  }

  // 3. Detect laterality issues
  const leftMentions = (reportLower.match(/left/gi) || []).length;
  const rightMentions = (reportLower.match(/right/gi) || []).length;

  if (leftMentions > 0 && rightMentions === 0) {
    lateralityIssues.push({
      type: 'laterality_incomplete',
      priority: 'high',
      title: 'Missing Right Side',
      suggestion: 'Report mentions "left" but not "right". Did you evaluate the right side? Add findings for right side or explicitly state it was not evaluated.',
      location: 'findings',
    });
  }

  if (rightMentions > 0 && leftMentions === 0) {
    lateralityIssues.push({
      type: 'laterality_incomplete',
      priority: 'high',
      title: 'Missing Left Side',
      suggestion: 'Report mentions "right" but not "left". Did you evaluate the left side? Add findings for left side or explicitly state it was not evaluated.',
      location: 'findings',
    });
  }

  // 4. Check for inconsistent laterality (saying same thing about both sides)
  const leftKidneyPattern = /left\s+kidney[^.]*?unremarkable|normal|unchanged/gi;
  const rightKidneyPattern = /right\s+kidney[^.]*?unremarkable|normal|unchanged/gi;

  if (reportLower.includes('left') && reportLower.includes('right')) {
    // Check if findings are too similar for both sides
    const leftFindings = reportLower.split('right')[0];
    const rightFindings = reportLower.split('right')[1];

    if (leftFindings.length > 20 && rightFindings.length > 20) {
      const leftWords = new Set(leftFindings.split(/\s+/));
      const rightWords = new Set(rightFindings.split(/\s+/));
      const intersection = new Set([...leftWords].filter(x => rightWords.has(x)));

      if (intersection.size > 15) {
        lateralityIssues.push({
          type: 'laterality_duplication',
          priority: 'medium',
          title: 'Possibly Duplicated Findings',
          suggestion: 'Left and right side findings appear very similar. Ensure findings are specific to each side.',
          location: 'findings',
        });
      }
    }
  }

  // 5. Detect missing impression for significant findings
  const significantWords = ['stone', 'mass', 'lesion', 'fracture', 'hemorrhage', 'embolism', 'infarction', 'abnormality', 'pathology'];
  const hasFinding = significantWords.some(word => reportLower.includes(word));

  if (hasFinding && report.split('IMPRESSION')[1]?.trim().length < 20) {
    mistakes.push({
      type: 'missing_impression',
      priority: 'high',
      title: 'Incomplete Impression',
      suggestion: 'Significant findings detected but impression is brief. Ensure impression clearly states clinical significance.',
      location: 'impression',
    });
  }

  // 6. Check for measurement without units
  const measurementPattern = /(\d+\s*(?:mm|cm|inches?|units?)?)/gi;
  const numbers = reportLower.match(/\d+(?:\s*(?:mm|cm))?/gi);
  if (numbers) {
    const numbersWithoutUnits = numbers.filter(n => !/(mm|cm)/.test(n));
    if (numbersWithoutUnits.length > 2) {
      mistakes.push({
        type: 'missing_units',
        priority: 'medium',
        title: 'Measurements Missing Units',
        suggestion: 'Some measurements lack units (mm, cm, etc.). Add units for clarity: "8 mm stone" instead of "8 stone".',
        location: 'findings',
      });
    }
  }

  // 7. Check for double negatives
  const doubleNegativePattern = /(no.*(?:no|not)|not.*not|without.*without)/gi;
  if (doubleNegativePattern.test(reportLower)) {
    mistakes.push({
      type: 'double_negative',
      priority: 'medium',
      title: 'Double Negative Detected',
      suggestion: 'Sentence contains double negatives. Simplify for clarity.',
      location: 'general',
    });
  }

  return {
    mistakes,
    lateralityIssues,
    templateLeftovers,
    allIssues: [...mistakes, ...lateralityIssues, ...templateLeftovers],
  };
}

export function cleanTemplateText(report: string): { cleaned: string; removed: string[] } {
  let cleaned = report;
  const removed: string[] = [];

  for (const leftover of TEMPLATE_LEFTOVERS) {
    if (cleaned.toLowerCase().includes(leftover)) {
      // Don't remove if it's part of actual text
      const lowerCleaned = cleaned.toLowerCase();
      const index = lowerCleaned.indexOf(leftover);

      // Check if it's standalone (surrounded by space or punctuation)
      const before = index === 0 ? ' ' : cleaned[index - 1];
      const after = index + leftover.length >= cleaned.length ? ' ' : cleaned[index + leftover.length];

      if ((before === ' ' || before === '\n' || before === '\t') &&
          (after === ' ' || after === '\n' || after === '\t' || after === '.' || after === ':')) {
        cleaned = cleaned.replace(new RegExp(`\\b${leftover}\\b`, 'gi'), '');
        removed.push(leftover);
      }
    }
  }

  // Remove extra whitespace
  cleaned = cleaned.replace(/\n\s*\n/g, '\n').trim();

  return { cleaned, removed };
}

export function validateLaterality(report: string, anatomy: string): Suggestion[] {
  const issues: Suggestion[] = [];
  const reportLower = report.toLowerCase();
  const anatomyLower = anatomy.toLowerCase();

  // Bilateral anatomy that requires left/right
  const bilateralAnatomy = [
    'kidney',
    'lung',
    'breast',
    'adnexa',
    'eye',
    'ear',
    'hand',
    'foot',
    'shoulder',
    'hip',
  ];

  const isBilateral = bilateralAnatomy.some(anat => anatomyLower.includes(anat));

  if (isBilateral) {
    const hasLeft = /\bleft\b/i.test(reportLower);
    const hasRight = /\bright\b/i.test(reportLower);

    if (!hasLeft && !hasRight) {
      issues.push({
        type: 'laterality_missing',
        priority: 'high',
        title: 'No Laterality Specified',
        suggestion: `Exam involves bilateral anatomy (${anatomy}). Specify "left" and "right" in findings, or note if only one side was evaluated.`,
        location: 'findings',
      });
    } else if (hasLeft && !hasRight) {
      issues.push({
        type: 'laterality_incomplete',
        priority: 'high',
        title: 'Right Side Not Mentioned',
        suggestion: `Report discusses left side but not right. Did you evaluate right ${anatomy}? Add right side findings or note.`,
        location: 'findings',
      });
    } else if (hasRight && !hasLeft) {
      issues.push({
        type: 'laterality_incomplete',
        priority: 'high',
        title: 'Left Side Not Mentioned',
        suggestion: `Report discusses right side but not left. Did you evaluate left ${anatomy}? Add left side findings or note.`,
        location: 'findings',
      });
    }
  }

  return issues;
}

export function detectCommonMistakes(report: string): Suggestion[] {
  const issues: Suggestion[] = [];
  const reportLower = report.toLowerCase();

  // 1. "There is" vs "There are" agreement
  const pluralPattern = /(there is.*(?:stones|lesions|findings|areas)|there are.*(?:stone|lesion|finding|area))/gi;
  if (pluralPattern.test(reportLower)) {
    issues.push({
      type: 'grammar_error',
      priority: 'low',
      title: 'Grammar: There is/are mismatch',
      suggestion: 'Use "there is" for singular (stone), "there are" for plural (stones).',
      location: 'findings',
    });
  }

  // 2. Missing measurements for findable things
  if (/(?:stone|mass|lesion|node|effusion|infiltrate)/i.test(report) &&
      !/\d+\s*(?:mm|cm)/i.test(report)) {
    issues.push({
      type: 'missing_measurement',
      priority: 'high',
      title: 'Finding Without Measurement',
      suggestion: 'Finding detected but no measurements provided. Add size in mm/cm.',
      location: 'findings',
    });
  }

  // 3. Impression without clinical correlation
  const impressionText = report.split(/impression:|findings:/i)[1] || '';
  if (impressionText.length > 0 && impressionText.length < 30) {
    issues.push({
      type: 'incomplete_impression',
      priority: 'medium',
      title: 'Brief Impression',
      suggestion: 'Impression is very brief. Ensure it summarizes key findings and clinical significance.',
      location: 'impression',
    });
  }

  return issues;
}
