import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  Plane,
  X,
  Landmark,
  Building2,
  Castle,
  Church,
  Home,
  Factory,
  Hotel,
  Trees,
  Mountain,
  Palmtree,
  Ship,
  TrainFront,
  Waves,
  Globe2,
  Sparkles,
  LandPlot,
  Warehouse,
  TowerControl,
} from 'lucide-react';

/** Deterministic hash for stable visuals per city name */
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const FALLBACK_ICONS = [
  Landmark,
  Building2,
  Castle,
  Church,
  Home,
  Factory,
  Hotel,
  Trees,
  Mountain,
  Palmtree,
  Ship,
  TrainFront,
  Waves,
  Globe2,
  Sparkles,
  LandPlot,
  Warehouse,
  TowerControl,
];

const ACCENT_PALETTE = [
  '#9f1239',
  '#0e7490',
  '#15803d',
  '#7c3aed',
  '#c2410c',
  '#1d4ed8',
  '#be185d',
  '#0369a1',
  '#a16207',
  '#4338ca',
  '#0f766e',
  '#b45309',
];

/** Optional soft wash inside frame (unique per city) */
function softBgForAccent(hex) {
  return `${hex}14`;
}

/**
 * Mini skyline: bar heights derived from name — unique silhouette per city.
 */
function CitySkyline({ seed, color }) {
  const heights = [];
  let s = seed;
  for (let i = 0; i < 8; i += 1) {
    s = (s * 1103515245 + 12345) >>> 0;
    heights.push(8 + (s % 18));
  }
  const maxH = Math.max(...heights, 1);
  const barW = 8;
  const gap = 2;
  const vbH = 30;
  const totalW = heights.length * barW + (heights.length - 1) * gap;
  return (
    <svg
      width="100%"
      height={34}
      viewBox={`0 0 ${totalW} ${vbH}`}
      style={{ display: 'block', marginTop: 4 }}
      aria-hidden
    >
      {heights.map((h, i) => {
        const scaled = (h / maxH) * 26;
        const x = i * (barW + gap);
        const y = vbH - scaled;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={scaled}
            rx={1.2}
            fill={color}
            opacity={0.75 + (i % 3) * 0.08}
          />
        );
      })}
    </svg>
  );
}

/** Famous / common Indian hubs → distinct icon + colour (line-art style) */
const KNOWN_CITY_VISUAL = {
  delhi: { Icon: Landmark, accent: '#9f1239' },
  'new delhi': { Icon: Landmark, accent: '#9f1239' },
  mumbai: { Icon: Building2, accent: '#0e7490' },
  bengaluru: { Icon: Trees, accent: '#15803d' },
  bangalore: { Icon: Trees, accent: '#15803d' },
  hyderabad: { Icon: Landmark, accent: '#a16207' },
  chennai: { Icon: Waves, accent: '#0369a1' },
  kolkata: { Icon: Warehouse, accent: '#7c3aed' },
  pune: { Icon: Mountain, accent: '#b45309' },
  jaipur: { Icon: Castle, accent: '#be185d' },
  ahmedabad: { Icon: Church, accent: '#c2410c' },
  gurugram: { Icon: TowerControl, accent: '#1d4ed8' },
  gurgaon: { Icon: TowerControl, accent: '#1d4ed8' },
  noida: { Icon: Factory, accent: '#4338ca' },
  ghaziabad: { Icon: Building2, accent: '#4f46e5' },
  kochi: { Icon: Ship, accent: '#0f766e' },
  goa: { Icon: Palmtree, accent: '#0d9488' },
  lucknow: { Icon: Castle, accent: '#9d174d' },
  indore: { Icon: Landmark, accent: '#ea580c' },
  nagpur: { Icon: Trees, accent: '#166534' },
  surat: { Icon: Waves, accent: '#0284c7' },
  vadodara: { Icon: Building2, accent: '#7c2d12' },
  ludhiana: { Icon: Factory, accent: '#854d0e' },
  chandigarh: { Icon: Landmark, accent: '#4338ca' },
  faridabad: { Icon: Home, accent: '#1e40af' },
  sonipat: { Icon: TrainFront, accent: '#92400e' },
  panipat: { Icon: Factory, accent: '#713f12' },
  ambala: { Icon: Church, accent: '#6b21a8' },
  rohtak: { Icon: Building2, accent: '#155e75' },
  karnal: { Icon: Trees, accent: '#3f6212' },
  meerut: { Icon: Landmark, accent: '#9f1239' },
  agra: { Icon: Castle, accent: '#b91c1c' },
  kanpur: { Icon: Factory, accent: '#713f12' },
  varanasi: { Icon: Church, accent: '#7c3aed' },
  prayagraj: { Icon: Waves, accent: '#1d4ed8' },
  alwar: { Icon: Castle, accent: '#c026d3' },
  bhiwadi: { Icon: Factory, accent: '#64748b' },
  jodhpur: { Icon: Castle, accent: '#0369a1' },
  udaipur: { Icon: Castle, accent: '#db2777' },
  kota: { Icon: Landmark, accent: '#ca8a04' },
  ajmer: { Icon: Landmark, accent: '#059669' },
  bikaner: { Icon: Castle, accent: '#b45309' },
  okhla: { Icon: Factory, accent: '#475569' },
  rohini: { Icon: Home, accent: '#2563eb' },
  dwarka: { Icon: Building2, accent: '#1d4ed8' },
  'greater noida': { Icon: TowerControl, accent: '#4f46e5' },
};

