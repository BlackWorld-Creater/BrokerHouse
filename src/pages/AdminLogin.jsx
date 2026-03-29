import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { API_URL } from '../config';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('admin_token', data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <motion.div
        className="admin-login-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center" style={{ marginBottom: 36 }}>
          <div className="flex items-center justify-center gap-2" style={{ marginBottom: 24 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 'var(--radius-md)',
              background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Building2 size={24} color="var(--primary)" />
            </div>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Admin Panel</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Sign in to manage broker registrations</p>
        </div>

        {error && (
          <div className="flex items-center gap-2" style={{
            background: 'var(--danger-soft)', color: 'var(--danger)',
            padding: '12px 16px', borderRadius: 'var(--radius-sm)',
            fontSize: 14, fontWeight: 600, marginBottom: 24
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="form-input-icon">
                <Mail size={16} />
                <input
                  type="email" required className="form-input"
                  placeholder="admin@gmail.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="form-input-icon">
                <Lock size={16} />
                <input
                  type="password" required className="form-input"
                  placeholder="Enter your password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-block btn-lg">
              {loading ? <><span className="spinner" /> Signing In...</> : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
