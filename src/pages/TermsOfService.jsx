import { Building2, ArrowLeft, FileText } from 'lucide-react';
import AnimatedStamp from '../components/AnimatedStamp';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function TermsOfService() {
  return (
    <div className="legal-page">
      <Navbar />

      <div className="container" style={{ paddingTop: 120, paddingBottom: 100 }}>
        <div className="register-card" style={{ gridTemplateColumns: '1fr', padding: 0 }}>
          <div className="register-form-area" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 40, right: 40 }}>
              <AnimatedStamp text="OFFICIAL TERMS" />
            </div>
            
            <div style={{ marginBottom: 40 }}>
              <div className="success-icon" style={{ margin: '0 0 24px', width: 64, height: 64, background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                <FileText size={32} />
              </div>
              <h1 className="hero-title" style={{ fontSize: 42, marginBottom: 16 }}>Terms of Service</h1>
              <p style={{ color: 'var(--text-muted)' }}>Effective Date: March 29, 2026</p>
            </div>

            <div className="legal-content" style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <h3 style={{ color: 'var(--text)', marginTop: 32, marginBottom: 12 }}>1. Acceptance of Terms</h3>
              <p>By accesssing and using the BrokrsHouse platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
              
              <h3 style={{ color: 'var(--text)', marginTop: 32, marginBottom: 12 }}>2. Broker Verification</h3>
              <p>All users registering as brokers must provide accurate and verifiable professional credentials. BrokrsHouse reserves the right to suspend any account that provides false or misleading information.</p>

              <h3 style={{ color: 'var(--text)', marginTop: 32, marginBottom: 12 }}>3. Platform Usage</h3>
              <p>The platform is intended for professional real estate connections. Users agree to conduct themselves ethically and comply with all local real estate regulations and laws.</p>

              <h3 style={{ color: 'var(--text)', marginTop: 32, marginBottom: 12 }}>4. Intellectual Property</h3>
              <p>All content, branding, and platform logic are the exclusive property of BrokrsHouse. Unauthorized reproduction or reverse engineering of the platform is strictly prohibited.</p>

              <h3 style={{ color: 'var(--text)', marginTop: 32, marginBottom: 12 }}>5. Limitation of Liability</h3>
              <p>BrokrsHouse provides a platform for connections but does not guarantee the success of any real estate transaction. We are not liable for disputes between users or external market factors.</p>
            </div>
            
            <div style={{ marginTop: 60, paddingTop: 40, borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>BrokrsHouse Legal Affairs</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Compliance & Regulatory Standards</p>
              </div>
              <div style={{ opacity: 0.1, fontSize: 11, fontWeight: 800 }}>BH-RE-2026-TOS</div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
