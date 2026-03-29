import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2, ChevronRight, Shield, Globe, MapPin,
  TrendingUp, Users, ArrowRight, CheckCircle2,
  Phone, Star, Briefcase, BarChart3
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }
  })
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } }
};

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
    >
      <div className="container navbar-inner">
        <Link to="/" className="nav-logo">
          <Building2 size={26} color="#1e40af" />
          Brokrs<span>House</span>
        </Link>
        <ul className="nav-links hide-mobile">
          <li><a href="#features">Services</a></li>
          <li><a href="#network">Network</a></li>
          <li><a href="#contact">Contact</a></li>
          <li>
            <Link to="/register" className="btn btn-primary btn-sm">
              Register Now <ArrowRight size={15} />
            </Link>
          </li>
        </ul>
      </div>
    </motion.nav>
  );
}

function HeroBuildings() {
  const buildings = [
    { w: 48, h: 120, color: '#bfdbfe', delay: 0 },
    { w: 56, h: 180, color: '#93c5fd', delay: 0.1 },
    { w: 64, h: 240, color: '#3b82f6', delay: 0.2 },
    { w: 72, h: 200, color: '#1e40af', delay: 0.3 },
    { w: 56, h: 160, color: '#60a5fa', delay: 0.4 },
    { w: 48, h: 130, color: '#93c5fd', delay: 0.5 },
    { w: 40, h: 100, color: '#bfdbfe', delay: 0.6 },
  ];

  return (
    <div className="building-card">
      <div className="building-illustration">
        {buildings.map((b, i) => (
          <motion.div
            key={i}
            className="building-bar"
            style={{ width: b.w, background: b.color }}
            initial={{ height: 0 }}
            animate={{ height: b.h }}
            transition={{ duration: 1.2, delay: 0.5 + b.delay, ease: [0.34, 1.56, 0.64, 1] }}
          />
        ))}
      </div>

      <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Total Portfolio Value</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>₹482Cr+</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#059669', fontSize: 14, fontWeight: 700 }}>
          <TrendingUp size={16} /> +24.5%
        </div>
      </div>

      <motion.div
        className="floating-badge animate-float"
        style={{ top: 20, right: -30 }}
      >
        <div className="floating-badge-icon" style={{ background: 'rgba(5,150,105,0.1)', color: '#059669' }}>
          <CheckCircle2 size={20} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>VERIFIED</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>2,500+ Brokers</div>
        </div>
      </motion.div>

      <motion.div
        className="floating-badge animate-float-delayed"
        style={{ bottom: 80, left: -40 }}
      >
        <div className="floating-badge-icon" style={{ background: 'rgba(30,64,175,0.08)', color: '#1e40af' }}>
          <MapPin size={20} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>COVERAGE</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>150+ Cities</div>
        </div>
      </motion.div>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg">
        <img src="/hero-bg.png" alt="" />
        <div className="hero-bg-overlay" />
      </div>
      <div className="hero-grid-pattern" />
      <div className="container hero-content">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} custom={0}>
            <span className="hero-badge">
              <Shield size={14} /> India's #1 Broker Network
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="hero-title">
            Build Your Real Estate <span className="text-gradient">Empire</span> With Us.
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="hero-subtitle">
            Join the most trusted network of licensed real estate brokers. Access premium listings,
            connect with verified buyers, and grow your professional portfolio across India.
          </motion.p>
          <motion.div variants={fadeUp} custom={3} className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              Start Registration <ChevronRight size={18} />
            </Link>
            <a href="#features" className="btn btn-outline btn-lg">
              Explore Platform
            </a>
          </motion.div>
          <motion.div variants={fadeUp} custom={4} className="hero-stats">
            {[
              { value: '2,500+', label: 'Active Brokers' },
              { value: '₹482Cr', label: 'Assets Managed' },
              { value: '150+', label: 'Cities Covered' },
            ].map((s, i) => (
              <div key={i}>
                <div className="hero-stat-value">{s.value}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
        >
          <HeroBuildings />
        </motion.div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: <Building2 size={24} />, color: 'blue', title: 'Residential Assets', desc: 'Premium apartments, luxury villas, gated communities, and high-rise developments across metro regions.' },
    { icon: <Globe size={24} />, color: 'gold', title: 'Commercial Properties', desc: 'Class-A office spaces, retail outlets, warehouses, and industrial complexes for enterprise clients.' },
    { icon: <MapPin size={24} />, color: 'green', title: 'Land & Development', desc: 'Strategic plots, township projects, and upcoming infrastructure corridors for long-term investments.' },
    { icon: <Briefcase size={24} />, color: 'blue', title: 'Portfolio Management', desc: 'Advanced tools to manage and showcase your property listings to verified institutional buyers.' },
    { icon: <BarChart3 size={24} />, color: 'gold', title: 'Market Intelligence', desc: 'Real-time data analytics, pricing trends, and comparative market analysis for better decisions.' },
    { icon: <Star size={24} />, color: 'green', title: 'Premium Branding', desc: 'Get featured on our platform with a verified broker badge and enhanced profile visibility.' },
  ];

  return (
    <section id="features" className="section features-section">
      <div className="container">
        <motion.div
          className="text-center"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
        >
          <motion.div variants={fadeUp}><span className="section-badge">Our Platform</span></motion.div>
          <motion.h2 variants={fadeUp} className="section-title">What Our Brokers Cover</motion.h2>
          <motion.p variants={fadeUp} className="section-desc centered">
            Comprehensive real estate coverage across all market sectors with institutional-grade tools and features.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-3 gap-8"
          style={{ marginTop: 60 }}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
        >
          {features.map((f, i) => (
            <motion.div key={i} variants={fadeUp} custom={i} className="card">
              <div className={`card-icon ${f.color}`}>{f.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, color: '#0f172a' }}>{f.title}</h3>
              <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7 }}>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function NetworkSection() {
  return (
    <section id="network" className="section" style={{ background: 'var(--bg)' }}>
      <div className="container">
        <motion.div
          className="text-center"
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div variants={fadeUp}><span className="section-badge">Global Reach</span></motion.div>
          <motion.h2 variants={fadeUp} className="section-title">Trusted by Professionals Nationwide</motion.h2>
          <motion.p variants={fadeUp} className="section-desc centered">
            Our growing network spans across major cities in India, covering Tier-1, Tier-2, and emerging markets.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-4 gap-6"
          style={{ marginTop: 60 }}
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={stagger}
        >
          {[
            { city: 'Mumbai', brokers: 420, icon: '🏙️' },
            { city: 'Delhi NCR', brokers: 380, icon: '🏛️' },
            { city: 'Bangalore', brokers: 310, icon: '💻' },
            { city: 'Hyderabad', brokers: 280, icon: '🌆' },
            { city: 'Pune', brokers: 240, icon: '🏗️' },
            { city: 'Chennai', brokers: 220, icon: '🌴' },
            { city: 'Ahmedabad', brokers: 180, icon: '🏭' },
            { city: 'Kolkata', brokers: 160, icon: '🌉' },
          ].map((c, i) => (
            <motion.div key={i} variants={fadeUp} custom={i} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{c.icon}</div>
              <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: '#0f172a' }}>{c.city}</h4>
              <p style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>{c.brokers} Active Brokers</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section id="contact" className="section" style={{ background: '#0f172a', color: '#fff' }}>
      <div className="container text-center">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2
            variants={fadeUp}
            style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, marginBottom: 18, lineHeight: 1.15 }}
          >
            Ready to Grow Your<br />Real Estate Business?
          </motion.h2>
          <motion.p variants={fadeUp} style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', maxWidth: 500, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Register today and become part of India's most trusted broker network. It takes less than 2 minutes.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link to="/register" className="btn btn-white btn-lg">
              Register as Broker <ArrowRight size={18} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="nav-logo" style={{ color: '#fff', marginBottom: 0 }}>
              <Building2 size={24} color="#3b82f6" />
              Brokrs<span style={{ color: '#3b82f6' }}>House</span>
            </div>
            <p>India's premier digital platform connecting licensed real estate brokers with verified institutional clients.</p>
          </div>
          <div>
            <h4 className="footer-heading">Platform</h4>
            <ul className="footer-links">
              <li><a href="#features">Services</a></li>
              <li><a href="#network">Network</a></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-links">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-heading">Legal</h4>
            <ul className="footer-links">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Compliance</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 BrokrsHouse. All rights reserved.</span>
          <span>Made with ❤️ in India</span>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <NetworkSection />
      <CTASection />
      <Footer />
    </>
  );
}
