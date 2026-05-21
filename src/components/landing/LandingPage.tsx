import { useEffect, useState, useRef } from 'react';
import {
  Activity,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock3,
  Lock,
  Microscope,
  Shield,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Workflow,
  Zap,
  BarChart3,
  Play,
  Star,
  ChevronRight,
  Globe,
  Layers3,
  ScanLine,
  Database,
  Cpu,
  Building2,
  BadgeCheck,
  ChevronDown,
  Menu,
  X,
  Award,
  HeartPulse,
  FileText,
  Users,
  CheckCheck,
  ArrowUpRight,
  Quote,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
  MoveRight,
} from 'lucide-react';

/* ─── Inline CSS injected once ─────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --navy: #050c1a;
      --navy-2: #071428;
      --surface: #0a1628;
      --surface-2: #0d1e36;
      --border: rgba(99,179,237,0.12);
      --border-hover: rgba(99,179,237,0.35);
      --cyan: #38bdf8;
      --cyan-light: #7dd3fc;
      --cyan-glow: rgba(56,189,248,0.15);
      --teal: #2dd4bf;
      --gold: #f4c55a;
      --text: #e2eaf4;
      --muted: #8ea8c8;
      --font-body: 'Poppins', sans-serif;
      --font-display: 'Playfair Display', serif;
      --r-xl: 20px;
      --r-2xl: 28px;
      --r-3xl: 40px;
    }

    html { scroll-behavior: smooth; }

    body {
      background: var(--navy);
      color: var(--text);
      font-family: var(--font-body);
      -webkit-font-smoothing: antialiased;
    }

    ::selection { background: rgba(56,189,248,0.3); color: #fff; }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--navy); }
    ::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.3); border-radius: 3px; }

    /* ── Noise overlay ── */
    .noise::before {
      content: '';
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
      background-repeat: repeat;
      background-size: 200px 200px;
      opacity: 0.5;
    }

    /* ── Animations ── */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes pulseGlow {
      0%, 100% { box-shadow: 0 0 0 0 rgba(56,189,248,0); }
      50%       { box-shadow: 0 0 40px 8px rgba(56,189,248,0.25); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-10px); }
    }
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes marquee {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }
    @keyframes scanLine {
      0% { top: 0%; opacity: 1; }
      90% { opacity: 1; }
      100% { top: 100%; opacity: 0; }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    @keyframes counterUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .animate-fadeUp  { animation: fadeUp 0.7s ease forwards; }
    .animate-fadeIn  { animation: fadeIn 0.5s ease forwards; }
    .animate-float   { animation: float 4s ease-in-out infinite; }
    .animate-marquee { animation: marquee 28s linear infinite; }
    .animate-scanLine { animation: scanLine 3s ease-in-out infinite; }
    .animate-blink   { animation: blink 1s step-end infinite; }
    .animate-spin-slow { animation: spin-slow 12s linear infinite; }
    .animate-pulse-glow { animation: pulseGlow 2.5s ease-in-out infinite; }

    .delay-100 { animation-delay: 0.1s; }
    .delay-200 { animation-delay: 0.2s; }
    .delay-300 { animation-delay: 0.3s; }
    .delay-400 { animation-delay: 0.4s; }
    .delay-500 { animation-delay: 0.5s; }
    .delay-600 { animation-delay: 0.6s; }
    .delay-700 { animation-delay: 0.7s; }
    .delay-800 { animation-delay: 0.8s; }

    /* ── Glass card ── */
    .glass {
      background: rgba(13, 30, 54, 0.6);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid var(--border);
    }
    .glass:hover { border-color: var(--border-hover); }

    /* ── Gradient text ── */
    .grad-text {
      background: linear-gradient(135deg, #7dd3fc 0%, #38bdf8 40%, #2dd4bf 80%, #a78bfa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .grad-text-gold {
      background: linear-gradient(135deg, #f4c55a 0%, #fbbf24 50%, #f59e0b 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* ── Button primary ── */
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 28px;
      border-radius: 14px;
      font-family: var(--font-body);
      font-weight: 700;
      font-size: 0.9rem;
      letter-spacing: 0.02em;
      background: linear-gradient(135deg, #7dd3fc, #38bdf8, #2dd4bf);
      background-size: 200% 200%;
      animation: gradientShift 4s ease infinite;
      color: #040e1e;
      border: none;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      position: relative;
      overflow: hidden;
    }
    .btn-primary::after {
      content: '';
      position: absolute;
      inset: 0;
      background: rgba(255,255,255,0);
      transition: background 0.2s;
    }
    .btn-primary:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 16px 48px rgba(56,189,248,0.4); }
    .btn-primary:hover::after { background: rgba(255,255,255,0.08); }

    /* ── Button outline ── */
    .btn-outline {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 28px;
      border-radius: 14px;
      font-family: var(--font-body);
      font-weight: 600;
      font-size: 0.9rem;
      background: rgba(56,189,248,0.04);
      border: 1px solid var(--border);
      color: var(--text);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-outline:hover { border-color: var(--border-hover); background: rgba(56,189,248,0.08); transform: translateY(-2px); }

    /* ── Section label ── */
    .section-label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      border-radius: 100px;
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border: 1px solid rgba(56,189,248,0.2);
      background: rgba(56,189,248,0.06);
      color: #93d5f8;
    }

    /* ── Nav link ── */
    .nav-link {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--muted);
      text-decoration: none;
      transition: color 0.2s;
      position: relative;
      padding-bottom: 2px;
    }
    .nav-link::after {
      content: '';
      position: absolute;
      bottom: -2px; left: 0;
      width: 0; height: 1.5px;
      background: var(--cyan);
      transition: width 0.25s ease;
    }
    .nav-link:hover { color: #fff; }
    .nav-link:hover::after { width: 100%; }

    /* ── FAQ accordion ── */
    .faq-item { transition: all 0.3s ease; }
    .faq-answer {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.4s ease, opacity 0.3s ease;
      opacity: 0;
    }
    .faq-answer.open { max-height: 300px; opacity: 1; }

    /* ── Step connector ── */
    .step-connector {
      position: absolute;
      top: 36px;
      left: calc(50% + 36px);
      width: calc(100% - 72px);
      height: 1px;
      background: linear-gradient(90deg, rgba(56,189,248,0.5), rgba(56,189,248,0.1));
    }

    /* ── Hero image mockup ── */
    .scan-overlay {
      position: absolute;
      left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(56,189,248,0.8), transparent);
      animation: scanLine 2.5s ease-in-out infinite;
    }

    /* ── Stat card shine ── */
    .stat-card {
      position: relative;
      overflow: hidden;
    }
    .stat-card::before {
      content: '';
      position: absolute;
      top: -50%; left: -50%;
      width: 200%; height: 200%;
      background: radial-gradient(circle at 50% 0%, rgba(56,189,248,0.08), transparent 60%);
      pointer-events: none;
    }

    /* ── Testimonial card ── */
    .testimonial-card {
      transition: transform 0.3s ease, border-color 0.3s ease;
    }
    .testimonial-card:hover { transform: translateY(-6px); border-color: var(--border-hover); }

    /* ── Feature card hover ── */
    .feature-card {
      transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
    }
    .feature-card:hover {
      transform: translateY(-6px);
      border-color: rgba(56,189,248,0.3);
      box-shadow: 0 24px 64px rgba(56,189,248,0.08);
    }

    /* ── Mobile nav ── */
    .mobile-nav {
      position: fixed;
      inset: 0;
      z-index: 200;
      background: rgba(5,12,26,0.97);
      backdrop-filter: blur(24px);
      transform: translateX(100%);
      transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
    }
    .mobile-nav.open { transform: translateX(0); }

    /* ── Marquee track ── */
    .marquee-track { overflow: hidden; }
    .marquee-inner { display: flex; gap: 0; width: max-content; }

    /* ── Progress bar ── */
    @keyframes progressBar {
      from { width: 0%; }
    }
    .progress-fill { animation: progressBar 1.5s ease forwards; animation-delay: 0.3s; }

    /* ── Glow dot ── */
    .glow-dot {
      width: 10px; height: 10px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 0 3px rgba(34,197,94,0.2);
      animation: pulseGlow 2s ease-in-out infinite;
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .hero-title { font-size: 2.8rem !important; }
    }
  `}</style>
);

/* ─── Animated counter hook ─────────────────────────────────────────── */
function useCounter(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

/* ─── Intersection observer hook ────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─── FAQ Item ───────────────────────────────────────────────────────── */
function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="faq-item glass"
      style={{ borderRadius: '20px', marginBottom: '12px', overflow: 'hidden' }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '22px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text)', fontFamily: 'var(--font-body)',
          textAlign: 'left', gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{
            minWidth: '28px', height: '28px', borderRadius: '8px',
            background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700, color: 'var(--cyan)',
          }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span style={{ fontWeight: 600, fontSize: '1rem' }}>{q}</span>
        </div>
        <ChevronDown
          size={18}
          style={{
            color: 'var(--cyan)', flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.3s ease',
          }}
        />
      </button>
      <div className={`faq-answer ${open ? 'open' : ''}`}>
        <p style={{ padding: '0 28px 22px 70px', color: 'var(--muted)', lineHeight: 1.75, fontSize: '0.95rem' }}>{a}</p>
      </div>
    </div>
  );
}

/* ─── Stats Section ──────────────────────────────────────────────────── */
const stats = [
  { value: 92, suffix: '%', label: 'Faster Reporting', icon: TrendingUp },
  { value: 10, suffix: 'K+', label: 'Reports / Month', icon: FileText },
  { value: 50, suffix: '+', label: 'Health Orgs Served', icon: Building2 },
  { value: 99.99, suffix: '%', label: 'Enterprise Uptime', icon: Activity, isDecimal: true },
];

function StatsSection() {
  const { ref, inView } = useInView();
  return (
    <section ref={ref} style={{ padding: '80px 0', position: 'relative', zIndex: 10 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px',
        }}>
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            const count = useCounter(stat.isDecimal ? 9999 : stat.value, 1800, inView);
            return (
              <div
                key={i}
                className="glass stat-card"
                style={{
                  borderRadius: '24px', padding: '32px 28px',
                  opacity: inView ? 1 : 0,
                  animation: inView ? `fadeUp 0.6s ease ${i * 0.12}s forwards` : 'none',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  width: '52px', height: '52px', borderRadius: '16px',
                  background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <Icon size={22} style={{ color: 'var(--cyan)' }} />
                </div>
                <div style={{ fontSize: '2.8rem', fontWeight: 900, lineHeight: 1 }}>
                  <span className="grad-text">
                    {stat.isDecimal ? '99.99' : count}{stat.suffix}
                  </span>
                </div>
                <div style={{ marginTop: '10px', fontSize: '0.9rem', color: 'var(--muted)', fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */
export function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const [activeDemoStep, setActiveDemoStep] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setActiveDemoStep((p) => (p + 1) % 4), 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const features = [
    {
      icon: Brain,
      title: 'Clinical AI Intelligence',
      desc: 'Advanced multimodal AI trained specifically for radiology — understands anatomy, modalities, and clinical context with radiologist-level precision.',
      color: '#38bdf8',
    },
    {
      icon: Workflow,
      title: 'Structured Reporting Engine',
      desc: 'Generate consistent, evidence-based radiology reports with intelligent section formatting, smart findings templates, and automated impression drafts.',
      color: '#2dd4bf',
    },
    {
      icon: Shield,
      title: 'Enterprise Healthcare Security',
      desc: 'HIPAA-ready infrastructure, end-to-end encryption, role-based access control, full audit logging, and SOC 2-aligned compliance architecture.',
      color: '#a78bfa',
    },
    {
      icon: Zap,
      title: 'Sub-Second AI Processing',
      desc: 'Reports generated in under 3 minutes with ultra-low-latency AI inference, purpose-built for high-volume radiology environments.',
      color: '#f4c55a',
    },
    {
      icon: BarChart3,
      title: 'Radiology Analytics Dashboard',
      desc: 'Track TAT, volume metrics, AI accuracy benchmarks, radiologist productivity, and quality scores across departments in real time.',
      color: '#34d399',
    },
    {
      icon: Layers3,
      title: 'Full Workflow Automation',
      desc: 'Eliminate repetitive documentation. Automate worklist prioritization, report distribution, and multi-modality workflow orchestration.',
      color: '#f87171',
    },
  ];

  const workflowSteps = [
    {
      title: 'Voice Dictation',
      icon: Stethoscope,
      desc: 'Capture clinical findings via intelligent voice recognition with medical vocabulary and speaker adaptation.',
      step: '01',
    },
    {
      title: 'AI Extraction',
      icon: Brain,
      desc: 'Clinical AI extracts anatomy, modality, laterality, measurements, and key imaging findings automatically.',
      step: '02',
    },
    {
      title: 'QA Validation',
      icon: Shield,
      desc: 'Automated consistency checks, critical finding alerts, and peer-review-ready quality assurance pipeline.',
      step: '03',
    },
    {
      title: 'Final Report',
      icon: FileText,
      desc: 'DICOM-compliant, structured professional radiology report generated, reviewed, and distributed instantly.',
      step: '04',
    },
  ];

  const testimonials = [
    {
      name: 'Dr. Ananya Mehta',
      role: 'Chief of Radiology, Apollo Hospitals',
      text: 'RadAI has transformed our department. Reporting TAT dropped by 89% in the first month. The AI understands clinical nuance at a level I did not expect from any software.',
      rating: 5,
      avatar: 'AM',
      location: 'Mumbai, India',
    },
    {
      name: 'Dr. James Crawford',
      role: 'Interventional Radiologist, Mayo Clinic',
      text: 'The structured reporting engine is exceptional. It understands complex multi-organ findings and generates impressions that require minimal correction. This is the future of radiology.',
      rating: 5,
      avatar: 'JC',
      location: 'Rochester, USA',
    },
    {
      name: 'Dr. Priya Sundar',
      role: 'Medical Director, Medanta Imaging',
      text: 'Security and compliance were our top concerns. RadAI exceeded every requirement — HIPAA ready, encrypted, with audit trails. The clinical team loves the interface.',
      rating: 5,
      avatar: 'PS',
      location: 'Gurugram, India',
    },
  ];

  const faqData = [
    {
      q: 'What is AI radiology reporting software and how does RadAI work?',
      a: 'RadAI is an enterprise AI radiology reporting platform that uses advanced large language models fine-tuned on clinical radiology data. Radiologists dictate findings or input text; the AI automatically extracts structured data, generates impressions, validates clinical consistency, and produces a final DICOM-compliant report in seconds.',
    },
    {
      q: 'Is RadAI HIPAA compliant and enterprise-ready?',
      a: 'Yes. RadAI is built with enterprise-grade healthcare security — HIPAA-ready architecture, end-to-end encrypted data pipelines, role-based access control (RBAC), complete audit logging, and SOC 2-aligned infrastructure. All PHI is handled under strict data governance protocols.',
    },
    {
      q: 'Can RadAI integrate with existing PACS, RIS, and EMR systems?',
      a: 'Absolutely. RadAI supports HL7 FHIR, DICOM SR, and REST API integrations for seamless connectivity with leading PACS (Sectra, Intelerad, Philips), RIS platforms, and EMR systems. Our enterprise team handles full integration within 30 days.',
    },
    {
      q: 'Which imaging modalities does RadAI support for structured reporting?',
      a: 'RadAI supports CT, MRI, X-Ray, Ultrasound, PET-CT, Mammography, Fluoroscopy, Nuclear Medicine, and Interventional Radiology reporting. Modality-specific structured templates are pre-configured and fully customizable.',
    },
    {
      q: 'What does the implementation process look like for enterprise hospitals?',
      a: 'Our dedicated enterprise implementation team provides a structured 4-week onboarding: system integration, radiologist training, workflow customization, pilot testing, and go-live support. Dedicated CSM assigned for ongoing success.',
    },
    {
      q: 'How does RadAI handle critical findings and clinical alerts?',
      a: 'RadAI includes an automated critical findings detection engine that flags urgent incidental and primary findings in real time, triggers notification workflows, and documents alert communication in the audit trail for full medico-legal compliance.',
    },
  ];

  const integrations = [
    'Philips IntelliSpace', 'Sectra PACS', 'Intelerad', 'Oracle Health',
    'Epic Systems', 'Cerner PowerChart', 'GE HealthCare', 'Siemens Healthineers',
    'Fujifilm Synapse', 'Change Healthcare', 'Nuance PowerScribe', 'Ambra Health',
  ];

  const capabilities = [
    { label: 'Report Accuracy', value: 97, color: '#38bdf8' },
    { label: 'Workflow Speed', value: 92, color: '#2dd4bf' },
    { label: 'Radiologist Satisfaction', value: 95, color: '#a78bfa' },
    { label: 'Integration Success Rate', value: 99, color: '#f4c55a' },
  ];

  const seoKeywords = [
    'AI Radiology Reporting Software',
    'Radiology AI Copilot',
    'AI Report Generator',
    'Workflow Automation',
    'Healthcare AI Platform',
    'Structured Reporting',
    'Enterprise Radiology',
    'PACS Integration',
  ];

  return (
    <>
      <GlobalStyles />
      <div className="noise" style={{ minHeight: '100vh', background: 'var(--navy)', color: 'var(--text)', fontFamily: 'var(--font-body)', overflow: 'hidden' }}>

        {/* ── Fixed background blobs ── */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: '-200px', left: '50%', transform: 'translateX(-50%)',
            width: '900px', height: '900px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', top: '40%', left: '-200px',
            width: '600px', height: '600px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(45,212,191,0.05) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-100px', right: '-100px',
            width: '700px', height: '700px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)',
          }} />
          {/* Grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(56,189,248,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.025) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }} />
        </div>

        {/* ══════════════════════════════════════════════
            NAVBAR
        ══════════════════════════════════════════════ */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 100,
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
          background: scrolled ? 'rgba(5,12,26,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px)' : 'none',
          transition: 'all 0.3s ease',
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="animate-pulse-glow" style={{
                width: '44px', height: '44px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #7dd3fc, #38bdf8, #2dd4bf)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Microscope size={22} style={{ color: '#040e1e' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 800, lineHeight: 1 }}>
                  Rad<span className="grad-text">AI</span>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--muted)', fontWeight: 500, letterSpacing: '0.06em' }}>
                  AI RADIOLOGY INTELLIGENCE
                </div>
              </div>
            </div>

            {/* Desktop Nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="desktop-nav">
              {[
                { label: 'Platform', href: '#platform' },
                { label: 'Workflow', href: '#workflow' },
                { label: 'Security', href: '#security' },
                { label: 'Enterprise', href: '#enterprise' },
                { label: 'Integrations', href: '#integrations' },
                { label: 'FAQ', href: '#faq' },
              ].map((item) => (
                <a key={item.label} href={item.href} className="nav-link">{item.label}</a>
              ))}
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button className="btn-outline" style={{ padding: '10px 20px', fontSize: '0.85rem', display: 'none' }}
                id="book-demo-btn">
                Book Demo
              </button>
              <button className="btn-primary" style={{ padding: '10px 22px' }} onClick={onGetStarted}>
                Start Free Trial <ArrowRight size={15} />
              </button>
              {/* Hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', display: 'flex', padding: '6px' }}
                id="hamburger-btn"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Nav Overlay */}
        <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
          <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 }}>
              Rad<span className="grad-text">AI</span>
            </div>
            <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}>
              <X size={24} />
            </button>
          </div>
          <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: 'Platform', href: '#platform' },
              { label: 'Workflow', href: '#workflow' },
              { label: 'Security', href: '#security' },
              { label: 'Enterprise', href: '#enterprise' },
              { label: 'Integrations', href: '#integrations' },
              { label: 'FAQ', href: '#faq' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'block', padding: '16px 20px', borderRadius: '14px',
                  color: 'var(--text)', textDecoration: 'none', fontWeight: 600, fontSize: '1.05rem',
                  border: '1px solid transparent', transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.background = 'rgba(56,189,248,0.06)'; (e.target as HTMLAnchorElement).style.borderColor = 'var(--border)'; }}
                onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.background = 'transparent'; (e.target as HTMLAnchorElement).style.borderColor = 'transparent'; }}
              >
                {item.label}
              </a>
            ))}
          </div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
            <button className="btn-primary" style={{ justifyContent: 'center' }} onClick={() => { setMobileOpen(false); onGetStarted(); }}>
              Start Free Trial <ArrowRight size={16} />
            </button>
            <button className="btn-outline" style={{ justifyContent: 'center' }} onClick={() => setMobileOpen(false)}>
              Book Enterprise Demo
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════ */}
        <section style={{ position: 'relative', zIndex: 10, maxWidth: '1280px', margin: '0 auto', padding: '80px 24px 60px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>

            {/* Left */}
            <div>
              {/* Badge */}
              <div className="animate-fadeUp section-label" style={{ marginBottom: '28px' }}>
                <Sparkles size={14} />
                AI Radiology Reporting Software · 2026
              </div>

              {/* Headline */}
              <h1
                className="animate-fadeUp delay-100 hero-title"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '3.8rem', fontWeight: 900, lineHeight: 1.08,
                  letterSpacing: '-0.02em',
                  opacity: 0,
                }}
              >
                The Elite AI<br />
                <span className="grad-text">Radiology</span><br />
                <span style={{ fontStyle: 'italic' }}>Intelligence</span> Suite
              </h1>

              {/* Sub */}
              <p
                className="animate-fadeUp delay-200"
                style={{
                  marginTop: '24px', maxWidth: '520px',
                  fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--muted)',
                  fontWeight: 400, opacity: 0,
                }}
              >
                Enterprise-grade AI radiology reporting platform that generates clinically structured,
                DICOM-ready reports in seconds. Built for modern imaging centers, hospital radiology
                departments, and enterprise healthcare networks.
              </p>

              {/* SEO Keywords */}
              <div
                className="animate-fadeUp delay-300"
                style={{
                  marginTop: '24px', display: 'flex', flexWrap: 'wrap', gap: '8px', opacity: 0,
                }}
              >
                {seoKeywords.map((kw, i) => (
                  <span key={i} style={{
                    padding: '5px 14px', borderRadius: '100px',
                    border: '1px solid rgba(56,189,248,0.12)',
                    background: 'rgba(56,189,248,0.04)',
                    fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em',
                    color: 'rgba(147,213,248,0.7)',
                  }}>{kw}</span>
                ))}
              </div>

              {/* CTAs */}
              <div
                className="animate-fadeUp delay-400"
                style={{ marginTop: '36px', display: 'flex', gap: '14px', flexWrap: 'wrap', opacity: 0 }}
              >
                <button className="btn-primary" onClick={onGetStarted} style={{ fontSize: '0.95rem', padding: '15px 32px' }}>
                  Start Free Trial <ArrowRight size={16} />
                </button>
                <button className="btn-outline" style={{ fontSize: '0.95rem', padding: '15px 32px' }}>
                  <Play size={16} /> Watch Product Demo
                </button>
              </div>

              {/* Social proof */}
              <div
                className="animate-fadeUp delay-500"
                style={{
                  marginTop: '44px',
                  display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap',
                  opacity: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '-8px' }}>
                  {['AM', 'JC', 'PS', 'RK'].map((initials, i) => (
                    <div key={i} style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: `linear-gradient(135deg, hsl(${i * 40 + 180}deg 70% 40%), hsl(${i * 40 + 210}deg 70% 55%))`,
                      border: '2px solid var(--navy)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.65rem', fontWeight: 700, color: '#fff',
                      marginLeft: i > 0 ? '-10px' : 0, zIndex: 10 - i,
                    }}>{initials}</div>
                  ))}
                </div>
                <div>
                  <div style={{ display: 'flex', gap: '2px', marginBottom: '3px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} fill="#f4c55a" style={{ color: '#f4c55a' }} />
                    ))}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    Trusted by <strong style={{ color: 'var(--text)' }}>50+ healthcare organizations</strong>
                  </div>
                </div>
                <div style={{ width: '1px', height: '32px', background: 'var(--border)' }} />
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                  <div className="glow-dot" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />
                  10,000+ reports generated today
                </div>
              </div>
            </div>

            {/* Right — AI Demo Panel */}
            <div className="animate-fadeIn delay-300" style={{ position: 'relative', opacity: 0 }}>
              <div className="animate-float" style={{ position: 'relative' }}>
                {/* Glow behind */}
                <div style={{
                  position: 'absolute', inset: '-20px',
                  background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)',
                  borderRadius: '50%',
                }} />

                {/* Main card */}
                <div className="glass" style={{ borderRadius: '28px', padding: '0', overflow: 'hidden', position: 'relative' }}>
                  {/* Card header */}
                  <div style={{
                    padding: '18px 22px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'rgba(56,189,248,0.03)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '12px',
                        background: 'rgba(56,189,248,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Brain size={18} style={{ color: 'var(--cyan)' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>RadAI Copilot</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Live AI Clinical Reporting Engine</div>
                      </div>
                    </div>
                    <div style={{
                      padding: '5px 12px', borderRadius: '100px',
                      background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                      fontSize: '0.7rem', fontWeight: 700, color: '#4ade80',
                      display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                      <span className="glow-dot" style={{ width: '6px', height: '6px' }} />
                      LIVE
                    </div>
                  </div>

                  <div style={{ padding: '20px' }}>
                    {/* Voice input */}
                    <div style={{
                      borderRadius: '16px', padding: '16px',
                      background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)',
                      marginBottom: '14px', position: 'relative', overflow: 'hidden',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <Activity size={14} style={{ color: 'var(--cyan)' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cyan)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                          Voice Input — CT KUB
                        </span>
                        <div className="animate-blink" style={{ width: '7px', height: '14px', background: 'var(--cyan)', borderRadius: '1px', marginLeft: 'auto' }} />
                      </div>
                      <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#c0d8f0' }}>
                        "5 mm right renal calculus with mild hydronephrosis, no ureteric extension..."
                      </p>
                      <div className="scan-overlay" />
                    </div>

                    {/* Extracted data */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                      {/* AI Extraction */}
                      <div style={{ borderRadius: '14px', padding: '14px', background: 'rgba(56,189,248,0.04)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                          <Cpu size={13} style={{ color: 'var(--cyan)' }} />
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI Extraction</span>
                        </div>
                        {[
                          { k: 'Modality', v: 'CT KUB' },
                          { k: 'Finding', v: 'Renal Calculus' },
                          { k: 'Confidence', v: '98.4%', highlight: true },
                        ].map((row) => (
                          <div key={row.k} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '5px 8px', borderRadius: '8px',
                            background: 'rgba(0,0,0,0.2)', marginBottom: '4px',
                            fontSize: '0.75rem',
                          }}>
                            <span style={{ color: 'var(--muted)' }}>{row.k}</span>
                            <span style={{ color: row.highlight ? '#4ade80' : 'var(--cyan)', fontWeight: 600 }}>{row.v}</span>
                          </div>
                        ))}
                      </div>

                      {/* QA Engine */}
                      <div style={{ borderRadius: '14px', padding: '14px', background: 'rgba(56,189,248,0.04)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                          <ScanLine size={13} style={{ color: 'var(--cyan)' }} />
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>QA Engine</span>
                        </div>
                        {[
                          'Findings validated',
                          'Impression generated',
                          'Clinical consistency ✓',
                        ].map((item) => (
                          <div key={item} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '5px 8px', borderRadius: '8px',
                            background: 'rgba(0,0,0,0.2)', marginBottom: '4px',
                            fontSize: '0.75rem', color: 'var(--muted)',
                          }}>
                            <CheckCircle2 size={12} style={{ color: '#4ade80', flexShrink: 0 }} />
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Generated impression */}
                    <div style={{
                      borderRadius: '16px', padding: '16px',
                      background: 'linear-gradient(135deg, rgba(56,189,248,0.08), rgba(45,212,191,0.06))',
                      border: '1px solid rgba(56,189,248,0.2)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cyan-light)' }}>Generated Impression</span>
                        <span style={{
                          padding: '3px 10px', borderRadius: '100px',
                          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                          fontSize: '0.65rem', fontWeight: 700, color: '#4ade80',
                        }}>AI Complete · 2.3s</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', lineHeight: 1.7, color: '#d0e8f8' }}>
                        5 mm calculus noted within the right renal pelvis with associated mild hydronephrosis.
                        No ureteric calculus identified. Contralateral kidney appears unremarkable.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating badge — top right */}
                <div style={{
                  position: 'absolute', top: '-16px', right: '-16px',
                  padding: '8px 16px', borderRadius: '100px',
                  background: 'linear-gradient(135deg, rgba(244,197,90,0.15), rgba(251,191,36,0.1))',
                  border: '1px solid rgba(244,197,90,0.3)',
                  fontSize: '0.72rem', fontWeight: 700, color: '#f4c55a',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  backdropFilter: 'blur(12px)',
                }}>
                  <Award size={13} /> Ranked #1 Radiology AI 2026
                </div>

                {/* Floating badge — bottom left */}
                <div style={{
                  position: 'absolute', bottom: '-14px', left: '-16px',
                  padding: '8px 16px', borderRadius: '100px',
                  background: 'rgba(13,30,54,0.9)',
                  border: '1px solid var(--border)',
                  fontSize: '0.72rem', fontWeight: 700, color: '#4ade80',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  backdropFilter: 'blur(12px)',
                }}>
                  <Shield size={13} /> HIPAA Compliant
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Marquee trust bar ── */}
        <section style={{ position: 'relative', zIndex: 10, borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '18px 0', background: 'rgba(13,30,54,0.4)', overflow: 'hidden' }}>
          <div className="marquee-track">
            <div className="marquee-inner animate-marquee">
              {[...integrations, ...integrations].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '0 32px', whiteSpace: 'nowrap',
                  fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)',
                }}>
                  <BadgeCheck size={15} style={{ color: 'var(--cyan)', flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Compliance badges ── */}
        <section style={{ position: 'relative', zIndex: 10, padding: '32px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
            {[
              { icon: Shield, label: 'HIPAA Ready', color: '#38bdf8' },
              { icon: BadgeCheck, label: 'SOC 2 Aligned', color: '#2dd4bf' },
              { icon: Lock, label: 'End-to-End Encrypted', color: '#a78bfa' },
              { icon: Database, label: 'PACS / RIS / EMR', color: '#f4c55a' },
              { icon: Globe, label: 'HL7 FHIR', color: '#34d399' },
              { icon: Clock3, label: '24/7 Monitoring', color: '#f87171' },
            ].map((badge, i) => {
              const Icon = badge.icon;
              return (
                <div key={i} className="glass" style={{
                  borderRadius: '16px', padding: '14px 16px',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted)',
                }}>
                  <Icon size={16} style={{ color: badge.color, flexShrink: 0 }} />
                  {badge.label}
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            STATS
        ══════════════════════════════════════════════ */}
        <StatsSection />

        {/* ══════════════════════════════════════════════
            PLATFORM / FEATURES
        ══════════════════════════════════════════════ */}
        <section id="platform" style={{ position: 'relative', zIndex: 10, padding: '100px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 64px' }}>
              <div className="section-label" style={{ marginBottom: '20px' }}>
                <Sparkles size={14} /> Enterprise AI Platform
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '3rem', fontWeight: 900, lineHeight: 1.12, letterSpacing: '-0.02em',
              }}>
                Crafted for Elite Imaging Centers &{' '}
                <span className="grad-text">Enterprise Healthcare</span>
              </h2>
              <p style={{ marginTop: '20px', fontSize: '1rem', lineHeight: 1.8, color: 'var(--muted)' }}>
                RadAI combines clinical intelligence, workflow automation, enterprise security,
                structured reporting, and real-time AI into one modern radiology platform.
              </p>
            </div>

            {/* Feature grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="glass feature-card" style={{ borderRadius: '24px', padding: '32px' }}>
                    <div style={{
                      width: '54px', height: '54px', borderRadius: '16px', marginBottom: '20px',
                      background: `linear-gradient(135deg, ${f.color}22, ${f.color}11)`,
                      border: `1px solid ${f.color}33`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={24} style={{ color: f.color }} />
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '12px' }}>{f.title}</h3>
                    <p style={{ fontSize: '0.9rem', lineHeight: 1.75, color: 'var(--muted)' }}>{f.desc}</p>
                    <button style={{
                      marginTop: '20px', display: 'flex', alignItems: 'center', gap: '6px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: f.color, fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--font-body)',
                      padding: 0, transition: 'gap 0.2s',
                    }}>
                      Explore Feature <ChevronRight size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            WORKFLOW
        ══════════════════════════════════════════════ */}
        <section id="workflow" style={{ position: 'relative', zIndex: 10, background: 'rgba(13,30,54,0.5)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '100px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 64px' }}>
              <div className="section-label" style={{ marginBottom: '20px' }}>
                <Workflow size={14} /> AI-Powered Workflow
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.8rem', fontWeight: 900, lineHeight: 1.12, letterSpacing: '-0.02em',
              }}>
                From Dictation to<br />
                <span className="grad-text">Final Report</span> in Seconds
              </h2>
              <p style={{ marginTop: '16px', fontSize: '1rem', lineHeight: 1.8, color: 'var(--muted)' }}>
                A seamless, clinically validated four-step AI pipeline that handles every
                aspect of radiology report generation.
              </p>
            </div>

            {/* Steps */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {workflowSteps.map((step, i) => {
                const Icon = step.icon;
                const active = activeDemoStep === i;
                return (
                  <div
                    key={i}
                    onClick={() => setActiveDemoStep(i)}
                    style={{
                      borderRadius: '24px', padding: '32px', cursor: 'pointer',
                      border: `1px solid ${active ? 'rgba(56,189,248,0.4)' : 'var(--border)'}`,
                      background: active ? 'rgba(56,189,248,0.07)' : 'rgba(13,30,54,0.5)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: active ? '0 0 40px rgba(56,189,248,0.12)' : 'none',
                      transform: active ? 'translateY(-4px)' : 'none',
                      transition: 'all 0.4s ease',
                    }}
                  >
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px',
                    }}>
                      <div style={{
                        width: '52px', height: '52px', borderRadius: '16px',
                        background: active ? 'linear-gradient(135deg, #7dd3fc, #38bdf8)' : 'rgba(56,189,248,0.08)',
                        border: `1px solid ${active ? 'transparent' : 'var(--border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.3s',
                      }}>
                        <Icon size={22} style={{ color: active ? '#040e1e' : 'var(--cyan)' }} />
                      </div>
                      <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '2rem', fontWeight: 900, color: active ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.06)',
                        transition: 'color 0.3s',
                      }}>{step.step}</span>
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '10px' }}>{step.title}</h3>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--muted)' }}>{step.desc}</p>
                    {active && (
                      <div style={{
                        marginTop: '16px', height: '3px', borderRadius: '2px',
                        background: 'linear-gradient(90deg, #38bdf8, #2dd4bf)',
                        animation: 'progressBar 2.5s linear',
                      }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Capabilities bars */}
            <div className="glass" style={{ borderRadius: '24px', padding: '40px', marginTop: '48px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px' }}>
                {capabilities.map((cap, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>{cap.label}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: cap.color }}>{cap.value}%</span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div
                        className="progress-fill"
                        style={{
                          height: '100%', borderRadius: '3px',
                          background: `linear-gradient(90deg, ${cap.color}, ${cap.color}99)`,
                          width: `${cap.value}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            SECURITY
        ══════════════════════════════════════════════ */}
        <section id="security" style={{ position: 'relative', zIndex: 10, padding: '100px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>

              {/* Security card */}
              <div className="glass" style={{ borderRadius: '28px', padding: '44px' }}>
                <div className="section-label" style={{ marginBottom: '20px' }}>
                  <Lock size={14} /> Enterprise Security
                </div>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2.4rem', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '16px',
                }}>
                  Healthcare-Grade<br />
                  <span className="grad-text">Infrastructure</span>
                </h2>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--muted)', marginBottom: '32px' }}>
                  Built for hospitals, imaging centers, and enterprise healthcare networks with
                  uncompromising security and compliance architecture.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'HIPAA-ready architecture & PHI governance', color: '#38bdf8' },
                    { label: 'End-to-end AES-256 encrypted data pipelines', color: '#2dd4bf' },
                    { label: 'Role-based access control (RBAC)', color: '#a78bfa' },
                    { label: 'Full audit logging & activity tracking', color: '#f4c55a' },
                    { label: 'SOC 2-aligned enterprise cloud infrastructure', color: '#34d399' },
                    { label: 'Critical findings alert & escalation workflows', color: '#f87171' },
                  ].map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '14px 18px', borderRadius: '14px',
                      background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)',
                    }}>
                      <CheckCheck size={16} style={{ color: item.color, flexShrink: 0 }} />
                      <span style={{ fontSize: '0.875rem', color: 'var(--text)', fontWeight: 500 }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metrics card */}
              <div id="enterprise" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="glass" style={{ borderRadius: '28px', padding: '40px' }}>
                  <div className="section-label" style={{ marginBottom: '20px' }}>
                    <TrendingUp size={14} /> Performance Metrics
                  </div>
                  <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2rem', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '28px',
                  }}>
                    Measurable Impact<br />Across Your Department
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {[
                      { value: '92%', label: 'Faster Reporting TAT', color: '#38bdf8' },
                      { value: '< 3 min', label: 'Avg. Report Generation', color: '#2dd4bf' },
                      { value: '95%', label: 'Clinical Satisfaction', color: '#a78bfa' },
                      { value: '24/7', label: 'Enterprise Reliability', color: '#f4c55a' },
                    ].map((item, i) => (
                      <div key={i} className="stat-card" style={{
                        borderRadius: '18px', padding: '22px',
                        background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)',
                        textAlign: 'center',
                      }}>
                        <div style={{
                          fontSize: '2rem', fontWeight: 900, color: item.color,
                          fontFamily: 'var(--font-display)',
                        }}>{item.value}</div>
                        <div style={{ marginTop: '6px', fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 500 }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enterprise CTA */}
                <div style={{
                  borderRadius: '28px', padding: '36px',
                  background: 'linear-gradient(135deg, rgba(56,189,248,0.1), rgba(45,212,191,0.06))',
                  border: '1px solid rgba(56,189,248,0.2)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <Building2 size={20} style={{ color: 'var(--cyan)' }} />
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Enterprise Program</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--muted)', marginBottom: '24px' }}>
                    Dedicated implementation team, custom integrations, SLA guarantees, and
                    radiologist training programs for enterprise hospitals & networks.
                  </p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button className="btn-primary" style={{ padding: '12px 22px', fontSize: '0.85rem' }} onClick={onGetStarted}>
                      Start Enterprise Trial <ArrowRight size={15} />
                    </button>
                    <button className="btn-outline" style={{ padding: '12px 22px', fontSize: '0.85rem' }}>
                      Schedule Demo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            INTEGRATIONS
        ══════════════════════════════════════════════ */}
        <section id="integrations" style={{ position: 'relative', zIndex: 10, background: 'rgba(13,30,54,0.5)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '100px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <div className="section-label" style={{ marginBottom: '20px' }}>
                <Database size={14} /> Integrations
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.6rem', fontWeight: 900, lineHeight: 1.12, letterSpacing: '-0.02em',
              }}>
                Connects Seamlessly to Your<br />
                <span className="grad-text">Existing Ecosystem</span>
              </h2>
              <p style={{ marginTop: '16px', fontSize: '1rem', lineHeight: 1.8, color: 'var(--muted)', maxWidth: '560px', margin: '16px auto 0' }}>
                PACS, RIS, EMR, HL7 FHIR, DICOM SR, REST API — RadAI plugs into
                your existing infrastructure in days, not months.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              {integrations.map((item, i) => (
                <div key={i} className="glass feature-card" style={{
                  borderRadius: '18px', padding: '20px 18px',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  fontSize: '0.82rem', fontWeight: 600, color: 'var(--muted)',
                }}>
                  <CheckCircle2 size={16} style={{ color: 'var(--cyan)', flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>

            {/* API promo */}
            <div className="glass" style={{ borderRadius: '24px', padding: '36px', marginTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '16px',
                  background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Cpu size={22} style={{ color: '#a78bfa' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Enterprise REST API</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '4px' }}>
                    Full programmatic access. HL7 FHIR, DICOM SR, and webhook support. 99.99% uptime SLA.
                  </div>
                </div>
              </div>
              <button className="btn-outline" style={{ flexShrink: 0 }}>
                View API Docs <ArrowUpRight size={15} />
              </button>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            TESTIMONIALS
        ══════════════════════════════════════════════ */}
        <section style={{ position: 'relative', zIndex: 10, padding: '100px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <div className="section-label" style={{ marginBottom: '20px' }}>
                <Star size={14} /> Trusted by Radiologists
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.6rem', fontWeight: 900, lineHeight: 1.12, letterSpacing: '-0.02em',
              }}>
                What Radiologists Are<br />
                <span className="grad-text">Saying About RadAI</span>
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {testimonials.map((t, i) => (
                <div key={i} className="glass testimonial-card" style={{ borderRadius: '24px', padding: '36px' }}>
                  <Quote size={28} style={{ color: 'rgba(56,189,248,0.2)', marginBottom: '20px' }} />
                  <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: 'var(--text)', fontStyle: 'italic', marginBottom: '28px' }}>
                    "{t.text}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%',
                      background: `linear-gradient(135deg, hsl(${i * 50 + 190}deg 70% 40%), hsl(${i * 50 + 220}deg 70% 55%))`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '0.8rem', color: '#fff',
                      flexShrink: 0,
                    }}>{t.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '2px' }}>{t.role}</div>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(56,189,248,0.6)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={10} /> {t.location}
                      </div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '2px' }}>
                      {[...Array(t.rating)].map((_, j) => (
                        <Star key={j} size={12} fill="#f4c55a" style={{ color: '#f4c55a' }} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            FAQ
        ══════════════════════════════════════════════ */}
        <section id="faq" style={{ position: 'relative', zIndex: 10, background: 'rgba(13,30,54,0.4)', borderTop: '1px solid var(--border)', padding: '100px 24px' }}>
          <div style={{ maxWidth: '860px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <div className="section-label" style={{ marginBottom: '20px' }}>
                <CheckCircle2 size={14} /> FAQ
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.8rem', fontWeight: 900, lineHeight: 1.12, letterSpacing: '-0.02em',
              }}>
                Frequently Asked<br />
                <span className="grad-text">Questions</span>
              </h2>
              <p style={{ marginTop: '16px', fontSize: '1rem', lineHeight: 1.8, color: 'var(--muted)' }}>
                Everything you need to know about AI radiology reporting, healthcare security,
                and enterprise implementation.
              </p>
            </div>
            {faqData.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} index={i} />
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            FINAL CTA
        ══════════════════════════════════════════════ */}
        <section style={{ position: 'relative', zIndex: 10, padding: '80px 24px 100px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{
              borderRadius: '40px', padding: '72px 60px',
              background: 'linear-gradient(135deg, rgba(56,189,248,0.1) 0%, rgba(45,212,191,0.07) 50%, rgba(167,139,250,0.1) 100%)',
              border: '1px solid rgba(56,189,248,0.2)',
              textAlign: 'center', position: 'relative', overflow: 'hidden',
            }}>
              {/* Background glow */}
              <div style={{
                position: 'absolute', top: '-40%', left: '50%', transform: 'translateX(-50%)',
                width: '600px', height: '400px', borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(56,189,248,0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              {/* Rotating ring */}
              <div className="animate-spin-slow" style={{
                position: 'absolute', top: '-60px', right: '-60px',
                width: '200px', height: '200px', borderRadius: '50%',
                border: '1px dashed rgba(56,189,248,0.15)',
              }} />

              <div style={{ position: 'relative' }}>
                <div className="section-label" style={{ marginBottom: '24px', display: 'inline-flex' }}>
                  <Globe size={14} /> Trusted by Modern Healthcare Teams Worldwide
                </div>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '3.2rem', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '20px',
                }}>
                  Redefine the Future of<br />
                  <span className="grad-text">Radiology Reporting</span>
                </h2>
                <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--muted)', maxWidth: '600px', margin: '0 auto 40px' }}>
                  Accelerate reporting, reduce radiologist burnout, improve clinical efficiency,
                  and modernize your radiology infrastructure with enterprise-grade AI.
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
                  <button className="btn-primary" style={{ padding: '16px 36px', fontSize: '1rem' }} onClick={onGetStarted}>
                    Start Free Trial — No Credit Card <ArrowRight size={16} />
                  </button>
                  <button className="btn-outline" style={{ padding: '16px 36px', fontSize: '1rem' }}>
                    Schedule Enterprise Demo
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
                  {[
                    { icon: Shield, label: 'HIPAA Ready' },
                    { icon: CheckCircle2, label: 'Free 14-Day Trial' },
                    { icon: Users, label: '50+ Orgs Trust Us' },
                    { icon: Zap, label: 'Live in 30 Days' },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.8rem', color: 'var(--muted)' }}>
                        <Icon size={14} style={{ color: 'var(--cyan)' }} />
                        {item.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════ */}
        <footer style={{ position: 'relative', zIndex: 10, borderTop: '1px solid var(--border)', background: 'rgba(5,12,26,0.8)', backdropFilter: 'blur(24px)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '72px 24px 40px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '40px', marginBottom: '56px' }}>

              {/* Brand */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '13px',
                    background: 'linear-gradient(135deg, #7dd3fc, #38bdf8, #2dd4bf)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Microscope size={20} style={{ color: '#040e1e' }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, lineHeight: 1 }}>
                      Rad<span className="grad-text">AI</span>
                    </div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '0.06em', fontWeight: 500 }}>
                      AI RADIOLOGY INTELLIGENCE
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.8, color: 'var(--muted)', maxWidth: '300px', marginBottom: '24px' }}>
                  Enterprise-grade AI radiology reporting platform built for modern healthcare,
                  intelligent reporting workflows, and clinical productivity acceleration.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[Twitter, Linkedin, Youtube, Instagram].map((Icon, i) => (
                    <a key={i} href="#" style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      border: '1px solid var(--border)', background: 'rgba(56,189,248,0.04)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--muted)', transition: 'all 0.2s',
                      textDecoration: 'none',
                    }}
                      onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = 'var(--border-hover)'; el.style.color = 'var(--cyan)'; }}
                      onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = 'var(--border)'; el.style.color = 'var(--muted)'; }}
                    >
                      <Icon size={16} />
                    </a>
                  ))}
                </div>
              </div>

              {/* Platform */}
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '20px' }}>Platform</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {['AI Reporting', 'Workflow Automation', 'Structured Reports', 'QA Engine', 'Analytics Dashboard'].map((item) => (
                    <a key={item} href="#platform" style={{ fontSize: '0.875rem', color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
                    >{item}</a>
                  ))}
                </div>
              </div>

              {/* Integrations */}
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '20px' }}>Integrations</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {['PACS Systems', 'RIS Platforms', 'EMR / EHR', 'HL7 FHIR', 'REST API'].map((item) => (
                    <a key={item} href="#integrations" style={{ fontSize: '0.875rem', color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
                    >{item}</a>
                  ))}
                </div>
              </div>

              {/* Resources */}
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '20px' }}>Resources</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {['Documentation', 'API Reference', 'Security Overview', 'Case Studies', 'Blog'].map((item) => (
                    <a key={item} href="#" style={{ fontSize: '0.875rem', color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
                    >{item}</a>
                  ))}
                </div>
              </div>

              {/* Company */}
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text)', marginBottom: '20px' }}>Company</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {['About RadAI', 'Enterprise', 'Careers', 'Contact', 'Privacy Policy'].map((item) => (
                    <a key={item} href="#" style={{ fontSize: '0.875rem', color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
                    >{item}</a>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer bottom */}
            <div style={{
              borderTop: '1px solid var(--border)', paddingTop: '28px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: '16px',
            }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                © 2026 RadAI Technologies. Enterprise AI Radiology Reporting Platform.
                All rights reserved.
              </p>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {[
                  { icon: Shield, label: 'HIPAA Ready' },
                  { icon: Database, label: 'Enterprise Infra' },
                  { icon: Clock3, label: '24/7 Monitoring' },
                  { icon: Building2, label: 'Healthcare Focused' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--muted)' }}>
                      <Icon size={13} style={{ color: 'var(--cyan)' }} /> {item.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </footer>

        {/* Responsive overrides via style tag */}
        <style>{`
          @media (max-width: 1024px) {
            section > div > div[style*="grid-template-columns: 1fr 1fr"] {
              grid-template-columns: 1fr !important;
            }
            section > div > div[style*="grid-template-columns: 2fr 1fr 1fr 1fr 1fr"] {
              grid-template-columns: 1fr 1fr !important;
            }
          }
          @media (max-width: 768px) {
            section > div > div[style*="grid-template-columns: 1fr 1fr"] {
              grid-template-columns: 1fr !important;
            }
            nav > div > div.desktop-nav { display: none !important; }
            #book-demo-btn { display: none !important; }
            #hamburger-btn { display: flex !important; }
          }
          @media (min-width: 769px) {
            #hamburger-btn { display: none !important; }
            #book-demo-btn { display: inline-flex !important; }
          }
        `}</style>
      </div>
    </>
  );
}