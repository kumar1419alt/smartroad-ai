/**
 * LandingPage — public marketing/information page for SmartRoad AI.
 *
 * Sections:
 *  1. Navbar
 *  2. Hero
 *  3. Statistics (demo data — clearly labelled)
 *  4. How It Works (6-step process)
 *  5. Features (6 cards)
 *  6. Damage Types (4 types)
 *  7. Smart Priority Score (SRPS)
 *  8. CTA
 *  9. Footer
 */

import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  Brain,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Upload,
  ScanSearch,
  Gauge,
  Map,
  ListOrdered,
  Wrench,
  MessageSquare,
  LineChart,
  ShieldCheck,
  Users,
  TrendingUp,
  ChevronRight,
  ArrowRight,
  Menu,
  X,
  Star,
  Info,
} from 'lucide-react'

// ─── Scroll reveal hook ───────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
          observer.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const navLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'About', href: '#about' },
  ]

  const scrollTo = (e, id) => {
    e.preventDefault()
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'nav-scrolled' : 'bg-transparent'
      }`}
    >
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <a
          href="#hero"
          onClick={(e) => scrollTo(e, '#hero')}
          className="flex items-center gap-2.5 group"
          aria-label="SmartRoad AI — home"
        >
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 group-hover:bg-blue-700 transition-colors">
            <MapPin size={16} className="text-white" aria-hidden="true" />
          </span>
          <span className="font-bold text-base text-slate-900 tracking-tight">
            SmartRoad<span className="text-blue-600"> AI</span>
          </span>
        </a>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1" role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(e) => scrollTo(e, link.href)}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors duration-150"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors duration-150"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors duration-150 shadow-sm"
          >
            Report Damage
            <ChevronRight size={14} aria-hidden="true" />
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-1 shadow-md">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => scrollTo(e, link.href)}
              className="block px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100"
            >
              {link.label}
            </a>
          ))}
          <hr className="border-slate-200 my-2" />
          <Link
            to="/login"
            className="block px-3 py-2.5 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100"
          >
            Login to Platform
          </Link>
          <Link
            to="/register"
            className="block text-center px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Report Road Damage
          </Link>
        </div>
      )}
    </header>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  const scrollTo = (e, id) => {
    e.preventDefault()
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center bg-slate-50 pt-16 overflow-hidden"
      aria-label="Hero"
    >
      {/* Subtle background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#0f2444 1px, transparent 1px), linear-gradient(90deg, #0f2444 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
        aria-hidden="true"
      />

      {/* Accent blob */}
      <div
        className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full opacity-[0.06] blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — text */}
          <div>
            {/* Eyebrow label */}
            <span className="animate-fade-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wide mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" aria-hidden="true" />
              AI-Powered Infrastructure Management
            </span>

            <h1 className="animate-fade-up delay-100 text-4xl sm:text-5xl lg:text-5xl font-bold text-slate-900 leading-tight tracking-tight mb-6">
              Smarter Roads.
              <br />
              <span className="text-blue-600">Faster Repairs.</span>
            </h1>

            <p className="animate-fade-up delay-200 text-lg text-slate-600 leading-relaxed mb-8 max-w-lg">
              SmartRoad AI uses computer vision and GIS mapping to automatically detect road
              damage, assess severity, and intelligently prioritize repairs — helping municipalities
              respond faster and allocate resources more effectively.
            </p>

            {/* CTAs */}
            <div className="animate-fade-up delay-300 flex flex-col sm:flex-row gap-3">
              <a
                href="#cta"
                onClick={(e) => scrollTo(e, '#cta')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors duration-150 shadow-sm"
              >
                Report Road Damage
                <ArrowRight size={16} aria-hidden="true" />
              </a>
              <Link
                to="/app/map"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-slate-700 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors duration-150 shadow-sm"
              >
                <Map size={16} aria-hidden="true" />
                View Road Map
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="animate-fade-up delay-400 flex flex-wrap items-center gap-5 mt-8 pt-8 border-t border-slate-200">
              {[
                { icon: ShieldCheck, label: 'Civic Infrastructure Grade' },
                { icon: Brain, label: 'Computer Vision Detection' },
                { icon: Navigation, label: 'GIS Spatial Mapping' },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Icon size={14} className="text-blue-500 shrink-0" aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Right — hero image */}
          <div className="animate-slide-right delay-200 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_60px_-10px_rgb(0_0_0/0.2)] border border-slate-200">
              <img
                src="/hero-road-ai.jpg"
                alt="AI and GIS-based road damage detection dashboard showing city road network with incident heatmap overlays"
                className="w-full h-auto object-cover"
                loading="eager"
              />
              {/* Overlay badge */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-slate-200/80">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
                <span className="text-xs font-semibold text-slate-700">System Active</span>
              </div>
            </div>
            {/* Floating stat card */}
            <div className="absolute -top-4 -right-4 hidden lg:flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-[0_4px_20px_rgb(0_0_0/0.12)] border border-slate-200">
              <span className="text-xl font-bold text-red-600">47</span>
              <div>
                <p className="text-xs font-semibold text-slate-700">Critical Issues</p>
                <p className="text-[10px] text-slate-400">Demo data</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Statistics ───────────────────────────────────────────────────────────────
function StatsSection() {
  const ref = useReveal()

  const stats = [
    { value: '1,284', label: 'Road Issues Detected', icon: AlertTriangle, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { value: '47', label: 'Critical Issues', icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' },
    { value: '892', label: 'Issues Resolved', icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50' },
    { value: '24', label: 'Areas Covered', icon: Map, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  ]

  return (
    <section className="py-14 bg-white border-y border-slate-100" aria-label="Platform statistics">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Demo data notice */}
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 w-fit mx-auto mb-8">
          <Info size={13} aria-hidden="true" />
          <span>The figures below are <strong>demonstration values</strong> for illustrative purposes only — not real-world results.</span>
        </div>

        <div ref={ref} className="reveal grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center p-6 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-blue-200 hover:bg-blue-50/30 transition-colors duration-200"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <span className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${stat.bgColor} mb-4`}>
                <stat.icon size={22} className={stat.color} aria-hidden="true" />
              </span>
              <span className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</span>
              <span className="text-sm text-slate-500 font-medium">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const ref = useReveal()

  const steps = [
    {
      step: '01',
      icon: Upload,
      title: 'Image Upload',
      description: 'Field inspectors or mounted cameras upload road surface images via the mobile app or API.',
      color: 'bg-blue-500',
    },
    {
      step: '02',
      icon: Brain,
      title: 'AI Detection',
      description: 'A computer vision model analyses the image to detect and classify road damage regions.',
      color: 'bg-indigo-500',
    },
    {
      step: '03',
      icon: ScanSearch,
      title: 'Severity Assessment',
      description: 'Detected damage is rated — Critical, High, Medium, or Low — based on size, depth, and type.',
      color: 'bg-violet-500',
    },
    {
      step: '04',
      icon: Map,
      title: 'GIS Mapping',
      description: 'GPS-tagged incidents are plotted on a live GIS map, giving a spatial view of all damage.',
      color: 'bg-cyan-500',
    },
    {
      step: '05',
      icon: Gauge,
      title: 'Smart Priority',
      description: 'The SRPS algorithm scores each incident using severity, traffic, location, and more.',
      color: 'bg-orange-500',
    },
    {
      step: '06',
      icon: Wrench,
      title: 'Repair Dispatch',
      description: 'Repair teams receive prioritised work orders and mark progress through the platform.',
      color: 'bg-green-500',
    },
  ]

  return (
    <section id="how-it-works" className="py-20 bg-slate-50" aria-label="How It Works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">Process</span>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            From image capture to repair dispatch — six automated steps powered by AI and geospatial intelligence.
          </p>
        </div>

        <div ref={ref} className="reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div
              key={step.step}
              className="relative bg-white rounded-xl border border-slate-200 p-6 hover:border-blue-300 hover:shadow-[0_4px_12px_rgb(0_0_0/0.07)] transition-all duration-200"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              {/* Step number */}
              <span className="absolute top-5 right-5 text-xs font-bold text-slate-300">
                {step.step}
              </span>
              {/* Icon */}
              <span className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${step.color} mb-4 shadow-sm`}>
                <step.icon size={20} className="text-white" aria-hidden="true" />
              </span>
              {/* Connector arrow (horizontal, large screens only) */}
              {i % 3 !== 2 && (
                <span
                  className="hidden lg:block absolute top-11 -right-3 z-10"
                  aria-hidden="true"
                >
                  <ChevronRight size={18} className="text-slate-300" />
                </span>
              )}
              <h3 className="text-sm font-semibold text-slate-800 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────
function FeaturesSection() {
  const ref = useReveal()

  const features = [
    {
      icon: Brain,
      title: 'AI Road Damage Detection',
      description:
        'Computer vision models analyse road surface images to identify and classify damage types — potholes, cracks, subsidence — without manual review.',
      accent: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: Navigation,
      title: 'GPS / GIS Mapping',
      description:
        'Every detected incident is automatically geo-tagged and plotted on an interactive map, giving administrators a live spatial overview of road health.',
      accent: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      icon: Gauge,
      title: 'Severity Assessment',
      description:
        'Each incident is rated on a four-level severity scale — Critical, High, Medium, Low — based on damage dimensions, type, and contextual factors.',
      accent: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      icon: ListOrdered,
      title: 'Smart Repair Priority',
      description:
        'The SRPS algorithm ranks all pending repairs using a weighted combination of severity, traffic importance, location criticality, and citizen feedback.',
      accent: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      icon: MessageSquare,
      title: 'Citizen Report Tracking',
      description:
        'Citizens can submit road damage reports via the mobile app or web form. All reports are validated, geo-tagged, and incorporated into the priority score.',
      accent: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      icon: LineChart,
      title: 'Admin Analytics',
      description:
        'Zone-level dashboards, monthly trend charts, cost estimates, and repair completion reports give administrators data-driven visibility into road health.',
      accent: 'text-cyan-600',
      bg: 'bg-cyan-50',
    },
  ]

  return (
    <section id="features" className="py-20 bg-white" aria-label="Platform features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">Platform</span>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Key Features</h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            An integrated toolkit for every stage of road infrastructure monitoring and repair management.
          </p>
        </div>

        <div ref={ref} className="reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <div
              key={feat.title}
              className="group p-6 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-[0_4px_12px_rgb(0_0_0/0.07)] transition-all duration-200 cursor-default"
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <span className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${feat.bg} mb-5 group-hover:scale-105 transition-transform duration-200`}>
                <feat.icon size={20} className={feat.accent} aria-hidden="true" />
              </span>
              <h3 className="text-sm font-semibold text-slate-800 mb-2">{feat.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Damage Types ─────────────────────────────────────────────────────────────
function DamageTypesSection() {
  const ref = useReveal()

  const types = [
    {
      name: 'Pothole',
      description: 'Bowl-shaped depression caused by water infiltration and traffic load, compromising vehicle safety and ride quality.',
      severity: 'Critical / High',
      severityColor: 'text-red-600 bg-red-50 border-red-200',
      visual: (
        <svg viewBox="0 0 120 80" className="w-full h-20" aria-hidden="true">
          <rect width="120" height="80" fill="#f1f5f9" rx="4"/>
          <rect x="0" y="20" width="120" height="40" fill="#cbd5e1"/>
          <ellipse cx="60" cy="40" rx="28" ry="14" fill="#64748b"/>
          <ellipse cx="60" cy="37" rx="22" ry="10" fill="#475569"/>
          <ellipse cx="58" cy="36" rx="10" ry="5" fill="#334155" opacity="0.6"/>
        </svg>
      ),
    },
    {
      name: 'Longitudinal Crack',
      description: 'Crack running parallel to the road centreline, often indicating structural fatigue or base layer failure.',
      severity: 'Medium / High',
      severityColor: 'text-orange-600 bg-orange-50 border-orange-200',
      visual: (
        <svg viewBox="0 0 120 80" className="w-full h-20" aria-hidden="true">
          <rect width="120" height="80" fill="#f1f5f9" rx="4"/>
          <rect x="0" y="20" width="120" height="40" fill="#e2e8f0"/>
          <path d="M15 40 Q30 38 45 41 Q60 43 75 39 Q90 36 105 40" stroke="#94a3b8" strokeWidth="3" fill="none" strokeDasharray="4,2"/>
          <path d="M15 40 Q30 38 45 41 Q60 43 75 39 Q90 36 105 40" stroke="#475569" strokeWidth="2" fill="none"/>
        </svg>
      ),
    },
    {
      name: 'Transverse Crack',
      description: 'Crack perpendicular to the road direction, typically caused by thermal expansion/contraction cycles.',
      severity: 'Medium',
      severityColor: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      visual: (
        <svg viewBox="0 0 120 80" className="w-full h-20" aria-hidden="true">
          <rect width="120" height="80" fill="#f1f5f9" rx="4"/>
          <rect x="0" y="20" width="120" height="40" fill="#e2e8f0"/>
          <path d="M60 22 Q62 30 59 40 Q57 50 60 58" stroke="#475569" strokeWidth="2.5" fill="none"/>
          <path d="M40 22 Q42 30 39 40 Q37 50 40 58" stroke="#94a3b8" strokeWidth="1.5" fill="none" opacity="0.6"/>
          <path d="M80 22 Q82 30 79 40 Q77 50 80 58" stroke="#94a3b8" strokeWidth="1.5" fill="none" opacity="0.6"/>
        </svg>
      ),
    },
    {
      name: 'Alligator Crack',
      description: 'Interconnected cracking pattern resembling alligator skin, indicating severe structural deterioration requiring full rehabilitation.',
      severity: 'Critical',
      severityColor: 'text-red-700 bg-red-50 border-red-300',
      visual: (
        <svg viewBox="0 0 120 80" className="w-full h-20" aria-hidden="true">
          <rect width="120" height="80" fill="#f1f5f9" rx="4"/>
          <rect x="10" y="15" width="100" height="50" fill="#e2e8f0" rx="2"/>
          {/* Alligator crack pattern */}
          <path d="M30 20 L50 32 L40 45 L60 38 L70 52 L90 40" stroke="#64748b" strokeWidth="1.5" fill="none"/>
          <path d="M50 32 L70 24 L80 38 L60 38" stroke="#64748b" strokeWidth="1.5" fill="none"/>
          <path d="M40 45 L30 55 L50 60" stroke="#64748b" strokeWidth="1.5" fill="none"/>
          <path d="M60 38 L50 55 L70 60 L80 50 L90 60" stroke="#64748b" strokeWidth="1.5" fill="none"/>
          <path d="M70 24 L90 30" stroke="#94a3b8" strokeWidth="1" fill="none"/>
          <path d="M30 35 L20 45 L30 55" stroke="#94a3b8" strokeWidth="1" fill="none"/>
          <path d="M80 38 L95 45 L90 58" stroke="#94a3b8" strokeWidth="1" fill="none"/>
        </svg>
      ),
    },
  ]

  return (
    <section id="about" className="py-20 bg-slate-50" aria-label="Road damage types">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">Detection</span>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Road Damage Types</h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            SmartRoad AI is designed to identify and classify four primary categories of road surface damage.
          </p>
        </div>

        <div ref={ref} className="reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {types.map((type, i) => (
            <div
              key={type.name}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-[0_4px_16px_rgb(0_0_0/0.08)] hover:border-slate-300 transition-all duration-200"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {/* Visual */}
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                {type.visual}
              </div>
              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-slate-800">{type.name}</h3>
                  <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${type.severityColor}`}>
                    {type.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{type.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── SRPS Section ─────────────────────────────────────────────────────────────
function SRPSSection() {
  const ref = useReveal()

  const factors = [
    {
      name: 'Damage Severity',
      description: 'Type, size, and depth of detected damage — the primary driver of the score.',
      weight: 35,
      color: 'bg-red-500',
    },
    {
      name: 'Traffic Volume Importance',
      description: 'Roads carrying higher daily traffic volumes receive elevated priority.',
      weight: 25,
      color: 'bg-orange-500',
    },
    {
      name: 'Location Criticality',
      description: 'Proximity to hospitals, schools, emergency routes, and other critical infrastructure.',
      weight: 20,
      color: 'bg-blue-500',
    },
    {
      name: 'Road Classification',
      description: 'National highways and arterials are prioritised over local residential roads.',
      weight: 12,
      color: 'bg-indigo-500',
    },
    {
      name: 'Citizen Report Frequency',
      description: 'Number of citizen complaints about a specific location, reflecting public impact.',
      weight: 8,
      color: 'bg-green-500',
    },
  ]

  return (
    <section className="py-20 bg-white" aria-label="Smart Repair Priority Score">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — explanation */}
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">Priority Algorithm</span>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Smart Road Repair
              <br />Priority Score
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              The <strong>SRPS (Smart Road Priority Score)</strong> is a composite metric that ranks
              every pending repair from 0 to 100, helping administrators direct limited resources
              where they have the greatest public benefit.
            </p>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              SRPS combines multiple contextual factors — not just damage severity — to reflect
              real-world repair urgency. The factor weights shown here are illustrative; the
              algorithm is designed to be tuned to local operational priorities.
            </p>
            {/* Score example */}
            <div className="inline-flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl px-5 py-4">
              <div className="text-center">
                <span className="text-4xl font-bold text-red-600">94</span>
                <p className="text-xs text-slate-400 mt-0.5">Score / 100</p>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <p className="text-sm font-semibold text-slate-700">Critical Priority</p>
                <p className="text-xs text-slate-500">Ring Road, ITO — Pothole</p>
                <p className="text-[10px] text-slate-400 mt-1">Example incident — demo data</p>
              </div>
            </div>
          </div>

          {/* Right — factor bars */}
          <div ref={ref} className="reveal space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Gauge size={16} className="text-blue-500" />
              Score Composition Factors
              <span className="text-xs font-normal text-slate-400">(illustrative weights)</span>
            </h3>
            {factors.map((factor, i) => (
              <div key={factor.name} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-slate-700">{factor.name}</span>
                  <span className="text-sm font-semibold text-slate-500">~{factor.weight}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${factor.color} rounded-full srps-bar`}
                    style={{
                      width: `${factor.weight * 2.5}%`,
                      animationDelay: `${i * 150 + 300}ms`,
                    }}
                    role="progressbar"
                    aria-valuenow={factor.weight}
                    aria-valuemin={0}
                    aria-valuemax={40}
                    aria-label={`${factor.name}: approximately ${factor.weight}%`}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">{factor.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── CTA Section ──────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section id="cta" className="py-20 bg-[#0f2444]" aria-label="Call to action">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-6">
          <Users size={26} className="text-blue-300" aria-hidden="true" />
        </span>
        <h2 className="text-3xl font-bold text-white mb-4">Help Make Roads Safer</h2>
        <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-xl mx-auto">
          Spotted a pothole or road hazard? Submit a report in under a minute. Your input helps
          the system prioritize repairs and keep communities safe.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 active:bg-blue-700 transition-colors duration-150 shadow-sm"
          >
            Report a Road Issue
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link
            to="/app/map"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold text-white/80 bg-white/10 border border-white/20 rounded-lg hover:bg-white/15 hover:text-white transition-colors duration-150"
          >
            <Map size={16} aria-hidden="true" />
            View Incident Map
          </Link>
        </div>

        <p className="text-slate-500 text-xs mt-6">
          All reports are reviewed and integrated into the live incident database.
        </p>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const scrollTo = (e, id) => {
    e.preventDefault()
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-slate-400" aria-label="Site footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600">
                <MapPin size={15} className="text-white" aria-hidden="true" />
              </span>
              <span className="font-bold text-white text-sm">
                SmartRoad <span className="text-blue-400">AI</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-500">
              AI and GIS-based road damage detection and repair prioritization for smarter municipal infrastructure management.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-300 mb-4">Platform</h3>
            <ul className="space-y-2.5 text-sm" role="list">
              {[
                { label: 'Dashboard', to: '/app/dashboard' },
                { label: 'Incident Map', to: '/app/map' },
                { label: 'Repair Queue', to: '/app/repairs' },
                { label: 'Analytics', to: '/app/analytics' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="hover:text-slate-200 transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-300 mb-4">Information</h3>
            <ul className="space-y-2.5 text-sm" role="list">
              {[
                { label: 'How It Works', href: '#how-it-works' },
                { label: 'Features', href: '#features' },
                { label: 'Damage Types', href: '#about' },
                { label: 'Priority Score', href: '#about' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => scrollTo(e, link.href)}
                    className="hover:text-slate-200 transition-colors duration-150"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-300 mb-4">Technology</h3>
            <ul className="space-y-2 text-sm" role="list">
              {[
                'Computer Vision (AI)',
                'GIS / Leaflet Mapping',
                'React.js Frontend',
                'FastAPI Backend',
              ].map((tech) => (
                <li key={tech} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-blue-500 shrink-0" aria-hidden="true" />
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <p>© {currentYear} SmartRoad AI — AI &amp; GIS Road Damage Detection System</p>
          <p className="flex items-center gap-1.5">
            <Info size={11} aria-hidden="true" />
            For academic / research demonstration purposes
          </p>
        </div>
      </div>
    </footer>
  )
}

// ─── Page Root ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main id="main-content" aria-label="Main content">
        <HeroSection />
        <StatsSection />
        <HowItWorksSection />
        <FeaturesSection />
        <DamageTypesSection />
        <SRPSSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
