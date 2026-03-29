import React from 'react';
import { motion } from 'framer-motion';

export default function CityBlueprint() {
  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i) => ({
      pathLength: 1,
      opacity: 0.15,
      transition: {
        pathLength: { delay: i * 0.2, duration: 2, ease: "easeInOut" },
        opacity: { delay: i * 0.2, duration: 0.5 }
      }
    })
  };

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 1,
      opacity: 0.6,
      pointerEvents: 'none',
      overflow: 'hidden'
    }}>
      <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="xMidYMax slice">
        {/* Building 1 - Left */}
        <motion.path
          d="M50,400 L50,150 L150,150 L150,400 M50,200 L150,200 M50,250 L150,250 M50,300 L150,300 M50,350 L150,350"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="1"
          custom={0}
          initial="hidden"
          animate="visible"
          variants={lineVariants}
        />
        
        {/* Building 2 - Middle Low */}
        <motion.path
          d="M200,400 L200,250 L350,250 L350,400 M200,300 L350,300 M200,350 L350,350 M250,250 L250,400 M300,250 L300,400"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="1"
          custom={1}
          initial="hidden"
          animate="visible"
          variants={lineVariants}
        />

        {/* Building 3 - Middle High (Empire state style) */}
        <motion.path
          d="M400,400 L400,100 L450,50 L500,100 L500,400 M400,150 L500,150 M400,200 L500,200 M400,250 L500,250 M400,300 L500,300 M400,350 L500,350 M450,50 L450,20"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="1"
          custom={2}
          initial="hidden"
          animate="visible"
          variants={lineVariants}
        />

        {/* Building 4 - Right */}
        <motion.path
          d="M550,400 L550,180 L700,180 L700,400 M550,220 L700,220 M550,260 L700,260 M550,300 L700,300 M550,340 L700,340 M600,180 L600,400 M650,180 L650,400"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="1"
          custom={3}
          initial="hidden"
          animate="visible"
          variants={lineVariants}
        />

        {/* Floor Line */}
        <motion.path
          d="M0,400 L800,400"
          stroke="var(--primary)"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.2 }}
          transition={{ duration: 1 }}
        />
      </svg>
    </div>
  );
}
