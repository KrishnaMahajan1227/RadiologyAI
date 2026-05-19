export interface Profile {
  id: string;
  name: string;
  role: string;
  specialty: string;
  reports_generated: number;
  time_saved_minutes: number;
  dark_mode: boolean;
  hospital_name: string;
  hospital_address: string;
  hospital_phone: string;
  doctor_credentials: string;
  registration_number: string;
  designation: string;
  department: string;
  signature_line: boolean;
  created_at: string;
  updated_at: string;
}

export interface Case {
  id: string;
  user_id: string;
  patient_name: string;
  patient_age: number | null;
  patient_gender: string;
  patient_cr_number: string;
  referring_doctor: string;
  scan_type: string;
  notes: string;
  status: 'active' | 'completed' | 'pending';
  priority: 'routine' | 'urgent' | 'stat';
  modality: string;
  body_part: string;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  case_id: string | null;
  user_id: string;
  title: string;
  input_text: string;
  structured_data: StructuredData;
  technique: string;
  findings: string;
  impression: string;
  generated_text: string;
  edited_text: string;
  suggestions: Suggestion[];
  errors: ReportError[];
  status: 'draft' | 'final' | 'amended';
  word_count: number;
  generation_time_ms: number;
  created_at: string;
  updated_at: string;
}

export interface StructuredData {
  modality?: string;
  body_part?: string;
  clinical_indication?: string;
  technique?: string;
  key_findings?: string[];
  measurements?: Array<{ structure: string; value: string; unit: string }>;
  comparison?: string;
  incidental_findings?: string[];
  critical_findings?: string[];
  laterality?: string;
  contrast?: string;
  scan_quality?: string;
  raw_input?: string;
}

export interface Suggestion {
  type: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  suggestion: string;
  location: string;
}

export interface ReportError {
  type: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  auto_detected: boolean;
}

export interface Differential {
  rank: number;
  diagnosis: string;
  likelihood: 'high' | 'moderate' | 'low';
  supporting_features: string[];
  against_features: string[];
  next_steps: string;
}

export interface Template {
  id: string;
  user_id: string;
  name: string;
  description: string;
  scan_type: string;
  structure: TemplateSection[];
  conditions: TemplateCondition[];
  is_default: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface TemplateSection {
  id: string;
  label: string;
  placeholder: string;
  required: boolean;
  type: 'text' | 'select' | 'checkbox' | 'measurement';
  options?: string[];
}

export interface TemplateCondition {
  id: string;
  trigger_keyword: string;
  add_section: string;
  section_content: string;
}

export interface Macro {
  id: string;
  user_id: string;
  trigger: string;
  expansion: string;
  category: string;
  description: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface LearningData {
  id: string;
  user_id: string;
  preferred_phrases: string[];
  corrections: Array<{ original: string; corrected: string; context: string }>;
  scan_type_preferences: Record<string, string[]>;
  style_preferences: Record<string, string>;
  updated_at: string;
}

export type Page =
  | 'dashboard'
  | 'report'
  | 'cases'
  | 'case-detail'
  | 'templates'
  | 'macros'
  | 'settings';

export interface AppState {
  currentPage: Page;
  selectedCaseId: string | null;
  selectedReportId: string | null;
  theme: 'light' | 'dark';
}
