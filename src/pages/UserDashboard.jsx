import { useState, useRef, useEffect } from 'react';
import { Shield, MapPin, Send, CheckCircle, AlertTriangle, Image, Video, Trash2, X } from 'lucide-react';

const MAX_VIDEO_SECONDS = 60;

const INCIDENT_TYPES = [
  { value: 'theft',               label: '🔓 Theft / Robbery' },
  { value: 'suspicious_person',   label: '👤 Suspicious Person' },
  { value: 'suspicious_vehicle',  label: '🚗 Suspicious Vehicle' },
  { value: 'crowd_anomaly',       label: '👥 Unusual Crowd Gathering' },
  { value: 'armed_individual',    label: '⚠️ Armed Individual' },
  { value: 'abandoned_object',    label: '📦 Abandoned Object' },
  { value: 'fire_explosion',      label: '🔥 Fire / Explosion' },
  { value: 'general',             label: '📋 Other Suspicious Activity' },
];

const emptyForm = { type: 'theft', description: '', useGPS: true, manualAddress: '' };

export default function UserDashboard() {
  const [form, setForm]             = useState(emptyForm);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [gpsCoords, setGpsCoords]   = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError]     = useState('');
  const [mediaError, setMediaError] = useState('');
  const [submitted, setSubmitted]   = useState(false);
  const [submitError, setSubmitError] = useState('');
  const fileInputRef = useRef();

  // Auto-request GPS on page load
  useEffect(() => {
    if (navigator.geolocation) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        pos => {
          setGpsCoords({ lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) });
          setGpsLoading(false);
        },
        () => {
          setGpsLoading(false);
          setGpsError('Location access denied. You can type your address instead.');
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    }
  }, []);

  function getGPS() {
    setGpsLoading(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGpsCoords({ lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) });
        setGpsLoading(false);
      },
      () => {
        setGpsError('GPS unavailable. Please type your location below.');
        setGpsLoading(false);
        setForm(prev => ({ ...prev, useGPS: false }));
      },
      { timeout: 8000 }
    );
  }

  function handleFileChange(e) {
    setMediaError('');
    const files = Array.from(e.target.files);
    let pending = files.length;
    if (!pending) return;
    const results = [];

    files.forEach(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) {
        setMediaError('Only image or video files are allowed.');
        pending--;
        if (pending === 0) setMediaFiles(prev => [...prev, ...results]);
        return;
      }
      if (isVideo) {
        const url = URL.createObjectURL(file);
        const vid = document.createElement('video');
        vid.preload = 'metadata';
        vid.onloadedmetadata = () => {
          URL.revokeObjectURL(url);
          if (vid.duration > MAX_VIDEO_SECONDS) {
            setMediaError(`"${file.name}" is ${Math.round(vid.duration)}s — videos must be 60 seconds or less.`);
          } else {
            results.push({ name: file.name, kind: 'video', size: file.size, duration: Math.round(vid.duration) });
          }
          pending--;
          if (pending === 0) setMediaFiles(prev => [...prev, ...results]);
        };
        vid.src = url;
      } else {
        const reader = new FileReader();
        reader.onload = ev => {
          results.push({ name: file.name, kind: 'image', size: file.size, preview: ev.target.result });
          pending--;
          if (pending === 0) setMediaFiles(prev => [...prev, ...results]);
        };
        reader.readAsDataURL(file);
      }
    });
    e.target.value = '';
  }

  function removeFile(idx) {
    setMediaFiles(prev => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    if (form.useGPS && !gpsCoords) { setSubmitError('Please capture your GPS location or switch to manual address.'); return; }
    if (!form.useGPS && !form.manualAddress.trim()) { setSubmitError('Please enter your location.'); return; }
    // In production: POST to API Gateway → Lambda → DynamoDB + S3
    setSubmitted(true);
    setForm(emptyForm);
    setMediaFiles([]);
    setGpsCoords(null);
  }

  function formatSize(b) {
    return b < 1048576 ? `${(b / 1024).toFixed(0)}KB` : `${(b / 1048576).toFixed(1)}MB`;
  }

  function reset() {
    setSubmitted(false);
    setForm(emptyForm);
    setMediaFiles([]);
    setGpsCoords(null);
    setGpsError('');
    setMediaError('');
    setSubmitError('');
  }

  return (
    <div className="user-portal">
      {/* Header */}
      <header className="user-header">
        <div className="user-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🛡️</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>CityAlert</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Citizen Reporting Portal</div>
            </div>
          </div>
          <a href="/" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Shield size={13} /> Admin Panel
          </a>
        </div>
      </header>

      <div className="user-content">

        {/* Success screen */}
        {submitted ? (
          <div className="user-card" style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={32} color="#4ade80" />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Report Submitted</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
              The security team has been notified. Your report is being reviewed.
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 28 }}>
              🔒 Your identity and location metadata are fully protected.
            </div>
            <button className="btn btn-primary" onClick={reset} style={{ padding: '10px 28px' }}>
              Submit Another Report
            </button>
          </div>
        ) : (
          <>
            {/* Intro banner */}
            <div className="user-banner">
              <AlertTriangle size={18} color="#f97316" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>See something suspicious? Report it.</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  You can report theft, unusual activity, suspicious persons or vehicles. Attach a photo or short video (max 1 minute) as evidence. Your identity is always protected.
                </div>
              </div>
            </div>

            <div className="user-card">
              {submitError && (
                <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#f87171', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <AlertTriangle size={14} /> {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit}>

                {/* Incident type */}
                <div className="form-group">
                  <label className="form-label">What are you reporting?</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
                    {INCIDENT_TYPES.map(t => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setForm({ ...form, type: t.value })}
                        style={{
                          padding: '9px 12px', borderRadius: 8, border: `1px solid ${form.type === t.value ? '#3b82f6' : 'var(--border)'}`,
                          background: form.type === t.value ? 'rgba(59,130,246,0.12)' : 'var(--bg-secondary)',
                          color: form.type === t.value ? '#60a5fa' : 'var(--text-secondary)',
                          fontSize: 12, fontWeight: 500, cursor: 'pointer', textAlign: 'left',
                          transition: 'all 0.15s',
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">Describe what you saw</label>
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Be specific — how many people, what direction, vehicle colour/type, what time you saw it..."
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    required
                    style={{ minHeight: 110 }}
                  />
                </div>

                {/* Location */}
                <div className="form-group">
                  <label className="form-label">Your Location</label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <button type="button" onClick={() => setForm({ ...form, useGPS: true })} className={`btn ${form.useGPS ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: 12, flex: 1, justifyContent: 'center' }}>
                      <MapPin size={12} /> Use GPS
                    </button>
                    <button type="button" onClick={() => setForm({ ...form, useGPS: false })} className={`btn ${!form.useGPS ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: 12, flex: 1, justifyContent: 'center' }}>
                      Type Address
                    </button>
                  </div>

                  {form.useGPS ? (
                    gpsCoords ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '10px 14px' }}>
                        <MapPin size={13} color="#4ade80" />
                        <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 600, flex: 1 }}>📍 {gpsCoords.lat}, {gpsCoords.lng}</span>
                        <button type="button" onClick={() => setGpsCoords(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={13} /></button>
                      </div>
                    ) : (
                      <div>
                        <button type="button" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }} onClick={getGPS} disabled={gpsLoading}>
                          <MapPin size={13} /> {gpsLoading ? 'Getting your location...' : 'Retry GPS'}
                        </button>
                        {gpsError && <div style={{ fontSize: 11, color: '#f87171', marginTop: 6 }}>{gpsError}</div>}
                      </div>
                    )
                  ) : (
                    <input
                      className="form-input"
                      placeholder="Nearest landmark, street or area name"
                      value={form.manualAddress}
                      onChange={e => setForm({ ...form, manualAddress: e.target.value })}
                    />
                  )}
                </div>

                {/* Media upload */}
                <div className="form-group">
                  <label className="form-label">
                    Attach Evidence
                    <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6, fontSize: 11 }}>photo or video — max 1 minute</span>
                  </label>

                  {mediaError && (
                    <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, padding: '8px 12px', marginBottom: 8, fontSize: 12, color: '#f87171', display: 'flex', gap: 6, alignItems: 'center' }}>
                      <AlertTriangle size={12} /> {mediaError}
                    </div>
                  )}

                  {/* Previews */}
                  {mediaFiles.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                      {mediaFiles.map((f, i) => (
                        <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                          {f.kind === 'image' ? (
                            <img src={f.preview} alt={f.name} style={{ width: 80, height: 80, objectFit: 'cover', display: 'block' }} />
                          ) : (
                            <div style={{ width: 80, height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                              <Video size={22} color="#a78bfa" />
                              <span style={{ fontSize: 10, color: '#a78bfa', fontWeight: 600 }}>{f.duration}s</span>
                            </div>
                          )}
                          <div style={{ padding: '3px 6px', fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>{formatSize(f.size)}</div>
                          <button type="button" onClick={() => removeFile(i)} style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Trash2 size={10} color="white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }} onChange={handleFileChange} />
                  <div
                    onClick={() => fileInputRef.current.click()}
                    style={{ border: '2px dashed var(--border)', borderRadius: 8, padding: '22px', textAlign: 'center', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, transition: 'border-color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 8 }}>
                      <Image size={22} color="#60a5fa" />
                      <Video size={22} color="#a78bfa" />
                    </div>
                    <div style={{ fontWeight: 500 }}>Tap to attach photo or video</div>
                    <div style={{ fontSize: 11, marginTop: 4 }}>JPG · PNG · MP4 · MOV &nbsp;|&nbsp; Video max 60 seconds</div>
                  </div>
                </div>

                {/* Privacy */}
                <div style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 18, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 15 }}>🔒</span>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Your identity is fully protected. All photo/video metadata is stripped before storage. Reports are anonymous by default.
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14 }}>
                  <Send size={15} /> Submit Report to Security Team
                </button>
              </form>
            </div>

            {/* Help section */}
            <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 12 }}>
              {[
                { icon: '📞', title: 'Emergency', desc: 'Call 112 for immediate danger' },
                { icon: '🔒', title: 'Anonymous', desc: 'Your identity is never revealed' },
                { icon: '⚡', title: 'Fast Response', desc: 'Security team alerted instantly' },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>{title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
