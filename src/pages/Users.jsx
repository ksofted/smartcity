import { mockUsers } from '../data/mockData';
import { trustScoreColor } from '../utils/helpers';
import Topbar from '../components/Topbar';
import { UserCheck, UserX, Shield } from 'lucide-react';

export default function Users() {
  return (
    <div>
      <Topbar title="Users" subtitle="Manage reporters, trust scores, and roles" />
      <div className="page-content">

        {/* Summary */}
        <div className="stats-grid" style={{ marginBottom: 20 }}>
          {[
            { label: 'Total Users', value: mockUsers.length, variant: 'blue' },
            { label: 'Trusted Reporters', value: mockUsers.filter(u => u.role === 'trusted_reporter').length, variant: 'cyan' },
            { label: 'Active', value: mockUsers.filter(u => u.status === 'active').length, variant: 'low' },
            { label: 'Suspended', value: mockUsers.filter(u => u.status === 'suspended').length, variant: 'critical' },
          ].map(({ label, value, variant }) => (
            <div key={label} className={`stat-card ${variant}`}>
              <span className="stat-label">{label}</span>
              <div className="stat-value">{value}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">User Registry</div>
            <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 12 }}>
              <Shield size={13} /> Add User
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Trust Score</th>
                <th>Status</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map(user => (
                <tr key={user.userId}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: `linear-gradient(135deg, ${trustScoreColor(user.trustScore)}, #1a2235)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0
                      }}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.userId}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge-role ${user.role}`}>{user.role.replace('_', ' ')}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="trust-bar">
                        <div
                          className="trust-bar-fill"
                          style={{ width: `${user.trustScore}%`, background: trustScoreColor(user.trustScore) }}
                        />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: trustScoreColor(user.trustScore) }}>
                        {user.trustScore}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600,
                      background: user.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(220,38,38,0.1)',
                      color: user.status === 'active' ? '#4ade80' : '#f87171',
                      border: `1px solid ${user.status === 'active' ? 'rgba(34,197,94,0.3)' : 'rgba(220,38,38,0.3)'}`,
                    }}>
                      {user.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{user.email}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 11 }}>
                        <UserCheck size={12} /> Verify
                      </button>
                      <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 11 }}>
                        <UserX size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
