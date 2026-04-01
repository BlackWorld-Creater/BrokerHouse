import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    document.body.style.overflow = newState ? 'hidden' : '';
  };

  const closeMenu = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
      document.body.style.overflow = '';
    }
  };

  const location = useLocation();

  const handleHomeClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
    closeMenu();
  };

  return (
    <>
      <div className={`nav-overlay ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu} />
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container navbar-inner">
          <Link to="/" className="nav-logo" onClick={handleHomeClick}>
            <Building2 size={28} color="#1e40af" />
            Brokrs<span>House</span>
          </Link>

          <div className={`nav-toggle ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>

          <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <li><Link to="/" onClick={handleHomeClick}>Home</Link></li>
            <li><a href="/#features" onClick={closeMenu}>Services</a></li>
            <li><a href="/#network" onClick={closeMenu}>Network</a></li>
            <li><a href="/#process" onClick={closeMenu}>Process</a></li>
            <li style={{ marginTop: isMenuOpen ? '20px' : '0' }}>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenu} style={{ width: isMenuOpen ? '100%' : 'auto' }}>
                Register Now <ArrowRight size={15} />
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
