import { useEffect, useState, useRef } from 'react';
import {
  Activity, ArrowRight, Brain, CheckCircle2, Clock3, Lock, Microscope,
  Shield, Sparkles, Stethoscope, TrendingUp, Workflow, Zap, BarChart3,
  Play, Star, ChevronRight, Globe, Layers3, ScanLine, Database, Cpu,
  Building2, BadgeCheck, ChevronDown, Menu, X, Award, HeartPulse,
  FileText, Users, CheckCheck, ArrowUpRight, Quote, Mail, Phone,
  MapPin, Twitter, Linkedin, Youtube, Instagram, MoveRight,
} from 'lucide-react';
import { PRICING, formatINR } from '../../lib/subscription';

/* ─── Global Styles ────────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;0,900;1,400;1,700&family=Roboto+Condensed:wght@700;900&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      /* Premium clinical palette — deep navy + platinum + gold */
      --navy-0:     #03070f;
      --navy-1:     #060d1c;
      --navy-2:     #091428;
      --navy-3:     #0d1c36;
      --navy-4:     #112244;
      --card:       rgba(9,20,40,0.78);
      --border:     rgba(180,200,240,0.10);
      --border-h:   rgba(180,200,240,0.28);

      /* Accent colours */
      --gold:       #c8a84b;
      --gold-l:     #e0c578;
      --gold-pale:  rgba(200,168,75,0.12);
      --platinum:   #d4dff0;
      --ice:        #a8c4e8;
      --ice-l:      #c8dcf5;
      --emerald:    #00c48c;
      --coral:      #f06060;
      --sapphire:   #2e7de9;

      --text:       #dce8f8;
      --muted:      #7090b8;
      --font-body:  'Roboto', system-ui, sans-serif;
      --font-disp:  'Roboto Condensed', sans-serif;
      --r-sm:  10px;
      --r-md:  16px;
      --r-lg:  22px;
      --r-xl:  30px;
      --r-2xl: 42px;
    }

    html { scroll-behavior: smooth; }
    body {
      background: var(--navy-0);
      color: var(--text);
      font-family: var(--font-body);
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
      line-height: 1.6;
    }
    ::selection { background: rgba(200,168,75,0.28); color:#fff; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: var(--navy-1); }
    ::-webkit-scrollbar-thumb { background: rgba(200,168,75,0.3); border-radius: 3px; }

    /* ── Gradient text ── */
    .grad {
      background: linear-gradient(120deg, #e0c578 0%, #c8a84b 45%, #b8923e 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .grad-ice {
      background: linear-gradient(120deg, #c8dcf5 0%, #a8c4e8 55%, #7aabdf 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }

    /* ── Glass ── */
    .glass {
      background: var(--card);
      backdrop-filter: blur(32px);
      -webkit-backdrop-filter: blur(32px);
      border: 1px solid var(--border);
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
    }
    .glass:hover { border-color: var(--border-h); }

    /* ── Buttons ── */
    .btn-p {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 14px 30px; border-radius: 8px;
      font-family: var(--font-body); font-weight: 700; font-size: 0.88rem;
      letter-spacing: 0.04em; text-transform: uppercase;
      background: linear-gradient(130deg, #e0c578 0%, #c8a84b 60%, #b8923e 100%);
      color: #0a0e18; border: none; cursor: pointer; position: relative; overflow: hidden;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .btn-p:hover {
      transform: translateY(-2px) scale(1.01);
      box-shadow: 0 12px 40px rgba(200,168,75,0.35);
    }
    .btn-p::after {
      content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
      transition: left 0s;
    }
    .btn-p:hover::after { left: 100%; transition: left 0.5s ease; }

    .btn-o {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 14px 30px; border-radius: 8px;
      font-family: var(--font-body); font-weight: 600; font-size: 0.88rem;
      letter-spacing: 0.04em; text-transform: uppercase;
      background: rgba(200,168,75,0.06);
      border: 1px solid rgba(200,168,75,0.35); color: var(--gold-l); cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-o:hover {
      border-color: var(--gold);
      background: rgba(200,168,75,0.12);
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(200,168,75,0.15);
    }

    /* ── Nav link ── */
    .nav-a {
      font-size: 0.82rem; font-weight: 500; color: var(--muted);
      text-decoration: none; transition: color 0.2s; position: relative;
      padding-bottom: 3px; letter-spacing: 0.06em; text-transform: uppercase;
    }
    .nav-a::after {
      content: ''; position: absolute; bottom: -1px; left: 0; width: 0; height: 1.5px;
      background: var(--gold); transition: width 0.25s ease;
    }
    .nav-a:hover { color: var(--gold-l); }
    .nav-a:hover::after { width: 100%; }

    /* ── Section chip ── */
    .chip {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 5px 14px; border-radius: 4px;
      font-size: 0.68rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
      border: 1px solid rgba(200,168,75,0.32);
      background: rgba(200,168,75,0.07); color: var(--gold-l);
    }

    /* ── Section divider ── */
    .sec-divider {
      width: 48px; height: 3px;
      background: linear-gradient(90deg, var(--gold), transparent);
      margin: 0 auto 20px;
      border-radius: 2px;
    }

    /* ── Animations ── */
    @keyframes fadeUp   { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }
    @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
    @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
    @keyframes spinSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes marquee  { from{transform:translateX(0)} to{transform:translateX(-50%)} }
    @keyframes scan     { 0%{top:0;opacity:1}90%{opacity:1}100%{top:100%;opacity:0} }
    @keyframes blink    { 0%,100%{opacity:1}50%{opacity:0} }
    @keyframes pgFill   { from{width:0%} }
    @keyframes pulseG   { 0%,100%{box-shadow:0 0 0 0 rgba(0,196,140,0)}50%{box-shadow:0 0 24px 4px rgba(0,196,140,0.22)} }
    @keyframes shimmer  { 0%{left:-100%} 100%{left:100%} }
    @keyframes gradShift{ 0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%} }

    .fu  { animation: fadeUp 0.7s ease forwards; }
    .fi  { animation: fadeIn 0.6s ease forwards; }
    .flt { animation: float 4.5s ease-in-out infinite; }
    .mq  { animation: marquee 36s linear infinite; }
    .sc  { animation: scan 2.5s ease-in-out infinite; }
    .blk { animation: blink 1s step-end infinite; }
    .ssl { animation: spinSlow 16s linear infinite; }
    .pg  { animation: pgFill 1.8s ease forwards 0.4s; }

    .d1{animation-delay:.1s}.d2{animation-delay:.2s}.d3{animation-delay:.3s}
    .d4{animation-delay:.4s}.d5{animation-delay:.5s}.d6{animation-delay:.6s}
    .d7{animation-delay:.7s}.d8{animation-delay:.8s}

    /* ── Cards ── */
    .feat-c { transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease; }
    .feat-c:hover {
      transform: translateY(-6px);
      border-color: rgba(200,168,75,0.3);
      box-shadow: 0 24px 64px rgba(200,168,75,0.08);
    }

    .testi-c { transition: transform 0.3s ease, border-color 0.3s ease; }
    .testi-c:hover { transform: translateY(-5px); border-color: rgba(200,168,75,0.28); }

    .cert-c { transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease; }
    .cert-c:hover {
      transform: translateY(-4px); border-color: var(--border-h);
      box-shadow: 0 14px 40px rgba(200,168,75,0.08);
    }

    /* ── FAQ ── */
    .faq-ans { max-height:0; overflow:hidden; transition: max-height 0.4s ease, opacity 0.3s ease; opacity:0; }
    .faq-ans.open { max-height:320px; opacity:1; }

    /* ── Mobile nav ── */
    .mob-nav {
      position:fixed; inset:0; z-index:200; background:rgba(3,7,15,0.97);
      backdrop-filter:blur(32px); transform:translateX(100%);
      transition:transform 0.35s cubic-bezier(0.4,0,0.2,1);
    }
    .mob-nav.open { transform:translateX(0); }

    /* ── Marquee ── */
    .mq-wrap { overflow:hidden; }
    .mq-inner { display:flex; gap:0; width:max-content; }

    /* ── Glow dot ── */
    .gdot {
      width:9px; height:9px; border-radius:50%; background:#00c48c;
      box-shadow:0 0 0 3px rgba(0,196,140,0.2); animation:pulseG 2s ease-in-out infinite;
    }

    /* ── Scan line ── */
    .scanl {
      position:absolute; left:0; right:0; height:2px;
      background:linear-gradient(90deg,transparent,rgba(200,168,75,0.65),transparent);
    }

    /* ── Stat card ── */
    .stat-c { position:relative; overflow:hidden; }
    .stat-c::before {
      content:''; position:absolute; top:-50%; left:-50%;
      width:200%; height:200%;
      background:radial-gradient(circle at 50% 0%,rgba(200,168,75,0.055),transparent 60%);
      pointer-events:none;
    }

    /* ── Number accent ── */
    .num-big { font-family:var(--font-disp); font-weight:900; font-size:3rem; line-height:1; letter-spacing:-0.01em; }

    /* ── Timeline connector ── */
    .tl-line {
      position:absolute; top:40px; left:calc(50% + 38px);
      width:calc(100% - 76px); height:1px;
      background:linear-gradient(90deg,rgba(200,168,75,0.4),rgba(200,168,75,0.06));
    }

    /* ── Image overlay ── */
    .img-overlay { position:relative; border-radius:var(--r-lg); overflow:hidden; }
    .img-overlay img { width:100%; height:100%; object-fit:cover; display:block; filter:brightness(0.82) saturate(1.08); }
    .img-overlay::after {
      content:''; position:absolute; inset:0;
      background:linear-gradient(180deg,transparent 35%,rgba(3,7,15,0.72));
    }

    /* ── Gold rule ── */
    .gold-rule {
      width:100%; height:1px;
      background:linear-gradient(90deg,transparent,rgba(200,168,75,0.35),transparent);
      margin: 0;
    }

    /* ── Fluid type scale — scales smoothly across every viewport, no jumps ── */
    .hero-h1  { font-size:clamp(2.15rem, 5.4vw + 0.6rem, 4.2rem)  !important; }
    .sec-h2   { font-size:clamp(1.7rem,  3.4vw + 0.5rem, 2.9rem)  !important; }
    .sec-h2-lg{ font-size:clamp(1.9rem,  4vw + 0.5rem, 3.2rem)    !important; }

    /* ── Responsive layout — extra-wide monitors down to the smallest phones ── */
    @media(max-width:1024px){
      .hero-grid{grid-template-columns:1fr!important; gap:40px!important; text-align:center;}
      .hero-img-col{max-width:520px; margin:0 auto;}
      .hero-cta-row, .hero-social-row{justify-content:center!important;}
      .desk-nav{gap:20px!important;}
    }
    @media(max-width:900px){
      .desk-nav{display:none!important}
      #demo-btn{display:none!important}
      #ham-btn{display:flex!important}
      .feat-grid{grid-template-columns:repeat(auto-fit,minmax(280px,1fr))!important}
      .footer-grid{grid-template-columns:1fr 1fr!important}
    }
    @media(min-width:901px){
      #ham-btn{display:none!important}
      #demo-btn{display:inline-flex!important}
    }
    @media(max-width:640px){
      .feat-grid{grid-template-columns:1fr!important}
      .testi-grid{grid-template-columns:1fr!important}
      .sec-grid-2{grid-template-columns:1fr!important}
      .footer-grid{grid-template-columns:1fr!important}
      .wf-grid{grid-template-columns:1fr 1fr!important}
      section{padding-left:18px!important; padding-right:18px!important;}
    }
    @media(max-width:480px){
      .wf-grid{grid-template-columns:1fr!important}
      .num-big{font-size:2.2rem!important}
      section{padding-top:52px!important; padding-bottom:52px!important;}
    }
    @media(max-width:360px){
      .hero-h1{letter-spacing:-0.02em!important}
      .chip{font-size:0.66rem!important; padding:6px 10px!important;}
    }

    /* ── Reduced motion accessibility ── */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
    }
  `}</style>
);

/* ─── Counter Hook ──────────────────────────────────────────────────────── */
function useCounter(target: number, duration = 1900, start = false) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!start) return;
    let t0: number | null = null;
    const step = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setV(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return v;
}

/* ─── InView Hook ──────────────────────────────────────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─── FAQ Item ─────────────────────────────────────────────────────────── */
function FAQItem({ q, a, idx }: { q: string; a: string; idx: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass" style={{ borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '22px 28px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text)', fontFamily: 'var(--font-body)', textAlign: 'left', gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{
            minWidth: 30, height: 30, borderRadius: 6,
            background: 'rgba(200,168,75,0.1)', border: '1px solid rgba(200,168,75,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.68rem', fontWeight: 700, color: 'var(--gold-l)', letterSpacing: '0.04em',
          }}>{String(idx + 1).padStart(2, '0')}</span>
          <span style={{ fontWeight: 500, fontSize: '0.96rem', lineHeight: 1.45 }}>{q}</span>
        </div>
        <ChevronDown size={16} style={{ color: 'var(--gold)', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
      </button>
      <div className={`faq-ans ${open ? 'open' : ''}`}>
        <p style={{ padding: '0 28px 22px 74px', color: 'var(--muted)', lineHeight: 1.82, fontSize: '0.92rem' }}>{a}</p>
      </div>
    </div>
  );
}

/* ─── Stats ─────────────────────────────────────────────────────────────── */
const STATS = [
  { v: 92,    sfx: '%',   label: 'Faster Report TAT',         icon: TrendingUp  },
  { v: 10,    sfx: 'K+',  label: 'Reports Per Month',         icon: FileText    },
  { v: 50,    sfx: '+',   label: 'Healthcare Orgs Served',    icon: Building2   },
  { v: 9999,  sfx: '%',   label: 'Enterprise Uptime',         icon: Activity, dec: true },
];

function StatsSection() {
  const { ref, inView } = useInView();
  return (
    <section ref={ref} style={{ padding: '80px 0', position: 'relative', zIndex: 10 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
          {STATS.map((s, i) => {
            const Icon = s.icon;
            const n = useCounter(s.v, 1800, inView);
            return (
              <div key={i} className="glass stat-c" style={{
                borderRadius: 10, padding: '32px 28px', textAlign: 'center',
                opacity: inView ? 1 : 0,
                animation: inView ? `fadeUp 0.6s ease ${i * 0.12}s forwards` : 'none',
                borderTop: '3px solid rgba(200,168,75,0.4)',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 10,
                  background: 'rgba(200,168,75,0.08)', border: '1px solid rgba(200,168,75,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <Icon size={22} style={{ color: 'var(--gold)' }} />
                </div>
                <div className="num-big grad">{s.dec ? '99.99' : n}{s.sfx}</div>
                <div style={{ marginTop: 10, fontSize: '0.84rem', color: 'var(--muted)', fontWeight: 400, letterSpacing: '0.02em' }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const [step, setStep]           = useState(0);
  const [mob, setMob]             = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [pricingBilling, setPricingBilling] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    const t = setInterval(() => setStep(p => (p + 1) % 4), 2600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* ── Data ── */
  const features = [
    { icon: Brain,     color: '#a8c4e8', title: 'Clinical AI Intelligence',       desc: 'Multimodal AI trained exclusively on radiology data — understands anatomy, modality, laterality, and clinical nuance at consultant-level precision across all imaging specialties.' },
    { icon: Workflow,  color: '#00c48c', title: 'Structured Reporting Engine',    desc: 'Generate evidence-based, DICOM-compliant radiology reports automatically with smart section formatting, adaptive templates, and AI-assisted impression drafts.' },
    { icon: Shield,    color: '#c8a84b', title: 'Enterprise Security & HIPAA',    desc: 'HIPAA-ready infrastructure with AES-256 encryption, role-based access, full PHI governance, SOC 2-aligned cloud architecture, and complete audit trail.' },
    { icon: Zap,       color: '#e0c578', title: 'Sub-3-Minute Report Generation', desc: 'Ultra-low-latency AI inference purpose-built for high-volume radiology departments — reports ready in under 3 minutes from dictation to final delivery.' },
    { icon: BarChart3, color: '#7aabdf', title: 'Radiology Analytics Dashboard',  desc: 'Track TAT, volume metrics, AI accuracy benchmarks, radiologist KPIs, and quality scores across departments and modalities in real time.' },
    { icon: Layers3,   color: '#b8923e', title: 'Full Workflow Automation',        desc: 'Eliminate repetitive documentation. Automate worklist prioritisation, critical-findings alerts, report distribution, and multi-modality orchestration.' },
  ];

  const workflowSteps = [
    { title: 'Voice Dictation',  icon: Stethoscope, step: '01', desc: 'Capture clinical findings via intelligent voice recognition with medical vocabulary, speaker adaptation, and real-time transcription.' },
    { title: 'AI Extraction',    icon: Brain,       step: '02', desc: 'Clinical AI extracts anatomy, modality, laterality, measurements, and key imaging findings automatically from dictation.' },
    { title: 'QA Validation',    icon: Shield,      step: '03', desc: 'Automated consistency checks, critical finding alerts, and peer-review-ready quality assurance pipeline with medico-legal logging.' },
    { title: 'Final Report',     icon: FileText,    step: '04', desc: 'DICOM-compliant, structured professional radiology report generated, validated, and distributed instantly to PACS and EMR.' },
  ];

  /* ── Indian-majority testimonials ── */
  const testimonials = [
    {
      name: 'Dr. Ananya Mehta',
      role: 'Chief of Radiology',
      org:  'Apollo Hospitals, Mumbai',
      text: 'RadAI has completely transformed our department\'s productivity. Reporting TAT dropped by 89% in the first month alone. The AI understands clinical nuance at a level that genuinely surprised our entire senior radiology team.',
      rating: 5, avatar: 'AM', loc: 'Mumbai, India', color: '#1a4a7a',
    },
    {
      name: 'Dr. Priya Sundar',
      role: 'Medical Director — Imaging',
      org:  'Medanta, Gurugram',
      text: 'Security and compliance were our top priorities. RadAI exceeded every requirement — HIPAA-ready, fully encrypted, with complete audit trails. The clinical staff adopted it within days. Exceptional product.',
      rating: 5, avatar: 'PS', loc: 'Gurugram, India', color: '#2a3f6a',
    },
    {
      name: 'Dr. Rohit Kapoor',
      role: 'Head of Radiology',
      org:  'Fortis Healthcare, Delhi NCR',
      text: 'The structured reporting engine handles complex multi-organ findings with remarkable precision. Integration with our existing PACS and RIS was seamless. I recommend RadAI to every imaging centre head I speak with.',
      rating: 5, avatar: 'RK', loc: 'New Delhi, India', color: '#1a3d5a',
    },
    {
      name: 'Dr. Kavitha Nair',
      role: 'Consultant Radiologist',
      org:  'Manipal Hospitals, Bengaluru',
      text: 'As a radiologist handling 80+ studies daily, RadAI has eliminated the documentation burden entirely. The AI impressions require minimal editing. It has genuinely given me time back to focus on complex cases.',
      rating: 5, avatar: 'KN', loc: 'Bengaluru, India', color: '#1a4a3a',
    },
    {
      name: 'Dr. James Crawford',
      role: 'Interventional Radiologist',
      org:  'Mayo Clinic, USA',
      text: 'The enterprise integration team delivered a flawless implementation in 26 days. RadAI\'s AI handles our complex interventional reporting at a level that required minimal customisation. This is the future standard.',
      rating: 5, avatar: 'JC', loc: 'Rochester, USA', color: '#2a3060',
    },
    {
      name: 'Dr. Suresh Babu',
      role: 'Chairman — Radiology Dept.',
      org:  'AIIMS, New Delhi',
      text: 'We evaluated five AI radiology platforms. RadAI stood apart in clinical accuracy, data governance, and support. The audit trail and PHI controls meet our strictest institutional requirements. Outstanding.',
      rating: 5, avatar: 'SB', loc: 'New Delhi, India', color: '#4a1a1a',
    },
  ];

  const certifications = [
    { label: 'HIPAA Ready',               icon: Shield,      color: '#a8c4e8', desc: 'PHI governance, BAA-ready' },
    { label: 'SOC 2 Aligned',             icon: BadgeCheck,  color: '#00c48c', desc: 'Enterprise cloud compliance' },
    { label: 'AES-256 Encrypted',         icon: Lock,        color: '#c8a84b', desc: 'End-to-end data security' },
    { label: 'HL7 FHIR Compliant',        icon: Globe,       color: '#e0c578', desc: 'Interoperability standard' },
    { label: 'DICOM Structured Reports',  icon: FileText,    color: '#7aabdf', desc: 'Radiology reporting standard' },
    { label: 'ISO 27001 Aligned',         icon: Award,       color: '#c8a84b', desc: 'Information security mgmt.' },
    { label: 'NABH Guideline Ready',      icon: HeartPulse,  color: '#00c48c', desc: 'Indian healthcare standard' },
    { label: 'DPDP Act Compliant',        icon: CheckCheck,  color: '#a8c4e8', desc: 'India data protection law' },
  ];

  const faqData = [
    { q: 'What is AI radiology reporting software and how does RadAI work?',
      a: 'RadAI is an enterprise AI radiology reporting platform built on large language models fine-tuned on clinical radiology data. Radiologists dictate findings; the AI extracts structured data, generates impressions, validates clinical consistency, and produces a final DICOM-compliant report in seconds — integrating seamlessly with your existing PACS, RIS, and EMR.' },
    { q: 'Is RadAI HIPAA compliant and safe for Indian hospitals?',
      a: 'Yes. RadAI is HIPAA-ready and fully compliant with India\'s Digital Personal Data Protection (DPDP) Act 2023 and NABH guidelines. We offer enterprise data residency within India, end-to-end AES-256 encryption, RBAC, full audit logging, and BAA agreements for institutional clients.' },
    { q: 'Can RadAI integrate with existing PACS, RIS, and EMR systems?',
      a: 'Absolutely. RadAI supports HL7 FHIR, DICOM SR, and REST API integrations for seamless connectivity with Sectra, Intelerad, Philips IntelliSpace, Oracle Health, Epic, and Cerner. Our dedicated enterprise team delivers full integration in 30 days with minimal disruption.' },
    { q: 'Which imaging modalities does RadAI support?',
      a: 'RadAI supports CT, MRI, X-Ray, Ultrasound, PET-CT, Mammography, Fluoroscopy, Nuclear Medicine, and Interventional Radiology. Modality-specific structured templates are pre-configured and fully customisable to your department\'s protocols.' },
    { q: 'What does implementation look like for Indian hospitals and enterprise networks?',
      a: 'Our structured 4-week onboarding covers system integration, radiologist training, workflow customisation, pilot testing, and go-live support. A dedicated Customer Success Manager is assigned throughout. We have active implementations at Apollo, Fortis, Manipal, and Medanta.' },
    { q: 'How does RadAI handle critical findings and medico-legal compliance?',
      a: 'RadAI includes an automated critical findings detection engine that flags urgent incidental and primary findings in real time, triggers notification workflows, and documents every alert in the audit trail — ensuring full medico-legal compliance and quality governance.' },
    { q: 'How much does RadAI cost?',
      a: 'Every account gets 10 free AI-generated reports with no credit card required. After that, individual radiologists can upgrade to the Pro plan at ₹780 per user per month (or save with annual billing) for unlimited reports, macros, and templates. Hospitals and imaging networks needing multi-user accounts, integrations, or custom billing can reach out for Enterprise pricing.' },
  ];

  const integrations = [
    'Philips IntelliSpace', 'Sectra PACS', 'Intelerad', 'Oracle Health',
    'Epic Systems', 'Cerner PowerChart', 'GE HealthCare', 'Siemens Healthineers',
    'Fujifilm Synapse', 'Nuance PowerScribe', 'Ambra Health', 'Change Healthcare',
  ];

  const capabilities = [
    { label: 'Report Accuracy',            val: 97, color: '#a8c4e8' },
    { label: 'Workflow Speed Improvement', val: 92, color: '#00c48c' },
    { label: 'Radiologist Satisfaction',   val: 95, color: '#c8a84b' },
    { label: 'Integration Success Rate',   val: 99, color: '#e0c578' },
  ];

  /* ── Background ── */
  const bgBlobs = (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {/* Deep navy base gradient */}
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(160deg,#060d1c 0%,#03070f 55%,#040a18 100%)' }} />
      {/* Radial glows */}
      <div style={{ position:'absolute', top:'-200px', left:'50%', transform:'translateX(-50%)',
        width:1000, height:700, borderRadius:'50%',
        background:'radial-gradient(ellipse,rgba(168,196,232,0.04) 0%,transparent 65%)' }} />
      <div style={{ position:'absolute', top:'42%', left:'-120px',
        width:500, height:500, borderRadius:'50%',
        background:'radial-gradient(circle,rgba(200,168,75,0.035) 0%,transparent 65%)' }} />
      <div style={{ position:'absolute', bottom:'-60px', right:'-60px',
        width:600, height:600, borderRadius:'50%',
        background:'radial-gradient(circle,rgba(168,196,232,0.04) 0%,transparent 65%)' }} />
      {/* Subtle grid */}
      <div style={{
        position:'absolute', inset:0,
        backgroundImage:'linear-gradient(rgba(168,196,232,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(168,196,232,0.018) 1px,transparent 1px)',
        backgroundSize:'80px 80px',
      }} />
    </div>
  );

  /* ══════ RENDER ══════ */
  return (
    <>
      <GlobalStyles />
      <div style={{ minHeight: '100vh', background: 'var(--navy-0)', color: 'var(--text)', fontFamily: 'var(--font-body)', overflowX: 'hidden', position: 'relative' }}>
        {bgBlobs}

        {/* ══ SEO schema JSON-LD ══ */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "RadAI — AI Radiology Reporting Platform",
          "applicationCategory": "HealthcareApplication",
          "operatingSystem": "Cloud / Web",
          "description": "Enterprise AI radiology reporting software that automates structured radiology reports in under 3 minutes. HIPAA-ready, HL7 FHIR compliant, DPDP Act 2023 compliant. Trusted by 50+ healthcare organisations across India and globally.",
          "url": "https://radai.health",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR", "description": "10 free AI-generated reports — no credit card required. Plans from ₹780/user/month." },
          "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "312", "bestRating": "5" },
          "provider": { "@type": "Organization", "name": "RadAI Technologies Pvt. Ltd.", "address": { "@type": "PostalAddress", "addressCountry": "IN" } },
        }) }} />

        {/* ══════════════ NAVBAR ══════════════ */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 100,
          borderBottom: scrolled ? '1px solid rgba(200,168,75,0.12)' : '1px solid transparent',
          background: scrolled ? 'rgba(3,7,15,0.96)' : 'transparent',
          backdropFilter: scrolled ? 'blur(32px)' : 'none',
          transition: 'all 0.3s ease',
        }}>
          <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', height:72 }}>
            {/* Logo */}
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{
                width:44, height:44, borderRadius:8,
                background:'linear-gradient(135deg,#c8a84b,#e0c578,#b8923e)',
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 0 26px rgba(200,168,75,0.32)',
              }}>
                <Microscope size={20} style={{ color:'#0a0e18' }} />
              </div>
              <div>
                <div style={{ fontFamily:'var(--font-disp)', fontSize:'1.38rem', fontWeight:900, lineHeight:1, letterSpacing:'0.03em' }}>
                  Rad<span className="grad">AI</span>
                </div>
                <div style={{ fontSize:'0.58rem', color:'var(--muted)', letterSpacing:'0.1em', fontWeight:500, textTransform:'uppercase', marginTop:1 }}>AI Radiology Intelligence</div>
              </div>
            </div>

            {/* Desktop nav */}
            <div style={{ display:'flex', alignItems:'center', gap:32 }} className="desk-nav">
              {[{l:'Platform',h:'#platform'},{l:'Workflow',h:'#workflow'},{l:'Pricing',h:'#pricing'},{l:'Security',h:'#security'},{l:'Certifications',h:'#certifications'},{l:'Integrations',h:'#integrations'},{l:'FAQ',h:'#faq'}].map(n => (
                <a key={n.l} href={n.h} className="nav-a">{n.l}</a>
              ))}
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <button className="btn-o" style={{ padding:'9px 18px', fontSize:'0.78rem', display:'none' }} id="demo-btn">Book Demo</button>
              <button className="btn-p" style={{ padding:'9px 20px', fontSize:'0.78rem' }} onClick={onGetStarted}>Free Trial <ArrowRight size={13} /></button>
              <button onClick={() => setMob(true)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text)', display:'flex', padding:6 }} id="ham-btn">
                <Menu size={22} />
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile nav */}
        <div className={`mob-nav ${mob ? 'open' : ''}`}>
          <div style={{ padding:'22px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid rgba(200,168,75,0.12)' }}>
            <div style={{ fontFamily:'var(--font-disp)', fontSize:'1.5rem', fontWeight:900, letterSpacing:'0.03em' }}>Rad<span className="grad">AI</span></div>
            <button onClick={() => setMob(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text)' }}><X size={24} /></button>
          </div>
          <div style={{ padding:'28px 24px', display:'flex', flexDirection:'column', gap:4 }}>
            {[{l:'Platform',h:'#platform'},{l:'Workflow',h:'#workflow'},{l:'Pricing',h:'#pricing'},{l:'Security',h:'#security'},{l:'Certifications',h:'#certifications'},{l:'Integrations',h:'#integrations'},{l:'FAQ',h:'#faq'}].map(n => (
              <a key={n.l} href={n.h} onClick={() => setMob(false)} style={{
                display:'block', padding:'16px 18px', borderRadius:8,
                color:'var(--text)', textDecoration:'none', fontWeight:500,
                letterSpacing:'0.04em', textTransform:'uppercase', fontSize:'0.88rem',
              }}>{n.l}</a>
            ))}
          </div>
          <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:10, borderTop:'1px solid rgba(200,168,75,0.12)', marginTop:'auto' }}>
            <button className="btn-p" style={{ justifyContent:'center' }} onClick={() => { setMob(false); onGetStarted(); }}>
              Start Free Trial <ArrowRight size={16} />
            </button>
            <button className="btn-o" style={{ justifyContent:'center' }} onClick={() => setMob(false)}>Book Enterprise Demo</button>
          </div>
        </div>

        {/* ══════════════ HERO ══════════════ */}
        <section style={{ position:'relative', zIndex:10, maxWidth:1280, margin:'0 auto', padding:'90px 24px 70px' }}>
          <div className="hero-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:72, alignItems:'center' }}>

            {/* Left */}
            <div>
              <div className="fu chip" style={{ marginBottom:28 }}>
                <Sparkles size={12} /> AI Radiology Reporting Platform · India &amp; Global · 2026
              </div>

              <h1 className="fu d1 hero-h1" style={{
                fontFamily:'var(--font-disp)', fontSize:'4.2rem', fontWeight:900,
                lineHeight:1.04, letterSpacing:'-0.01em', opacity:0, textTransform:'uppercase',
              }}>
                The <span className="grad">Smarter</span><br />
                Way to Write<br />
                <span style={{ fontStyle:'italic', fontWeight:700, textTransform:'none', letterSpacing:0 }}>Radiology Reports</span>
              </h1>

              {/* Gold accent rule */}
              <div className="fu d2" style={{ width:64, height:3, background:'linear-gradient(90deg,var(--gold),transparent)', borderRadius:2, marginTop:24, marginBottom:22, opacity:0 }} />

              <p className="fu d2" style={{ maxWidth:510, fontSize:'1.04rem', lineHeight:1.84, color:'var(--muted)', opacity:0 }}>
                Enterprise AI that converts radiologist dictation into complete, structured,
                DICOM-ready reports in under 3 minutes — reducing TAT by 92%, eliminating
                documentation burnout, and integrating with your existing PACS, RIS, and EMR.
              </p>

              {/* Trust stats row */}
              <div className="fu d3" style={{ marginTop:30, display:'flex', flexWrap:'wrap', gap:24, opacity:0 }}>
                {[
                  { v:'92%',    l:'Faster TAT'          },
                  { v:'50+',    l:'Hospitals Trust Us'   },
                  { v:'10K+',   l:'Reports / Month'      },
                  { v:'99.99%', l:'Uptime SLA'           },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign:'center' }}>
                    <div style={{ fontFamily:'var(--font-disp)', fontSize:'1.6rem', fontWeight:900, letterSpacing:'-0.01em' }} className="grad">{s.v}</div>
                    <div style={{ fontSize:'0.68rem', color:'var(--muted)', fontWeight:400, marginTop:3, letterSpacing:'0.04em', textTransform:'uppercase' }}>{s.l}</div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="fu d4 hero-cta-row" style={{ marginTop:36, display:'flex', gap:12, flexWrap:'wrap', opacity:0 }}>
                <button className="btn-p" onClick={onGetStarted} style={{ fontSize:'0.88rem', padding:'15px 32px' }}>
                  Start Free 14-Day Trial <ArrowRight size={15} />
                </button>
                <button className="btn-o" style={{ fontSize:'0.88rem', padding:'15px 32px' }}>
                  <Play size={14} /> Watch Demo
                </button>
              </div>

              {/* Social proof */}
              <div className="fu d5 hero-social-row" style={{ marginTop:38, display:'flex', alignItems:'center', gap:22, flexWrap:'wrap', opacity:0 }}>
                <div style={{ display:'flex' }}>
                  {['AM','PS','RK','KN','SB'].map((ini, i) => (
                    <div key={i} style={{
                      width:34, height:34, borderRadius:'50%',
                      background:`linear-gradient(135deg,hsl(${210+i*18}deg 50% 28%),hsl(${210+i*18}deg 50% 42%))`,
                      border:'2px solid var(--navy-0)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'0.58rem', fontWeight:700, color:'#d4dff0',
                      marginLeft: i > 0 ? -10 : 0, zIndex: 10-i,
                    }}>{ini}</div>
                  ))}
                </div>
                <div>
                  <div style={{ display:'flex', gap:2, marginBottom:4 }}>
                    {[...Array(5)].map((_,i) => <Star key={i} size={12} fill="var(--gold)" style={{ color:'var(--gold)' }} />)}
                  </div>
                  <div style={{ fontSize:'0.77rem', color:'var(--muted)' }}>
                    Trusted by <strong style={{ color:'var(--platinum)' }}>50+ healthcare organisations</strong> across India &amp; globally
                  </div>
                </div>
                <div style={{ width:1, height:28, background:'var(--border)' }} />
                <div style={{ fontSize:'0.77rem', color:'var(--muted)', display:'flex', alignItems:'center', gap:6 }}>
                  <span className="gdot" /> 10,000+ reports generated today
                </div>
              </div>
            </div>

            {/* Right — AI UI card */}
            <div className="fi d3 hero-img-col" style={{ position:'relative', opacity:0 }}>
              <div className="flt" style={{ position:'relative' }}>
                <div style={{ position:'absolute', inset:'-28px', background:'radial-gradient(circle,rgba(200,168,75,0.08) 0%,transparent 68%)', borderRadius:'50%' }} />

                {/* Real radiology context image */}
                <div style={{ borderRadius:12, overflow:'hidden', marginBottom:16, position:'relative' }}>
                  <img
                    src="https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80&auto=format&fit=crop"
                    alt="Radiologist reviewing AI-assisted medical imaging scans on workstation"
                    style={{ width:'100%', height:200, objectFit:'cover', filter:'brightness(0.7) saturate(1.1)' }}
                    loading="lazy"
                  />
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,transparent 40%,rgba(3,7,15,0.85))' }} />
                  <div style={{ position:'absolute', bottom:14, left:18, right:18 }}>
                    <div style={{ fontSize:'0.7rem', color:'var(--gold-l)', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>Live Clinical Environment</div>
                    <div style={{ fontSize:'0.82rem', color:'#c8dcf5' }}>Radiologist + RadAI Copilot — Apollo Hospitals Mumbai</div>
                  </div>
                </div>

                <div className="glass" style={{ borderRadius:12, overflow:'hidden', position:'relative' }}>
                  {/* Card header */}
                  <div style={{ padding:'15px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(200,168,75,0.03)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:36, height:36, borderRadius:8, background:'rgba(200,168,75,0.12)', border:'1px solid rgba(200,168,75,0.22)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Brain size={16} style={{ color:'var(--gold)' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:'0.86rem' }}>RadAI Copilot</div>
                        <div style={{ fontSize:'0.66rem', color:'var(--muted)' }}>Live Clinical Reporting Engine</div>
                      </div>
                    </div>
                    <div style={{ padding:'4px 11px', borderRadius:100, background:'rgba(0,196,140,0.1)', border:'1px solid rgba(0,196,140,0.22)', fontSize:'0.67rem', fontWeight:700, color:'#00c48c', display:'flex', alignItems:'center', gap:5 }}>
                      <span className="gdot" style={{ width:6, height:6 }} /> LIVE
                    </div>
                  </div>

                  <div style={{ padding:18 }}>
                    {/* Voice input */}
                    <div style={{ borderRadius:10, padding:15, background:'rgba(0,0,0,0.3)', border:'1px solid var(--border)', marginBottom:12, position:'relative', overflow:'hidden' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:9 }}>
                        <Activity size={13} style={{ color:'var(--gold)' }} />
                        <span style={{ fontSize:'0.68rem', fontWeight:700, color:'var(--gold-l)', letterSpacing:'0.08em', textTransform:'uppercase' }}>Voice Input — CT KUB</span>
                        <div className="blk" style={{ width:6, height:13, background:'var(--gold)', borderRadius:1, marginLeft:'auto' }} />
                      </div>
                      <p style={{ fontSize:'0.82rem', lineHeight:1.6, color:'#b8d5f0' }}>"5 mm right renal calculus with mild hydronephrosis, no ureteric extension seen..."</p>
                      <div className="scanl sc" />
                    </div>

                    {/* Extraction grid */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
                      <div style={{ borderRadius:10, padding:12, background:'rgba(200,168,75,0.04)', border:'1px solid var(--border)' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:8 }}>
                          <Cpu size={11} style={{ color:'var(--gold)' }} />
                          <span style={{ fontSize:'0.65rem', fontWeight:700, color:'var(--gold-l)', textTransform:'uppercase', letterSpacing:'0.07em' }}>AI Extraction</span>
                        </div>
                        {[{k:'Modality',v:'CT KUB'},{k:'Finding',v:'Renal Calculus'},{k:'Confidence',v:'98.4%',hi:true}].map(r => (
                          <div key={r.k} style={{ display:'flex', justifyContent:'space-between', padding:'4px 7px', borderRadius:6, background:'rgba(0,0,0,0.22)', marginBottom:3, fontSize:'0.71rem' }}>
                            <span style={{ color:'var(--muted)' }}>{r.k}</span>
                            <span style={{ color: r.hi ? '#00c48c' : 'var(--gold-l)', fontWeight:600 }}>{r.v}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ borderRadius:10, padding:12, background:'rgba(200,168,75,0.04)', border:'1px solid var(--border)' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:8 }}>
                          <ScanLine size={11} style={{ color:'var(--gold)' }} />
                          <span style={{ fontSize:'0.65rem', fontWeight:700, color:'var(--gold-l)', textTransform:'uppercase', letterSpacing:'0.07em' }}>QA Engine</span>
                        </div>
                        {['Findings validated','Impression generated','Clinical consistency ✓'].map(item => (
                          <div key={item} style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 7px', borderRadius:6, background:'rgba(0,0,0,0.22)', marginBottom:3, fontSize:'0.71rem', color:'var(--muted)' }}>
                            <CheckCircle2 size={10} style={{ color:'#00c48c', flexShrink:0 }} /> {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Output */}
                    <div style={{ borderRadius:10, padding:14, background:'linear-gradient(135deg,rgba(200,168,75,0.08),rgba(168,196,232,0.06))', border:'1px solid rgba(200,168,75,0.2)' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                        <span style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--gold-l)' }}>Generated Impression</span>
                        <span style={{ padding:'2px 9px', borderRadius:100, background:'rgba(0,196,140,0.1)', border:'1px solid rgba(0,196,140,0.2)', fontSize:'0.63rem', fontWeight:700, color:'#00c48c' }}>DICOM-Ready</span>
                      </div>
                      <p style={{ fontSize:'0.79rem', lineHeight:1.65, color:'#c4dff4' }}>
                        Impression: Right renal calculus (5 mm) with mild ipsilateral hydronephrosis. No ureteric calculus identified. Clinical correlation recommended. Urological referral advised.
                      </p>
                    </div>
                  </div>

                  <div style={{ padding:'0 18px 18px', display:'flex', gap:8 }}>
                    <button style={{ flex:1, padding:'10px', borderRadius:8, background:'linear-gradient(130deg,#e0c578,#c8a84b)', color:'#0a0e18', fontWeight:700, fontSize:'0.77rem', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                      <CheckCircle2 size={13} /> Approve &amp; Send
                    </button>
                    <button style={{ flex:1, padding:'10px', borderRadius:8, background:'rgba(200,168,75,0.05)', color:'var(--text)', fontWeight:600, fontSize:'0.77rem', border:'1px solid var(--border)', cursor:'pointer' }}>
                      Edit Draft
                    </button>
                  </div>
                </div>

                {/* Floating badges */}
                <div style={{ position:'absolute', bottom:-14, left:-18, padding:'7px 14px', borderRadius:100, background:'rgba(6,13,28,0.94)', border:'1px solid rgba(200,168,75,0.22)', fontSize:'0.68rem', fontWeight:700, color:'#00c48c', display:'flex', alignItems:'center', gap:5, backdropFilter:'blur(16px)' }}>
                  <Shield size={11} /> HIPAA Compliant
                </div>
                <div style={{ position:'absolute', top:-14, right:-18, padding:'7px 14px', borderRadius:100, background:'rgba(6,13,28,0.94)', border:'1px solid rgba(200,168,75,0.22)', fontSize:'0.68rem', fontWeight:700, color:'var(--gold-l)', display:'flex', alignItems:'center', gap:5, backdropFilter:'blur(16px)' }}>
                  <Zap size={11} /> Report in &lt;3 min
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="gold-rule" />

        {/* ── Marquee trust bar ── */}
        <section style={{ position:'relative', zIndex:10, borderTop:'none', borderBottom:'1px solid var(--border)', padding:'15px 0', background:'rgba(9,20,40,0.5)', overflow:'hidden' }}>
          <div className="mq-wrap">
            <div className="mq-inner mq">
              {[...integrations, ...integrations].map((item, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'0 30px', whiteSpace:'nowrap', fontSize:'0.78rem', fontWeight:500, color:'var(--muted)', letterSpacing:'0.02em' }}>
                  <BadgeCheck size={13} style={{ color:'var(--gold)', flexShrink:0 }} /> {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <StatsSection />

        <div className="gold-rule" />

        {/* ══════════════ PLATFORM FEATURES ══════════════ */}
        <section id="platform" style={{ position:'relative', zIndex:10, padding:'100px 24px' }}>
          <div style={{ maxWidth:1200, margin:'0 auto' }}>
            <div style={{ textAlign:'center', maxWidth:680, margin:'0 auto 64px' }}>
              <div className="chip" style={{ marginBottom:16 }}><Sparkles size={12} /> Enterprise AI Platform</div>
              <div className="sec-divider" />
              <h2 className="sec-h2" style={{ fontFamily:'var(--font-disp)', fontSize:'3rem', fontWeight:900, lineHeight:1.08, letterSpacing:'-0.01em', textTransform:'uppercase' }}>
                Built for Elite Imaging Centres &amp;{' '}
                <span className="grad">Enterprise Healthcare</span>
              </h2>
              <p style={{ marginTop:18, fontSize:'1rem', lineHeight:1.84, color:'var(--muted)' }}>
                RadAI unifies clinical intelligence, workflow automation, enterprise security, structured reporting,
                and real-time analytics into one modern radiology platform trusted across India and globally.
              </p>
            </div>

            {/* Feature image banner */}
            <div style={{ borderRadius:12, overflow:'hidden', marginBottom:40, position:'relative', height:220 }}>
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80&auto=format&fit=crop"
                alt="Advanced medical imaging radiology AI platform dashboard"
                style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.55) saturate(1.1)' }}
                loading="lazy"
              />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,rgba(3,7,15,0.85) 0%,rgba(3,7,15,0.3) 60%,rgba(3,7,15,0.7) 100%)' }} />
              <div style={{ position:'absolute', top:'50%', left:40, transform:'translateY(-50%)' }}>
                <div style={{ fontFamily:'var(--font-disp)', fontSize:'1.8rem', fontWeight:900, lineHeight:1.1, textTransform:'uppercase', maxWidth:400 }}>
                  Trusted Across India's Premier Hospitals
                </div>
                <p style={{ marginTop:8, fontSize:'0.85rem', color:'var(--muted)', maxWidth:400 }}>Apollo · Fortis · Medanta · Manipal · AIIMS · Narayana Health</p>
              </div>
              <div style={{ position:'absolute', top:'50%', right:40, transform:'translateY(-50%)', display:'flex', flexDirection:'column', gap:8 }}>
                {['50+ Hospitals Live','10,000+ Reports/Day','30-Day Go-Live SLA'].map((t,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(6,13,28,0.82)', border:'1px solid rgba(200,168,75,0.2)', borderRadius:6, padding:'7px 14px', backdropFilter:'blur(12px)' }}>
                    <CheckCircle2 size={13} style={{ color:'var(--gold)' }} />
                    <span style={{ fontSize:'0.78rem', fontWeight:600, color:'var(--platinum)' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="feat-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))', gap:16 }}>
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="glass feat-c" style={{ borderRadius:10, padding:32, borderLeft:`3px solid ${f.color}50` }}>
                    <div style={{ width:50, height:50, borderRadius:10, marginBottom:20, background:`${f.color}14`, border:`1px solid ${f.color}28`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Icon size={22} style={{ color:f.color }} />
                    </div>
                    <h3 style={{ fontWeight:700, fontSize:'1.08rem', marginBottom:12, fontFamily:'var(--font-disp)', letterSpacing:'0.02em', textTransform:'uppercase' }}>{f.title}</h3>
                    <p style={{ fontSize:'0.88rem', lineHeight:1.8, color:'var(--muted)' }}>{f.desc}</p>
                    <button style={{ marginTop:20, display:'flex', alignItems:'center', gap:5, background:'none', border:'none', cursor:'pointer', color:f.color, fontSize:'0.78rem', fontWeight:700, fontFamily:'var(--font-body)', padding:0, letterSpacing:'0.05em', textTransform:'uppercase' }}>
                      Explore Feature <ChevronRight size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="gold-rule" />

        {/* ══════════════ WORKFLOW ══════════════ */}
        <section id="workflow" style={{ position:'relative', zIndex:10, background:'rgba(9,20,40,0.5)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', padding:'100px 24px' }}>
          <div style={{ maxWidth:1200, margin:'0 auto' }}>
            <div style={{ textAlign:'center', maxWidth:640, margin:'0 auto 64px' }}>
              <div className="chip" style={{ marginBottom:16 }}><Workflow size={12} /> AI-Powered Workflow</div>
              <div className="sec-divider" />
              <h2 className="sec-h2" style={{ fontFamily:'var(--font-disp)', fontSize:'2.9rem', fontWeight:900, lineHeight:1.08, letterSpacing:'-0.01em', textTransform:'uppercase' }}>
                Dictation to <span className="grad">Final Report</span> in Seconds
              </h2>
              <p style={{ marginTop:16, fontSize:'1rem', lineHeight:1.84, color:'var(--muted)' }}>
                A seamless, clinically validated four-step AI pipeline that handles every aspect of radiology report generation — from voice capture to PACS delivery.
              </p>
            </div>

            <div className="wf-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:16 }}>
              {workflowSteps.map((ws, i) => {
                const Icon = ws.icon;
                const active = step === i;
                return (
                  <div key={i} onClick={() => setStep(i)} style={{
                    borderRadius:10, padding:30, cursor:'pointer',
                    border:`1px solid ${active ? 'rgba(200,168,75,0.45)' : 'var(--border)'}`,
                    background: active ? 'rgba(200,168,75,0.07)' : 'rgba(9,20,40,0.55)',
                    backdropFilter:'blur(20px)',
                    boxShadow: active ? '0 0 40px rgba(200,168,75,0.1)' : 'none',
                    transform: active ? 'translateY(-5px)' : 'none',
                    transition:'all 0.4s ease',
                  }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
                      <div style={{ width:48, height:48, borderRadius:10, background: active ? 'linear-gradient(130deg,#e0c578,#c8a84b)' : 'rgba(200,168,75,0.08)', border:`1px solid ${active ? 'transparent':'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.3s' }}>
                        <Icon size={20} style={{ color: active ? '#0a0e18':'var(--gold)' }} />
                      </div>
                      <span style={{ fontFamily:'var(--font-disp)', fontSize:'2rem', fontWeight:900, color: active ? 'rgba(200,168,75,0.22)':'rgba(255,255,255,0.04)', transition:'color 0.3s', letterSpacing:'-0.02em' }}>{ws.step}</span>
                    </div>
                    <h3 style={{ fontWeight:700, fontSize:'1.05rem', marginBottom:9, fontFamily:'var(--font-disp)', textTransform:'uppercase', letterSpacing:'0.04em' }}>{ws.title}</h3>
                    <p style={{ fontSize:'0.84rem', lineHeight:1.74, color:'var(--muted)' }}>{ws.desc}</p>
                    {active && <div style={{ marginTop:14, height:2, borderRadius:2, background:'linear-gradient(90deg,var(--gold),transparent)', animation:'pgFill 2.6s linear' }} />}
                  </div>
                );
              })}
            </div>

            {/* Capability bars */}
            <div className="glass" style={{ borderRadius:10, padding:'36px 40px', marginTop:44 }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))', gap:28 }}>
                {capabilities.map((c, i) => (
                  <div key={i}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:9 }}>
                      <span style={{ fontSize:'0.82rem', fontWeight:500, color:'var(--text)' }}>{c.label}</span>
                      <span style={{ fontSize:'0.82rem', fontWeight:700, color:c.color }}>{c.val}%</span>
                    </div>
                    <div style={{ height:5, borderRadius:3, background:'rgba(255,255,255,0.05)', overflow:'hidden' }}>
                      <div className="pg" style={{ height:'100%', borderRadius:3, background:`linear-gradient(90deg,${c.color},${c.color}88)`, width:`${c.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════ SECURITY ══════════════ */}
        <section id="security" style={{ position:'relative', zIndex:10, padding:'100px 24px' }}>
          <div style={{ maxWidth:1200, margin:'0 auto' }}>
            <div className="sec-grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'start' }}>
              <div className="glass" style={{ borderRadius:10, padding:'44px 40px', borderTop:'3px solid rgba(200,168,75,0.4)' }}>
                <div className="chip" style={{ marginBottom:18 }}><Lock size={12} /> Enterprise Security</div>
                <h2 className="sec-h2" style={{ fontFamily:'var(--font-disp)', fontSize:'2.3rem', fontWeight:900, lineHeight:1.08, letterSpacing:'-0.01em', marginBottom:16, textTransform:'uppercase' }}>
                  Healthcare-Grade<br /><span className="grad">Security Infrastructure</span>
                </h2>

                {/* Security image */}
                <div style={{ borderRadius:8, overflow:'hidden', marginBottom:24, height:140 }}>
                  <img
                    src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80&auto=format&fit=crop"
                    alt="Healthcare data security and encryption infrastructure"
                    style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.6) saturate(0.9)' }}
                    loading="lazy"
                  />
                </div>

                <p style={{ fontSize:'0.92rem', lineHeight:1.82, color:'var(--muted)', marginBottom:28 }}>
                  Built for Indian hospitals, enterprise imaging networks, and global healthcare with uncompromising compliance architecture — fully aligned with HIPAA, DPDP Act, NABH, and ISO 27001.
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                  {[
                    {l:'HIPAA-ready architecture & PHI governance',c:'#a8c4e8'},
                    {l:'DPDP Act 2023 compliant — India data residency',c:'#00c48c'},
                    {l:'End-to-end AES-256 encrypted data pipelines',c:'#c8a84b'},
                    {l:'Role-based access control (RBAC) with SSO',c:'#e0c578'},
                    {l:'Full audit logging & activity tracking',c:'#00c48c'},
                    {l:'SOC 2-aligned enterprise cloud infrastructure',c:'#a8c4e8'},
                    {l:'Critical findings alert & escalation workflows',c:'#c8a84b'},
                    {l:'BAA agreements for enterprise clients',c:'#7aabdf'},
                  ].map((item, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:13, padding:'12px 16px', borderRadius:8, background:'rgba(0,0,0,0.24)', border:'1px solid var(--border)' }}>
                      <CheckCheck size={14} style={{ color:item.c, flexShrink:0 }} />
                      <span style={{ fontSize:'0.845rem', color:'var(--text)', fontWeight:400 }}>{item.l}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div id="enterprise" style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div className="glass" style={{ borderRadius:10, padding:36, borderTop:'3px solid rgba(168,196,232,0.3)' }}>
                  <div className="chip" style={{ marginBottom:18 }}><TrendingUp size={12} /> Proven Performance</div>
                  <h2 className="sec-h2" style={{ fontFamily:'var(--font-disp)', fontSize:'1.85rem', fontWeight:900, lineHeight:1.08, letterSpacing:'-0.01em', marginBottom:24, textTransform:'uppercase' }}>
                    Measurable Clinical Impact
                  </h2>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    {[
                      {v:'89%',     l:'Average TAT reduction',    c:'#a8c4e8'},
                      {v:'< 3 min', l:'Report generation time',   c:'#00c48c'},
                      {v:'97%',     l:'AI accuracy score',        c:'#c8a84b'},
                      {v:'30 days', l:'Enterprise go-live SLA',   c:'#e0c578'},
                      {v:'50+',     l:'Hospitals live in India',  c:'#7aabdf'},
                      {v:'4.9/5',   l:'Avg. radiologist rating',  c:'#c8a84b'},
                    ].map((m, i) => (
                      <div key={i} style={{ padding:'18px 16px', borderRadius:8, background:'rgba(0,0,0,0.25)', border:'1px solid var(--border)', textAlign:'center' }}>
                        <div style={{ fontFamily:'var(--font-disp)', fontSize:'1.85rem', fontWeight:900, letterSpacing:'-0.01em', color:m.c }}>{m.v}</div>
                        <div style={{ fontSize:'0.74rem', color:'var(--muted)', marginTop:5, fontWeight:400, letterSpacing:'0.02em' }}>{m.l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* India-specific section */}
                <div className="glass" style={{ borderRadius:10, padding:30, borderLeft:'3px solid rgba(200,168,75,0.4)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
                    <div style={{ width:40, height:40, borderRadius:8, background:'rgba(200,168,75,0.1)', border:'1px solid rgba(200,168,75,0.22)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <MapPin size={18} style={{ color:'var(--gold)' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:'1.02rem', fontFamily:'var(--font-disp)', textTransform:'uppercase', letterSpacing:'0.04em' }}>Built for India</div>
                      <div style={{ fontSize:'0.78rem', color:'var(--muted)', marginTop:2 }}>Serving Apollo, Fortis, Medanta, Manipal &amp; more</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                    {['India Data Residency','Hindi & Regional Dictation','NABH Ready','DPDP Act 2023','Indian Medical Council Aligned','GST Invoicing'].map((item, i) => (
                      <span key={i} style={{ padding:'5px 12px', borderRadius:4, border:'1px solid rgba(200,168,75,0.22)', background:'rgba(200,168,75,0.06)', fontSize:'0.7rem', fontWeight:600, color:'rgba(224,197,120,0.88)', letterSpacing:'0.04em' }}>{item}</span>
                    ))}
                  </div>
                </div>

                {/* API card */}
                <div className="glass" style={{ borderRadius:10, padding:26, display:'flex', alignItems:'center', gap:16 }}>
                  <div style={{ width:44, height:44, borderRadius:8, background:'rgba(168,196,232,0.1)', border:'1px solid rgba(168,196,232,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Cpu size={20} style={{ color:'#a8c4e8' }} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:'0.97rem', fontFamily:'var(--font-disp)', textTransform:'uppercase', letterSpacing:'0.04em' }}>Enterprise REST API</div>
                    <div style={{ fontSize:'0.81rem', color:'var(--muted)', marginTop:4 }}>HL7 FHIR, DICOM SR, webhooks. 99.99% uptime SLA.</div>
                  </div>
                  <button className="btn-o" style={{ flexShrink:0, fontSize:'0.78rem', padding:'9px 14px' }}>
                    API Docs <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="gold-rule" />

        {/* ══════════════ CERTIFICATIONS ══════════════ */}
        <section id="certifications" style={{ position:'relative', zIndex:10, background:'rgba(9,20,40,0.5)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', padding:'100px 24px' }}>
          <div style={{ maxWidth:1200, margin:'0 auto' }}>
            <div style={{ textAlign:'center', maxWidth:640, margin:'0 auto 60px' }}>
              <div className="chip" style={{ marginBottom:16 }}><Award size={12} /> Certifications &amp; Compliance</div>
              <div className="sec-divider" />
              <h2 className="sec-h2" style={{ fontFamily:'var(--font-disp)', fontSize:'2.9rem', fontWeight:900, lineHeight:1.08, letterSpacing:'-0.01em', textTransform:'uppercase' }}>
                Certified. Compliant.<br /><span className="grad">Trusted by Healthcare</span>
              </h2>
              <p style={{ marginTop:16, fontSize:'1rem', lineHeight:1.84, color:'var(--muted)' }}>
                RadAI meets the strictest global and Indian healthcare compliance standards — from HIPAA and ISO 27001 to India's DPDP Act 2023 and NABH guidelines.
              </p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:14 }}>
              {certifications.map((cert, i) => {
                const Icon = cert.icon;
                return (
                  <div key={i} className="glass cert-c" style={{ borderRadius:10, padding:'26px 24px', borderTop:`2px solid ${cert.color}40` }}>
                    <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
                      <div style={{ width:46, height:46, borderRadius:10, background:`${cert.color}14`, border:`1px solid ${cert.color}28`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <Icon size={20} style={{ color:cert.color }} />
                      </div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:'0.92rem', fontFamily:'var(--font-disp)', textTransform:'uppercase', letterSpacing:'0.04em' }}>{cert.label}</div>
                        <div style={{ fontSize:'0.73rem', color:'var(--muted)', marginTop:3 }}>{cert.desc}</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                      <CheckCircle2 size={13} style={{ color:'#00c48c' }} />
                      <span style={{ fontSize:'0.73rem', color:'#00c48c', fontWeight:600, letterSpacing:'0.04em' }}>Verified &amp; Active</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Certification banner */}
            <div style={{ marginTop:44, padding:'32px 40px', borderRadius:10, background:'linear-gradient(130deg,rgba(200,168,75,0.08),rgba(168,196,232,0.05),rgba(200,168,75,0.06))', border:'1px solid rgba(200,168,75,0.2)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:20 }}>
              <div>
                <h3 style={{ fontFamily:'var(--font-disp)', fontSize:'1.4rem', fontWeight:900, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.02em' }}>
                  Need Compliance Documentation?
                </h3>
                <p style={{ fontSize:'0.88rem', color:'var(--muted)' }}>Request our full security pack: BAA, SLA, penetration test reports, and audit documentation.</p>
              </div>
              <button className="btn-p" style={{ flexShrink:0 }}>
                Request Security Pack <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </section>

        {/* ══════════════ INTEGRATIONS ══════════════ */}
        <section id="integrations" style={{ position:'relative', zIndex:10, padding:'100px 24px' }}>
          <div style={{ maxWidth:1200, margin:'0 auto' }}>
            <div style={{ textAlign:'center', maxWidth:640, margin:'0 auto 60px' }}>
              <div className="chip" style={{ marginBottom:16 }}><Globe size={12} /> Integrations</div>
              <div className="sec-divider" />
              <h2 className="sec-h2" style={{ fontFamily:'var(--font-disp)', fontSize:'2.9rem', fontWeight:900, lineHeight:1.08, letterSpacing:'-0.01em', textTransform:'uppercase' }}>
                Connects with Your<br /><span className="grad">Entire Tech Stack</span>
              </h2>
              <p style={{ marginTop:16, fontSize:'1rem', lineHeight:1.84, color:'var(--muted)' }}>
                Native integrations with all major PACS, RIS, and EMR platforms. Our enterprise team handles implementation in 30 days.
              </p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:12 }}>
              {integrations.map((item, i) => (
                <div key={i} className="glass" style={{ borderRadius:8, padding:'17px 18px', display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:30, height:30, borderRadius:6, background:'rgba(200,168,75,0.08)', border:'1px solid rgba(200,168,75,0.18)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <BadgeCheck size={14} style={{ color:'var(--gold)' }} />
                  </div>
                  <span style={{ fontSize:'0.81rem', fontWeight:500, color:'var(--text)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="gold-rule" />

        {/* ══════════════ TESTIMONIALS ══════════════ */}
        <section style={{ position:'relative', zIndex:10, background:'rgba(9,20,40,0.5)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', padding:'100px 24px' }}>
          <div style={{ maxWidth:1200, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:60 }}>
              <div className="chip" style={{ marginBottom:16 }}><Star size={12} /> Trusted by Radiologists</div>
              <div className="sec-divider" />
              <h2 className="sec-h2" style={{ fontFamily:'var(--font-disp)', fontSize:'2.9rem', fontWeight:900, lineHeight:1.1, letterSpacing:'-0.01em', textTransform:'uppercase' }}>
                What Radiologists Are<br /><span className="grad">Saying About RadAI</span>
              </h2>
              <p style={{ marginTop:16, fontSize:'1rem', lineHeight:1.84, color:'var(--muted)' }}>
                Trusted across Apollo, Fortis, Medanta, Manipal, AIIMS and leading international hospitals.
              </p>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:22 }}>
                {[...Array(5)].map((_,i) => <Star key={i} size={18} fill="var(--gold)" style={{ color:'var(--gold)' }} />)}
                <span style={{ fontWeight:700, fontSize:'1.08rem', marginLeft:6, fontFamily:'var(--font-disp)' }}>4.9</span>
                <span style={{ color:'var(--muted)', fontSize:'0.87rem' }}>/ 5 — based on 312 radiologist reviews</span>
              </div>
            </div>

            <div className="testi-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(330px,1fr))', gap:16 }}>
              {testimonials.map((t, i) => (
                <div key={i} className="glass testi-c" style={{ borderRadius:10, padding:34, borderTop:`2px solid ${t.color}60` }}>
                  <Quote size={24} style={{ color:'rgba(200,168,75,0.18)', marginBottom:18 }} />
                  <div style={{ display:'flex', gap:2, marginBottom:16 }}>
                    {[...Array(t.rating)].map((_,j) => <Star key={j} size={12} fill="var(--gold)" style={{ color:'var(--gold)' }} />)}
                  </div>
                  <p style={{ fontSize:'0.92rem', lineHeight:1.84, color:'var(--text)', fontStyle:'italic', marginBottom:26 }}>
                    "{t.text}"
                  </p>
                  <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{ width:48, height:48, borderRadius:8, background:t.color, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.78rem', color:'#d4dff0', flexShrink:0, fontFamily:'var(--font-disp)' }}>{t.avatar}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:'0.87rem', fontFamily:'var(--font-disp)', textTransform:'uppercase', letterSpacing:'0.04em' }}>{t.name}</div>
                      <div style={{ fontSize:'0.74rem', color:'var(--muted)', marginTop:3 }}>{t.role}</div>
                      <div style={{ fontSize:'0.72rem', color:'rgba(200,168,75,0.6)', marginTop:2, fontWeight:500 }}>{t.org}</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.7rem', color:'var(--muted)', flexShrink:0 }}>
                      <MapPin size={10} /> {t.loc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial image band */}
            <div style={{ marginTop:44, borderRadius:10, overflow:'hidden', position:'relative', height:180 }}>
              <img
                src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&q=80&auto=format&fit=crop"
                alt="Radiologists and medical team collaborating in hospital imaging department India"
                style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.5) saturate(0.9)' }}
                loading="lazy"
              />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,rgba(3,7,15,0.92) 0%,rgba(3,7,15,0.4) 60%,rgba(3,7,15,0.82) 100%)' }} />
              <div style={{ position:'absolute', top:'50%', left:40, transform:'translateY(-50%)' }}>
                <div style={{ fontFamily:'var(--font-disp)', fontSize:'1.4rem', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.02em', marginBottom:6 }}>
                  Join India's Most Trusted Radiology AI Platform
                </div>
                <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
                  {['Apollo','Fortis','Medanta','Manipal','AIIMS','Narayana Health'].map((h,i) => (
                    <span key={i} style={{ fontSize:'0.78rem', color:'var(--muted)', fontWeight:500 }}>{h}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="gold-rule" />

        {/* ══════════════ PRICING ══════════════ */}
        <section id="pricing" style={{ position:'relative', zIndex:10, padding:'100px 24px' }}>
          <div style={{ maxWidth:1160, margin:'0 auto' }}>
            <div style={{ textAlign:'center', maxWidth:640, margin:'0 auto 44px' }}>
              <div className="chip" style={{ marginBottom:16 }}><Sparkles size={12} /> Pricing</div>
              <div className="sec-divider" />
              <h2 className="sec-h2" style={{ fontFamily:'var(--font-disp)', fontSize:'2.9rem', fontWeight:900, lineHeight:1.08, letterSpacing:'-0.01em', textTransform:'uppercase' }}>
                Simple, Transparent<br /><span className="grad">Pricing</span>
              </h2>
              <p style={{ marginTop:16, fontSize:'1rem', lineHeight:1.84, color:'var(--muted)' }}>
                Every account starts with 10 free AI-generated reports — no credit card required. Upgrade whenever you're ready for unlimited reporting.
              </p>
            </div>

            {/* Billing toggle */}
            <div style={{ display:'flex', justifyContent:'center', marginBottom:36 }}>
              <div className="glass" style={{ display:'inline-flex', alignItems:'center', gap:4, borderRadius:12, padding:4 }}>
                <button
                  onClick={() => setPricingBilling('monthly')}
                  style={{
                    padding:'9px 20px', borderRadius:9, fontSize:'0.8rem', fontWeight:700, cursor:'pointer', border:'none',
                    background: pricingBilling === 'monthly' ? 'rgba(200,168,75,0.14)' : 'transparent',
                    color: pricingBilling === 'monthly' ? 'var(--gold)' : 'var(--muted)',
                  }}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setPricingBilling('yearly')}
                  style={{
                    padding:'9px 20px', borderRadius:9, fontSize:'0.8rem', fontWeight:700, cursor:'pointer', border:'none', display:'flex', alignItems:'center', gap:8,
                    background: pricingBilling === 'yearly' ? 'rgba(200,168,75,0.14)' : 'transparent',
                    color: pricingBilling === 'yearly' ? 'var(--gold)' : 'var(--muted)',
                  }}
                >
                  Yearly
                  <span style={{ fontSize:'0.62rem', fontWeight:800, padding:'3px 7px', borderRadius:20, background:'rgba(0,196,140,0.14)', color:'#00c48c' }}>
                    Save {PRICING.yearlySavingsPct}%
                  </span>
                </button>
              </div>
            </div>

            {/* Plan cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20, alignItems:'stretch' }}>
              {/* Free */}
              <div className="glass" style={{ borderRadius:12, padding:'34px 30px', display:'flex', flexDirection:'column' }}>
                <div style={{ fontFamily:'var(--font-disp)', fontWeight:800, fontSize:'1.05rem', textTransform:'uppercase', letterSpacing:'0.03em' }}>Free</div>
                <div style={{ display:'flex', alignItems:'baseline', gap:6, margin:'16px 0 4px' }}>
                  <span style={{ fontFamily:'var(--font-disp)', fontSize:'2.4rem', fontWeight:900 }}>₹0</span>
                </div>
                <p style={{ fontSize:'0.8rem', color:'var(--muted)', marginBottom:24 }}>10 free reports, forever</p>
                <div style={{ display:'flex', flexDirection:'column', gap:10, flex:1, marginBottom:26 }}>
                  {['10 AI report generations','Full report workspace & editing','Preview & download every report','Case management'].map((f,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:9, fontSize:'0.82rem', color:'var(--text)' }}>
                      <CheckCircle2 size={14} style={{ color:'var(--muted)', marginTop:2, flexShrink:0 }} /> {f}
                    </div>
                  ))}
                </div>
                <button className="btn-o" style={{ justifyContent:'center' }} onClick={onGetStarted}>Start Free</button>
              </div>

              {/* Pro */}
              <div className="glass" style={{ borderRadius:12, padding:'34px 30px', display:'flex', flexDirection:'column', position:'relative', border:'1px solid rgba(200,168,75,0.5)', boxShadow:'0 0 40px -12px rgba(200,168,75,0.25)' }}>
                <span style={{ position:'absolute', top:-13, left:'50%', transform:'translateX(-50%)', fontSize:'0.62rem', fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase', padding:'5px 14px', borderRadius:20, background:'linear-gradient(135deg,#e0c578,#c8a84b)', color:'#0a0e18', whiteSpace:'nowrap' }}>
                  Most Popular
                </span>
                <div style={{ fontFamily:'var(--font-disp)', fontWeight:800, fontSize:'1.05rem', textTransform:'uppercase', letterSpacing:'0.03em', color:'var(--gold)' }}>Pro</div>
                <div style={{ display:'flex', alignItems:'baseline', gap:6, margin:'16px 0 4px' }}>
                  <span style={{ fontFamily:'var(--font-disp)', fontSize:'2.4rem', fontWeight:900 }}>
                    {formatINR(pricingBilling === 'monthly' ? PRICING.monthly : PRICING.yearlyMonthlyEquivalent)}
                  </span>
                  <span style={{ fontSize:'0.8rem', color:'var(--muted)' }}>/ user / mo</span>
                </div>
                <p style={{ fontSize:'0.8rem', color:'var(--muted)', marginBottom:24 }}>
                  {pricingBilling === 'yearly' ? `Billed ${formatINR(PRICING.yearly)} / year` : 'Billed monthly · cancel anytime'}
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:10, flex:1, marginBottom:26 }}>
                  {['Unlimited AI report generations','Unlimited macros & templates','Priority AI processing','PDF export with hospital letterhead','Email support'].map((f,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:9, fontSize:'0.82rem', color:'var(--text)' }}>
                      <CheckCircle2 size={14} style={{ color:'var(--gold)', marginTop:2, flexShrink:0 }} /> {f}
                    </div>
                  ))}
                </div>
                <button className="btn-p" style={{ justifyContent:'center' }} onClick={onGetStarted}>
                  Start Free, Then Upgrade <ArrowRight size={14} />
                </button>
              </div>

              {/* Enterprise */}
              <div className="glass" style={{ borderRadius:12, padding:'34px 30px', display:'flex', flexDirection:'column' }}>
                <div style={{ fontFamily:'var(--font-disp)', fontWeight:800, fontSize:'1.05rem', textTransform:'uppercase', letterSpacing:'0.03em', display:'flex', alignItems:'center', gap:8 }}>
                  <Building2 size={16} /> Enterprise
                </div>
                <div style={{ display:'flex', alignItems:'baseline', gap:6, margin:'16px 0 4px' }}>
                  <span style={{ fontFamily:'var(--font-disp)', fontSize:'2.4rem', fontWeight:900 }}>Custom</span>
                </div>
                <p style={{ fontSize:'0.8rem', color:'var(--muted)', marginBottom:24 }}>For hospitals & imaging networks</p>
                <div style={{ display:'flex', flexDirection:'column', gap:10, flex:1, marginBottom:26 }}>
                  {['Everything in Pro, for your whole team','Multi-radiologist / multi-dept accounts','PACS, RIS & EMR integrations','Dedicated account manager','Custom billing & invoicing'].map((f,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:9, fontSize:'0.82rem', color:'var(--text)' }}>
                      <CheckCircle2 size={14} style={{ color:'var(--muted)', marginTop:2, flexShrink:0 }} /> {f}
                    </div>
                  ))}
                </div>
                <a href="mailto:hello@radai.health?subject=Enterprise%20plan%20enquiry%20-%20RadAI%20Copilot" className="btn-o" style={{ justifyContent:'center', textDecoration:'none' }}>
                  Contact Sales
                </a>
              </div>
            </div>

            <p style={{ textAlign:'center', fontSize:'0.78rem', color:'var(--muted)', marginTop:32 }}>
              Prices in Indian Rupees, per user, exclusive of applicable taxes. Need a custom quote or bulk seats for your hospital? <a href="mailto:hello@radai.health" style={{ color:'var(--gold)' }}>Talk to sales</a>.
            </p>
          </div>
        </section>

        <div className="gold-rule" />

        {/* ══════════════ FAQ ══════════════ */}
        <section id="faq" style={{ position:'relative', zIndex:10, padding:'100px 24px' }}>
          <div style={{ maxWidth:860, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:56 }}>
              <div className="chip" style={{ marginBottom:16 }}><CheckCircle2 size={12} /> FAQ</div>
              <div className="sec-divider" />
              <h2 className="sec-h2" style={{ fontFamily:'var(--font-disp)', fontSize:'2.9rem', fontWeight:900, lineHeight:1.08, letterSpacing:'-0.01em', textTransform:'uppercase' }}>
                Frequently Asked<br /><span className="grad">Questions</span>
              </h2>
              <p style={{ marginTop:16, fontSize:'1rem', lineHeight:1.84, color:'var(--muted)' }}>
                Everything you need to know about AI radiology reporting, healthcare compliance in India, and enterprise implementation.
              </p>
            </div>
            {faqData.map((item, i) => <FAQItem key={i} q={item.q} a={item.a} idx={i} />)}
          </div>
        </section>

        <div className="gold-rule" />

        {/* ══════════════ FINAL CTA ══════════════ */}
        <section style={{ position:'relative', zIndex:10, padding:'72px 24px 100px' }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div style={{ borderRadius:12, padding:'68px 56px', background:'linear-gradient(130deg,rgba(200,168,75,0.09) 0%,rgba(168,196,232,0.05) 50%,rgba(200,168,75,0.09) 100%)', border:'1px solid rgba(200,168,75,0.2)', textAlign:'center', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:'-40%', left:'50%', transform:'translateX(-50%)', width:700, height:500, borderRadius:'50%', background:'radial-gradient(ellipse,rgba(200,168,75,0.08) 0%,transparent 68%)', pointerEvents:'none' }} />
              <div className="ssl" style={{ position:'absolute', top:'-64px', right:'-64px', width:200, height:200, borderRadius:'50%', border:'1px dashed rgba(200,168,75,0.12)' }} />
              <div className="ssl" style={{ position:'absolute', bottom:'-40px', left:'-40px', width:140, height:140, borderRadius:'50%', border:'1px dashed rgba(168,196,232,0.1)', animationDirection:'reverse' }} />

              <div style={{ position:'relative' }}>
                <div className="chip" style={{ marginBottom:22, display:'inline-flex' }}>
                  <Globe size={12} /> Trusted Across India &amp; Globally — 2026
                </div>
                <h2 className="sec-h2-lg" style={{ fontFamily:'var(--font-disp)', fontSize:'3.2rem', fontWeight:900, lineHeight:1.06, letterSpacing:'-0.01em', marginBottom:18, textTransform:'uppercase' }}>
                  Redefine the Future of<br /><span className="grad">Radiology Reporting</span>
                </h2>
                <p style={{ fontSize:'1.04rem', lineHeight:1.84, color:'var(--muted)', maxWidth:600, margin:'0 auto 38px' }}>
                  Accelerate reporting, reduce radiologist burnout, improve clinical efficiency, and modernise your radiology infrastructure with enterprise-grade AI built for India.
                </p>
                <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', marginBottom:38 }}>
                  <button className="btn-p" style={{ padding:'16px 36px', fontSize:'0.9rem' }} onClick={onGetStarted}>
                    Start Free Trial — No Credit Card <ArrowRight size={15} />
                  </button>
                  <button className="btn-o" style={{ padding:'16px 36px', fontSize:'0.9rem' }}>
                    Schedule Enterprise Demo
                  </button>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:24, flexWrap:'wrap' }}>
                  {[
                    {icon:Shield,l:'HIPAA & DPDP Ready'},
                    {icon:CheckCircle2,l:'Free 14-Day Trial'},
                    {icon:Users,l:'50+ Orgs Trust Us'},
                    {icon:Zap,l:'Live in 30 Days'},
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.77rem', color:'var(--muted)', letterSpacing:'0.03em' }}>
                        <Icon size={12} style={{ color:'var(--gold)' }} /> {item.l}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════ FOOTER ══════════════ */}
        <footer style={{ position:'relative', zIndex:10, borderTop:'1px solid rgba(200,168,75,0.12)', background:'rgba(3,7,15,0.9)', backdropFilter:'blur(32px)' }}>
          <div style={{ maxWidth:1200, margin:'0 auto', padding:'72px 24px 40px' }}>
            <div className="footer-grid" style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', gap:36, marginBottom:56 }}>

              {/* Brand */}
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
                  <div style={{ width:42, height:42, borderRadius:8, background:'linear-gradient(135deg,#c8a84b,#e0c578,#b8923e)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px rgba(200,168,75,0.25)' }}>
                    <Microscope size={19} style={{ color:'#0a0e18' }} />
                  </div>
                  <div>
                    <div style={{ fontFamily:'var(--font-disp)', fontSize:'1.3rem', fontWeight:900, lineHeight:1, letterSpacing:'0.04em' }}>Rad<span className="grad">AI</span></div>
                    <div style={{ fontSize:'0.56rem', color:'var(--muted)', letterSpacing:'0.1em', fontWeight:500, textTransform:'uppercase', marginTop:2 }}>AI Radiology Intelligence</div>
                  </div>
                </div>
                <p style={{ fontSize:'0.84rem', lineHeight:1.84, color:'var(--muted)', maxWidth:295, marginBottom:22 }}>
                  Enterprise AI radiology reporting platform built for modern healthcare — intelligent workflows, structured reports, clinical accuracy at scale. Trusted across India and globally.
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:22 }}>
                  {[
                    { icon:Mail,  l:'hello@radai.health' },
                    { icon:Phone, l:'+91 98765 43210' },
                    { icon:MapPin,l:'Mumbai · Delhi · Bengaluru · Global' },
                  ].map((c,i) => {
                    const Icon = c.icon;
                    return (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:8, fontSize:'0.77rem', color:'var(--muted)' }}>
                        <Icon size={12} style={{ color:'var(--gold)', flexShrink:0 }} /> {c.l}
                      </div>
                    );
                  })}
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  {[Twitter,Linkedin,Youtube,Instagram].map((Icon, i) => (
                    <a key={i} href="#" style={{ width:34, height:34, borderRadius:6, border:'1px solid var(--border)', background:'rgba(200,168,75,0.04)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--muted)', textDecoration:'none', transition:'all 0.2s' }}
                      onMouseEnter={e=>{const el=e.currentTarget;el.style.borderColor='rgba(200,168,75,0.35)';el.style.color='var(--gold)';}}
                      onMouseLeave={e=>{const el=e.currentTarget;el.style.borderColor='var(--border)';el.style.color='var(--muted)';}}>
                      <Icon size={14} />
                    </a>
                  ))}
                </div>
              </div>

              {/* Platform */}
              <div>
                <h4 style={{ fontWeight:700, fontSize:'0.72rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gold-l)', marginBottom:18 }}>Platform</h4>
                <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
                  {['AI Reporting','Workflow Automation','Structured Reports','QA Engine','Analytics Dashboard'].map(item => (
                    <a key={item} href="#platform" style={{ fontSize:'0.83rem', color:'var(--muted)', textDecoration:'none', transition:'color 0.2s' }}
                      onMouseEnter={e=>(e.currentTarget.style.color='var(--text)')}
                      onMouseLeave={e=>(e.currentTarget.style.color='var(--muted)')}>{item}</a>
                  ))}
                </div>
              </div>

              {/* Integrations */}
              <div>
                <h4 style={{ fontWeight:700, fontSize:'0.72rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gold-l)', marginBottom:18 }}>Integrations</h4>
                <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
                  {['PACS Systems','RIS Platforms','EMR / EHR','HL7 FHIR','REST API'].map(item => (
                    <a key={item} href="#integrations" style={{ fontSize:'0.83rem', color:'var(--muted)', textDecoration:'none', transition:'color 0.2s' }}
                      onMouseEnter={e=>(e.currentTarget.style.color='var(--text)')}
                      onMouseLeave={e=>(e.currentTarget.style.color='var(--muted)')}>{item}</a>
                  ))}
                </div>
              </div>

              {/* Resources */}
              <div>
                <h4 style={{ fontWeight:700, fontSize:'0.72rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gold-l)', marginBottom:18 }}>Resources</h4>
                <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
                  {['Documentation','API Reference','Security Overview','Case Studies','Blog'].map(item => (
                    <a key={item} href="#" style={{ fontSize:'0.83rem', color:'var(--muted)', textDecoration:'none', transition:'color 0.2s' }}
                      onMouseEnter={e=>(e.currentTarget.style.color='var(--text)')}
                      onMouseLeave={e=>(e.currentTarget.style.color='var(--muted)')}>{item}</a>
                  ))}
                </div>
              </div>

              {/* Company */}
              <div>
                <h4 style={{ fontWeight:700, fontSize:'0.72rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gold-l)', marginBottom:18 }}>Company</h4>
                <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
                  {['About RadAI','Enterprise','Careers','Contact','Privacy Policy'].map(item => (
                    <a key={item} href="#" style={{ fontSize:'0.83rem', color:'var(--muted)', textDecoration:'none', transition:'color 0.2s' }}
                      onMouseEnter={e=>(e.currentTarget.style.color='var(--text)')}
                      onMouseLeave={e=>(e.currentTarget.style.color='var(--muted)')}>{item}</a>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer bottom */}
            <div style={{ borderTop:'1px solid rgba(200,168,75,0.1)', paddingTop:26, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:14 }}>
              <p style={{ fontSize:'0.75rem', color:'var(--muted)' }}>
                © 2026 RadAI Technologies Pvt. Ltd. Enterprise AI Radiology Reporting Platform. All rights reserved.
              </p>
              <div style={{ display:'flex', gap:18, flexWrap:'wrap' }}>
                {[
                  {icon:Shield,l:'HIPAA & DPDP Ready'},
                  {icon:Database,l:'Enterprise Infra'},
                  {icon:Clock3,l:'24/7 Monitoring'},
                  {icon:Building2,l:'Healthcare Focused'},
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.72rem', color:'var(--muted)' }}>
                      <Icon size={11} style={{ color:'var(--gold)' }} /> {item.l}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}