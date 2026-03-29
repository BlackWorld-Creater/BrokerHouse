import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2, Users, MapPin, Phone, LogOut, Trash2,
  RefreshCw, Calendar, Search, Download
} from 'lucide-react';
import { API_URL } from '../config';

export default function AdminDashboard() {
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    if (!token) {
      navigate('/admin');
      return;
    }
    fetchBrokers();
  }, []);

  const fetchBrokers = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
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

  const filtered = brokers.filter(b =>
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.broker_location?.toLowerCase().includes(search.toLowerCase()) ||
    b.mobile?.includes(search)
  );

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
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}
        >
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Dashboard</h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)' }}>
            Manage all broker registrations from one place.
          </p>
        </motion.div>

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
          <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700 }}>Registered Brokers</h3>
            <div className="form-input-icon" style={{ width: 280 }}>
              <Search size={16} />
              <input
                className="form-input"
                placeholder="Search by name, city, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ fontSize: 13, padding: '10px 14px 10px 42px' }}
              />
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
                        <td>{b.mobile}</td>
                        <td>{b.whatsapp}</td>
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
      </div>
    </div>
  );
}