function getCityVisual(name) {
  const key = name.trim().toLowerCase().replace(/\s+/g, ' ');
  const seed = hashCode(key);
  const known = KNOWN_CITY_VISUAL[key];
  if (known) {
    return {
      Icon: known.Icon,
      accent: known.accent,
      seed,
      frameVariant: seed % 3,
    };
  }
  const Icon = FALLBACK_ICONS[seed % FALLBACK_ICONS.length];
  const accent = ACCENT_PALETTE[seed % ACCENT_PALETTE.length];
  return { Icon, accent, seed, frameVariant: seed % 3 };
}

function CityCard({ city }) {
  const { Icon, accent, seed, frameVariant } = getCityVisual(city.name);
  const soft = softBgForAccent(accent);

  const frameStyles = [
    { borderRadius: '50%', borderStyle: 'solid', borderWidth: 2 },
    { borderRadius: 22, borderStyle: 'solid', borderWidth: 2 },
    { borderRadius: 16, borderStyle: 'dashed', borderWidth: 2 },
  ][frameVariant];

  return (
    <div
      className="city-card"
      style={{
        flex: '0 0 auto',
        width: 260,
        minHeight: 264,
        padding: '28px 22px',
        background: '#fff',
        borderRadius: 18,
        boxShadow: '6px 8px 28px rgba(15, 23, 42, 0.09), 0 1px 0 rgba(255,255,255,0.9) inset',
        border: '1px solid #eef2f6',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 18,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 138,
          height: 138,
          ...frameStyles,
          borderColor: accent,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '14px 14px 8px',
          background: `linear-gradient(165deg, ${soft} 0%, #ffffff 55%, #fafafa 100%)`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.9), 0 4px 14px ${accent}18`,
        }}
        aria-hidden
      >
        <Icon size={56} strokeWidth={1.65} color={accent} style={{ flexShrink: 0 }} />
        <div style={{ width: '100%', paddingLeft: 2, paddingRight: 2 }}>
          <CitySkyline seed={seed} color={accent} />
        </div>
      </div>
      <span
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: '#0f172a',
          lineHeight: 1.3,
          letterSpacing: '-0.02em',
        }}
      >
        {city.name}
      </span>
    </div>
  );
}

export default function CitiesShowcase({ cities = [], loading }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((c) => c.name.toLowerCase().includes(q));
  }, [cities, query]);

  const showNotFound = query.trim().length > 0 && filtered.length === 0 && !loading;
  const showCarousel = !showNotFound && !query.trim() && cities.length > 0;
  const showSearchGrid = !showNotFound && query.trim().length > 0 && filtered.length > 0;

  const loopItems = useMemo(() => {
    if (cities.length === 0) return [];
    return [...cities, ...cities];
  }, [cities]);

  const durationSec = Math.min(60, Math.max(28, cities.length * 2.8));

  return (
    <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 28, position: 'relative' }}>
        <Search
          size={18}
          color="#64748b"
          style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a city…"
          className="city-search-input"
          style={{
            width: '100%',
            padding: '14px 44px 14px 46px',
            fontSize: 15,
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            background: '#fff',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.06)',
            outline: 'none',
          }}
          aria-label="Search cities"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              padding: 8,
              border: 'none',
              background: '#f1f5f9',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} color="#64748b" />
          </button>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8', fontWeight: 600 }}>
          Loading cities…
        </div>
      )}

      {!loading && showNotFound && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="city-not-found-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 0,
            background: '#fff',
            borderRadius: 20,
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(15, 23, 42, 0.08)',
          }}
        >
          <div
            style={{
              padding: '40px 36px',
              borderRight: '1px solid #e2e8f0',
            }}
          >
            <h3
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: '#334155',
                marginBottom: 8,
                lineHeight: 1.3,
                textAlign: 'center',
              }}
            >
              Oops, BrokrsHouse is not yet available in your city!
            </h3>
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>
              “{query.trim()}”
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20,
                flexWrap: 'wrap',
              }}
            >
              <MapPin size={40} color="#16a34a" strokeWidth={2} />
              <Plane size={36} color="#ca8a04" strokeWidth={1.8} style={{ transform: 'rotate(-12deg)' }} />
            </div>
            <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 1.6, marginBottom: 20 }}>
              Try another name or explore cities we currently cover below.
            </p>
            <div style={{ textAlign: 'center' }}>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register as broker
              </Link>
            </div>
          </div>
          <div style={{ padding: '40px 36px', background: '#fafafa' }}>
            <h4
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: '#0f172a',
                marginBottom: 8,
              }}
            >
              BrokrsHouse in the following cities:
            </h4>
            <div
              style={{
                width: 48,
                height: 3,
                background: '#eab308',
                borderRadius: 2,
                marginBottom: 20,
              }}
            />
            <ul
              style={{
                columns: 2,
                columnGap: 24,
                fontSize: 14,
                color: '#475569',
                lineHeight: 1.9,
                listStyle: 'none',
                padding: 0,
                margin: 0,
              }}
            >
              {cities.map((c) => (
                <li key={c.id} style={{ breakInside: 'avoid' }}>
                  {c.name}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {!loading && showCarousel && (
        <div
          className="city-carousel-viewport"
          style={{
            overflow: 'hidden',
            padding: '10px 0 22px',
          }}
        >
          <div
            className="city-carousel-track"
            style={{
              display: 'flex',
              gap: 28,
              width: 'max-content',
              animation: `city-marquee ${durationSec}s linear infinite`,
            }}
          >
            {loopItems.map((city, idx) => (
              <CityCard key={`${city.id}-${idx}`} city={city} />
            ))}
          </div>
        </div>
      )}

      {!loading && showSearchGrid && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 28,
            justifyContent: 'center',
          }}
        >
          {filtered.map((city) => (
            <CityCard key={city.id} city={city} />
          ))}
        </div>
      )}

      {!loading && !showNotFound && cities.length === 0 && (
        <p style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>
          Cities will appear here once added in the admin panel.
        </p>
      )}

      <style>{`
        @keyframes city-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .city-carousel-viewport:hover .city-carousel-track {
          animation-play-state: paused;
        }
        .city-search-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(30, 64, 175, 0.15);
        }
        @media (max-width: 768px) {
          .city-not-found-grid {
            grid-template-columns: 1fr !important;
          }
          .city-not-found-grid > div:first-child {
            border-right: none !important;
            border-bottom: 1px solid #e2e8f0;
          }
        }
      `}</style>
    </div>
  );
}
