import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, MessageSquare, Plus, X, CheckCircle2 } from 'lucide-react';
import { API_URL } from '../config';

export default function RegisterForm({ variant = 'page' }) {
  const isCompact = variant === 'cta';

  const [activeRegions, setActiveRegions] = useState([]);
  const coveringAreasRef = useRef([{ state: '', city: '', cities: [] }]);
  const [formData, setFormData] = useState({
    name: '',
    firm_name: '',
    mobile: '',
    whatsapp: '',
    broker_location: '',
    state: '',
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

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [coveringAreas.length]);

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
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'state') setFormData((prev) => ({ ...prev, broker_location: '' }));
  };

  const handleMobileChange = (e) => {
    const mobile = e.target.value;
    setFormData((prev) => ({ ...prev, mobile, ...(whatsappSame && { whatsapp: mobile }) }));
  };

  const toggleWhatsappSame = () => {
    const newVal = !whatsappSame;
    setWhatsappSame(newVal);
    if (newVal) {
      setFormData((prev) => ({ ...prev, whatsapp: prev.mobile }));
    } else {
      setFormData((prev) => ({ ...prev, whatsapp: '' }));
    }
  };

  const addCoveringArea = () => setCoveringAreas([...coveringAreas, { state: '', city: '', cities: [] }]);
  const removeCoveringArea = (index) => setCoveringAreas(coveringAreas.filter((_, i) => i !== index));

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
        } catch {
          // ignore
        }
      } else {
        updated[index].cities = [];
      }
    }
    setCoveringAreas(updated);
  };

  const validCovering = useMemo(() => coveringAreas.filter((a) => a.state && a.city), [coveringAreas]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.registered_as) {
      setError('Please select how you are registering');
      return;
    }
    if (!formData.broker_location) {
      setError('Please Enter your location');
      return;
    }
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
      covering_location: JSON.stringify(
        validCovering.map((a) => {
          const stateName = activeRegions.find((r) => r.id.toString() === a.state)?.name || a.state;
          return `${a.city}, ${stateName}`;
        })
      ),
    };

    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
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

  const resetForm = () => {
    setSuccess(false);
    setFormData({
      name: '',
      firm_name: '',
      mobile: '',
      whatsapp: '',
      broker_location: '',
      state: '',
      registered_as: 'broker',
      assist_manage: '',
    });
    setCoveringAreas([{ state: '', city: '', cities: [] }]);
    setWhatsappSame(false);
    setError('');
  };

  return (
    <AnimatePresence mode="wait">
      {!success ? (
        <motion.div
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, x: -30 }}
          style={isCompact ? { width: '100%', maxWidth: 820, margin: '0 auto', textAlign: 'left' } : undefined}
        >
          {!isCompact && (
            <>
              <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Broker Registration</h3>
              <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 32 }}>Professional details below.</p>
            </>
          )}

          {error && (
            <div
              style={{
                background: 'var(--danger-soft)',
                color: 'var(--danger)',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 20,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
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

              <div className="grid grid-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    name="name"
                    required
                    className="form-input"
                    placeholder="Broker Full Name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Firm Name (Optional)</label>
                  <input
                    name="firm_name"
                    className="form-input"
                    placeholder="Real Estate Agency Name"
                    value={formData.firm_name}
                    onChange={handleChange}
                  />
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

              <div className="form-group">
                <label className="form-label">Assets</label>
                <input
                  name="assist_manage"
                  className="form-input"
                  placeholder="e.g. 5"
                  value={formData.assist_manage}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Mobile Number *</label>
                  <div className="form-input-icon">
                    <Phone size={16} />
                    <input
                      name="mobile"
                      required
                      className="form-input"
                      placeholder="+91 98765 43210"
                      value={formData.mobile}
                      onChange={handleMobileChange}
                    />
                  </div>
                </div>
                {!whatsappSame && (
                  <div className="form-group">
                    <label className="form-label">WhatsApp Number *</label>
                    <div className="form-input-icon">
                      <MessageSquare size={16} />
                      <input
                        name="whatsapp"
                        required
                        className="form-input"
                        placeholder="+91 98765 43210"
                        value={formData.whatsapp}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginTop: -16 }}>
                <label
                  className="flex items-center gap-2"
                  style={{ cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}
                >
                  <input
                    type="checkbox"
                    checked={whatsappSame}
                    onChange={toggleWhatsappSame}
                    style={{ accentColor: 'var(--primary)', width: 14, height: 14 }}
                  />
                  WhatsApp number is same as Mobile
                </label>
              </div>

              <div className="form-group">
                <label
                  className="form-label"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  Covering Locations *
                  <button
                    type="button"
                    onClick={addCoveringArea}
                    className="btn btn-sm btn-ghost"
                    style={{ padding: 0, color: 'var(--primary)', fontSize: 12 }}
                  >
                    <Plus size={14} /> Add More
                  </button>
                </label>

                <div
                  ref={scrollContainerRef}
                  className="flex flex-col gap-3 custom-scrollbar"
                  style={{ maxHeight: '110px', overflowY: 'auto', paddingRight: '8px', marginBottom: '8px' }}
                >
                  {coveringAreas.map((area, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <select
                        className="form-input"
                        style={{ flex: 1, padding: '10px 14px', fontSize: 13 }}
                        value={area.state}
                        onChange={(e) => updateCoveringArea(index, 'state', e.target.value)}
                      >
                        <option value="">State</option>
                        {activeRegions.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>

                      <select
                        className="form-input"
                        style={{ flex: 1, padding: '10px 14px', fontSize: 13 }}
                        value={area.city}
                        onChange={(e) => updateCoveringArea(index, 'city', e.target.value)}
                        disabled={!area.state}
                      >
                        <option value="">{area.state ? 'Select city (from admin list)' : 'Please select state first'}</option>
                        {area.cities.map((city) => (
                          <option key={city.id ?? city.name} value={city.name}>
                            {city.name}
                          </option>
                        ))}
                      </select>

                      {coveringAreas.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCoveringArea(index)}
                          className="btn btn-sm btn-ghost"
                          style={{ padding: '10px 10px' }}
                          aria-label="Remove covering location"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
                style={isCompact ? { width: '100%', justifyContent: 'center' } : undefined}
              >
                {loading ? 'Submitting...' : 'Submit Registration'}
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={isCompact ? { width: '100%', maxWidth: 820, margin: '0 auto' } : undefined}
        >
          <div className="success-card">
            <div className="success-icon"><CheckCircle2 size={40} /></div>
            <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>Registration successful!</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 18 }}>
              Thanks for registering. Our team will contact you shortly.
            </p>
            <button onClick={resetForm} className="btn btn-outline">
              Register Another
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

