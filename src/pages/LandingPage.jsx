import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, animate } from 'framer-motion';
import {
  Building2, ChevronRight, Shield, Globe, MapPin,
  ArrowRight, CheckCircle2,
  Phone, Star, Briefcase, BarChart3, Search, ArrowDown,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { API_URL } from '../config';
import CitiesShowcase from '../components/CitiesShowcase';
import RegisterForm from '../components/RegisterForm';

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
    { month: 'Oct', value: 12, total: 1150, growth: '+10%' },
    { month: 'Nov', value: 24, total: 1420, growth: '+23%' },
    { month: 'Dec', value: 20, total: 1650, growth: '+16%' },
    { month: 'Jan', value: 48, total: 1980, growth: '+20%' },
    { month: 'Feb', value: 75, total: 2350, growth: '+18%' },
    { month: 'Mar', value: 96, total: 2600, growth: '+11%' }
  ];

  const [hovered, setHovered] = useState(null);
  const width = 360;
  const height = 180;
  const paddingY = 40;

  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - (d.value / 100) * (height - paddingY * 2) - paddingY
  }));

  const drawPath = points.reduce((acc, p, i, a) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const prev = a[i - 1];
    const cp1x = prev.x + (p.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (p.x - prev.x) / 2;
    const cp2y = p.y;
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p.x},${p.y}`;
  }, '');

  return (
    <div className="building-card no-padding" style={{ overflow: 'visible' }}>
      <div style={{ padding: '32px 32px 0' }}>
        <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
          <span>MARKET GROWTH</span>
          <span style={{ color: '#059669' }}><Counter value={88} suffix="%" /></span>
        </div>
      </div>

      <div style={{ position: 'relative', height: 240, marginTop: 20, width: '100%' }}>
        <svg 
          width="100%" height="100%" 
          viewBox={`0 0 ${width} ${height}`} 
          style={{ overflow: 'visible', display: 'block' }}
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(59,130,246,0.3)" />
              <stop offset="100%" stopColor="rgba(59,130,246,0)" />
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
            <g key={i} onMouseEnter={() => setHovered(i)}>
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
              transform: hovered === 0 ? 'translateX(0)' : hovered === data.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)',
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

      <motion.div className="floating-badge animate-float" style={{ top: -20, right: -30, background: '#ffffff', padding: '16px 20px', borderRadius: '16px', boxShadow: '0 12px 32px rgba(0,0,0,0.08)', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ background: '#f0fdf4', color: '#16a34a', padding: 10, borderRadius: '50%' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 2 }}>VERIFIED BROKERS</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>2,600+ Active</div>
          </div>
        </div>
      </motion.div>

      <motion.div className="floating-badge animate-float-delayed" style={{ top: 10, left: -50, background: '#ffffff', padding: '16px 20px', borderRadius: '16px', boxShadow: '0 12px 32px rgba(0,0,0,0.08)', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ background: '#eff6ff', color: '#2563eb', padding: 10, borderRadius: '50%' }}>
            <MapPin size={24} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 2 }}>MARKET COVERAGE</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>150+ Cities</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Hero() {
  const [stats, setStats] = useState({ activeBrokers: 0, assetsManagedCr: 0, citiesCovered: 0 });

  useEffect(() => {
    fetch(`${API_URL}/api/stats`)
      .then((r) => r.json())
      .then((data) => {
        setStats({
          activeBrokers: Number(data.activeBrokers) || 0,
          assetsManagedCr: Number(data.assetsManagedCr) || 0,
          citiesCovered: Number(data.citiesCovered) || 0,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <section className="hero">
      <div className="hero-bg">
        <div className="hero-bg-overlay" />
      </div>
      <div className="hero-grid-pattern" />
      <div className="container hero-content">
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} custom={0}>
            <span className="hero-badge">
              <Shield size={14} /> India's Premier Real Estate Network
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="hero-title">
            Empowering Brokers. Connecting <span className="text-gradient">Investors.</span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="hero-subtitle">
            Whether you are a <strong>Broker</strong> looking to scale your verified network, or an <strong>Investor</strong> seeking premium property assets, BrokrsHouse brings the best opportunities directly to you.
          </motion.p>
          <motion.div variants={fadeUp} custom={3} className="hero-actions">
            <a href="#contact" className="btn btn-primary btn-lg">
              Start Registration <ChevronRight size={18} />
            </a>
            <a href="#features" className="btn btn-outline btn-lg">
              Explore Platform
            </a>
          </motion.div>
          <motion.div variants={fadeUp} custom={4} className="hero-stats">
            {[
              { value: stats.activeBrokers, label: 'Active Brokers', suffix: '+' },
              { value: stats.assetsManagedCr, label: 'Assets Managed', prefix: '₹', suffix: 'Cr' },
              { value: stats.citiesCovered, label: 'Cities Covered', suffix: '+' },
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
    { icon: <Building2 size={24} />, color: 'blue', title: 'Residential Assets', desc: 'Premium B2C apartments, luxury villas, gated communities, and high-rise developments across metro regions.' },
    { icon: <Globe size={24} />, color: 'gold', title: 'Commercial Properties', desc: 'Class-A office spaces, retail outlets, warehouses, and industrial complexes for B2B enterprise clients.' },
    { icon: <MapPin size={24} />, color: 'green', title: 'Land & Development', desc: 'Strategic plots, township projects, and upcoming infrastructure corridors for long-term investments.' },
    { icon: <Briefcase size={24} />, color: 'blue', title: 'Portfolio Management', desc: 'Advanced B2B tools to manage and showcase your property listings to verified institutional buyers.' },
    { icon: <BarChart3 size={24} />, color: 'gold', title: 'Market Intelligence', desc: 'Real-time data analytics, pricing trends, and comparative market analysis for better decisions.' },
    { icon: <Star size={24} />, color: 'green', title: 'Premium Branding', desc: 'Get featured on our platform with a verified broker badge and enhanced profile visibility for B2C clients.' },
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
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCities = async () => {
    try {
      const citiesData = await fetch(`${API_URL}/api/cities`).then((res) => res.json());
      setCities((citiesData || []).filter((c) => c.is_active !== false));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
    const interval = setInterval(fetchCities, 5000);
    const onFocus = () => fetchCities();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  return (
    <section id="network" className="section" style={{ background: 'var(--bg)', position: 'relative' }}>
      <div className="container">
        <motion.div
          className="text-center"
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div variants={fadeUp}><span className="section-badge">Active Areas</span></motion.div>
          <motion.h2 variants={fadeUp} className="section-title">Where We Operate</motion.h2>
          <motion.p variants={fadeUp} className="section-desc centered">
            Our established network covers top real estate hubs, managed by our dedicated team to ensure quality connections.
          </motion.p>
        </motion.div>

        <motion.div
          style={{ marginTop: 44, display: 'flex', justifyContent: 'center' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <CitiesShowcase cities={cities} loading={loading} />
        </motion.div>
      </div>
    </section>
  );
}

function ProcessSteps() {
  const steps = [
    { title: 'Visit Platform', desc: 'Enter our website to start your journey.', icon: <Globe size={28} /> },
    { title: 'Explore', desc: 'Discover premium B2B properties and B2C broker networks.', icon: <Search size={28} /> },
    { title: 'Register', desc: 'Sign up quickly into our specialized platform.', icon: <CheckCircle2 size={28} /> },
    { title: 'Get Contacted', desc: 'Our dedicated support team will reach out to onboard you.', icon: <Phone size={28} /> }
  ];

  return (
    <section id="process" className="section" style={{ background: '#f8fafc', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
      <div className="container">
        <motion.div className="text-center" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger}>
          <motion.div variants={fadeUp}><span className="section-badge">How It Works</span></motion.div>
          <motion.h2 variants={fadeUp} className="section-title">The BrokrsHouse Process</motion.h2>
          <motion.p variants={fadeUp} className="section-desc centered">Follow our simple 4-step process to join the fastest growing real estate network in India.</motion.p>
        </motion.div>

        <motion.div
          className="grid grid-4 gap-6"
          style={{ marginTop: 60 }}
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={stagger}
        >
          {steps.map((s, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i}
              className="card text-center hover-lift"
              style={{ position: 'relative', overflow: 'hidden', padding: '32px 16px', background: '#fff', borderRadius: 16, border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', transition: 'all 0.3s ease' }}
            >
              <div style={{ background: 'var(--primary-soft)', color: 'var(--primary)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                {s.icon}
              </div>
              <h4 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>{`Step ${i + 1}: ${s.title}`}</h4>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1 }}
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          style={{ display: 'flex', justifyContent: 'center', marginTop: 50, marginBottom: -30, position: 'relative', zIndex: 10 }}
        >
          <div style={{ background: '#fff', padding: 12, borderRadius: '50%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <ArrowDown size={32} color="var(--primary)" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section id="contact" className="section" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', color: 'var(--text)', borderTop: '1px solid var(--border-light)' }}>
      <div className="container">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2
            variants={fadeUp}
            style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, marginBottom: 18, lineHeight: 1.15, textAlign: 'center' }}
          >
            Ready to Grow Your<br />Real Estate Business?
          </motion.h2>
          <motion.p variants={fadeUp} style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 700, margin: '0 auto 34px', lineHeight: 1.7, textAlign: 'center' }}>
            Register today and become part of India's most trusted broker network. It takes less than 2 minutes.
          </motion.p>
          <motion.div variants={fadeUp} style={{ marginTop: 10 }}>
            <div style={{ maxWidth: 720, margin: '0 auto' }}>
              <RegisterForm variant="cta" />
            </div>
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
      <ProcessSteps />
      <CTASection />
      <Footer />
    </>
  );
}
