import React, { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker, Polygon } from 'react-leaflet';
import { mockSchools, mockIncidents } from '../data/mockData';
import { distanceMeters, severityColor, incidentTypeLabel, timeAgo } from '../utils/helpers';
import Topbar from '../components/Topbar';
import MapClickHandler from '../components/Map/MapClickHandler';
import RectangleDrawer from '../components/Map/RectangleDrawer';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GraduationCap, Plus, X, AlertTriangle, Phone, Mail, MapPin, MousePointer, Trash2, Square, Maximize2, Minimize2 } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function schoolIcon(atRisk) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:24px;height:24px;border-radius:6px;
      background:${atRisk ? '#dc2626' : '#7c3aed'};
      border:2px solid white;display:flex;
      align-items:center;justify-content:center;
      font-size:13px;box-shadow:0 0 10px ${atRisk ? '#dc2626' : '#7c3aed'};
    ">🎓</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function getNearbyIncidents(school, incidents) {
  return incidents.filter(inc =>
    inc.status !== 'resolved' &&
    distanceMeters(school.location.lat, school.location.lng, inc.location.lat, inc.location.lng) <= school.radius
  );
}

const emptyForm = { name: '', phone: '', email: '', lat: '', lng: '', radius: 500, rectPoints: null };

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    if (!data || data.error) return '';
    const a = data.address || {};
    return (
      a.amenity || a.building || a.school || a.college || a.university ||
      a.leisure || a.tourism || a.shop || a.neighbourhood ||
      a.suburb || a.village || a.town || a.city_district || a.city || ''
    );
  } catch { return ''; }
}

