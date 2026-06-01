import { useState } from 'react';
import { mockIncidents } from '../data/mockData';
import { timeAgo, severityColor, incidentTypeLabel } from '../utils/helpers';
import Topbar from '../components/Topbar';
import { X, MapPin, User, Clock, CheckCircle } from 'lucide-react';

export default function Incidents() {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? mockIncidents
    : mockIncidents.filter(i => i.severity === filter || i.status === filter);

  return (
    <div>
      <Topbar title="Incidents" subtitle="All reported and detected incidents" />
      <div className="page-content">

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {['all', 'critical', 'high', 'medium', 'low', 'active', 'investigating', 'resolved'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '6px 14px', fontSize: 12 }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          {/* Table */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <div className="card-title">Incident Log ({filtered.length})</div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Validations</th>
                  <th>Reported</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inc => (
                  <tr
                    key={inc.incidentId}
                    onClick={() => setSelected(inc)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{inc.incidentId}</td>
                    <td>{incidentTypeLabel(inc.type)}</td>
                    <td style={{ maxWidth: 180 }}>{inc.location.address}</td>
                    <td><span className={`badge-severity ${inc.severity}`}>{inc.severity}</span></td>
                    <td><span className={`badge-status ${inc.status}`}>{inc.status}</span></td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{inc.validationCount}</td>
                    <td>{timeAgo(inc.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="card" style={{ width: 320, flexShrink: 0 }}>
              <div className="card-header">
                <div className="card-title">{selected.incidentId}</div>
                <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => setSelected(null)}>
                  <X size={14} />
                </button>
              </div>

              <div style={{ marginBottom: 12 }}>
                <span className={`badge-severity ${selected.severity}`}>{selected.severity}</span>
                {' '}
                <span className={`badge-status ${selected.status}`}>{selected.status}</span>
              </div>

              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
                {selected.description}
              </div>

              {[
                { icon: MapPin, label: 'Location', value: selected.location.address },
                { icon: User, label: 'Reported By', value: selected.reportedBy },
                { icon: Clock, label: 'Time', value: timeAgo(selected.createdAt) },
                { icon: CheckCircle, label: 'Validations', value: `${selected.validationCount} confirmations` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                  <Icon size={14} color="var(--text-muted)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{value}</div>
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Investigate</button>
                <button className="btn btn-ghost">Resolve</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
