import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedStamp({ text = "BROKER OFFICIAL" }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 4, rotate: -45 }}
      whileInView={{ opacity: 0.7, scale: 1, rotate: -15 }}
      viewport={{ once: true }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 15,
        delay: 0.8 
      }}
      style={{
        display: 'inline-block',
        border: '5px double #dc2626',
        color: '#dc2626',
        padding: '10px 20px',
        borderRadius: '2px',
        fontSize: '28px',
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: '3px',
        fontFamily: "'Inter', sans-serif",
        userSelect: 'none',
        pointerEvents: 'none',
        background: 'rgba(220, 38, 38, 0.02)',
        mixBlendMode: 'multiply',
        boxShadow: '0 0 0 2px #dc2626'
      }}
    >
      <div style={{ border: '1px solid #dc2626', padding: '4px 10px' }}>
        {text}
      </div>
    </motion.div>
  );
}
