import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  return (
    <>
      <div className={`nav-overlay ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu} />
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container navbar-inner">
          <Link to="/" className="nav-logo" onClick={() => isMenuOpen && toggleMenu()}>
            <Building2 size={28} color="#1e40af" />
            Brokrs<span>House</span>
          </Link>
          
          <div className={`nav-toggle ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>

          <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
            <li><a href="#features" onClick={toggleMenu}>Services</a></li>
            <li><a href="#network" onClick={toggleMenu}>Network</a></li>
            <li style={{ marginTop: isMenuOpen ? '20px' : '0' }}>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={toggleMenu} style={{ width: isMenuOpen ? '100%' : 'auto' }}>
                Register Now <ArrowRight size={15} />
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
