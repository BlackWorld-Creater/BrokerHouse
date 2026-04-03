/**
 * Rebuilds public/india-states-simple.geojson: Natural Earth 10m India admin-1 for all units,
 * but replaces Jammu & Kashmir + Ladakh geometries with merged districts from
 * udit-001/india-maps-data (Indian administrative / census-style outlines).
 *
 * Run: node scripts/patch-jk-ladakh-geojson.mjs
 */
import fs from 'fs';
import https from 'https';

const NE_URL =
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson';
const UJIT = 'https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@ef25ebc/geojson/states';
const OUT = new URL('../public/india-states-simple.geojson', import.meta.url);

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode} ${url}`));
          res.resume();
          return;
        }
        let d = '';
        res.on('data', (c) => (d += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(d));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

/** Combine district polygons into one MultiPolygon (no boolean union — fine for SVG fill). */
function mergeDistrictsToMultiPolygon(features) {
  const coordinates = [];
  for (const f of features) {
    const g = f.geometry;
    if (!g) continue;
    if (g.type === 'Polygon') {
      coordinates.push(g.coordinates);
    } else if (g.type === 'MultiPolygon') {
      for (const poly of g.coordinates) {
        coordinates.push(poly);
      }
    }
  }
  return { type: 'MultiPolygon', coordinates };
}

async function main() {
  console.log('Fetching Natural Earth 10m…');
  const ne = await fetchJson(NE_URL);
  const india = ne.features.filter((f) => f.properties?.admin === 'India');

  console.log('Fetching udit Ladakh + J&K…');
  const [ladakhFc, jkFc] = await Promise.all([
    fetchJson(`${UJIT}/ladakh.geojson`),
    fetchJson(`${UJIT}/jammu-and-kashmir.geojson`),
  ]);

  const ladakhGeom = mergeDistrictsToMultiPolygon(ladakhFc.features);
  const jkGeom = mergeDistrictsToMultiPolygon(jkFc.features);

  const out = {
    type: 'FeatureCollection',
    name: 'ne10m_india_admin1_jk_ladakh_udit',
    crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
    features: india.map((f) => {
      const name = f.properties.name;
      if (name === 'Ladakh') {
        return {
          type: 'Feature',
          properties: {
            NAME_0: 'India',
            NAME_1: 'Ladakh',
            NE_ID: f.properties.ne_id,
            ISO_3166_2: f.properties.iso_3166_2,
            _geometry_source: 'udit-001/india-maps-data@ef25ebc (districts merged)',
          },
          geometry: ladakhGeom,
        };
      }
      if (name === 'Jammu and Kashmir') {
        return {
          type: 'Feature',
          properties: {
            NAME_0: 'India',
            NAME_1: 'Jammu and Kashmir',
            NE_ID: f.properties.ne_id,
            ISO_3166_2: f.properties.iso_3166_2,
            _geometry_source: 'udit-001/india-maps-data@ef25ebc (districts merged)',
          },
          geometry: jkGeom,
        };
      }
      return {
        type: 'Feature',
        properties: {
          NAME_0: 'India',
          NAME_1: name,
          NE_ID: f.properties.ne_id,
          ISO_3166_2: f.properties.iso_3166_2,
        },
        geometry: f.geometry,
      };
    }),
  };

  fs.writeFileSync(OUT, JSON.stringify(out));
  const bytes = fs.statSync(OUT).size;
  console.log('Wrote', OUT.pathname, 'features', out.features.length, 'bytes', bytes);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
