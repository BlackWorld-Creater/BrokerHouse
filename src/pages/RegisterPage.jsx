import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Phone, MessageSquare, MapPin, ArrowRight,
  CheckCircle2, ArrowLeft, Shield, Globe, Users
} from 'lucide-react';
import { API_URL } from '../config';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }
  })
};

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '', mobile: '', whatsapp: '',
    broker_location: '', state: '', covering_location: ''
  });
  const [whatsappSame, setWhatsappSame] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMobileChange = (e) => {
    const mobile = e.target.value;
    setFormData(prev => ({ ...prev, mobile, ...(whatsappSame && { whatsapp: mobile }) }));
  };

  const toggleWhatsappSame = () => {
    setWhatsappSame(!whatsappSame);
    if (!whatsappSame) {
      setFormData(prev => ({ ...prev, whatsapp: prev.mobile }));
    } else {
      setFormData(prev => ({ ...prev, whatsapp: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="container" style={{ maxWidth: 1000 }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <Link to="/" className="flex items-center gap-2" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 14 }}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </motion.div>

        <motion.div
          className="register-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Sidebar */}
          <div className="register-sidebar">
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: 32 }}>
                <Building2 size={28} />
                <span style={{ fontSize: 20, fontWeight: 800 }}>BrokrsHouse</span>
              </div>
              <h2>Join India's Premier Broker Network</h2>
              <p>Register today and get instant access to premium listings, verified buyers, and powerful portfolio tools.</p>
              <ul className="register-features">
                {[
                  { icon: <Shield size={16} />, text: 'Verified Professional Badge' },
                  { icon: <Globe size={16} />, text: 'Pan-India Client Visibility' },
                  { icon: <Users size={16} />, text: 'Direct Institutional Access' },
                  { icon: <CheckCircle2 size={16} />, text: 'Free Lifetime Membership' },
                ].map((f, i) => (
                  <li key={i}>
                    <div className="register-features-icon">{f.icon}</div>
                    {f.text}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ fontSize: 12, opacity: 0.5, marginTop: 40 }}>
              By registering, you agree to our Terms of Service and Privacy Policy.
            </div>
          </div>

          {/* Form Area */}
          <div className="register-form-area">
            <AnimatePresence mode="wait">
              {!success ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -30 }}
                >
                  <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Broker Registration</h3>
                  <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 32 }}>
                    Fill in your professional details below to get started.
                  </p>

                  {error && (
                    <div style={{
                      background: 'var(--danger-soft)', color: 'var(--danger)',
                      padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                      fontSize: 14, fontWeight: 600, marginBottom: 20
                    }}>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-6">
                      <div className="grid grid-2 gap-6">
                        <div className="form-group">
                          <label className="form-label">Full Name *</label>
                          <input
                            name="name" required className="form-input"
                            placeholder="Enter your full name"
                            value={formData.name} onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="grid grid-2 gap-6">
                        <div className="form-group">
                          <label className="form-label">State *</label>
                          <div className="form-input-icon">
                            <MapPin size={16} />
                            <input
                              name="state" required className="form-input"
                              placeholder="e.g. Maharashtra"
                              value={formData.state} onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">City / Broker Location *</label>
                          <div className="form-input-icon">
                            <MapPin size={16} />
                            <input
                              name="broker_location" required className="form-input"
                              placeholder="City, Area"
                              value={formData.broker_location} onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-2 gap-6">
                        <div className="form-group">
                          <label className="form-label">Mobile Number *</label>
                          <div className="form-input-icon">
                            <Phone size={16} />
                            <input
                              name="mobile" required className="form-input"
                              placeholder="+91 98765 43210"
                              value={formData.mobile} onChange={handleMobileChange}
                            />
                          </div>
                        </div>
                        
                        {!whatsappSame && (
                          <div className="form-group">
                            <label className="form-label">WhatsApp Number *</label>
                            <div className="form-input-icon">
                              <MessageSquare size={16} />
                              <input
                                name="whatsapp" required className="form-input"
                                placeholder="+91 98765 43210"
                                value={formData.whatsapp} onChange={handleChange}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="form-group" style={{ marginTop: -16, marginBottom: 8 }}>
                        <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                          <input type="checkbox" checked={whatsappSame} onChange={toggleWhatsappSame} style={{ accentColor: 'var(--primary)', width: 14, height: 14 }} />
                          WhatsApp number is same as Mobile
                        </label>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Covering Locations *</label>
                        <div className="form-input-icon">
                          <Globe size={16} />
                          <input
                            name="covering_location" required className="form-input"
                            placeholder="Mumbai, Thane, Navi Mumbai..."
                            value={formData.covering_location} onChange={handleChange}
                          />
                        </div>
                      </div>

                      <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg" style={{ marginTop: 8 }}>
                        {loading ? <><span className="spinner" /> Processing...</> : <>Submit Registration <ArrowRight size={18} /></>}
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="success-card"
                >
                  <div className="success-icon">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Registration Successful!</h3>
                  <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.7 }}>
                    Welcome aboard, <strong>{formData.name}</strong>! Your broker profile has been submitted successfully.
                  </p>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 32 }}>
                    Our team will review your details and contact you within 24 hours.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button onClick={() => { setSuccess(false); setFormData({ name: '', mobile: '', whatsapp: '', broker_location: '', state: '', covering_location: '' }); }} className="btn btn-outline">
                      Register Another
                    </button>
                    <Link to="/" className="btn btn-primary">
                      Back to Home <ArrowRight size={16} />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
