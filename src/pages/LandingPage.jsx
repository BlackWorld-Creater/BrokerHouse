import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, animate } from 'framer-motion';
import {
  Building2, ChevronRight, Shield, Globe, MapPin,
  TrendingUp, Users, ArrowRight, CheckCircle2,
  Phone, Star, Briefcase, BarChart3
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CityBlueprint from '../components/CityBlueprint';

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

function Counter({ value, duration = 2, suffix = "", prefix = "" }) {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplayValue(Math.floor(v)),
    });
    return () => controls.stop();
  }, [value, duration]);
  return <>{prefix}{displayValue.toLocaleString()}{suffix}</>;
}



function HeroGraph() {
  const data = [
    { month: 'Jan', value: 32, total: 1200, growth: '+12%' },
    { month: 'Feb', value: 45, total: 1540, growth: '+28%' },
    { month: 'Mar', value: 42, total: 1890, growth: '+22.5%' },
    { month: 'Apr', value: 68, total: 2100, growth: '+10.8%' },
    { month: 'May', value: 65, total: 2350, growth: '+11.9%' },
    { month: 'Jun', value: 88, total: 2500, growth: '+6.4%' }
  ];

  const [hovered, setHovered] = useState(null);
  const width = 360;
  const height = 180;
  const paddingY = 40;

  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - (d.value / 100) * (height - paddingY * 2) - paddingY
  }));

  const drawPath = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

  return (
    <div className="building-card no-padding" style={{ overflow: 'visible' }}>
      <div style={{ padding: '32px 32px 0' }}>
        <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
          <span>MARKET GROWTH</span>
          <span style={{ color: '#059669' }}><Counter value={88} suffix="%" /></span>
        </div>
      </div>

      <div style={{ position: 'relative', height: 240, marginTop: 20, width: '100%' }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible', display: 'block' }}>
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#1e40af" />
              <stop offset="100%" stopColor="#b8860b" />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(30,64,175,0.15)" />
              <stop offset="100%" stopColor="rgba(30,64,175,0)" />
            </linearGradient>
          </defs>

          {/* Area under line */}
          <path
            d={`${drawPath} L ${points[points.length - 1].x},${height} L 0,${height} Z`}
            fill="url(#areaGradient)"
          />

          {/* The Line */}
          <motion.path
            d={drawPath}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Dots and Interaction */}
          {points.map((p, i) => (
            <g key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              <circle cx={p.x} cy={p.y} r="16" fill="transparent" style={{ cursor: 'pointer' }} />
              <motion.circle
                cx={p.x} cy={p.y} r={4}
                fill={hovered === i ? '#1e40af' : '#3b82f6'}
                stroke="#fff" strokeWidth="2"
                initial={{ r: 4 }}
                animate={{ r: hovered === i ? 6 : 4 }}
              />
            </g>
          ))}
        </svg>

        {/* Floating Tooltip */}
        {hovered !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            style={{
              position: 'absolute',
              left: points[hovered].x,
              top: points[hovered].y - 65,
              transform: 'translateX(-50%)',
              background: '#0f172a',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              pointerEvents: 'none',
              zIndex: 10,
              minWidth: 100
            }}
          >
            <div style={{ fontSize: 10, opacity: 0.6, fontWeight: 700, marginBottom: 2 }}>{data[hovered].month} REPORT</div>
            <div style={{ fontWeight: 800, fontSize: 13 }}>{data[hovered].total} Brokers</div>
            <div style={{ color: '#10b981', fontWeight: 700, fontSize: 11 }}>{data[hovered].growth} Growth</div>
          </motion.div>
        )}
      </div>

      <div style={{ padding: '0 24px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Total Portfolio Value</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            <Counter value={482} prefix="₹" suffix="Cr+" />
          </div>
        </div>
      </div>

      <motion.div className="floating-badge animate-float" style={{ top: 20, right: -40 }}>
        <div className="floating-badge-icon" style={{ background: 'rgba(5,150,105,0.1)', color: '#059669' }}>
          <CheckCircle2 size={20} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700 }}>VERIFIED</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>2,500+ Brokers</div>
        </div>
      </motion.div>

      <motion.div className="floating-badge animate-float-delayed" style={{ bottom: 240, left: -48 }}>
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
        <CityBlueprint />
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
              { value: 2500, label: 'Active Brokers', suffix: '+' },
              { value: 482, label: 'Assets Managed', prefix: '₹', suffix: 'Cr' },
              { value: 150, label: 'Cities Covered', suffix: '+' },
            ].map((s, i) => (
              <div key={i}>
                <div className="hero-stat-value">
                  <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} />
                </div>
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
          <HeroGraph />
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
    <section id="contact" className="section" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', color: 'var(--text)', borderTop: '1px solid var(--border-light)' }}>
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
          <motion.p variants={fadeUp} style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Register today and become part of India's most trusted broker network. It takes less than 2 minutes.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link to="/register" className="btn btn-primary btn-lg">
              Register as Broker <ArrowRight size={18} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
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
