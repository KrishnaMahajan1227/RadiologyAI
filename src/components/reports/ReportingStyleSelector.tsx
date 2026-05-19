/**
 * ReportingStyleSelector — STUB
 *
 * The style selector UI has been permanently removed.
 * Reporting style is now always professional-detailed by default,
 * enforced directly in the AI system prompt (ai.ts).
 *
 * This file is kept as a stub so existing imports do not break.
 * All exports (types, constants, component) remain intact.
 * The component renders nothing — it is a no-op.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReportingStyle {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  icon: string;
}

// ─── Styles array — kept for any external references ─────────────────────────

export const REPORTING_STYLES: ReportingStyle[] = [
  {
    id: 'detailed',
    name: 'Detailed',
    description: 'Professional detailed reporting — always active.',
    systemPrompt: 'Write a detailed, professional, senior-radiologist-grade report. Anatomically organized findings. Numbered impression at the end.',
    icon: '📋',
  },
];

// ─── Props interface — kept for import compatibility ──────────────────────────

interface ReportingStyleSelectorProps {
  selectedStyle?: string;
  onStyleChange?: (styleId: string) => void;
  onClose?: () => void;
}

// ─── Component — renders nothing ─────────────────────────────────────────────

export function ReportingStyleSelector(_props: ReportingStyleSelectorProps) {
  // Style selection is no longer exposed to the user.
  // The AI always uses professional-detailed mode (see RADIOLOGY_SYSTEM_PROMPT in ai.ts).
  return null;
}