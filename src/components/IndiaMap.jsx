import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { motion, useInView } from 'framer-motion';
import { MapPin, Info } from 'lucide-react';

// Local simplified GeoJSON — India states (served from /public)
const INDIA_TOPO_URL = '/india-states-simple.geojson';

// Map admin state names → GeoJSON NAME_1 field
const STATE_NAME_MAP = {
  'Delhi': 'Delhi',
  'Delhi (NCR)': 'Delhi',
  'New Delhi': 'Delhi',
  'Haryana': 'Haryana',
  'Uttar Pradesh': 'Uttar Pradesh',
  'Rajasthan': 'Rajasthan',
  'Punjab': 'Punjab',
  'Himachal Pradesh': 'Himachal Pradesh',
  'Uttarakhand': 'Uttaranchal',
  'Madhya Pradesh': 'Madhya Pradesh',
  'Gujarat': 'Gujarat',
  'Maharashtra': 'Maharashtra',
  'Goa': 'Goa',
  'Karnataka': 'Karnataka',
  'Kerala': 'Kerala',
  'Tamil Nadu': 'Tamil Nadu',
  'Andhra Pradesh': 'Andhra Pradesh',
  'Telangana': 'Andhra Pradesh',
  'Bihar': 'Bihar',
  'Jharkhand': 'Jharkhand',
  'West Bengal': 'West Bengal',
  'Odisha': 'Orissa',
  'Chhattisgarh': 'Chhattisgarh',
  'Assam': 'Assam',
  'Jammu & Kashmir': 'Jammu and Kashmir',
  'Jammu and Kashmir': 'Jammu and Kashmir',
  'Meghalaya': 'Meghalaya',
  'Tripura': 'Tripura',
  'Manipur': 'Manipur',
  'Mizoram': 'Mizoram',
  'Nagaland': 'Nagaland',
  'Arunachal Pradesh': 'Arunachal Pradesh',
  'Sikkim': 'Sikkim',
  'Chandigarh': 'Chandigarh',
};

// Geographic centroids for location pin placement (Quick lookup for common states)
const STATE_CENTROIDS = {
  'Delhi': [77.1025, 28.7041],
  'Haryana': [76.0856, 29.0588],
  'Uttar Pradesh': [80.9462, 26.8467],
  'Rajasthan': [74.2179, 27.0238],
  'Punjab': [75.3412, 31.1471],
  'Himachal Pradesh': [77.1734, 31.1048],
  'Uttaranchal': [79.0193, 30.0668],
  'Madhya Pradesh': [78.6569, 22.9734],
  'Gujarat': [71.1924, 22.2587],
  'Maharashtra': [75.7139, 19.7515],
  'Goa': [74.124, 15.2993],
  'Karnataka': [75.7139, 15.3173],
  'Kerala': [76.2711, 10.8505],
  'Tamil Nadu': [78.6569, 11.1271],
  'Andhra Pradesh': [79.7400, 15.9129],
  'Bihar': [85.3131, 25.0961],
  'Jharkhand': [85.2799, 23.6102],
  'West Bengal': [87.8550, 22.9868],
  'Orissa': [85.0985, 20.9517],
  'Chhattisgarh': [81.8661, 21.2787],
  'Assam': [92.9376, 26.2006],
  'Jammu and Kashmir': [76.9182, 33.7782],
  'Meghalaya': [91.3662, 25.4670],
  'Tripura': [91.9882, 23.9408],
  'Manipur': [93.9063, 24.6637],
  'Mizoram': [92.9376, 23.1645],
  'Nagaland': [94.5624, 26.1584],
  'Arunachal Pradesh': [94.7278, 28.2180],
  'Sikkim': [88.5122, 27.5330],
  'Chandigarh': [76.7794, 30.7333],
};

const STATE_COLORS = [
  '#0ea5e9', // Sky 500
  '#8b5cf6', // Violet 500
  '#2dd4bf', // Teal 400
  '#f59e0b', // Amber 500
  '#f43f5e', // Rose 500
  '#10b981', // Emerald 500
  '#6366f1', // Indigo 500
];

