import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import ncrPaths from '../assets/paths_extracted.json';

const NCRMap = ({ onStateSelect = () => {} }) => {
  // First, we need to calculate the bounding box of all paths to set a proper viewBox
  // But wait, computing bounding box of SVG path strings is hard in JS without a library like svg-path-bounds
  // Let's use a hardcoded bounding box that broadly fits the coordinates 
  // Observed X coordinates: 900 to 2300. Observed Y coordinates: 380 to 2300
  // To be safe, we will use a viewBox that encompasses these: "800 300 1600 2000"
  
  const handleMapClick = (e, stateName) => {
    e.stopPropagation();
    onStateSelect(stateName);
  };

  return (
    <div className="w-full relative group">
      <svg
        viewBox="850 350 1500 1950"
        className="w-full h-auto will-change-transform filter drop-shadow-xl"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g id="ncr-districts">
          {ncrPaths.map((district, i) => {
            // Some names have newlines, clean them up
            const cleanLabel = district.label.replace(/\n/g, ' ');

            return (
              <g key={`district-${i}`} id={`district-${cleanLabel.replace(/\s+/g, '-')}`}>
                {district.paths.map((p, pIdx) => (
                  <motion.path
                    key={`path-${i}-${pIdx}`}
                    d={p}
                    fill="currentColor"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="text-primary/10 hover:text-primary transition-colors cursor-pointer"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.8,
                      ease: "easeOut",
                      delay: i * 0.05
                    }}
                    whileHover={{ 
                      scale: 1.01,
                      filter: "brightness(1.1)",
                      zIndex: 10
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => handleMapClick(e, cleanLabel)}
                    // Interactive tooltips can be added here or via title
                  >
                    <title>{cleanLabel}</title>
                  </motion.path>
                ))}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default NCRMap;
