import { Building2, ArrowLeft, ShieldCheck } from 'lucide-react';
import AnimatedStamp from '../components/AnimatedStamp';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <Navbar />

      <div className="container" style={{ paddingTop: 120, paddingBottom: 100 }}>
        <div className="register-card" style={{ gridTemplateColumns: '1fr', padding: 0 }}>
          <div className="register-form-area" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 40, right: 40 }}>
              <AnimatedStamp text="BH VERIFIED" />
            </div>
            
            <div style={{ marginBottom: 40 }}>
              <div className="success-icon" style={{ margin: '0 0 24px', width: 64, height: 64 }}>
                <ShieldCheck size={32} />
              </div>
              <h1 className="hero-title" style={{ fontSize: 42, marginBottom: 16 }}>Privacy Policy</h1>
              <p style={{ color: 'var(--text-muted)' }}>Last updated: March 29, 2026</p>
            </div>

            <div className="legal-content" style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              <h3 style={{ color: 'var(--text)', marginTop: 32, marginBottom: 12 }}>1. Information We Collect</h3>
              <p>At BrokrsHouse, we collect information that you provide directly to us, such as your name, contact information, professional credentials, and location during the registration process. We also collect transactional information related to your use of our platform.</p>
              
              <h3 style={{ color: 'var(--text)', marginTop: 32, marginBottom: 12 }}>2. How We Use Your Information</h3>
              <p>We use the information we collect to operate, maintain, and provide the features of our platform. This includes verifying your broker status, connecting you with institutional clients, and improving our network intelligence.</p>

              <h3 style={{ color: 'var(--text)', marginTop: 32, marginBottom: 12 }}>3. Data Sharing</h3>
              <p>We do not sell your personal data. We share your information with verified institutional clients only when you initiate a professional connection or listing inquiry. We may also share data with service providers who help us maintain our infrastructure.</p>

              <h3 style={{ color: 'var(--text)', marginTop: 32, marginBottom: 12 }}>4. Security</h3>
              <p>We implement industry-standard security measures to protect your data from unauthorized access, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.</p>

              <h3 style={{ color: 'var(--text)', marginTop: 32, marginBottom: 12 }}>5. Your Rights</h3>
              <p>You have the right to access, correct, or delete your professional data at any time. You can manage these settings from your Broker Dashboard or by contacting our compliance team.</p>
            </div>
            
            <div style={{ marginTop: 60, paddingTop: 40, borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>BrokrsHouse Compliance Team</p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Verified & Secure Portal</p>
              </div>
              <div style={{ opacity: 0.1, fontSize: 11, fontWeight: 800 }}>BH-RE-2026-PRIVACY</div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