const TEXT_LABEL_OFFSETS = {
  'Delhi': { x: 12, y: 18 },
  'Haryana': { x: -18, y: 14 },
  'Uttaranchal': { x: 10, y: 14 },
};

/**
 * Simple centroid calculation from GeoJSON feature coordinates.
 * This ensures new states show up with pins even if we haven't hardcoded them.
 */
const calculateCentroid = (feature) => {
  if (!feature || !feature.geometry) return null;
  const coords = feature.geometry.coordinates;
  const type = feature.geometry.type;
  
  let lons = [];
  let lats = [];
  
  const processCoords = (arr) => {
    arr.forEach(c => {
      if (Array.isArray(c[0])) processCoords(c);
      else {
        lons.push(c[0]);
        lats.push(c[1]);
      }
    });
  };
  
  processCoords(coords);
  
  if (lons.length === 0) return null;
  
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  
  return [(minLon + maxLon) / 2, (minLat + maxLat) / 2];
};

export default function IndiaMap({ states = [], cities = [], onStateClick }) {
  const [geoData, setGeoData] = useState(null);
  const [hoveredState, setHoveredState] = useState(null);
  
  // Animation management
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  
  // Projection state for "Auto Zoom"
  const [zoom, setZoom] = useState(700);
  const [center, setCenter] = useState([82, 23]);

  // Pre-load GeoJSON
  useEffect(() => {
    fetch(INDIA_TOPO_URL)
      .then(r => r.json())
      .then(setGeoData)
      .catch(err => console.error("Map Load Error:", err));
  }, []);

  // Build the live info map for rendering logic
  const stateInfoMap = useMemo(() => {
    if (!geoData) return {};
    const map = {};

    const geoNames = geoData.features
      .map(f => f?.properties?.NAME_1)
      .filter(Boolean);

    const normalizeName = (v) =>
      String(v)
        .toLowerCase()
        .trim()
        .replace(/&/g, 'and')
        .replace(/[\(\)]/g, '')
        .replace(/[^a-z0-9 ]/g, ' ')
        .replace(/\s+/g, ' ');

    const geoByNormalized = new Map(geoNames.map(n => [normalizeName(n), n]));
    
    states.forEach((s, idx) => {
      const adminName = (s?.name ?? '').toString().trim();
      if (!adminName) return;

      const adminNorm = normalizeName(adminName);

      let geoName = null;

      // Case-insensitive STATE_NAME_MAP lookup
      const directKey = Object.keys(STATE_NAME_MAP).find(
        k => k.toLowerCase().trim() === adminName.toLowerCase().trim()
      );
      if (directKey) geoName = STATE_NAME_MAP[directKey];

      // Common alias handling (GeoJSON NAME_1 differs across datasets)
      if (!geoName) {
        if (adminNorm.includes('delhi')) geoName = 'Delhi';
        else if (adminNorm === 'uttaranchal' || adminNorm.includes('khand') || adminNorm.includes('uttrak')) {
          // GeoJSON in `india-states-simple.geojson` uses `Uttaranchal` (not `Uttarakhand`).
          const uttaranchalGeo = geoNames.find(g => normalizeName(g).replace(/\s+/g, '') === 'uttaranchal');
          const uttGeo = geoNames.find(g => normalizeName(g).replace(/\s+/g, '') === 'uttarakhand');
          geoName = uttaranchalGeo || uttGeo || 'Uttaranchal';
        } else if (adminNorm === 'odisha' || adminNorm === 'orissa') {
          geoName = geoNames.includes('Odisha') ? 'Odisha' : 'Orissa';
        } else if (adminNorm === 'west bengal') {
          geoName = 'West Bengal';
        } else if (adminNorm === 'telangana') {
          geoName = geoNames.includes('Telangana') ? 'Telangana' : 'Andhra Pradesh';
        } else {
          geoName = geoByNormalized.get(adminNorm) || null;
        }
      }

      // Final fuzzy match on normalized strings
      if (!geoName) {
        geoName = geoNames.find(g => {
          const gNorm = normalizeName(g);
          return gNorm === adminNorm || gNorm.includes(adminNorm) || adminNorm.includes(gNorm);
        }) || null;
      }
      
      // Only map states that we can match to GeoJSON NAME_1
      if (!geoName) return;

      // Attempt to find the geographic feature for this state to calculate its center
      const feature = geoData.features.find(f => f.properties.NAME_1 === geoName);
      let centroid = STATE_CENTROIDS[geoName];
      
      // Dynamic Fallback: If we don't have a hardcoded center, calculate it from the GeoJSON
      if (!centroid && feature) {
        centroid = calculateCentroid(feature);
      }
      
      if (geoName) {
        map[geoName] = {
          admin: s,
          color: STATE_COLORS[idx % STATE_COLORS.length],
          cityCount: cities.filter(c => Number(c.state_id) === Number(s.id)).length,
          centroid: centroid
        };
      }
    });
    return map;
  }, [states, cities, geoData]);

  // Calculate focal point and zoom level when coming into view or when states change
  useEffect(() => {
    if (isInView && states.length > 0 && Object.keys(stateInfoMap).length > 0) {
      const activeCentroids = Object.values(stateInfoMap)
        .map(i => i.centroid)
        .filter(Boolean);
      
      if (activeCentroids.length > 0) {
        const minLon = Math.min(...activeCentroids.map(c => c[0]));
        const maxLon = Math.max(...activeCentroids.map(c => c[0]));
        const minLat = Math.min(...activeCentroids.map(c => c[1]));
        const maxLat = Math.max(...activeCentroids.map(c => c[1]));

        // Center the map on the bounding box midpoint so new distant states (e.g. Karnataka)
        // are always brought into view, not just averaged into the existing cluster.
        const centerLon = (minLon + maxLon) / 2;
        const centerLat = (minLat + maxLat) / 2;

        // Dynamic zoom: keep all states in frame with a gentle zoom level.
        const spread = Math.max(maxLon - minLon, maxLat - minLat);
        const rawZoom = 2000 - (spread * 60);
        const targetZoom = Math.min(Math.max(650, rawZoom), 1900);
        
        setTimeout(() => {
          setCenter([centerLon, centerLat]);
          setZoom(targetZoom);
        }, 400);
      }
    }
  }, [isInView, states, stateInfoMap]);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden rounded-3xl" 
         style={{ 
           background: '#f8fafc',
           boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
           border: '1px solid #e2e8f0',
           minHeight: 420
         }}>
      
      {/* Premium Header */}
      <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
        <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-200 shadow-sm">
          <MapPin size={20} className="text-blue-600" />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-slate-800 tracking-widest uppercase">REGIONAL COVERAGE</h4>
          {/* <p className="text-[10px] text-slate-500 font-medium">A</p> */}
        </div>
      </div>

      {!geoData ? (
        <div className="h-[450px] flex flex-col items-center justify-center gap-4 text-slate-400">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
           <p className="text-xs font-bold animate-pulse">Syncing with Admin Cluster...</p>
        </div>
      ) : (
        <div className="relative group">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ center, scale: zoom }}
            width={760}
            height={460}
            style={{ 
              width: '100%', 
              height: 'auto', 
              transition: 'all 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)' 
            }}
          >
            <ZoomableGroup
              center={center}
              zoom={zoom / 1000}
              onMoveEnd={({ coordinates, zoom: z }) => {
                setCenter(coordinates);
                setZoom(z * 1000);
              }}
              style={{ cursor: 'grab' }}
            >
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
              </pattern>
              <rect width="800" height="500" fill="url(#grid)" pointerEvents="none" opacity="0.4" />

              <Geographies geography={geoData}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const geoName = geo.properties.NAME_1;
                    const info = stateInfoMap[geoName];
                    const isActive = !!info;
                    const isHovered = hoveredState === geoName;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={() => isActive && setHoveredState(geoName)}
                        onMouseLeave={() => setHoveredState(null)}
                        onClick={() => isActive && onStateClick(info.admin)}
                        style={{
                          default: {
                            fill: isActive ? (isHovered ? info.color : `${info.color}dd`) : '#f1f5f9',
                            stroke: isActive ? '#fff' : '#cbd5e1',
                            strokeWidth: 0.5,
                            outline: 'none',
                            transition: 'all 0.4s',
                            cursor: isActive ? 'pointer' : 'default'
                          },
                          hover: {
                            fill: isActive ? info.color : '#e2e8f0',
                            stroke: '#fff',
                            strokeWidth: 1,
                            outline: 'none',
                            cursor: isActive ? 'pointer' : 'default'
                          },
                          pressed: {
                            fill: info?.color || '#cbd5e1',
                            outline: 'none',
                          }
                        }}
                      />
                    );
                  })
                }
              </Geographies>

              {/* SYNCED MARKERS - These are now created dynamically for ANY active state */}
              {Object.entries(stateInfoMap).map(([geoName, info], idx) => {
                 const centroid = info.centroid;
                 if (!centroid) return null;
                 const isHovered = hoveredState === geoName;
                 const textOffset = TEXT_LABEL_OFFSETS[geoName] || { x: 0, y: 16 };

                 return (
                   <Marker key={info.admin.id} coordinates={centroid}>
                      <motion.g
                        initial={{ opacity: 0, scale: 0 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ delay: 0.8 + (idx * 0.08), type: "spring" }}
                        style={{ cursor: 'pointer' }}
                        onClick={() => onStateClick(info.admin)}
                        onMouseEnter={() => setHoveredState(geoName)}
                        onMouseLeave={() => setHoveredState(null)}
                      >
                        {/* Pin */}
                        <motion.text
                          textAnchor="middle"
                          y={5}
                          style={{ fontSize: 24, pointerEvents: 'none' }}
                          animate={{ y: isHovered ? -5 : 5, scale: isHovered ? 1.2 : 1 }}
                        >
                          📍
                        </motion.text>
                        
                        <motion.circle
                          r={8}
                          fill={info.color}
                          initial={{ opacity: 0.3, scale: 0.5 }}
                          animate={{ opacity: [0.3, 0], scale: [0.5, 3] }}
                          transition={{ repeat: Infinity, duration: 2.5, ease: "easeOut" }}
                          style={{ pointerEvents: 'none' }}
                        />

                        {/* Simple text label near pin (no outer border/pill) */}
                        <g transform={`translate(${textOffset.x}, ${textOffset.y})`}>
                          <text
                            textAnchor="middle"
                            y={0}
                            style={{
                              fontSize: 8,
                              fill: '#020617',
                              fontWeight: 700,
                              fontFamily: 'Arial, Helvetica, sans-serif',
                              pointerEvents: 'none'
                            }}
                          >
                            {info.admin.name}
                          </text>
                        </g>
                      </motion.g>
                   </Marker>
                 );
              })}
            </ZoomableGroup>
          </ComposableMap>
          
          {/* Manual zoom controls */}
          <div
            className="absolute"
            style={{
              right: 24,
              bottom: 80, // sit just above the bottom legend row
              zIndex: 30,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: '#64748b',
                padding: '6px 8px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 10px rgba(15,23,42,0.06)'
              }}
            >
              MAP ZOOM
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button
              type="button"
              onClick={() => setZoom(z => Math.min(z * 1.2, 4000))}
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 16,
                boxShadow: '0 4px 10px rgba(15,23,42,0.08)',
                cursor: 'pointer'
              }}
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setZoom(z => Math.max(z / 1.2, 500))}
              style={{
                width: 32,
                height: 32,
                borderRadius: 999,
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 18,
                boxShadow: '0 4px 10px rgba(15,23,42,0.08)',
                cursor: 'pointer'
              }}
            >
              −
            </button>
            </div>
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
             <div className="flex gap-2">
                {Object.values(stateInfoMap).slice(0, 3).map((info, idx) => (
                  <div key={info.admin.id} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm">
                    <div className="w-2 h-2 rounded-full" style={{ background: info.color }} />
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{info.admin.name}</span>
                  </div>
                ))}
             </div>
             <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm animate-pulse">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>SYNC CAPABLE PLATFORM</span>
             </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .track-tighter { letter-spacing: -0.025em; }
      `}</style>
    </div>
  );
}
