import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Building = ({ x, width, height, delay, speed, opacity = 0.1 }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 2000], [0, -200 * speed]);

  return (
    <motion.div
      style={{
        position: 'absolute',
        left: `${x}%`,
        bottom: 0,
        width: `${width}px`,
        height: `${height}px`,
        background: 'linear-gradient(180deg, rgba(30, 64, 175, 0.05) 0%, rgba(30, 64, 175, 0.1) 100%)',
        backdropFilter: 'blur(2px)',
        border: '1px solid rgba(30, 64, 175, 0.1)',
        borderBottom: 'none',
        borderRadius: '8px 8px 0 0',
        y,
        opacity,
        zIndex: Math.floor(speed * 10),
      }}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height, opacity }}
      transition={{ duration: 1.5, delay, ease: "easeOut" }}
    >
      {/* Windows glow */}
      <div style={{
        position: 'absolute',
        inset: '20px 10px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
        opacity: 0.3
      }}>
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              width: '100%',
              height: '4px',
              background: 'var(--primary-light)',
              borderRadius: '2px'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: Math.random() > 0.5 ? 0.8 : 0.2 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: Math.random() * 2 }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default function PremiumCityBackground() {
  const containerRef = useRef(null);

  const buildings = [
    { x: 5, width: 120, height: 350, delay: 0.1, speed: 0.2 },
    { x: 15, width: 100, height: 450, delay: 0.3, speed: 0.4 },
    { x: 30, width: 140, height: 300, delay: 0.2, speed: 0.15 },
    { x: 45, width: 180, height: 600, delay: 0.5, speed: 0.6 },
    { x: 65, width: 110, height: 400, delay: 0.4, speed: 0.3 },
    { x: 80, width: 130, height: 380, delay: 0.6, speed: 0.25 },
    { x: 90, width: 100, height: 500, delay: 0.7, speed: 0.45 },
  ];

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(250, 251, 255, 0) 0%, rgba(250, 251, 255, 1) 90%)',
      }}
    >
      {buildings.map((b, i) => (
        <Building key={i} {...b} />
      ))}
      
      {/* Distant skyline (very faint) */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.4, zIndex: 0 }}>
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              bottom: 0,
              left: `${i * 12}%`,
              width: '80px',
              height: `${150 + Math.random() * 100}px`,
              background: 'rgba(30, 64, 175, 0.03)',
              borderRadius: '4px 4px 0 0'
            }}
          />
        ))}
      </div>
    </div>
  );
}
