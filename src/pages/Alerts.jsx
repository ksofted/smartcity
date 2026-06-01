import { useState } from 'react';
import { mockAlerts, mockIncidents } from '../data/mockData';
import { timeAgo, incidentTypeLabel } from '../utils/helpers';
import Topbar from '../components/Topbar';
import { Bell, BellOff, CheckCheck } from 'lucide-react';

export default function Alerts() {
  const [alerts, setAlerts] = useState(mockAlerts);

  function markAllRead() {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  }

  function markRead(id) {
    setAlerts(prev => prev.map(a => a.alertId === id ? { ...a, read: true } : a));
  }

  const unread = alerts.filter(a => !a.read).length;

  return (
    <div>
      <Topbar title="Alerts" subtitle="System-generated security notifications" />
      <div className="page-content">

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {unread} unread alert{unread !== 1 ? 's' : ''}
          </div>
          <button className="btn btn-ghost" onClick={markAllRead} style={{ fontSize: 12 }}>
            <CheckCheck size={13} /> Mark all read
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {alerts.map(alert => {
            const incident = mockIncidents.find(i => i.incidentId === alert.incidentId);
            return (
              <div
                key={alert.alertId}
                className="card"
                style={{
                  padding: '14px 16px',
                  opacity: alert.read ? 0.6 : 1,
                  borderLeft: `3px solid var(--severity-${alert.severity})`,
                  cursor: 'pointer',
                }}
                onClick={() => markRead(alert.alertId)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ marginTop: 2 }}>
                      {alert.read
                        ? <BellOff size={16} color="var(--text-muted)" />
                        : <Bell size={16} color={`var(--severity-${alert.severity})`} />
                      }
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                        {alert.message}
                      </div>
                      {incident && (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {incidentTypeLabel(incident.type)} — {incident.location.address}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                    <span className={`badge-severity ${alert.severity}`}>{alert.severity}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(alert.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
