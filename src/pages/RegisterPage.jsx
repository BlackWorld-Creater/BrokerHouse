import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Phone, MessageSquare, MapPin, ArrowRight,
  CheckCircle2, ArrowLeft, Shield, Globe, Users, Plus, X
} from 'lucide-react';
import { API_URL } from '../config';

export default function RegisterPage() {
  const [activeRegions, setActiveRegions] = useState([]);
  const coveringAreasRef = useRef([{ state: '', city: '', cities: [] }]);
  const [formData, setFormData] = useState({
    name: '', firm_name: '', mobile: '', whatsapp: '',
    broker_location: '', state: '',
    registered_as: 'broker',
    assist_manage: '',
  });
  const [coveringAreas, setCoveringAreas] = useState([{ state: '', city: '', cities: [] }]);
  coveringAreasRef.current = coveringAreas;
  const [whatsappSame, setWhatsappSame] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const scrollContainerRef = useRef(null);

  // Auto-scroll to bottom of covering areas when adding new one
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [coveringAreas.length]);

  /** Re-fetch city lists for each row from admin-managed `/api/cities` (stays in sync when admin adds cities). */
  const refreshCityListsForRows = () => {
    const prev = coveringAreasRef.current;
    Promise.all(
      prev.map(async (area) => {
        if (!area.state) return { ...area, cities: [] };
        try {
          const res = await fetch(`${API_URL}/api/cities?state_id=${area.state}`);
          const data = await res.json();
          return { ...area, cities: Array.isArray(data) ? data : [] };
        } catch {
          return area;
        }
      })
    ).then((next) => setCoveringAreas(next));
  };

  const fetchStates = () => {
    fetch(`${API_URL}/api/states`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setActiveRegions(data);
          refreshCityListsForRows();
        }
      })
      .catch((err) => console.error('Error fetching states:', err));
  };

  useEffect(() => {
    fetchStates();

    const interval = setInterval(fetchStates, 15000);

    const onFocus = () => fetchStates();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'state') setFormData(prev => ({ ...prev, broker_location: '' }));
  };

  const handleMobileChange = (e) => {
    const mobile = e.target.value;
    setFormData(prev => ({ ...prev, mobile, ...(whatsappSame && { whatsapp: mobile }) }));
  };

  const toggleWhatsappSame = () => {
    const newVal = !whatsappSame;
    setWhatsappSame(newVal);
    if (newVal) {
      setFormData(prev => ({ ...prev, whatsapp: prev.mobile }));
    } else {
      setFormData(prev => ({ ...prev, whatsapp: '' }));
    }
  };

  // Covering Areas Logic
  const addCoveringArea = () => {
    setCoveringAreas([...coveringAreas, { state: '', city: '', cities: [] }]);
  };

  const removeCoveringArea = (index) => {
    setCoveringAreas(coveringAreas.filter((_, i) => i !== index));
  };

  const updateCoveringArea = async (index, field, value) => {
    const updated = [...coveringAreas];
    updated[index][field] = value;

    if (field === 'state') {
      updated[index].city = '';
      if (value) {
        try {
          const res = await fetch(`${API_URL}/api/cities?state_id=${value}`);
          const data = await res.json();
          if (Array.isArray(data)) updated[index].cities = data;
        } catch (err) {
          console.error('Error fetching cities:', err);
        }
      } else {
        updated[index].cities = [];
      }
    }
    setCoveringAreas(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.registered_as) {
      setError('Please select how you are registering');
      return;
    }
    if (!formData.assist_manage || !['yes', 'no'].includes(formData.assist_manage)) {
      setError('Please select an Assist management option');
      return;
    }
    if (!formData.broker_location) {
      setError('Please Enter your location');
      return;
    }
    
    // Validate covering areas
    const validCovering = coveringAreas.filter(a => a.state && a.city);
    if (validCovering.length === 0) {
      setError('Please add at least one covering location');
      return;
    }

    setError('');
    setLoading(true);
    
    const submissionData = {
      ...formData,
      state: formData.state || '',
      registered_as: formData.registered_as,
      assist_manage: formData.assist_manage,
      covering_location: JSON.stringify(validCovering.map(a => {
        const stateName = activeRegions.find(r => r.id.toString() === a.state)?.name || a.state;
        return `${a.city}, ${stateName}`;
      }))
    };

    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
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
            <div className="sidebar-content">
              <div className="flex items-center gap-2" style={{ marginBottom: 32 }}>
                <Building2 size={28} />
                <span style={{ fontSize: 20, fontWeight: 800 }}>BrokrsHouse</span>
              </div>
              <h2>Join India's Premier Broker Network</h2>
              <p>Register today and get instant access to premium listings and verified buyers.</p>
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
            <div className="sidebar-footer" style={{ fontSize: 12, opacity: 0.5 }}>
              By registering, you agree to our Terms of Service and Privacy Policy.
            </div>
          </div>

          {/* Form Area */}
          <div className="register-form-area">
            <AnimatePresence mode="wait">
              {!success ? (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -30 }}>
                  <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Broker Registration</h3>
                  <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 32 }}>Professional details below.</p>

                  {error && (
                    <div style={{ background: 'var(--danger-soft)', color: 'var(--danger)', padding: '12px 16px', borderRadius: '8px', fontSize: 14, fontWeight: 600, marginBottom: 20 }}>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-6">
                      <div className="grid grid-2 gap-6">
                        <div className="form-group">
                          <label className="form-label">Registered as *</label>
                          <select
                            name="registered_as"
                            required
                            className="form-input"
                            value={formData.registered_as}
                            onChange={handleChange}
                          >
                            <option value="broker">Broker</option>
                            <option value="individual">Individual</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Assist management *</label>
                          <select
                            name="assist_manage"
                            required
                            className="form-input"
                            value={formData.assist_manage}
                            onChange={handleChange}
                          >
                            <option value="">Select…</option>
                            <option value="no">No assistance needed</option>
                            <option value="yes">Yes — I want assistance</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-2 gap-6">
                        <div className="form-group">
                          <label className="form-label">Full Name *</label>
                          <input name="name" required className="form-input" placeholder="Broker Full Name" value={formData.name} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Firm Name (Optional)</label>
                          <input name="firm_name" className="form-input" placeholder="Real Estate Agency Name" value={formData.firm_name} onChange={handleChange} />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Broker Location *</label>
                        <div className="form-input-icon">
                          <MapPin size={16} />
                          <input 
                            name="broker_location" 
                            required 
                            className="form-input" 
                            placeholder="E.g. Noida Extension, Greater Noida West or Gurgaon Sector 54"
                            value={formData.broker_location} 
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="grid grid-2 gap-6">
                        <div className="form-group">
                          <label className="form-label">Mobile Number *</label>
                          <div className="form-input-icon">
                            <Phone size={16} />
                            <input name="mobile" required className="form-input" placeholder="+91 98765 43210" value={formData.mobile} onChange={handleMobileChange} />
                          </div>
                        </div>
                        {!whatsappSame && (
                          <div className="form-group">
                            <label className="form-label">WhatsApp Number *</label>
                            <div className="form-input-icon">
                              <MessageSquare size={16} />
                              <input name="whatsapp" required className="form-input" placeholder="+91 98765 43210" value={formData.whatsapp} onChange={handleChange} />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="form-group" style={{ marginTop: -16 }}>
                        <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                          <input type="checkbox" checked={whatsappSame} onChange={toggleWhatsappSame} style={{ accentColor: 'var(--primary)', width: 14, height: 14 }} />
                          WhatsApp number is same as Mobile
                        </label>
                      </div>

                      {/* MULTI-LOCATION COVERING AREAS */}
                      <div className="form-group">
                        <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          Covering Locations *
                          <button type="button" onClick={addCoveringArea} className="btn btn-sm btn-ghost" style={{ padding: 0, color: 'var(--primary)', fontSize: 12 }}>
                            <Plus size={14} /> Add More
                          </button>
                        </label>
                        <div ref={scrollContainerRef} className="flex flex-col gap-3 custom-scrollbar" style={{ maxHeight: '110px', overflowY: 'auto', paddingRight: '8px', marginBottom: '8px' }}>
                          {coveringAreas.map((area, index) => (
                            <div key={index} className="flex gap-2 items-start">
                              <select 
                                className="form-input" style={{ flex: 1, padding: '10px 14px', fontSize: 13 }}
                                value={area.state} onChange={(e) => updateCoveringArea(index, 'state', e.target.value)}
                              >
                                <option value="">State</option>
                                {activeRegions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                              </select>
                              <select 
                                className="form-input" style={{ flex: 1, padding: '10px 14px', fontSize: 13 }}
                                value={area.city} onChange={(e) => updateCoveringArea(index, 'city', e.target.value)}
                                disabled={!area.state}
                              >
                                <option value="">{area.state ? 'Select city (from admin list)' : 'Please select state first'}</option>
                                {area.cities.map((city) => (
                                  <option key={city.id ?? city.name} value={city.name}>{city.name}</option>
                                ))}
                              </select>
                              {coveringAreas.length > 1 && (
                                <button type="button" onClick={() => removeCoveringArea(index)} style={{ padding: 12, color: 'var(--danger)' }}>
                                  <X size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg" style={{ marginTop: 8 }}>
                        {loading ? <><span className="spinner" /> Processing...</> : <>Submit Registration <ArrowRight size={18} /></>}
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="success-card">
                  <div className="success-icon"><CheckCircle2 size={40} /></div>
                  <h3 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Registration Successful!</h3>
                  <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 32 }}>Welcome onboard!</p>
                  <div className="flex gap-4 justify-center">
                    <button onClick={() => { setSuccess(false); setFormData({ name: '', firm_name: '', mobile: '', whatsapp: '', broker_location: '', state: '', registered_as: 'broker', assist_manage: '' }); setCoveringAreas([{ state: '', city: '', cities: [] }]); }} className="btn btn-outline">Register Another</button>
                    <Link to="/" className="btn btn-primary">Back to Home <ArrowRight size={16} /></Link>
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
