import { useState } from 'react';
import {
  Microscope, Zap, Shield, TrendingUp, CheckCircle2, ArrowRight,
  Stethoscope, Activity, Lock, Brain, BarChart3, Workflow, Sparkles,
  Clock, Users, Award, ArrowUpRight
} from 'lucide-react';

export function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Intelligence',
      description: 'Advanced deep learning models trained on thousands of radiology reports for exceptional accuracy',
      benefit: 'Reduces report generation time by up to 90%'
    },
    {
      icon: Workflow,
      title: 'Smart Templates',
      description: 'Pre-built templates for all major modalities with customizable fields and clinical pathways',
      benefit: 'Pre-configured for immediate use'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Real-time processing with instant report generation and formatting',
      benefit: '3 minutes per report on average'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'HIPAA-compliant, SOC 2 certified, end-to-end encryption for all patient data',
      benefit: 'Healthcare-grade protection'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track productivity metrics, turnaround times, and quality indicators in real-time',
      benefit: 'Data-driven insights'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Multi-user access, role-based permissions, and seamless workflow integration',
      benefit: 'Works with your team'
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Mitchell',
      role: 'Chief Radiologist',
      institution: 'Metro Medical Center',
      quote: 'RadAI has transformed our workflow. We\'ve reduced report turnaround time by 85% while maintaining clinical accuracy.',
      image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
    },
    {
      name: 'Dr. James Chen',
      role: 'Radiologist',
      institution: 'Advanced Imaging Diagnostics',
      quote: 'The AI suggestions are remarkably accurate. It\'s like having an experienced colleague reviewing every case.',
      image: 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
    },
    {
      name: 'Dr. Elena Rodriguez',
      role: 'Department Head',
      institution: 'Healthcare Solutions Network',
      quote: 'Integration with our existing systems was seamless. The support team is exceptional and responsive.',
      image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Reports Generated Monthly', icon: TrendingUp },
    { value: '95%', label: 'Clinical Accuracy Rate', icon: Award },
    { value: '8.5 min', label: 'Average Turnaround Time', icon: Clock },
    { value: '50+', label: 'Healthcare Facilities Trust Us', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-20 left-1/3 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      {/* Premium Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 lg:px-16 py-5 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Microscope size={22} className="text-slate-950" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              RadAI
            </span>
            <p className="text-xs text-slate-500 font-medium">Copilot</p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-8">
          <a href="#features" className="text-sm text-slate-300 hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="text-sm text-slate-300 hover:text-white transition-colors">Pricing</a>
          <a href="#testimonials" className="text-sm text-slate-300 hover:text-white transition-colors">Testimonials</a>
        </div>

        <button
          onClick={onGetStarted}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg font-semibold text-sm transition-all hover:shadow-xl hover:shadow-blue-500/40 active:scale-95"
        >
          Get Started Free
        </button>
      </nav>

      {/* Hero Section - Premium */}
      <section className="relative z-10 px-6 lg:px-16 py-24 lg:py-40 max-w-7xl mx-auto">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-block">
            <div className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/40 rounded-full flex items-center gap-2 backdrop-blur-sm">
              <Sparkles size={16} className="text-cyan-400" />
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Trusted by 50+ Healthcare Facilities
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="space-y-6">
            <h1 className="text-6xl lg:text-8xl font-black leading-tight tracking-tight">
              <span className="block text-slate-100">Radiology Reports</span>
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                in Seconds, Not Hours
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light">
              Enterprise-grade AI copilot for radiologists. Generate clinical-accurate reports 10x faster,
              reduce administrative burden, and focus on what matters—patient care.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <button
              onClick={onGetStarted}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg font-semibold text-base transition-all hover:shadow-2xl hover:shadow-blue-500/50 flex items-center justify-center gap-2 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Free Trial
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button className="px-8 py-4 border border-slate-600 hover:border-slate-400 rounded-lg font-semibold text-base transition-all hover:bg-slate-800/50 backdrop-blur-sm">
              Schedule Demo
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-12 border-t border-slate-800/50 flex flex-wrap justify-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">HIPAA</div>
              <div className="text-xs text-slate-500">Compliant</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">SOC 2</div>
              <div className="text-xs text-slate-500">Certified</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">99.9%</div>
              <div className="text-xs text-slate-500">Uptime SLA</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">24/7</div>
              <div className="text-xs text-slate-500">Support</div>
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="mt-20 lg:mt-32 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl blur-3xl" />
          <div className="relative bg-gradient-to-br from-slate-800/40 to-slate-900/60 border border-slate-700/50 rounded-2xl p-8 lg:p-12 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="relative aspect-video bg-slate-900/50 rounded-xl border border-slate-700/30 flex items-center justify-center">
              <img
                src="https://images.pexels.com/photos/3825517/pexels-photo-3825517.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Medical dashboard"
                className="w-full h-full object-cover rounded-xl opacity-40"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mx-auto flex items-center justify-center">
                    <Activity size={32} className="text-white" />
                  </div>
                  <p className="text-slate-200 font-semibold">AI-Powered Report Generation</p>
                  <p className="text-slate-400 text-sm">Real-time processing and clinical accuracy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Premium */}
      <section className="relative z-10 px-6 lg:px-16 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="group relative bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/50 rounded-xl p-8 hover:border-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-cyan-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative space-y-4">
                  <Icon className="text-cyan-400" size={28} />
                  <div>
                    <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Section - Premium */}
      <section id="features" className="relative z-10 px-6 lg:px-16 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
            Enterprise-Grade Features
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto font-light">
            Designed for professional radiologists and healthcare organizations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-gradient-to-br from-slate-800/40 to-slate-900/60 border border-slate-700/50 group-hover:border-blue-500/30 rounded-xl p-8 transition-all duration-300">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                      <Icon size={24} className="text-white" />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                      <p className="text-slate-400 text-sm mt-2 leading-relaxed">{feature.description}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-700/50">
                      <p className="text-sm text-cyan-400 font-semibold flex items-center gap-2">
                        <ArrowUpRight size={16} />
                        {feature.benefit}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 px-6 lg:px-16 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight">Loved by Radiologists</h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto font-light">
            See what healthcare professionals say about RadAI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className="relative bg-gradient-to-br from-slate-800/40 to-slate-900/60 border border-slate-700/50 rounded-xl p-8 hover:border-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/10"
            >
              <div className="flex items-start gap-4 mb-6">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-600"
                />
                <div>
                  <h4 className="font-bold text-white">{testimonial.name}</h4>
                  <p className="text-xs text-slate-400">{testimonial.role}</p>
                  <p className="text-xs text-cyan-400 font-semibold">{testimonial.institution}</p>
                </div>
              </div>
              <p className="text-slate-300 italic leading-relaxed">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 lg:px-16 py-24 max-w-7xl mx-auto">
        <div className="relative bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-12 lg:p-16 text-center backdrop-blur-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-cyan-600/5" />
          <div className="relative space-y-8">
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
              Ready to Transform Your Workflow?
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto font-light">
              Join 50+ healthcare facilities already using RadAI to deliver faster, more accurate reports
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg font-bold transition-all hover:shadow-2xl hover:shadow-blue-500/50"
              >
                Start Your Free Trial
              </button>
              <button className="px-8 py-4 border border-slate-400 hover:border-white rounded-lg font-bold transition-all hover:bg-white/5">
                Schedule a Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-sm px-6 lg:px-16 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">HIPAA</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800/50 pt-8 flex items-center justify-between">
            <p className="text-slate-500 text-sm">© 2026 RadAI. All rights reserved. | Enterprise Healthcare Platform</p>
            <div className="flex gap-4 text-slate-500 text-sm">
              <span className="flex items-center gap-1"><Shield size={16} /> HIPAA Compliant</span>
              <span className="flex items-center gap-1"><Lock size={16} /> Enterprise Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
