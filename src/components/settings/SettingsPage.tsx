import {useEffect ,useState } from 'react';
import {
  Save, Loader2, User, Bell, Keyboard, Moon, Sun, Building2, GraduationCap,
  FileText, Award, Settings, Scale, CheckCircle2, AlertTriangle, Clock,
  Zap, BarChart3,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';
import type { Profile } from '../../types';

/* -------------------------------------------------------------------------- */
/*  DATA CONSTANTS                                                             */
/* -------------------------------------------------------------------------- */

const SCAN_TYPES = [
  'CT Chest',
  'CT Abdomen/Pelvis',
  'CT Head',
  'CT Spine (Cervical)',
  'CT Spine (Lumbar)',
  'CT KUB / Renal Stone Protocol',
  'CT Pulmonary Angiography (CTPA)',
  'CT Coronary Angiography (CTCA)',
  'CT Virtual Colonoscopy',
  'CT Neck',
  'CT Extremity',
  'MRI Brain',
  'MRI Spine (Cervical)',
  'MRI Spine (Thoracic)',
  'MRI Spine (Lumbar)',
  'MRI Knee',
  'MRI Shoulder',
  'MRI Hip',
  'MRI Ankle / Foot',
  'MRI Wrist',
  'MRI Abdomen / Liver',
  'MRCP',
  'MRI Pelvis (Female)',
  'MRI Prostate',
  'MRI Cardiac',
  'MRI Breast',
  'MRI Orbit / IAC / Temporal Bone',
  'X-Ray Chest PA',
  'X-Ray Chest AP',
  'X-Ray Chest Lateral',
  'X-Ray Abdomen',
  'X-Ray Spine (Cervical)',
  'X-Ray Spine (Lumbar)',
  'X-Ray Spine (Thoracic)',
  'X-Ray Pelvis',
  'X-Ray Knee',
  'X-Ray Shoulder',
  'X-Ray Hip',
  'X-Ray Ankle',
  'X-Ray Wrist',
  'X-Ray Foot',
  'X-Ray Hand',
  'X-Ray Skull',
  'Ultrasound Abdomen',
  'Ultrasound Pelvis (Female)',
  'Ultrasound Pelvis (Male)',
  'Obstetric Ultrasound (1st Trimester)',
  'Obstetric Ultrasound (2nd/3rd Trimester)',
  'Ultrasound Thyroid',
  'Ultrasound Breast',
  'Ultrasound Scrotal',
  'Ultrasound Renal',
  'Carotid Doppler',
  'Peripheral Vascular Doppler',
  'Ultrasound MSK',
  'Echocardiography',
  'Neonatal Brain Ultrasound',
  'Nuclear Medicine — Bone Scan',
  'Nuclear Medicine — Thyroid Scan',
  'Nuclear Medicine — DMSA / DTPA / MAG3',
  'Nuclear Medicine — HIDA Scan',
  'Nuclear Medicine — V/Q Scan',
  'Nuclear Medicine — Myocardial Perfusion',
  'PET-CT (Oncology)',
  'PET-CT (Neurological)',
  'PET-CT (Cardiac)',
  'Mammography — Screening',
  'Mammography — Diagnostic',
  'Mammography — Tomosynthesis',
  'Fluoroscopy — Barium Swallow',
  'Fluoroscopy — Barium Meal',
  'Fluoroscopy — Barium Enema',
  'Fluoroscopy — IVP',
  'Fluoroscopy — MCU / VCUG',
  'Fluoroscopy — HSG',
  'Fluoroscopy — Fistulogram',
  'DEXA',
  'Interventional Radiology Report',
];


/* -------------------------------------------------------------------------- */
/*  REUSABLE TOGGLE COMPONENT                                                  */
/* -------------------------------------------------------------------------- */


function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
        checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
      }`}
    >
      <div
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  REUSABLE INPUT / SELECT CLASSES                                            */
/* -------------------------------------------------------------------------- */

const inputCls =
  'w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all';

const selectCls =
  'w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all';

const labelCls = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5';

/* -------------------------------------------------------------------------- */
/*  CARD WRAPPER                                                               */
/* -------------------------------------------------------------------------- */

function SectionCard({
  icon: Icon,
  title,
  badge,
  children,
}: {
  icon: React.ElementType;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <Icon size={16} className="text-gray-500 dark:text-gray-400" />
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h3>
        {badge && (
          <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full ml-auto">
            {badge}
          </span>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  TOGGLE ROW                                                                 */
/* -------------------------------------------------------------------------- */

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

export function SettingsPage() {
  const { state, dispatch } = useApp();
  const p = state.profile;

  // ── Existing fields ───────────────────────────────────────────────────────
  const [name, setName] = useState(p?.name ?? '');
  const [specialty, setSpecialty] = useState(p?.specialty ?? 'general');
  const [role, setRole] = useState(p?.role ?? 'radiologist');
  const [hospitalName, setHospitalName] = useState(p?.hospital_name ?? '');
  const [hospitalAddress, setHospitalAddress] = useState(p?.hospital_address ?? '');
  const [hospitalPhone, setHospitalPhone] = useState(p?.hospital_phone ?? '');
  const [hospitalEmail, setHospitalEmail] = useState((p as any)?.hospital_email ?? '');
  const [hospitalWebsite, setHospitalWebsite] = useState((p as any)?.hospital_website ?? '');
  const [hospitalLogoUrl, setHospitalLogoUrl] = useState((p as any)?.hospital_logo_url ?? '');
  const [hospitalRegistrationNumber, setHospitalRegistrationNumber] = useState(
    (p as any)?.hospital_registration_number ?? ''
  );
  const [doctorCredentials, setDoctorCredentials] = useState(p?.doctor_credentials ?? '');
  const [registrationNumber, setRegistrationNumber] = useState(p?.registration_number ?? '');
  const [designation, setDesignation] = useState(p?.designation ?? '');
  const [department, setDepartment] = useState(p?.department ?? '');
  const [signatureLine, setSignatureLine] = useState(p?.signature_line ?? true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // ── Accreditation badges ──────────────────────────────────────────────────
  const [accreditationNabh, setAccreditationNabh] = useState<boolean>(
    (p as any)?.accreditation_nabh ?? false
  );
  const [accreditationNabl, setAccreditationNabl] = useState<boolean>(
    (p as any)?.accreditation_nabl ?? false
  );
  const [accreditationIso, setAccreditationIso] = useState<boolean>(
    (p as any)?.accreditation_iso ?? false
  );

  // ── Report configuration ──────────────────────────────────────────────────
  const [defaultScanType, setDefaultScanType] = useState<string>(
    (p as any)?.default_scan_type ?? ''
  );
  const [reportLanguage, setReportLanguage] = useState<string>(
    (p as any)?.report_language ?? 'english'
  );
  const [signatureStyle, setSignatureStyle] = useState<string>(
    (p as any)?.signature_style ?? 'text_only'
  );
  const [includeComparisonDefault, setIncludeComparisonDefault] = useState<boolean>(
    (p as any)?.include_comparison_default ?? false
  );
  const [autoFazekas, setAutoFazekas] = useState<boolean>(
    (p as any)?.auto_fazekas ?? false
  );

  // ── Legal & Compliance ────────────────────────────────────────────────────
  const [registrationBody, setRegistrationBody] = useState<string>(
    (p as any)?.registration_body ?? ''
  );
  const [registrationExpiry, setRegistrationExpiry] = useState<string>(
    (p as any)?.registration_expiry ?? ''
  );
  const [aerbLicense, setAerbLicense] = useState<string>(
    (p as any)?.aerb_license ?? ''
  );
  const [customDisclaimer, setCustomDisclaimer] = useState<string>(
    (p as any)?.custom_disclaimer ?? ''
  );

useEffect(() => {
  if (!p) return;

  setName(p.name ?? '');
  setSpecialty(p.specialty ?? 'general');
  setRole(p.role ?? 'radiologist');

  setHospitalName(p.hospital_name ?? '');
  setHospitalAddress(p.hospital_address ?? '');
  setHospitalPhone(p.hospital_phone ?? '');
  setHospitalEmail((p as any)?.hospital_email ?? '');
  setHospitalWebsite((p as any)?.hospital_website ?? '');
  setHospitalLogoUrl((p as any)?.hospital_logo_url ?? '');
  setHospitalRegistrationNumber((p as any)?.hospital_registration_number ?? '');

  setDoctorCredentials(p.doctor_credentials ?? '');
  setRegistrationNumber(p.registration_number ?? '');
  setDesignation(p.designation ?? '');
  setDepartment(p.department ?? '');

  setSignatureLine(p.signature_line ?? true);

  setAccreditationNabh(
    (p as any)?.accreditation_nabh ?? false
  );

  setAccreditationNabl(
    (p as any)?.accreditation_nabl ?? false
  );

  setAccreditationIso(
    (p as any)?.accreditation_iso ?? false
  );

  setDefaultScanType(
    (p as any)?.default_scan_type ?? ''
  );

  setReportLanguage(
    (p as any)?.report_language ?? 'english'
  );

  setSignatureStyle(
    (p as any)?.signature_style ?? 'text_only'
  );

  setIncludeComparisonDefault(
    (p as any)?.include_comparison_default ?? false
  );

  setAutoFazekas(
    (p as any)?.auto_fazekas ?? false
  );

  setRegistrationBody(
    (p as any)?.registration_body ?? ''
  );

  setRegistrationExpiry(
    (p as any)?.registration_expiry ?? ''
  );

  setAerbLicense(
    (p as any)?.aerb_license ?? ''
  );

  setCustomDisclaimer(
    (p as any)?.custom_disclaimer ?? ''
  );

}, [p]);  

  // ── Save handler ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!state.user) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: state.user.id,
          // Existing fields
          name,
          specialty,
          role,
          hospital_name: hospitalName,
          hospital_address: hospitalAddress,
          hospital_phone: hospitalPhone,
          hospital_email: hospitalEmail,
          hospital_website: hospitalWebsite,
          hospital_logo_url: hospitalLogoUrl,
          hospital_registration_number: hospitalRegistrationNumber,
          doctor_credentials: doctorCredentials,
          registration_number: registrationNumber,
          designation,
          department,
          signature_line: signatureLine,
          // New fields
          accreditation_nabh: accreditationNabh,
          accreditation_nabl: accreditationNabl,
          accreditation_iso: accreditationIso,
          default_scan_type: defaultScanType,
          report_language: reportLanguage,
          signature_style: signatureStyle,
          include_comparison_default: includeComparisonDefault,
          auto_fazekas: autoFazekas,
          registration_body: registrationBody,
          registration_expiry: registrationExpiry || null,
          aerb_license: aerbLicense,
          custom_disclaimer: customDisclaimer,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) {
  console.error(error);
  alert(error.message);
  return;
}
if (error) throw error;
      if (data) dispatch({ type: 'SET_PROFILE', profile: data as Profile });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
  console.error('Save failed:', err);

  alert(
    err?.message || 'Settings save failed'
  );
} finally {
      setSaving(false);
    }
  };

  // ── Derived helpers ───────────────────────────────────────────────────────

  /** Days until expiry — null if no date set */
  const daysUntilExpiry: number | null = (() => {
    if (!registrationExpiry) return null;
    const diff = new Date(registrationExpiry).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  })();

  const expiryWarning =
    daysUntilExpiry !== null && daysUntilExpiry <= 90;

  /** Time-saved formatting */
  const timeSavedMinutes: number = (p as any)?.time_saved_minutes ?? 0;
  const timeSavedHrs = Math.floor(timeSavedMinutes / 60);
  const timeSavedMins = timeSavedMinutes % 60;
  const timeSavedLabel =
    timeSavedMinutes > 0
      ? `${timeSavedHrs > 0 ? `${timeSavedHrs}h ` : ''}${timeSavedMins}m`
      : '—';

  /** Average words per report */
  const avgWords = (() => {
    const reports = state.reports ?? [];
    if (!reports.length) return 0;
    const total = reports.reduce((acc: number, r: any) => {
      const text = [r.findings, r.impression, r.technique].filter(Boolean).join(' ');
      return acc + (text.split(/\s+/).filter(Boolean).length);
    }, 0);
    return Math.round(total / reports.length);
  })();

  const macroCount = (state as any).macros?.length ?? 0;

  const shortcuts = [
    { keys: 'Cmd+N', description: 'New Report' },
    { keys: 'Cmd+1', description: 'Dashboard' },
    { keys: 'Cmd+2', description: 'Report Workspace' },
    { keys: 'Cmd+3', description: 'Cases' },
    { keys: 'Cmd+4', description: 'Templates' },
    { keys: 'Cmd+5', description: 'Macros' },
    { keys: '/', description: 'Macro picker (in report)' },
    { keys: 'Cmd+G', description: 'Generate Report' },
    { keys: 'Cmd+Shift+F', description: 'Fix & Clean Report' },
    { keys: 'Cmd+Shift+E', description: 'Export PDF' },
    { keys: 'Cmd+Shift+S', description: 'Save Report' },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">

      {/* ── PERSONAL INFORMATION ─────────────────────────────────────────── */}
      <SectionCard icon={User} title="Personal Information">
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Email</label>
            <input
              type="email"
              value={state.user?.email ?? ''}
              disabled
              className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Jane Smith"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Designation</label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Consultant Radiologist"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className={selectCls}>
                <option value="radiologist">Radiologist</option>
                <option value="resident">Radiology Resident</option>
                <option value="fellow">Fellow</option>
                <option value="attending">Attending</option>
                <option value="head">Head of Department</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Specialty</label>
              <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={selectCls}>
                <option value="general">General Radiology</option>
                <option value="neuroradiology">Neuroradiology</option>
                <option value="musculoskeletal">Musculoskeletal</option>
                <option value="chest">Chest Radiology</option>
                <option value="abdominal">Abdominal Radiology</option>
                <option value="vascular">Vascular/Interventional</option>
                <option value="nuclear">Nuclear Medicine</option>
                <option value="pediatric">Pediatric Radiology</option>
                <option value="breast">Breast Imaging</option>
                <option value="oncologic">Oncologic Radiology</option>
                <option value="cardiac">Cardiac Imaging</option>
                <option value="emergency">Emergency Radiology</option>
                <option value="interventional">Interventional Radiology</option>
                <option value="womens_imaging">Women's Imaging</option>
                <option value="head_neck">Head & Neck Radiology</option>
                <option value="genitourinary">Genitourinary Radiology</option>
                <option value="gastrointestinal">Gastrointestinal Radiology</option>
              </select>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── DOCTOR CREDENTIALS ───────────────────────────────────────────── */}
      <SectionCard icon={GraduationCap} title="Doctor Credentials" badge="Shows on reports">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Credentials / Degrees</label>
              <input
                type="text"
                value={doctorCredentials}
                onChange={(e) => setDoctorCredentials(e.target.value)}
                placeholder="MD, DNB, FRCR"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Registration Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="MCI-XXXXX"
                  className={`${inputCls} pr-9`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {registrationNumber.trim() ? (
                    <CheckCircle2 size={15} className="text-emerald-500" />
                  ) : (
                    <AlertTriangle size={15} className="text-amber-500" />
                  )}
                </div>
              </div>
              {!registrationNumber.trim() && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                  Registration number is required for valid reports
                </p>
              )}
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Department of Radiology"
                className={inputCls}
              />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={signatureLine}
              onChange={(e) => setSignatureLine(e.target.checked)}
              className="rounded"
            />
            <div>
              <p className="text-sm text-gray-900 dark:text-white">Include signature line on reports</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Adds a blank signature line at the bottom of printed reports
              </p>
            </div>
          </label>
        </div>
      </SectionCard>

      {/* ── HOSPITAL DETAILS ─────────────────────────────────────────────── */}
      <SectionCard icon={Building2} title="Hospital / Clinic Details" badge="Report header">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelCls}>Hospital / Clinic Name</label>
            <input
              type="text"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              placeholder="City General Hospital"
              className={inputCls}
            />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Logo URL</label>
            <input
              type="text"
              value={hospitalLogoUrl}
              onChange={(e) => setHospitalLogoUrl(e.target.value)}
              placeholder="https://your-hospital.com/logo.png"
              className={inputCls}
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Public image URL. Printed at the top-left of every report letterhead.
            </p>
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Address</label>
            <input
              type="text"
              value={hospitalAddress}
              onChange={(e) => setHospitalAddress(e.target.value)}
              placeholder="123 Medical Center Dr, City, State 123456"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input
              type="text"
              value={hospitalPhone}
              onChange={(e) => setHospitalPhone(e.target.value)}
              placeholder="+91 1234 567 890"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input
              type="email"
              value={hospitalEmail}
              onChange={(e) => setHospitalEmail(e.target.value)}
              placeholder="reports@hospital.com"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Website</label>
            <input
              type="text"
              value={hospitalWebsite}
              onChange={(e) => setHospitalWebsite(e.target.value)}
              placeholder="www.hospital.com"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Clinical Establishment Reg. No.</label>
            <input
              type="text"
              value={hospitalRegistrationNumber}
              onChange={(e) => setHospitalRegistrationNumber(e.target.value)}
              placeholder="CEA/2024/00123"
              className={inputCls}
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Diagnostic centre / establishment registration — shown in the report footer.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* ── ACCREDITATION BADGES ─────────────────────────────────────────── */}
      <SectionCard icon={Award} title="Accreditation & Quality Certifications" badge="Report header">
        <div className="space-y-5">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            These badges appear in the report header when enabled.
          </p>

          <div className="space-y-4">
            <ToggleRow
              label="NABH Accredited"
              description="National Accreditation Board for Hospitals & Healthcare Providers"
              checked={accreditationNabh}
              onChange={setAccreditationNabh}
            />
            <ToggleRow
              label="NABL Accredited"
              description="National Accreditation Board for Testing and Calibration Laboratories"
              checked={accreditationNabl}
              onChange={setAccreditationNabl}
            />
            <ToggleRow
              label="ISO 15189:2022 Certified"
              description="International standard for quality and competence of medical laboratories"
              checked={accreditationIso}
              onChange={setAccreditationIso}
            />
          </div>

          {/* Live badge preview */}
          {(accreditationNabh || accreditationNabl || accreditationIso) && (
            <div className="mt-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">
                Badge preview
              </p>
              <div className="flex flex-wrap gap-2">
                {accreditationNabh && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 ring-1 ring-blue-300 dark:ring-blue-700">
                    <Award size={10} />
                    NABH Accredited
                  </span>
                )}
                {accreditationNabl && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 ring-1 ring-emerald-300 dark:ring-emerald-700">
                    <Award size={10} />
                    NABL Accredited
                  </span>
                )}
                {accreditationIso && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 ring-1 ring-violet-300 dark:ring-violet-700">
                    <Award size={10} />
                    ISO 15189:2022
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── REPORT CONFIGURATION ─────────────────────────────────────────── */}
      <SectionCard icon={Settings} title="Report Configuration">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Default Scan Type</label>
              <select
                value={defaultScanType}
                onChange={(e) => setDefaultScanType(e.target.value)}
                className={selectCls}
              >
                <option value="">— None —</option>
                {SCAN_TYPES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Report Language</label>
              <select
                value={reportLanguage}
                onChange={(e) => setReportLanguage(e.target.value)}
                className={selectCls}
              >
                <option value="english">English</option>
                <option value="hindi_bilingual">Hindi (Bilingual)</option>
                <option value="tamil_bilingual">Tamil (Bilingual)</option>
              </select>
              {reportLanguage !== 'english' && (
                <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">
                  English report with patient summary in regional language
                </p>
              )}
            </div>
            <div>
              <label className={labelCls}>Signature Style</label>
              <select
                value={signatureStyle}
                onChange={(e) => setSignatureStyle(e.target.value)}
                className={selectCls}
              >
                <option value="text_only">Text Only</option>
                <option value="digital_pki">Digital (PKI)</option>
                <option value="upload_image">Upload Image</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            <ToggleRow
              label="Include Comparison Statement by default"
              description='Auto-populates "No prior imaging available for comparison" in new reports'
              checked={includeComparisonDefault}
              onChange={setIncludeComparisonDefault}
            />
            <ToggleRow
              label="Auto-apply Fazekas grading"
              description="Automatically injects Fazekas grade into brain MRI impressions when WMH are present"
              checked={autoFazekas}
              onChange={setAutoFazekas}
            />
          </div>
        </div>
      </SectionCard>

      {/* ── LEGAL & COMPLIANCE ───────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <Scale size={16} className="text-gray-500 dark:text-gray-400" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              Medico-Legal &amp; Compliance
            </h3>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
              Required for legally valid reports in India
            </p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Registration number — already exists, now with validation */}
            <div>
              <label className={labelCls}>Registration Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="MCI-XXXXX"
                  className={`${inputCls} pr-9`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {registrationNumber.trim() ? (
                    <CheckCircle2 size={15} className="text-emerald-500" />
                  ) : (
                    <AlertTriangle size={15} className="text-amber-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Registration body */}
            <div>
              <label className={labelCls}>Registration Body</label>
              <select
                value={registrationBody}
                onChange={(e) => setRegistrationBody(e.target.value)}
                className={selectCls}
              >
                <option value="">— Select —</option>
                <option value="nmc">NMC (National Medical Commission)</option>
                <option value="state_council">State Medical Council</option>
                <option value="mci_legacy">MCI (Legacy)</option>
                <option value="dnb">DNB Board</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Registration expiry */}
            <div>
              <label className={labelCls}>Registration Expiry Date</label>
              <input
                type="date"
                value={registrationExpiry}
                onChange={(e) => setRegistrationExpiry(e.target.value)}
                className={inputCls}
              />
              {expiryWarning && daysUntilExpiry !== null && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
                  <AlertTriangle size={11} />
                  {daysUntilExpiry <= 0
                    ? 'Registration has expired'
                    : `Expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''} — renew soon`}
                </div>
              )}
            </div>

            {/* AERB license */}
            <div>
              <label className={labelCls}>
                AERB Radiation License Number{' '}
                <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={aerbLicense}
                onChange={(e) => setAerbLicense(e.target.value)}
                placeholder="AERB/LIC/XXXXX"
                className={inputCls}
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Required for centres performing X-ray, CT, or nuclear medicine
              </p>
            </div>
          </div>

          {/* Custom disclaimer */}
          <div>
            <label className={labelCls}>
              Custom Disclaimer Text{' '}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              value={customDisclaimer}
              onChange={(e) => setCustomDisclaimer(e.target.value)}
              placeholder="e.g. This report is based on imaging findings only and should be correlated with clinical history..."
              rows={3}
              className={`${inputCls} resize-none`}
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Appears at the bottom of every report above the signature
            </p>
          </div>
        </div>
      </div>

      {/* ── REPORT HEADER PREVIEW ────────────────────────────────────────── */}
      <SectionCard icon={FileText} title="Report Header Preview">
        <div className="bg-white border border-gray-300 rounded-lg p-6 font-serif text-gray-900 text-[13px] shadow-inner">
          {/* Logo + hospital name */}
          <div className="flex items-center justify-center gap-3 border-b border-gray-300 pb-2 mb-1">
            {hospitalLogoUrl && (
              <img
                src={hospitalLogoUrl}
                alt="Hospital logo"
                className="h-9 max-w-[90px] object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            {hospitalName ? (
              <h4 className="text-center text-base font-bold">{hospitalName}</h4>
            ) : (
              <h4 className="text-center text-base font-bold text-gray-300">[Hospital Name]</h4>
            )}
          </div>

          {/* Address / phone / email / website */}
          {hospitalAddress && (
            <p className="text-center text-[11px] text-gray-600 mb-0.5">{hospitalAddress}</p>
          )}
          {(hospitalPhone || hospitalEmail || hospitalWebsite) && (
            <p className="text-center text-[11px] text-gray-600 mb-1.5">
              {[
                hospitalPhone ? `Tel: ${hospitalPhone}` : '',
                hospitalEmail,
                hospitalWebsite,
              ].filter(Boolean).join('  |  ')}
            </p>
          )}

          {/* Department */}
          {department && (
            <p className="text-center text-[12px] font-semibold text-gray-700 border-t border-gray-200 pt-2 mb-2">
              {department}
            </p>
          )}

          {/* Accreditation badges */}
          {(accreditationNabh || accreditationNabl || accreditationIso) && (
            <div className="flex justify-center flex-wrap gap-1.5 mb-3">
              {accreditationNabh && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  ★ NABH Accredited
                </span>
              )}
              {accreditationNabl && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ★ NABL Accredited
                </span>
              )}
              {accreditationIso && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                  ★ ISO 15189:2022
                </span>
              )}
            </div>
          )}

          {/* Double rule */}
          <div className="border-t-2 border-gray-900 my-2" />

          {/* Patient info mock table */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-gray-600 mb-3">
            <div>
              Patient: <strong>John Doe</strong>
            </div>
            <div>
              Age/Sex: <strong>48Y / M</strong>
            </div>
            <div>
              Referral: <strong>Dr. S. Patel</strong>
            </div>
            <div>
              Date: <strong>{new Date().toLocaleDateString('en-IN')}</strong>
            </div>
            <div>
              Acc. No: <strong>RAD-2025-00142</strong>
            </div>
            <div>
              Modality:{' '}
              <strong className="text-blue-700">
                {defaultScanType || 'CT Chest'}
              </strong>
            </div>
          </div>

          <div className="border-t border-gray-300 my-2" />
          <p className="text-[12px] font-bold text-gray-800 mb-1 tracking-wide">
            RADIOLOGY REPORT
          </p>
          <p className="text-[11px] text-gray-400 italic">… report content …</p>

          {/* Custom disclaimer */}
          {customDisclaimer && (
            <div className="mt-4 border-t border-gray-200 pt-2">
              <p className="text-[10px] text-gray-500 italic">{customDisclaimer}</p>
            </div>
          )}

          {/* Signature block */}
          <div className="mt-6 border-t border-gray-200 pt-3">
            <p className="text-[12px] font-semibold text-gray-800">
              {name || 'Dr. [Name]'}
              {doctorCredentials ? `, ${doctorCredentials}` : ''}
            </p>
            {designation && (
              <p className="text-[11px] text-gray-600">{designation}</p>
            )}
            {registrationNumber && (
              <p className="text-[10px] text-gray-500">
                Reg. No: {registrationNumber}
                {registrationBody
                  ? ` (${
                      {
                        nmc: 'NMC',
                        state_council: 'State Medical Council',
                        mci_legacy: 'MCI',
                        dnb: 'DNB Board',
                        other: 'Other',
                      }[registrationBody] ?? registrationBody
                    })`
                  : ''}
              </p>
            )}
            {aerbLicense && (
              <p className="text-[10px] text-gray-500">AERB: {aerbLicense}</p>
            )}
            {signatureLine && (
              <div className="mt-5 border-t border-gray-400 w-40" />
            )}
          </div>
        </div>
      </SectionCard>

      {/* ── APPEARANCE ───────────────────────────────────────────────────── */}
      <SectionCard icon={state.theme === 'dark' ? Moon : Sun} title="Appearance">
        <ToggleRow
          label="Dark Mode"
          description="Reduce eye strain in low-light environments"
          checked={state.theme === 'dark'}
          onChange={(v) =>
            dispatch({ type: 'SET_THEME', theme: v ? 'dark' : 'light' })
          }
        />
      </SectionCard>

      {/* ── ACTIVITY ─────────────────────────────────────────────────────── */}
      <SectionCard icon={BarChart3} title="Your Activity">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Reports', value: state.reports.length },
            { label: 'Cases', value: state.cases.length },
            { label: 'Templates', value: state.templates.length },
            { label: 'Macros', value: macroCount },
            { label: 'Time Saved', value: timeSavedLabel },
            { label: 'Avg Words / Report', value: avgWords > 0 ? avgWords : '—' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl py-4 px-2"
            >
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── KEYBOARD SHORTCUTS ───────────────────────────────────────────── */}
      <SectionCard icon={Keyboard} title="Keyboard Shortcuts">
        <div className="space-y-1">
          {shortcuts.map((s) => (
            <div key={s.keys} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {s.description}
              </span>
              <kbd className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-lg font-mono border border-gray-200 dark:border-gray-700">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── STICKY SAVE BUTTON ───────────────────────────────────────────── */}
      <div className="sticky bottom-4 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-lg disabled:opacity-60 ${
            saved
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : saved ? (
            <CheckCircle2 size={16} />
          ) : (
            <Save size={16} />
          )}
          {saved ? 'All Changes Saved!' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}