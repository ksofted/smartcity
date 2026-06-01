import { useState } from 'react';
import { mockAgencies, NIGERIAN_AGENCIES } from '../data/mockData';
import { Shield, Plus, X, Trash2, UserCheck, Users, Bell, LogOut, CheckCircle, AlertTriangle } from 'lucide-react';

// Simulate logged-in agency (in production this comes from Cognito JWT)
const LOGGED_IN_AGENCY_ID = 'AGY-001';

const emptyAdminForm = { name: '', email: '', role: 'agency_admin' };

export default function AgencyDashboard() {
  const [agencies, setAgencies] = useState(mockAgencies);
  const [showForm, setShowForm] = useState(false);
  const [adminForm, setAdminForm] = useState(emptyAdminForm);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('admins');

  const agency = agencies.find(a => a.agencyId === LOGGED_IN_AGENCY_ID);
  const agencyMeta = NIGERIAN_AGENCIES.find(a => a.id === agency?.agencyType);

  function addAdmin(e) {
    e.preventDefault();
    setFormError('');
    if (!adminForm.name.trim()) { setFormError('Enter admin name.'); return; }
    if (!adminForm.email.trim() || !adminForm.email.includes('@')) { setFormError('Enter a valid email.'); return; }
    if (agency.admins.some(a => a.email === adminForm.email)) { setFormError('This email is already registered.'); return; }

    const newAdmin = {
      adminId: `ADM-${String(Date.now()).slice(-4)}`,
      name: adminForm.name,
      email: adminForm.email,
      role: adminForm.role,
      addedAt: new Date().toISOString(),
    };

    setAgencies(prev => prev.map(ag =>
      ag.agencyId === LOGGED_IN_AGENCY_ID
        ? { ...ag, admins: [...ag.admins, newAdmin] }
        : ag
    ));
    setAdminForm(emptyAdminForm);
    setShowForm(false);
    setSuccessMsg(`${newAdmin.name} has been added as an admin.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  }

  function removeAdmin(adminId) {
    if (!window.confirm('Remove this admin?')) return;
    setAgencies(prev => prev.map(ag =>
      ag.agencyId === LOGGED_IN_AGENCY_ID
        ? { ...ag, admins: ag.admins.filter(a => a.adminId !== adminId) }
        : ag
    ));
  }

  function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  if (!agency) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Agency not found.</div>;

  const TABS = [
    { key: 'admins', label: 'Admins', icon: Users },
    { key: 'alerts', label: 'Alerts', icon: Bell },
    { key: 'profile', label: 'Profile', icon: Shield },
  ];

  return (
    <div className="user-portal">
      {/* Header */}
      <header className="user-header">
        <div style={{ maxWidth: 900, width: '100%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${agencyMeta?.color}, #0a0e1a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              {agencyMeta?.icon}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{agency.agencyName}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{agencyMeta?.name} · {agency.state} State</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 20, background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)', fontWeight: 600 }}>
              ● Active
            </span>
            <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 10px' }}>
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px 48px', width: '100%' }}>

        {/* Agency info banner */}
        <div style={{ background: `${agencyMeta?.color}10`, border: `1px solid ${agencyMeta?.color}30`, borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 32 }}>{agencyMeta?.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: agencyMeta?.color }}>{agency.agencyName}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Contact: {agency.contactName} &nbsp;·&nbsp; {agency.email} &nbsp;·&nbsp; {agency.phone}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
            {[
              { label: 'Admins', value: agency.admins.length },
              { label: 'State', value: agency.state },
              { label: 'Status', value: agency.status },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, marginBottom: 24, width: 'fit-content' }}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                padding: '8px 20px', borderRadius: 7, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
                background: activeTab === key ? agencyMeta?.color : 'transparent',
                color: activeTab === key ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* ── Admins Tab ── */}
        {activeTab === 'admins' && (
          <div>
            {successMsg && (
              <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#4ade80', display: 'flex', gap: 8, alignItems: 'center' }}>
                <CheckCircle size={14} /> {successMsg}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Agency Admins</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Admins have access to the CityAlert command dashboard for {agencyMeta?.short}
                </div>
              </div>
              {!showForm && (
                <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => setShowForm(true)}>
                  <Plus size={13} /> Add Admin
                </button>
              )}
            </div>

            {/* Add admin form */}
            {showForm && (
              <div className="user-card" style={{ marginBottom: 16, border: `1px solid ${agencyMeta?.color}40` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Add New Admin</div>
                  <button className="btn btn-ghost" style={{ padding: '4px 8px' }} onClick={() => { setShowForm(false); setFormError(''); setAdminForm(emptyAdminForm); }}>
                    <X size={14} />
                  </button>
                </div>

                {formError && (
                  <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 12, color: '#f87171', display: 'flex', gap: 6, alignItems: 'center' }}>
                    <AlertTriangle size={12} /> {formError}
                  </div>
                )}

                <form onSubmit={addAdmin}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">Full Name & Rank</label>
                      <input className="form-input" placeholder="e.g. Insp. Amina Bello" value={adminForm.name} onChange={e => setAdminForm({ ...adminForm, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Official Email</label>
                      <input className="form-input" type="email" placeholder="name@agency.gov.ng" value={adminForm.email} onChange={e => setAdminForm({ ...adminForm, email: e.target.value })} required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Access Role</label>
                    <select className="form-input form-select" value={adminForm.role} onChange={e => setAdminForm({ ...adminForm, role: e.target.value })}>
                      <option value="agency_admin">Agency Admin — Full dashboard access</option>
                      <option value="agency_viewer">Agency Viewer — Read-only access</option>
                      <option value="agency_responder">Agency Responder — Can action incidents</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                      <UserCheck size={13} /> Add Admin
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setAdminForm(emptyAdminForm); setFormError(''); }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Admins list */}
            {agency.admins.length === 0 ? (
              <div className="user-card" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: 13 }}>
                No admins added yet. Click "Add Admin" to get started.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {agency.admins.map(admin => (
                  <div key={admin.adminId} className="user-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg, ${agencyMeta?.color}, #1a2235)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                      {admin.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{admin.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{admin.email}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)', fontWeight: 600 }}>
                        {admin.role.replace('agency_', '').replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Added {timeAgo(admin.addedAt)}</span>
                      <button
                        onClick={() => removeAdmin(admin.adminId)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex', alignItems: 'center' }}
                        title="Remove admin"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Alerts Tab ── */}
        {activeTab === 'alerts' && (
          <div className="user-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Bell size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Agency Alerts</div>
            <div style={{ fontSize: 13 }}>Security alerts relevant to {agencyMeta?.short} will appear here once the system is connected to live data.</div>
          </div>
        )}

        {/* ── Profile Tab ── */}
        {activeTab === 'profile' && (
          <div className="user-card">
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Agency Profile</div>
            {[
              { label: 'Agency', value: agencyMeta?.name },
              { label: 'Command / Unit', value: agency.agencyName },
              { label: 'Contact Officer', value: agency.contactName },
              { label: 'Email', value: agency.email },
              { label: 'Phone', value: agency.phone },
              { label: 'State', value: agency.state },
              { label: 'Status', value: agency.status },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', gap: 16, padding: '10px 0', borderBottom: '1px solid rgba(30,58,95,0.4)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', width: 130, flexShrink: 0 }}>{label}</div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{value}</div>
              </div>
            ))}
            <button className="btn btn-ghost" style={{ marginTop: 16, fontSize: 12 }}>Edit Profile</button>
          </div>
        )}
      </div>
    </div>
  );
}
