import { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, CircleMarker, Polyline } from 'react-leaflet';
import { mockGeofences } from '../data/mockData';
import Topbar from '../components/Topbar';
import MapClickHandler from '../components/Map/MapClickHandler';
import RectangleDrawer from '../components/Map/RectangleDrawer';
import { Shield, Plus, ToggleLeft, ToggleRight, X, Trash2, MousePointer, Square, Maximize2, Minimize2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const COLORS = ['#3b82f6', '#ef4444', '#f97316', '#22c55e', '#a855f7', '#eab308'];
const emptyForm = { name: '', type: 'restricted', color: '#ef4444', points: [] };
// drawMode: 'click' = add points by clicking, 'rect' = drag to draw rectangle

export default function Geofences() {
  const [zones, setZones]         = useState(mockGeofences);
  const [selected, setSelected]   = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [drawMode, setDrawMode]   = useState('click');
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setFullscreen(false); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function toggleZone(id) {
    setZones(prev => prev.map(z => z.geofenceId === id ? { ...z, active: !z.active } : z));
  }

  function deleteZone(id) {
    setZones(prev => prev.filter(z => z.geofenceId !== id));
    setSelected(prev => prev?.geofenceId === id ? null : prev);
  }

  // Called by MapClickHandler when form is open (click mode)
  function handleMapClick(lat, lng) {
    if (drawMode !== 'click') return;
    setForm(prev => ({ ...prev, points: [...prev.points, { lat, lng }] }));
  }

  // Called by RectangleDrawer when drag is complete
  const handleRectDrawn = useCallback((pts, placeName) => {
    setForm(prev => ({
      ...prev,
      points: pts,
      // Auto-fill name only if user hasn't typed one yet
      name: prev.name.trim() === '' && placeName ? placeName : prev.name,
    }));
    setFormError('');
  }, []);

  function removePoint(idx) {
    setForm(prev => ({ ...prev, points: prev.points.filter((_, i) => i !== idx) }));
  }

  function clearPoints() {
    setForm(prev => ({ ...prev, points: [] }));
  }

  const previewCoords = form.points.map(p => [p.lat, p.lng]);

  function handleAdd(e) {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) { setFormError('Zone name is required.'); return; }
    if (previewCoords.length < 3) { setFormError('Click at least 3 points on the map to define the zone boundary.'); return; }

    setZones(prev => [...prev, {
      geofenceId: `GEO-${String(prev.length + 1).padStart(3, '0')}`,
      name: form.name.trim(),
      type: form.type,
      active: true,
      coordinates: previewCoords,
      color: form.color,
    }]);
    setForm(emptyForm);
    setFormError('');
    setShowForm(false);
  }

  function closeForm() {
    setShowForm(false);
    setForm(emptyForm);
    setFormError('');
    setDrawMode('click');
  }

  return (
    <div>
      <Topbar title="Geofences" subtitle="Manage city boundaries and restricted zones" />
      <div className="page-content">
        <div className="grid-main-side" style={{ alignItems: 'flex-start' }}>

          {/* Map */}
          <div style={{ position: 'relative' }}>
            {/* Fullscreen button */}
            <button
              onClick={() => setFullscreen(f => !f)}
              style={{ position: 'absolute', top: 10, right: 10, zIndex: 1001, background: 'rgba(17,24,39,0.85)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600 }}
            >
              {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              {fullscreen ? 'Exit' : 'Fullscreen'}
            </button>
            {showForm && (
              <div style={{
                position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
                zIndex: 1000, background: drawMode === 'rect' ? 'rgba(59,130,246,0.92)' : 'rgba(124,58,237,0.92)', color: 'white',
                padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 6, pointerEvents: 'none',
                boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
              }}>
                {drawMode === 'rect'
                  ? <><Square size={13} /> Click and drag on the map to draw a rectangle</>  
                  : <><MousePointer size={13} /> Click on the map to add boundary points ({form.points.length} added)</>
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
              <MapContainer center={[11.8700, 13.1300]} zoom={11} style={{ height: fullscreen ? '100vh' : 520, cursor: showForm ? 'crosshair' : 'grab' }}>
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
                <RectangleDrawer active={showForm && drawMode === 'rect'} color={form.color} onDrawn={handleRectDrawn} />

                {/* Saved zones */}
                {zones.filter(z => z.active).map(zone => (
                  <Polygon
                    key={zone.geofenceId}
                    positions={zone.coordinates}
                    pathOptions={{
                      color: zone.color,
                      fillColor: zone.color,
                      fillOpacity: selected?.geofenceId === zone.geofenceId ? 0.25 : 0.1,
                      weight: selected?.geofenceId === zone.geofenceId ? 3 : 2,
                      dashArray: zone.type === 'restricted' ? '6 4' : null,
                    }}
                    eventHandlers={{ click: () => setSelected(zone) }}
                  >
                    <Popup><strong>{zone.name}</strong><br />Type: {zone.type}</Popup>
                  </Polygon>
                ))}

                {/* Live preview polygon */}
                {showForm && previewCoords.length >= 3 && (
                  <Polygon
                    positions={previewCoords}
                    pathOptions={{ color: form.color, fillColor: form.color, fillOpacity: 0.18, weight: 2, dashArray: '5 5' }}
                  />
                )}

                {/* Preview line when < 3 points */}
                {showForm && previewCoords.length === 2 && (
                  <Polyline positions={previewCoords} pathOptions={{ color: form.color, weight: 2, dashArray: '5 5' }} />
                )}

                {/* Clicked point markers */}
                {showForm && previewCoords.map(([lat, lng], i) => (
                  <CircleMarker
                    key={i}
                    center={[lat, lng]}
                    radius={6}
                    pathOptions={{ color: 'white', fillColor: form.color, fillOpacity: 1, weight: 2 }}
                  >
                    <Popup>Point {i + 1}: {lat.toFixed(5)}, {lng.toFixed(5)}</Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Right panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                Defined Zones ({zones.length})
              </div>
              {!showForm && (
                <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setShowForm(true)}>
                  <Plus size={13} /> Add Zone
                </button>
              )}
            </div>

            {/* Add Zone Form */}
            {showForm && (
              <div className="card">
                <div className="card-header">
                  <div className="card-title">New Geofence Zone</div>
                  <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={closeForm}>
                    <X size={14} />
                  </button>
                </div>

                {formError && (
                  <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 12, color: '#f87171' }}>
                    {formError}
                  </div>
                )}

                <form onSubmit={handleAdd}>
                  <div className="form-group">
                    <label className="form-label">Zone Name</label>
                    <input className="form-input" placeholder="e.g. Market Restricted Zone" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Zone Type</label>
                    <select className="form-input form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                      <option value="restricted">Restricted Zone</option>
                      <option value="boundary">City Boundary</option>
                      <option value="monitoring">Monitoring Zone</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Zone Color</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {COLORS.map(c => (
                        <div key={c} onClick={() => setForm({ ...form, color: c })} style={{
                          width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer',
                          border: form.color === c ? '3px solid white' : '2px solid transparent',
                          boxShadow: form.color === c ? `0 0 8px ${c}` : 'none', transition: 'all 0.15s',
                        }} />
                      ))}
                    </div>
                  </div>

                  {/* Draw mode toggle */}
                  <div className="form-group">
                    <label className="form-label">Drawing Mode</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => { setDrawMode('rect'); clearPoints(); }}
                        style={{
                          flex: 1, padding: '8px 10px', borderRadius: 8, border: `1px solid ${drawMode === 'rect' ? '#3b82f6' : 'var(--border)'}`,
                          background: drawMode === 'rect' ? 'rgba(59,130,246,0.15)' : 'var(--bg-secondary)',
                          color: drawMode === 'rect' ? '#60a5fa' : 'var(--text-secondary)',
                          cursor: 'pointer', fontSize: 12, fontWeight: 600,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        }}
                      >
                        <Square size={13} /> Drag Rectangle
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDrawMode('click'); clearPoints(); }}
                        style={{
                          flex: 1, padding: '8px 10px', borderRadius: 8, border: `1px solid ${drawMode === 'click' ? '#a855f7' : 'var(--border)'}`,
                          background: drawMode === 'click' ? 'rgba(168,85,247,0.15)' : 'var(--bg-secondary)',
                          color: drawMode === 'click' ? '#c084fc' : 'var(--text-secondary)',
                          cursor: 'pointer', fontSize: 12, fontWeight: 600,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        }}
                      >
                        <MousePointer size={13} /> Click Points
                      </button>
                    </div>
                  </div>

                  {/* Points list */}
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <label className="form-label" style={{ margin: 0 }}>
                        Boundary Points
                        <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>(click map to add)</span>
                      </label>
                      {form.points.length > 0 && (
                        <button type="button" className="btn btn-ghost" style={{ padding: '3px 8px', fontSize: 11 }} onClick={clearPoints}>
                          Clear all
                        </button>
                      )}
                    </div>

                    {form.points.length === 0 ? (
                      <div style={{ border: '2px dashed var(--border)', borderRadius: 8, padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                        {drawMode === 'rect'
                          ? <><Square size={16} style={{ margin: '0 auto 6px', display: 'block' }} />Click and drag on the map to draw a rectangle</>  
                          : <><MousePointer size={16} style={{ margin: '0 auto 6px', display: 'block' }} />Click anywhere on the map to start adding points</>
                        }
                      </div>
                    ) : (
                      <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {form.points.map((pt, idx) => (
                          <div key={idx} style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: 'var(--bg-secondary)', borderRadius: 6, padding: '5px 10px',
                          }}>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: form.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                              {idx + 1}
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--text-secondary)', flex: 1 }}>
                              {pt.lat.toFixed(5)}, {pt.lng.toFixed(5)}
                            </span>
                            <button type="button" onClick={() => removePoint(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {form.points.length >= 3 && (
                      <div style={{ fontSize: 11, color: '#4ade80', marginTop: 6 }}>
                        ✓ {form.points.length} points — polygon preview visible on map
                      </div>
                    )}
                    {form.points.length > 0 && form.points.length < 3 && (
                      <div style={{ fontSize: 11, color: '#facc15', marginTop: 6 }}>
                        {3 - form.points.length} more point{3 - form.points.length > 1 ? 's' : ''} needed
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                      <Shield size={13} /> Save Zone
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={closeForm}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* Zone cards */}
            {zones.map(zone => (
              <div
                key={zone.geofenceId}
                className="card"
                style={{
                  cursor: 'pointer', padding: 14,
                  border: selected?.geofenceId === zone.geofenceId ? `1px solid ${zone.color}` : '1px solid var(--border)',
                }}
                onClick={() => setSelected(prev => prev?.geofenceId === zone.geofenceId ? null : zone)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <Shield size={16} color={zone.color} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{zone.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {zone.type === 'restricted' ? '🔴 Restricted' : zone.type === 'boundary' ? '🔵 Boundary' : '🟡 Monitoring'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button onClick={e => { e.stopPropagation(); toggleZone(zone.geofenceId); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: zone.active ? '#22c55e' : 'var(--text-muted)' }}>
                      {zone.active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); if (window.confirm(`Delete "${zone.name}"?`)) deleteZone(zone.geofenceId); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                      title="Delete zone"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: zone.active ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)', color: zone.active ? '#4ade80' : 'var(--text-muted)', border: `1px solid ${zone.active ? 'rgba(34,197,94,0.3)' : 'rgba(100,116,139,0.2)'}` }}>
                    {zone.active ? 'Active' : 'Inactive'}
                  </span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)' }}>
                    {zone.coordinates.length} points
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