export default function Schools() {
  const [schools, setSchools]     = useState(mockSchools);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(emptyForm);
  const [selected, setSelected]   = useState(null);
  const [formError, setFormError] = useState('');
  const [drawMode, setDrawMode]   = useState('click');
  const [geocoding, setGeocoding] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setFullscreen(false); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Map click sets school GPS location + reverse geocodes name
  async function handleMapClick(lat, lng) {
    if (drawMode !== 'click') return;
    setForm(prev => ({ ...prev, lat: String(lat), lng: String(lng) }));
    setFormError('');
    if (form.name.trim() === '') {
      setGeocoding(true);
      const name = await reverseGeocode(lat, lng);
      setGeocoding(false);
      if (name) setForm(prev => ({ ...prev, name: prev.name.trim() === '' ? name : prev.name }));
    }
  }

  // Rectangle drawn — use center for reverse geocode
  const handleRectDrawn = useCallback(async (pts, placeName) => {
    const centerLat = (pts[0].lat + pts[2].lat) / 2;
    const centerLng = (pts[0].lng + pts[2].lng) / 2;
    setForm(prev => ({
      ...prev,
      lat: String(centerLat.toFixed(6)),
      lng: String(centerLng.toFixed(6)),
      rectPoints: pts,
      name: prev.name.trim() === '' && placeName ? placeName : prev.name,
    }));
    setFormError('');
  }, []);

  function handleRegister(e) {
    e.preventDefault();
    const lat = parseFloat(form.lat);
    const lng = parseFloat(form.lng);
    if (isNaN(lat) || isNaN(lng)) { setFormError('Click on the map to set the school location.'); return; }
    setSchools(prev => [...prev, {
      schoolId: `SCH-${String(prev.length + 1).padStart(3, '0')}`,
      name: form.name,
      contact: { phone: form.phone, email: form.email },
      location: { lat, lng },
      radius: Number(form.radius),
      active: true,
      registeredAt: new Date().toISOString(),
    }]);
    setForm(emptyForm);
    setFormError('');
    setShowForm(false);
  }

  function toggleActive(id) {
    setSchools(prev => prev.map(s => s.schoolId === id ? { ...s, active: !s.active } : s));
  }

  function deleteSchool(id) {
    setSchools(prev => prev.filter(s => s.schoolId !== id));
    setSelected(prev => prev?.schoolId === id ? null : prev);
  }

  const atRiskSchools = schools.filter(s => s.active && getNearbyIncidents(s, mockIncidents).length > 0);
  const previewLat = parseFloat(form.lat);
  const previewLng = parseFloat(form.lng);
  const hasPreview = !isNaN(previewLat) && !isNaN(previewLng);

  return (
    <div>
      <Topbar title="Schools" subtitle="Registered schools and proximity security alerts" />
      <div className="page-content">

        <div className="stats-grid" style={{ marginBottom: 20 }}>
          {[
            { label: 'Registered', value: schools.length, variant: 'blue' },
            { label: 'Active', value: schools.filter(s => s.active).length, variant: 'low' },
            { label: 'At Risk Now', value: atRiskSchools.length, variant: atRiskSchools.length > 0 ? 'critical' : 'low' },
            { label: 'Inactive', value: schools.filter(s => !s.active).length, variant: 'medium' },
          ].map(({ label, value, variant }) => (
            <div key={label} className={`stat-card ${variant}`}>
              <span className="stat-label">{label}</span>
              <div className="stat-value">{value}</div>
            </div>
          ))}
        </div>

        {atRiskSchools.length > 0 && (
          <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={16} color="#f87171" />
            <span style={{ fontSize: 13, color: '#f87171', fontWeight: 600 }}>
              {atRiskSchools.length} school{atRiskSchools.length > 1 ? 's are' : ' is'} within range of active incidents — {atRiskSchools.map(s => s.name).join(', ')}
            </span>
          </div>
        )}

        <div className="grid-main-side" style={{ alignItems: 'flex-start' }}>

          {/* Left: form + list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {!showForm ? (
              <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={() => setShowForm(true)}>
                <Plus size={14} /> Register School
              </button>
            ) : (
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Register New School</div>
                  <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => { setShowForm(false); setForm(emptyForm); setFormError(''); setDrawMode('click'); }}>
                    <X size={14} />
                  </button>
                </div>

                {formError && (
                  <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 12, color: '#f87171' }}>
                    {formError}
                  </div>
                )}

                <form onSubmit={handleRegister}>
                  <div className="form-group">
                    <label className="form-label">School / Location Name</label>
                    <input className="form-input" required placeholder="e.g. Government Secondary School, Airport, Stadium..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>

                  {/* Draw mode toggle */}
                  <div className="form-group">
                    <label className="form-label">Location Mode</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" onClick={() => { setDrawMode('rect'); setForm(prev => ({ ...prev, lat: '', lng: '' })); }}
                        style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: `1px solid ${drawMode === 'rect' ? '#3b82f6' : 'var(--border)'}`, background: drawMode === 'rect' ? 'rgba(59,130,246,0.15)' : 'var(--bg-secondary)', color: drawMode === 'rect' ? '#60a5fa' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <Square size={13} /> Draw Rectangle
                      </button>
                      <button type="button" onClick={() => { setDrawMode('click'); setForm(prev => ({ ...prev, lat: '', lng: '' })); }}
                        style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: `1px solid ${drawMode === 'click' ? '#a855f7' : 'var(--border)'}`, background: drawMode === 'click' ? 'rgba(168,85,247,0.15)' : 'var(--bg-secondary)', color: drawMode === 'click' ? '#c084fc' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <MousePointer size={13} /> Pin Point
                      </button>
                    </div>
                  </div>

                  {/* GPS from map click */}
                  <div className="form-group">
                    <label className="form-label">GPS Location {geocoding && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>— detecting place name...</span>}</label>
                    {hasPreview ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '8px 12px' }}>
                        <MapPin size={13} color="#4ade80" />
                        <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 600, flex: 1 }}>
                          {previewLat.toFixed(5)}, {previewLng.toFixed(5)}
                        </span>
                        <button type="button" onClick={() => setForm(prev => ({ ...prev, lat: '', lng: '' }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: drawMode === 'rect' ? 'rgba(59,130,246,0.08)' : 'rgba(124,58,237,0.08)', border: `2px dashed ${drawMode === 'rect' ? 'rgba(59,130,246,0.4)' : 'rgba(124,58,237,0.4)'}`, borderRadius: 8, padding: '12px', color: drawMode === 'rect' ? '#60a5fa' : '#a78bfa', fontSize: 12 }}>
                        {drawMode === 'rect' ? <Square size={14} /> : <MousePointer size={14} />}
                        {drawMode === 'rect' ? 'Click and drag on the map to draw the area' : 'Click anywhere on the map to pin the location'}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Alert Radius: {form.radius}m</label>
                    <input type="range" min="100" max="2000" step="100" value={form.radius}
                      onChange={e => setForm({ ...form, radius: e.target.value })}
                      style={{ width: '100%', accentColor: '#7c3aed' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                      <span>100m</span><span>2000m</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input className="form-input" placeholder="+234..." value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Email</label>
                    <input className="form-input" type="email" placeholder="contact@org.ng" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    <GraduationCap size={14} /> Register Location
                  </button>
                </form>
              </div>
            )}

            {/* School list */}
            {schools.map(school => {
              const nearby = getNearbyIncidents(school, mockIncidents);
              const isAtRisk = nearby.length > 0 && school.active;
              return (
                <div
                  key={school.schoolId}
                  className="card"
                  style={{ cursor: 'pointer', borderLeft: `3px solid ${isAtRisk ? '#dc2626' : school.active ? '#7c3aed' : 'var(--border)'}`, opacity: school.active ? 1 : 0.6 }}
                  onClick={() => setSelected(selected?.schoolId === school.schoolId ? null : school)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <GraduationCap size={16} color={isAtRisk ? '#f87171' : '#a78bfa'} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{school.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{school.schoolId} · Radius: {school.radius}m</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {isAtRisk && <span className="badge-severity critical">AT RISK</span>}
                      <button
                        onClick={e => { e.stopPropagation(); toggleActive(school.schoolId); }}
                        style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600, border: 'none', cursor: 'pointer', background: school.active ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)', color: school.active ? '#4ade80' : 'var(--text-muted)' }}
                      >
                        {school.active ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); if (window.confirm(`Delete "${school.name}"?`)) deleteSchool(school.schoolId); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
                      <Phone size={11} />{school.contact.phone || '—'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
                      <Mail size={11} />{school.contact.email || '—'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
                      <MapPin size={11} />{school.location.lat.toFixed(4)}, {school.location.lng.toFixed(4)}
                    </div>
                  </div>

                  {selected?.schoolId === school.schoolId && nearby.length > 0 && (
                    <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#f87171', marginBottom: 8, textTransform: 'uppercase' }}>
                        ⚠ {nearby.length} Active Incident{nearby.length > 1 ? 's' : ''} Within Radius
                      </div>
                      {nearby.map(inc => (
                        <div key={inc.incidentId} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: severityColor(inc.severity), marginTop: 4, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{inc.incidentId} — {incidentTypeLabel(inc.type)}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              {inc.location.address} · {Math.round(distanceMeters(school.location.lat, school.location.lng, inc.location.lat, inc.location.lng))}m away · {timeAgo(inc.createdAt)}
                            </div>
                          </div>
                          <span className={`badge-severity ${inc.severity}`} style={{ marginLeft: 'auto', flexShrink: 0 }}>{inc.severity}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {selected?.schoolId === school.schoolId && nearby.length === 0 && (
                    <div style={{ marginTop: 10, fontSize: 12, color: '#4ade80' }}>
                      ✓ No active incidents within {school.radius}m radius
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: map */}
          <div style={{ position: 'sticky', top: 80 }}>
            {/* Fullscreen button */}
            <button
              onClick={() => setFullscreen(f => !f)}
              style={{ position: 'absolute', top: 46, right: 10, zIndex: 1001, background: 'rgba(17,24,39,0.85)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600 }}
            >
              {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              {fullscreen ? 'Exit' : 'Fullscreen'}
            </button>
            {showForm && (
              <div style={{ background: drawMode === 'rect' ? 'rgba(59,130,246,0.9)' : 'rgba(124,58,237,0.9)', color: 'white', borderRadius: 20, padding: '7px 16px', fontSize: 12, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                {drawMode === 'rect' ? <Square size={13} /> : <MousePointer size={13} />}
                {drawMode === 'rect'
                  ? hasPreview ? `📍 Area selected — drag again to redraw` : 'Click and drag on the map to draw the area'
                  : hasPreview ? `📍 ${previewLat.toFixed(5)}, ${previewLng.toFixed(5)} — click to reposition` : 'Click on the map to pin the location'
                }
              </div>
            )}

            <div
              className="card"
              style={{
                padding: 0, overflow: 'hidden',
                ...(fullscreen ? { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 2000, borderRadius: 0 } : {})
              }}
            >
              <MapContainer center={[11.8800, 13.1400]} zoom={12} style={{ height: fullscreen ? '100vh' : 560, cursor: showForm ? 'crosshair' : 'grab' }}>
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution='&copy; Esri &mdash; Source: Esri, USGS, NOAA'
                  maxZoom={19}
                />
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                  maxZoom={19}
                  opacity={1}
                />

                <MapClickHandler active={showForm && drawMode === 'click'} onMapClick={handleMapClick} />
                <RectangleDrawer active={showForm && drawMode === 'rect'} color="#7c3aed" onDrawn={handleRectDrawn} />

                {/* New location preview */}
                {showForm && hasPreview && drawMode === 'click' && (
                  <>
                    <CircleMarker center={[previewLat, previewLng]} radius={9} pathOptions={{ color: 'white', fillColor: '#f97316', fillOpacity: 1, weight: 3 }}>
                      <Popup>New location<br />{previewLat.toFixed(5)}, {previewLng.toFixed(5)}</Popup>
                    </CircleMarker>
                    <Circle center={[previewLat, previewLng]} radius={Number(form.radius)} pathOptions={{ color: '#7c3aed', fillColor: '#7c3aed', fillOpacity: 0.1, weight: 1.5, dashArray: '4 3' }} />
                  </>
                )}
                {showForm && hasPreview && drawMode === 'rect' && form.rectPoints && (
                  <Polygon
                    positions={form.rectPoints.map(p => [p.lat, p.lng])}
                    pathOptions={{ color: '#7c3aed', fillColor: '#7c3aed', fillOpacity: 0.18, weight: 2, dashArray: '5 5' }}
                  >
                    <Popup>{form.name || 'New location'}<br />{previewLat.toFixed(5)}, {previewLng.toFixed(5)}</Popup>
                  </Polygon>
                )}

                {/* Registered schools */}
                {schools.filter(s => s.active).map(school => {
                  const nearby = getNearbyIncidents(school, mockIncidents);
                  const isAtRisk = nearby.length > 0;
                  return (
                    <React.Fragment key={school.schoolId}>
                      <Circle
                        center={[school.location.lat, school.location.lng]}
                        radius={school.radius}
                        pathOptions={{ color: isAtRisk ? '#dc2626' : '#7c3aed', fillColor: isAtRisk ? '#dc2626' : '#7c3aed', fillOpacity: isAtRisk ? 0.12 : 0.07, weight: isAtRisk ? 2 : 1.5, dashArray: '4 3' }}
                      />
                      <Marker position={[school.location.lat, school.location.lng]} icon={schoolIcon(isAtRisk)}>
                        <Popup>
                          <div style={{ minWidth: 180 }}>
                            <strong style={{ color: isAtRisk ? '#dc2626' : '#7c3aed' }}>{school.name}</strong>
                            <div style={{ fontSize: 11, marginTop: 4 }}>Radius: {school.radius}m</div>
                            <div style={{ fontSize: 11 }}>{school.contact.email}</div>
                            {isAtRisk && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4, fontWeight: 600 }}>⚠ {nearby.length} incident{nearby.length > 1 ? 's' : ''} nearby</div>}
                          </div>
                        </Popup>
                      </Marker>
                    </React.Fragment>
                  );
                })}

                {/* Active incidents */}
                {mockIncidents.filter(i => i.status !== 'resolved').map(inc => (
                  <Marker
                    key={inc.incidentId}
                    position={[inc.location.lat, inc.location.lng]}
                    icon={L.divIcon({
                      className: '',
                      html: `<div style="width:10px;height:10px;border-radius:50%;background:${severityColor(inc.severity)};border:2px solid white;box-shadow:0 0 6px ${severityColor(inc.severity)}"></div>`,
                      iconSize: [10, 10], iconAnchor: [5, 5],
                    })}
                  >
                    <Popup>
                      <strong>{inc.incidentId}</strong>
                      <div style={{ fontSize: 11 }}>{incidentTypeLabel(inc.type)}</div>
                      <div style={{ fontSize: 11, color: '#666' }}>{inc.location.address}</div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
