import { mockStats, mockAlerts, mockIncidents, mockChartData } from '../data/mockData';
import { timeAgo, severityColor, incidentTypeLabel } from '../utils/helpers';
import Topbar from '../components/Topbar';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { AlertTriangle, CheckCircle, Shield, Users, Clock, Activity } from 'lucide-react';

const statCards = [
  { label: 'Active Alerts', value: mockStats.activeAlerts, sub: 'Requires attention', variant: 'critical', icon: AlertTriangle },
  { label: 'Total Incidents', value: mockStats.totalIncidents, sub: 'This week', variant: 'high', icon: Activity },
  { label: 'Resolved Today', value: mockStats.resolvedToday, sub: 'Closed incidents', variant: 'low', icon: CheckCircle },
  { label: 'Geofence Violations', value: mockStats.geofenceViolations, sub: 'Active breaches', variant: 'medium', icon: Shield },
  { label: 'Trusted Reporters', value: mockStats.trustedReporters, sub: 'Verified users', variant: 'blue', icon: Users },
  { label: 'Avg Response', value: mockStats.avgResponseTime, sub: 'Response time', variant: 'cyan', icon: Clock },
];

export default function Dashboard() {
  const unreadAlerts = mockAlerts.filter(a => !a.read);
  const activeIncidents = mockIncidents.filter(i => i.status === 'active');

  return (
    <div>
      <Topbar title="Security Dashboard" subtitle="Real-time city monitoring overview" />
      <div className="page-content">

        {/* Stats */}
        <div className="stats-grid">
          {statCards.map(({ label, value, sub, variant, icon: Icon }) => (
            <div key={label} className={`stat-card ${variant}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="stat-label">{label}</span>
                <Icon size={16} color="var(--text-muted)" />
              </div>
              <div className="stat-value">{value}</div>
              <div className="stat-sub">{sub}</div>
            </div>
          ))}
        </div>

        <div className="grid-main-side">
          {/* Chart */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Incident Trend</div>
                <div className="card-subtitle">Last 7 days — incidents vs resolved</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={mockChartData}>
                <defs>
                  <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="resGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,95,0.5)" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a2235', border: '1px solid #1e3a5f', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="incidents" stroke="#f97316" strokeWidth={2} fill="url(#incGrad)" name="Incidents" />
                <Area type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} fill="url(#resGrad)" name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Alert Feed */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Live Alerts</div>
                <div className="card-subtitle">{unreadAlerts.length} unread</div>
              </div>
              <span className="badge-severity critical">LIVE</span>
            </div>
            {mockAlerts.map(alert => (
              <div key={alert.alertId} className="alert-item">
                <div className={`alert-dot ${alert.severity}`} />
                <div className="alert-content">
                  <div className="alert-msg" style={{ opacity: alert.read ? 0.6 : 1 }}>{alert.message}</div>
                  <div className="alert-time">{timeAgo(alert.createdAt)}</div>
                </div>
                {!alert.read && (
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', marginTop: 6, flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Active Incidents Table */}
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Active Incidents</div>
              <div className="card-subtitle">{activeIncidents.length} incidents requiring attention</div>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Location</th>
                <th>Severity</th>
                <th>Validations</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {activeIncidents.map(inc => (
                <tr key={inc.incidentId}>
                  <td style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{inc.incidentId}</td>
                  <td>{incidentTypeLabel(inc.type)}</td>
                  <td>{inc.location.address}</td>
                  <td><span className={`badge-severity ${inc.severity}`}>{inc.severity}</span></td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{inc.validationCount}</td>
                  <td><span className={`badge-status ${inc.status}`}>{inc.status}</span></td>
                  <td>{timeAgo(inc.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
