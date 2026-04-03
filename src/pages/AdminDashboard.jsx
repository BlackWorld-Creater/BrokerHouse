import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Users, MapPin, Phone, LogOut, Trash2,
  RefreshCw, Calendar, Search, Download, Eye, EyeOff, ArrowLeft, Edit2,
  AlertTriangle
} from 'lucide-react';
import { API_URL } from '../config';

/* ─── Confirm Dialog Component ─── */
function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-dialog-header">
          <div className="confirm-dialog-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="confirm-dialog-text">
            <div className="confirm-dialog-title">{title}</div>
            <div className="confirm-dialog-message">{message}</div>
          </div>
        </div>
        <div className="confirm-dialog-actions">
          <button className="btn btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn btn-confirm-danger" onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('brokers');
  const [brokers, setBrokers] = useState([]);
  const [statesData, setStatesData] = useState([]);
  const [citiesData, setCitiesData] = useState([]);
  const [newStateName, setNewStateName] = useState('');
  const [newCityNames, setNewCityNames] = useState({});
  const [editingStateId, setEditingStateId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const navigate = useNavigate();

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: null });

  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    if (!token) {
      navigate('/admin');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchBrokers(), fetchAdminStates(), fetchAdminCities()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrokers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/brokers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/admin');
        return;
      }
      const data = await res.json();
      setBrokers(data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const fetchAdminStates = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/states`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setStatesData(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchAdminCities = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/cities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setCitiesData(await res.json());
    } catch (err) { console.error(err); }
  };

  /* ─── Optimistic CRUD ─── */

  const addState = async (e) => {
    e.preventDefault();
    const name = newStateName.trim();
    if (!name) return;

    // Optimistic: add temp state immediately
    const tempId = `temp-${Date.now()}`;
    const tempState = { id: tempId, name, is_active: 1 };
    setStatesData(prev => [...prev, tempState]);
    setNewStateName('');

    try {
      const res = await fetch(`${API_URL}/api/admin/states`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        const created = await res.json();
        // Replace temp with real data
        setStatesData(prev => prev.map(s => s.id === tempId ? { ...s, id: created.id ?? created.insertId ?? tempId, ...created } : s));
        // Refetch to ensure consistency
        fetchAdminStates();
      } else {
        // Rollback
        setStatesData(prev => prev.filter(s => s.id !== tempId));
      }
    } catch (err) {
      console.error(err);
      setStatesData(prev => prev.filter(s => s.id !== tempId));
    }
  };

  const addCity = async (e, stateId) => {
    e.preventDefault();
    const cityName = newCityNames[stateId]?.trim();
    if (!cityName) return;

    // Optimistic
    const tempId = `temp-${Date.now()}`;
    const tempCity = { id: tempId, name: cityName, state_id: stateId, is_active: 1 };
    setCitiesData(prev => [...prev, tempCity]);
    setNewCityNames(prev => ({ ...prev, [stateId]: '' }));

    try {
      const res = await fetch(`${API_URL}/api/admin/cities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: cityName, state_id: stateId })
      });
      if (res.ok) {
        const created = await res.json();
        setCitiesData(prev => prev.map(c => c.id === tempId ? { ...c, id: created.id ?? created.insertId ?? tempId, ...created } : c));
        fetchAdminCities();
      } else {
        setCitiesData(prev => prev.filter(c => c.id !== tempId));
      }
    } catch (err) {
      console.error(err);
      setCitiesData(prev => prev.filter(c => c.id !== tempId));
    }
  };

  const toggleState = async (id) => {
    // Optimistic toggle
    setStatesData(prev => prev.map(s => s.id === id ? { ...s, is_active: s.is_active ? 0 : 1 } : s));

    try {
      const res = await fetch(`${API_URL}/api/admin/states/${id}/toggle`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        // Rollback
        setStatesData(prev => prev.map(s => s.id === id ? { ...s, is_active: s.is_active ? 0 : 1 } : s));
      }
    } catch (err) {
      console.error(err);
      setStatesData(prev => prev.map(s => s.id === id ? { ...s, is_active: s.is_active ? 0 : 1 } : s));
    }
  };

  const saveStateName = async (id) => {
    const trimmed = editingName.trim();
    if (!trimmed) return;

    const oldName = statesData.find(s => s.id === id)?.name;
    // Optimistic
    setStatesData(prev => prev.map(s => s.id === id ? { ...s, name: trimmed } : s));
    setEditingStateId(null);

    try {
      const res = await fetch(`${API_URL}/api/admin/states/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: trimmed })
      });
      if (!res.ok) {
        setStatesData(prev => prev.map(s => s.id === id ? { ...s, name: oldName } : s));
      }
    } catch (err) {
      console.error(err);
      setStatesData(prev => prev.map(s => s.id === id ? { ...s, name: oldName } : s));
    }
  };

  const openDeleteStateDialog = (state) => {
    const stateCities = citiesData.filter(c => c.state_id === state.id);
    const cityCount = stateCities.length;
    setConfirmDialog({
      open: true,
      title: `Delete "${state.name}"?`,
      message: cityCount > 0
        ? `This will permanently delete the state "${state.name}" and all ${cityCount} ${cityCount === 1 ? 'city' : 'cities'} under it. This action cannot be undone.`
        : `This will permanently delete the state "${state.name}". This action cannot be undone.`,
      onConfirm: () => {
        setConfirmDialog({ open: false });
        deleteState(state.id);
      }
    });
  };

  const deleteState = async (id) => {
    // Optimistic
    const removedState = statesData.find(s => s.id === id);
    const removedCities = citiesData.filter(c => c.state_id === id);
    setStatesData(prev => prev.filter(s => s.id !== id));
    setCitiesData(prev => prev.filter(c => c.state_id !== id));

    try {
      const res = await fetch(`${API_URL}/api/admin/states/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        // Rollback
        setStatesData(prev => [...prev, removedState]);
        setCitiesData(prev => [...prev, ...removedCities]);
      }
    } catch (err) {
      console.error(err);
      setStatesData(prev => [...prev, removedState]);
      setCitiesData(prev => [...prev, ...removedCities]);
    }
  };

  const toggleCity = async (id) => {
    // Optimistic
    setCitiesData(prev => prev.map(c => c.id === id ? { ...c, is_active: c.is_active ? 0 : 1 } : c));

    try {
      const res = await fetch(`${API_URL}/api/admin/cities/${id}/toggle`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        setCitiesData(prev => prev.map(c => c.id === id ? { ...c, is_active: c.is_active ? 0 : 1 } : c));
      }
    } catch (err) {
      console.error(err);
      setCitiesData(prev => prev.map(c => c.id === id ? { ...c, is_active: c.is_active ? 0 : 1 } : c));
    }
  };

  const openDeleteCityDialog = (city) => {
    setConfirmDialog({
      open: true,
      title: `Delete "${city.name}"?`,
      message: `This will permanently remove the city "${city.name}" from the platform. This action cannot be undone.`,
      onConfirm: () => {
        setConfirmDialog({ open: false });
        deleteCity(city.id);
      }
    });
  };

  const deleteCity = async (id) => {
    // Optimistic
    const removedCity = citiesData.find(c => c.id === id);
    setCitiesData(prev => prev.filter(c => c.id !== id));

    try {
      const res = await fetch(`${API_URL}/api/admin/cities/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        setCitiesData(prev => [...prev, removedCity]);
      }
    } catch (err) {
      console.error('Delete error:', err);
      setCitiesData(prev => [...prev, removedCity]);
    }
  };

  const openDeleteBrokerDialog = (broker) => {
    setConfirmDialog({
      open: true,
      title: `Delete broker "${broker.name}"?`,
      message: `This will permanently remove ${broker.name}${broker.firm_name ? ` (${broker.firm_name})` : ''} from the platform. This action cannot be undone.`,
      onConfirm: () => {
        setConfirmDialog({ open: false });
        deleteBroker(broker.id);
      }
    });
  };

  const deleteBroker = async (id) => {
    // Optimistic
    const removedBroker = brokers.find(b => b.id === id);
    setBrokers(prev => prev.filter(b => b.id !== id));

    try {
      const res = await fetch(`${API_URL}/api/admin/brokers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        setBrokers(prev => [...prev, removedBroker]);
      }
    } catch (err) {
      console.error('Delete error:', err);
      setBrokers(prev => [...prev, removedBroker]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin');
  };

  const filtered = brokers.filter(b => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      b.name?.toLowerCase().includes(searchLower) ||
      b.firm_name?.toLowerCase().includes(searchLower) ||
      b.broker_location?.toLowerCase().includes(searchLower) ||
      b.mobile?.includes(search);
    
    const matchesCity = filterCity === '' || b.broker_location === filterCity;
    
    return matchesSearch && matchesCity;
  });

  const cities = [...new Set(brokers.map(b => b.broker_location))].sort();

  const uniqueCities = [...new Set(brokers.map(b => b.broker_location))].length;

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="admin-dashboard">
      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ open: false })}
      />

      {/* Header */}
      <header className="admin-header">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 size={24} color="var(--primary)" />
            <span style={{ fontSize: 18, fontWeight: 800 }}>BrokrsHouse <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: 14 }}>Admin</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="btn btn-outline btn-sm" style={{ borderColor: 'transparent' }}>
              <ArrowLeft size={15} /> Back to Site
            </Link>
            <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />
            <button onClick={fetchData} className="btn btn-outline btn-sm" title="Refresh">
              <RefreshCw size={15} /> Refresh
            </button>
            <button onClick={handleLogout} className="btn btn-sm" style={{ background: 'var(--danger-soft)', color: 'var(--danger)', border: 'none' }}>
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        {/* Page Title & Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}
        >
          <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Dashboard</h1>
              <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>
                Manage brokers and platform data from one place.
              </p>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-lg" style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 4 }}>
              <button 
                className={`btn btn-sm ${activeTab === 'brokers' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveTab('brokers')}
                style={{ border: 'none' }}
              >
                <Users size={16} /> Brokers
              </button>
              <button 
                className={`btn btn-sm ${activeTab === 'cities' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setActiveTab('cities')}
                style={{ border: 'none' }}
              >
                <MapPin size={16} /> Cities
              </button>
            </div>
          </div>
        </motion.div>

        {activeTab === 'brokers' && (
        <>
        {/* Stats */}
        <motion.div
          className="admin-stats-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
              <Users size={22} />
            </div>
            <div className="admin-stat-value">{brokers.length}</div>
            <div className="admin-stat-label">Total Brokers</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
              <MapPin size={22} />
            </div>
            <div className="admin-stat-value">{uniqueCities}</div>
            <div className="admin-stat-label">Cities Covered</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: 'var(--gold-soft)', color: 'var(--gold)' }}>
              <Phone size={22} />
            </div>
            <div className="admin-stat-value">{brokers.length}</div>
            <div className="admin-stat-label">Active Contacts</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-icon" style={{ background: 'rgba(168,85,247,0.08)', color: '#8b5cf6' }}>
              <Calendar size={22} />
            </div>
            <div className="admin-stat-value">
              {brokers.length > 0 ? formatDate(brokers[0]?.created_at) : '—'}
            </div>
            <div className="admin-stat-label">Latest Registration</div>
          </div>
        </motion.div>

        {/* Search & Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Registered Brokers</h3>
            <div className="flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
              <select 
                className="form-input" 
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                style={{ width: 180, fontSize: 13, padding: '10px 14px' }}
              >
                <option value="">All Locations</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <div className="form-input-icon" style={{ width: 280 }}>
                <Search size={16} />
                <input
                  className="form-input"
                  placeholder="Search by name or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ fontSize: 13, padding: '10px 14px 10px 42px' }}
                />
              </div>
            </div>
          </div>

          <div className="data-table-container">
            {loading ? (
              <div className="empty-state">
                <div className="spinner dark" style={{ width: 32, height: 32 }} />
                <p style={{ marginTop: 16 }}>Loading broker data...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <Users size={48} />
                <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No brokers found</p>
                <p style={{ fontSize: 14 }}>
                  {search ? 'Try a different search term.' : 'Registrations will appear here.'}
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Broker Name</th>
                      <th>Firm Name</th>
                      <th>Mobile</th>
                      <th>WhatsApp</th>
                      <th>Location</th>
                      <th>Covering Areas</th>
                      <th>Registered On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((b, i) => (
                      <tr key={b.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{i + 1}</td>
                        <td className="name-cell">{b.name}</td>
                        <td style={{ fontSize: 13, fontWeight: 500 }}>{b.firm_name || '—'}</td>
                        <td>
                          <a href={`tel:${b.mobile}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                            {b.mobile}
                          </a>
                        </td>
                        <td>
                          <a 
                            href={`https://wa.me/91${b.whatsapp?.replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: '#25D366', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            {b.whatsapp}
                          </a>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <MapPin size={13} color="var(--text-muted)" />
                            {b.broker_location}
                          </div>
                        </td>
                        <td style={{ maxWidth: 300 }}>
                          <div className="flex flex-wrap gap-1">
                            {(() => {
                              try {
                                const areas = JSON.parse(b.covering_location);
                                return Array.isArray(areas) ? areas.map((area, idx) => (
                                  <span key={idx} style={{ 
                                    fontSize: 10, background: 'var(--primary-soft)', 
                                    color: 'var(--primary)', padding: '2px 6px', 
                                    borderRadius: 4, fontWeight: 600 
                                  }}>
                                    {area}
                                  </span>
                                )) : b.covering_location;
                              } catch (e) {
                                return b.covering_location;
                              }
                            })()}
                          </div>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(b.created_at)}</td>
                        <td>
                          <button
                            onClick={() => openDeleteBrokerDialog(b)}
                            className="btn btn-sm btn-danger"
                            style={{ padding: '6px 12px' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
        </>
        )}

        {activeTab === 'cities' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="data-table-container" style={{ padding: 24 }}>
              <div className="flex justify-between items-center" style={{ marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h3 style={{ fontSize: 24, fontWeight: 800 }}>Manage Locations</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Add regions and cities to the network</p>
                </div>
                <form onSubmit={addState} className="flex gap-2">
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="New State (e.g. Punjab)" 
                    value={newStateName}
                    onChange={(e) => setNewStateName(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary">Add State</button>
                </form>
              </div>

              {statesData.length === 0 ? (
                <div className="empty-state">
                  <MapPin size={48} />
                  <p>No regions added yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  {statesData.map(state => {
                    const stateCities = citiesData.filter(c => c.state_id === state.id);
                    return (
                      <div key={state.id} className="state-card" style={{ background: 'var(--bg-pure)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                        <div className="state-header" style={{ padding: '20px 24px', background: 'var(--bg-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                          <div className="flex items-center gap-3">
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                              {state.name.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              {editingStateId === state.id ? (
                                <div className="flex items-center gap-2">
                                  <input 
                                    className="form-input" 
                                    style={{ height: 32, fontSize: 13, width: 220 }}
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') saveStateName(state.id);
                                      if (e.key === 'Escape') setEditingStateId(null);
                                    }}
                                  />
                                  <button onClick={() => saveStateName(state.id)} className="btn btn-sm btn-primary" style={{ padding: '0 8px', height: 32 }}>Save</button>
                                  <button onClick={() => setEditingStateId(null)} className="btn btn-sm btn-outline" style={{ padding: '0 8px', height: 32 }}>Cancel</button>
                                </div>
                              ) : (
                                <>
                                  <div className="flex items-center gap-2">
                                    <h4 style={{ fontSize: 16, fontWeight: 700 }}>{state.name}</h4>
                                    <button 
                                      onClick={() => { setEditingStateId(state.id); setEditingName(state.name); }} 
                                      className="btn btn-ghost btn-sm" 
                                      style={{ padding: 4, color: 'var(--text-muted)' }}
                                      title="Rename State"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                  </div>
                                  <span style={{ fontSize: 12, color: state.is_active ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                                    {state.is_active ? 'Active Region' : 'Hidden'}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <form onSubmit={(e) => addCity(e, state.id)} className="flex gap-2 mr-4">
                              <input 
                                type="text" 
                                className="form-input" 
                                style={{ height: 36, fontSize: 13, width: 180 }}
                                placeholder="Add City (e.g. Ludhiana)" 
                                value={newCityNames[state.id] || ''}
                                onChange={(e) => setNewCityNames(prev => ({ ...prev, [state.id]: e.target.value }))}
                                required
                              />
                              <button type="submit" className="btn btn-primary btn-sm" style={{ height: 36 }}>Add</button>
                            </form>
                            <button onClick={() => toggleState(state.id)} className="btn btn-sm btn-outline" style={{ height: 36 }}>
                              {state.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                            <button onClick={() => openDeleteStateDialog(state)} className="btn btn-sm btn-outline" style={{ height: 36, color: 'var(--danger)' }}>
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                        <div className="state-cities" style={{ padding: 20 }}>
                          {stateCities.length === 0 ? (
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', padding: 20 }}>No cities added to this region yet.</p>
                          ) : (
                            <div className="grid grid-3 gap-3">
                              {stateCities.map(city => (
                                <div key={city.id} className="flex items-center justify-between" style={{ padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)', background: city.is_active ? 'transparent' : 'var(--bg-soft)', opacity: city.is_active ? 1 : 0.7 }}>
                                  <div className="flex items-center gap-3">
                                    <MapPin size={16} color={city.is_active ? 'var(--primary)' : 'var(--text-muted)'} />
                                    <span style={{ fontSize: 14, fontWeight: 500 }}>{city.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => toggleCity(city.id)} className="btn btn-sm" style={{ padding: 4, background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}>
                                      {city.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                    <button onClick={() => openDeleteCityDialog(city)} className="btn btn-sm" style={{ padding: 4, background: 'transparent', border: 'none', color: 'var(--danger)' }}>
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
