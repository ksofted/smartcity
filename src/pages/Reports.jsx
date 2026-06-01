import { useState } from 'react';
import { timeAgo, incidentTypeLabel } from '../utils/helpers';
import Topbar from '../components/Topbar';
import { Eye, CheckCircle, XCircle, Clock, Image, Video, AlertTriangle, MapPin } from 'lucide-react';

const mockReports = [
  {
    reportId: 'RPT-001',
    type: 'theft',
    description: 'A group of unknown men were seen moving suspiciously near the school fence with bags.',
    location: { address: 'Lamisula Road, near GSS' },
    mediaFiles: [{ name: 'photo1.jpg', type: 'image', size: '1.2MB' }],
    status: 'pending',
    submittedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    anonymous: true,
  },
  {
    reportId: 'RPT-002',
    type: 'crowd_anomaly',
    description: 'Very large crowd gathering at the junction, looks unusual for this time of day.',
    location: { address: 'Monday Market Junction' },
    mediaFiles: [
      { name: 'crowd.jpg', type: 'image', size: '2.1MB' },
      { name: 'clip.mp4', type: 'video', size: '18MB', duration: 45 },
    ],
    status: 'reviewed',
    submittedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    anonymous: false,
    reporterName: 'Hauwa Sule',
  },
  {
    reportId: 'RPT-003',
    type: 'suspicious_vehicle',
    description: 'Abandoned vehicle parked outside the bank for over 3 hours, no driver seen.',
    location: { address: 'Bank Road, Maiduguri' },
    mediaFiles: [{ name: 'vehicle.jpg', type: 'image', size: '900KB' }],
    status: 'escalated',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    anonymous: true,
  },
  {
    reportId: 'RPT-004',
    type: 'general',
    description: 'Heard loud gunshots near the market area around 2pm.',
    location: { address: 'Central Market Area' },
    mediaFiles: [],
    status: 'pending',
    submittedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    anonymous: true,
  },
  {
    reportId: 'RPT-005',
    type: 'armed_individual',
    description: 'Man seen carrying what looked like a weapon near the school gate.',
    location: { address: 'GSS Maiduguri Gate' },
    mediaFiles: [{ name: 'snapshot.jpg', type: 'image', size: '1.8MB' }],
    status: 'pending',
    submittedAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    anonymous: true,
  },
];

const STATUS_STYLES = {
  pending:   { bg: 'rgba(234,179,8,0.1)',   color: '#facc15', border: 'rgba(234,179,8,0.3)' },
  reviewed:  { bg: 'rgba(34,197,94,0.1)',   color: '#4ade80', border: 'rgba(34,197,94,0.3)' },
  escalated: { bg: 'rgba(220,38,38,0.1)',   color: '#f87171', border: 'rgba(220,38,38,0.3)' },
  dismissed: { bg: 'rgba(100,116,139,0.1)', color: '#94a3b8', border: 'rgba(100,116,139,0.2)' },
};

const TYPE_LABELS = {
  theft: 'Theft / Robbery',
  suspicious_person: 'Suspicious Person',
  suspicious_vehicle: 'Suspicious Vehicle',
  crowd_anomaly: 'Unusual Crowd',
  armed_individual: 'Armed Individual',
  abandoned_object: 'Abandoned Object',
  fire_explosion: 'Fire / Explosion',
  general: 'General Activity',
};

