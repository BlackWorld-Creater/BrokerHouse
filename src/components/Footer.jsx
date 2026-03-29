import React from 'react';
import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="nav-logo" style={{ marginBottom: 20 }}>
              <Building2 size={24} color="#3b82f6" />
              Brokrs<span style={{ color: '#3b82f6' }}>House</span>
            </div>
            <p>India's premier digital platform connecting licensed real estate brokers with verified institutional clients.</p>
          </div>
          <div>
            <h4 className="footer-heading">Important Links</h4>
            <ul className="footer-links">
              <li><Link to="/register">Register as Broker</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
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
