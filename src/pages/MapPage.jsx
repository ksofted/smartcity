import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle, useMap } from 'react-leaflet';
import { mockIncidents, mockGeofences, mockSchools } from '../data/mockData';
import { severityColor, incidentTypeLabel, timeAgo } from '../utils/helpers';
import Topbar from '../components/Topbar';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, X, Loader, MapPin } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createColoredIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 8px ${color};"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function createSchoolIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="width:22px;height:22px;border-radius:6px;background:#7c3aed;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 0 10px #7c3aed;">🎓</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function createSearchResultIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#f97316;border:3px solid white;box-shadow:0 0 12px #f97316;"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

// Flies map to given coords — must be inside MapContainer
function FlyToLocation({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], target.zoom || 15, { duration: 1.5 });
  }, [target]);
  return null;
}

export default function MapPage() {
  const center = [11.8846, 13.1520];
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [searchError, setSearchError] = useState('');
  const [flyTarget, setFlyTarget]   = useState(null);
  const [pinned, setPinned]         = useState(null); // dropped pin on search result
  const debounceRef = useRef(null);

  function handleQueryChange(e) {
    const val = e.target.value;
    setQuery(val);
    setSearchError('');
    if (!val.trim()) { setResults([]); return; }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchPlace(val), 500);
  }

  async function searchPlace(q) {
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data.length === 0) setSearchError('No results found. Try a different name.');
      setResults(data);
    } catch {
      setSearchError('Search failed. Check your internet connection.');
    }
    setLoading(false);
  }

  function selectResult(result) {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setFlyTarget({ lat, lng, zoom: 16 });
    setPinned({ lat, lng, label: result.display_name });
    setQuery(result.display_name.split(',')[0]);
    setResults([]);
  }

  function clearSearch() {
    setQuery('');
    setResults([]);
    setSearchError('');
    setPinned(null);
    setFlyTarget(null);
  }

  return (
    <div>
      <Topbar title="Live Map" subtitle="Real-time incident and geofence visualization" />
      <div className="page-content">
        <div className="grid-main-side" style={{ alignItems: 'start' }}>

          {/* Map */}
          <div style={{ position: 'relative' }}>

            {/* Search bar — floats over the map */}
            <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 1000, width: 320 }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  value={query}
                  onChange={handleQueryChange}
                  placeholder="Search city, area, landmark..."
                  style={{
                    width: '100%', padding: '9px 36px 9px 34px',
                    background: 'rgba(17,24,39,0.95)', border: '1px solid var(--border)',
                    borderRadius: results.length > 0 ? '8px 8px 0 0' : 8,
                    color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                  }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                {loading && <Loader size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', animation: 'spin 1s linear infinite' }} />}
                {query && !loading && (
                  <button onClick={clearSearch} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Dropdown results */}
              {results.length > 0 && (
                <div style={{ background: 'rgba(17,24,39,0.97)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 8px 8px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', maxHeight: 260, overflowY: 'auto' }}>
                  {results.map((r, i) => (
                    <div
                      key={i}
                      onClick={() => selectResult(r)}
                      style={{ padding: '9px 12px', cursor: 'pointer', borderBottom: i < results.length - 1 ? '1px solid rgba(30,58,95,0.4)' : 'none', display: 'flex', gap: 8, alignItems: 'flex-start', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <MapPin size={13} color="#3b82f6" style={{ marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {r.display_name.split(',')[0]}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                          {r.display_name.split(',').slice(1, 3).join(',')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error */}
              {searchError && !loading && (
                <div style={{ background: 'rgba(17,24,39,0.95)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '10px 12px', fontSize: 12, color: 'var(--text-muted)' }}>
                  {searchError}
                </div>
              )}
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <MapContainer center={center} zoom={12} style={{ height: 560 }}>
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution='&copy; Esri &mdash; Source: Esri, USGS, NOAA'
                  maxZoom={19}
                />
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                  maxZoom={19}
                />

                <FlyToLocation target={flyTarget} />

                {/* Search result pin */}
                {pinned && (
                  <Marker position={[pinned.lat, pinned.lng]} icon={createSearchResultIcon()}>
                    <Popup>
                      <div style={{ minWidth: 180 }}>
                        <strong style={{ color: '#f97316' }}>📍 Search Result</strong>
                        <div style={{ fontSize: 11, marginTop: 4 }}>{pinned.label.split(',').slice(0, 3).join(', ')}</div>
                        <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>{pinned.lat.toFixed(5)}, {pinned.lng.toFixed(5)}</div>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Geofence polygons */}
                {mockGeofences.map(geo => (
                  <Polygon
                    key={geo.geofenceId}
                    positions={geo.coordinates}
                    pathOptions={{ color: geo.color, fillColor: geo.color, fillOpacity: 0.1, weight: 2, dashArray: geo.type === 'restricted' ? '6 4' : null }}
                  >
                    <Popup><strong>{geo.name}</strong><br />Type: {geo.type}<br />Status: {geo.active ? 'Active' : 'Inactive'}</Popup>
                  </Polygon>
                ))}

                {/* Incident markers */}
                {mockIncidents.map(inc => (
                  <Marker key={inc.incidentId} position={[inc.location.lat, inc.location.lng]} icon={createColoredIcon(severityColor(inc.severity))}>
                    <Popup>
                      <div style={{ minWidth: 180 }}>
                        <strong style={{ color: severityColor(inc.severity) }}>{inc.incidentId}</strong>
                        <div style={{ marginTop: 4, fontSize: 12 }}>{incidentTypeLabel(inc.type)}</div>
                        <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{inc.location.address}</div>
                        <div style={{ fontSize: 11, marginTop: 4 }}>{inc.description}</div>
                        <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>{timeAgo(inc.createdAt)}</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* School markers + radius circles */}
                {mockSchools.filter(s => s.active).map(school => (
                  <React.Fragment key={school.schoolId}>
                    <Circle center={[school.location.lat, school.location.lng]} radius={school.radius} pathOptions={{ color: '#7c3aed', fillColor: '#7c3aed', fillOpacity: 0.08, weight: 1.5, dashArray: '4 3' }} />
                    <Marker position={[school.location.lat, school.location.lng]} icon={createSchoolIcon()}>
                      <Popup>
                        <div style={{ minWidth: 180 }}>
                          <strong style={{ color: '#7c3aed' }}>{school.schoolId}</strong>
                          <div style={{ marginTop: 4, fontSize: 12, fontWeight: 600 }}>{school.name}</div>
                          <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>Radius: {school.radius}m</div>
                          <div style={{ fontSize: 11, color: '#666' }}>{school.contact.email}</div>
                        </div>
                      </Popup>
                    </Marker>
                  </React.Fragment>
                ))}

                {/* Heatmap circles */}
                {mockIncidents.map(inc => (
                  <Circle key={`heat-${inc.incidentId}`} center={[inc.location.lat, inc.location.lng]} radius={300} pathOptions={{ color: severityColor(inc.severity), fillColor: severityColor(inc.severity), fillOpacity: 0.06, weight: 0 }} />
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Side panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>Map Legend</div>
              {[
                { label: 'Critical', color: '#dc2626' },
                { label: 'High', color: '#f97316' },
                { label: 'Medium', color: '#eab308' },
                { label: 'Low', color: '#22c55e' },
              ].map(({ label, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label} Severity</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 20, height: 2, background: '#ef4444', borderTop: '2px dashed #ef4444' }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Restricted Zone</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 20, height: 2, background: '#3b82f6' }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>City Boundary</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: '#7c3aed', boxShadow: '0 0 6px #7c3aed' }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>School Zone</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>Incidents on Map</div>
              {mockIncidents.map(inc => (
                <div key={inc.incidentId} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(30,58,95,0.5)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: severityColor(inc.severity), marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{inc.incidentId} — {incidentTypeLabel(inc.type)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{inc.location.address}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: translateY(-50%) rotate(0deg); } to { transform: translateY(-50%) rotate(360deg); } }`}</style>
    </div>
  );
}