export default function Reports() {
  const [reports, setReports] = useState(mockReports);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter);
  const pendingCount = reports.filter(r => r.status === 'pending').length;

  function updateStatus(id, status) {
    setReports(prev => prev.map(r => r.reportId === id ? { ...r, status } : r));
    setSelected(prev => prev?.reportId === id ? { ...prev, status } : prev);
  }

  return (
    <div>
      <Topbar title="Citizen Reports" subtitle="Review and action reports submitted by citizens" />
      <div className="page-content">

        {/* Stats row */}
        <div className="stats-grid" style={{ marginBottom: 20 }}>
          {[
            { label: 'Total Reports', value: reports.length, variant: 'blue' },
            { label: 'Pending Review', value: pendingCount, variant: pendingCount > 0 ? 'high' : 'low' },
            { label: 'Escalated', value: reports.filter(r => r.status === 'escalated').length, variant: 'critical' },
            { label: 'Resolved', value: reports.filter(r => r.status === 'reviewed' || r.status === 'dismissed').length, variant: 'low' },
          ].map(({ label, value, variant }) => (
            <div key={label} className={`stat-card ${variant}`}>
              <span className="stat-label">{label}</span>
              <div className="stat-value">{value}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {['all', 'pending', 'escalated', 'reviewed', 'dismissed'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '6px 14px', fontSize: 12 }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'pending' && pendingCount > 0 && (
                <span style={{ marginLeft: 5, background: '#eab308', color: '#000', borderRadius: 10, fontSize: 10, padding: '1px 6px', fontWeight: 700 }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

          {/* Report list */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: 13 }}>
                No reports in this category.
              </div>
            )}
            {filtered.map(r => {
              const s = STATUS_STYLES[r.status];
              const isSelected = selected?.reportId === r.reportId;
              return (
                <div
                  key={r.reportId}
                  className="card"
                  style={{ padding: '14px 16px', cursor: 'pointer', borderLeft: `3px solid ${s.color}`, transition: 'all 0.15s' }}
                  onClick={() => setSelected(isSelected ? null : r)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 5, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-blue)' }}>{r.reportId}</span>
                        <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontWeight: 600 }}>
                          {r.status}
                        </span>
                        {r.anonymous
                          ? <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'rgba(100,116,139,0.1)', padding: '1px 7px', borderRadius: 20 }}>anonymous</span>
                          : <span style={{ fontSize: 10, color: '#60a5fa', background: 'rgba(59,130,246,0.1)', padding: '1px 7px', borderRadius: 20 }}>{r.reporterName}</span>
                        }
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                        {TYPE_LABELS[r.type] || r.type}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, lineHeight: 1.5 }}>
                        {r.description.length > 100 ? r.description.slice(0, 100) + '…' : r.description}
                      </div>
                      <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={10} />{r.location.address}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10} />{timeAgo(r.submittedAt)}</span>
                      </div>
                    </div>

                    {/* Media badges */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', marginLeft: 12, flexShrink: 0 }}>
                      {r.mediaFiles.filter(m => m.type === 'image').length > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#60a5fa', background: 'rgba(59,130,246,0.1)', padding: '2px 8px', borderRadius: 20 }}>
                          <Image size={10} /> {r.mediaFiles.filter(m => m.type === 'image').length} photo
                        </span>
                      )}
                      {r.mediaFiles.filter(m => m.type === 'video').length > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#a78bfa', background: 'rgba(124,58,237,0.1)', padding: '2px 8px', borderRadius: 20 }}>
                          <Video size={10} /> {r.mediaFiles.filter(m => m.type === 'video').length} video
                        </span>
                      )}
                      {r.mediaFiles.length === 0 && (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>no media</span>
                      )}
                    </div>
                  </div>

                  {/* Expanded */}
                  {isSelected && (
                    <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>
                        {r.description}
                      </div>

                      {r.mediaFiles.length > 0 && (
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Attached Evidence</div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {r.mediaFiles.map((m, i) => (
                              <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
                                {m.type === 'image' ? <Image size={14} color="#60a5fa" /> : <Video size={14} color="#a78bfa" />}
                                <div>
                                  <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{m.name}</div>
                                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.size}{m.duration ? ` · ${m.duration}s` : ''}</div>
                                </div>
                                <button className="btn btn-ghost" style={{ padding: '3px 8px', fontSize: 11, marginLeft: 4 }}>
                                  <Eye size={11} /> View
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button className="btn btn-primary" style={{ fontSize: 12, padding: '7px 14px' }} onClick={e => { e.stopPropagation(); updateStatus(r.reportId, 'reviewed'); }}>
                          <CheckCircle size={12} /> Mark Reviewed
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); updateStatus(r.reportId, 'escalated'); }}
                          style={{ fontSize: 12, padding: '7px 14px', background: 'rgba(220,38,38,0.1)', color: '#f87171', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}
                        >
                          <AlertTriangle size={12} /> Escalate to Incident
                        </button>
                        <button className="btn btn-ghost" style={{ fontSize: 12, padding: '7px 14px' }} onClick={e => { e.stopPropagation(); updateStatus(r.reportId, 'dismissed'); }}>
                          <XCircle size={12} /> Dismiss
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
