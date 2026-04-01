import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2, Users, MapPin, Phone, LogOut, Trash2,
  RefreshCw, Calendar, Search, Download, Eye, EyeOff
} from 'lucide-react';
import { API_URL } from '../config';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('brokers');
  const [brokers, setBrokers] = useState([]);
  const [citiesData, setCitiesData] = useState([]);
  const [newCityName, setNewCityName] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const navigate = useNavigate();

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
      await Promise.all([fetchBrokers(), fetchCities()]);
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

  const fetchCities = async () => {
    try {
      const res = await fetch(`${API_URL}/api/cities`);
      if (res.ok) {
        const data = await res.json();
        setCitiesData(data);
      }
    } catch (err) {
      console.error('Fetch cities error:', err);
    }
  };

  const addCity = async (e) => {
    e.preventDefault();
    if (!newCityName.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/cities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCityName.trim() })
      });
      if (res.ok) {
        setNewCityName('');
        fetchCities();
      } else {
        alert('Failed to add city (might already exist)');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCity = async (id) => {
    if (!window.confirm('Delete this city?')) return;
    try {
      await fetch(`${API_URL}/api/admin/cities/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setCitiesData(citiesData.filter(c => c.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const toggleCity = async (id, isActive) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/cities/${id}/toggle`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setCitiesData(citiesData.map(c => 
          c.id === id ? { ...c, is_active: !isActive } : c
        ));
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const deleteBroker = async (id) => {
    if (!window.confirm('Are you sure you want to delete this broker?')) return;
    try {
      await fetch(`${API_URL}/api/admin/brokers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setBrokers(brokers.filter(b => b.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin');
  };

  const filtered = brokers.filter(b => {
    const matchesSearch = 
      b.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.broker_location?.toLowerCase().includes(search.toLowerCase()) ||
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
      {/* Header */}
      <header className="admin-header">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 size={24} color="var(--primary)" />
            <span style={{ fontSize: 18, fontWeight: 800 }}>BrokrsHouse <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: 14 }}>Admin</span></span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchBrokers} className="btn btn-outline btn-sm" title="Refresh">
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
                      <th>Mobile</th>
                      <th>WhatsApp</th>
                      <th>Location</th>
                      <th>Covering Areas</th>
                      <th>Registered On</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((b, i) => (
                      <tr key={b.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{i + 1}</td>
                        <td className="name-cell">{b.name}</td>
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
                        <td style={{ maxWidth: 200 }}>
                          <span style={{
                            display: '-webkit-box', WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical', overflow: 'hidden'
                          }}>
                            {b.covering_location}
                          </span>
                        </td>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(b.created_at)}</td>
                        <td><span className="table-badge">Active</span></td>
                        <td>
                          <button
                            onClick={() => deleteBroker(b.id)}
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

        {/* CITIES TAB */}
        {activeTab === 'cities' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="data-table-container" style={{ padding: 24 }}>
              <div className="flex justify-between items-center" style={{ marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>Managed Cities</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>These cities appear on the landing page.</p>
                </div>
                <form onSubmit={addCity} className="flex gap-2">
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="E.g. Pune" 
                    value={newCityName}
                    onChange={(e) => setNewCityName(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary">Add City</button>
                </form>
              </div>

              {citiesData.length === 0 ? (
                <div className="empty-state">
                  <MapPin size={48} />
                  <p>No cities added yet.</p>
                </div>
              ) : (
                <div className="grid grid-4 gap-4">
                  {citiesData.map(c => (
                    <div key={c.id} className="card flex justify-between items-center" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div className="flex items-center gap-2">
                        <MapPin size={18} color="var(--primary)" />
                        <span style={{ fontWeight: 600 }}>{c.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, padding: '4px 8px', borderRadius: 12, background: c.is_active !== false ? 'var(--success-soft)' : 'var(--danger-soft)', color: c.is_active !== false ? 'var(--success)' : 'var(--danger)' }}>
                          {c.is_active !== false ? 'Enabled' : 'Disabled'}
                        </div>
                        <button 
                          onClick={() => toggleCity(c.id, c.is_active !== false)}
                          className="btn btn-sm btn-ghost" 
                          style={{ color: 'var(--text-secondary)', padding: 6 }}
                          title={c.is_active !== false ? "Disable" : "Enable"}
                        >
                          {c.is_active !== false ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button 
                          onClick={() => deleteCity(c.id)}
                          className="btn btn-sm btn-ghost" 
                          style={{ color: 'var(--danger)', padding: 6 }}
                          title="Delete City"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
