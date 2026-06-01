import { useState } from 'react';
import { NIGERIAN_AGENCIES } from '../data/mockData';
import { Shield, CheckCircle, AlertTriangle, ChevronDown } from 'lucide-react';

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT - Abuja','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara',
];

const emptyForm = {
  agencyType: '',
  agencyName: '',
  contactName: '',
  email: '',
  phone: '',
  state: '',
  password: '',
  confirmPassword: '',
};

export default function AgencyRegister() {
  const [form, setForm]         = useState(emptyForm);
  const [step, setStep]         = useState(1); // 1 = pick agency, 2 = fill details
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors]     = useState({});

  const selectedAgency = NIGERIAN_AGENCIES.find(a => a.id === form.agencyType);

  function validate() {
    const e = {};
    if (!form.agencyType)    e.agencyType    = 'Select your agency.';
    if (!form.agencyName.trim()) e.agencyName = 'Enter your command/unit name.';
    if (!form.contactName.trim()) e.contactName = 'Enter contact officer name.';
    if (!form.email.trim())  e.email  = 'Enter official email.';
    if (!form.phone.trim())  e.phone  = 'Enter phone number.';
    if (!form.state)         e.state  = 'Select your state.';
    if (!form.password || form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    setSubmitted(true);
  }

  function Field({ label, name, type = 'text', placeholder, children }) {
    return (
      <div className="form-group">
        <label className="form-label">{label}</label>
        {children || (
          <input
            className="form-input"
            type={type}
            placeholder={placeholder}
            value={form[name]}
            onChange={e => { setForm({ ...form, [name]: e.target.value }); setErrors({ ...errors, [name]: '' }); }}
          />
        )}
        {errors[name] && <div style={{ fontSize: 11, color: '#f87171', marginTop: 4 }}>{errors[name]}</div>}
      </div>
    );
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
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Agency Registration</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-muted)' }}>
            <a href="/agency/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Already registered? Sign in</a>
          </div>
        </div>
      </header>

      <div className="user-content">

        {submitted ? (
          <div className="user-card" style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={32} color="#4ade80" />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Registration Submitted</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 8 }}>
              <strong style={{ color: selectedAgency?.color }}>{selectedAgency?.icon} {form.agencyName}</strong> has been registered.<br />
              Your account is pending verification by the CityAlert system administrator.
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 28 }}>
              You will receive a confirmation email at <strong>{form.email}</strong> once approved.
            </div>
            <a href="/agency/login" className="btn btn-primary" style={{ padding: '10px 28px', textDecoration: 'none' }}>
              Go to Agency Login
            </a>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Agency Registration</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Register your security agency to access the CityAlert command system</div>
            </div>

            {/* Step 1 — Pick agency */}
            {step === 1 && (
              <div className="user-card">
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Select Your Agency</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Choose the Nigerian security force or agency you represent</div>

                {errors.agencyType && (
                  <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 12, color: '#f87171' }}>
                    {errors.agencyType}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                  {NIGERIAN_AGENCIES.map(agency => (
                    <button
                      key={agency.id}
                      type="button"
                      onClick={() => { setForm({ ...form, agencyType: agency.id }); setErrors({ ...errors, agencyType: '' }); }}
                      style={{
                        padding: '12px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                        border: `1px solid ${form.agencyType === agency.id ? agency.color : 'var(--border)'}`,
                        background: form.agencyType === agency.id ? `${agency.color}18` : 'var(--bg-secondary)',
                        transition: 'all 0.15s',
                        display: 'flex', alignItems: 'center', gap: 10,
                      }}
                    >
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{agency.icon}</span>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: form.agencyType === agency.id ? agency.color : 'var(--text-primary)' }}>
                          {agency.short}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.3, marginTop: 1 }}>
                          {agency.name.length > 38 ? agency.name.slice(0, 38) + '…' : agency.name}
                        </div>
                      </div>
                      {form.agencyType === agency.id && (
                        <CheckCircle size={14} color={agency.color} style={{ marginLeft: 'auto', flexShrink: 0 }} />
                      )}
                    </button>
                  ))}
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
                  onClick={() => {
                    if (!form.agencyType) { setErrors({ agencyType: 'Please select your agency.' }); return; }
                    setStep(2);
                  }}
                >
                  Continue →
                </button>
              </div>
            )}

            {/* Step 2 — Fill details */}
            {step === 2 && (
              <div className="user-card">
                {/* Selected agency badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: `${selectedAgency.color}12`, border: `1px solid ${selectedAgency.color}40`, borderRadius: 10, padding: '10px 14px', marginBottom: 20 }}>
                  <span style={{ fontSize: 22 }}>{selectedAgency.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: selectedAgency.color }}>{selectedAgency.short}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{selectedAgency.name}</div>
                  </div>
                  <button type="button" onClick={() => setStep(1)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--text-muted)' }}>
                    Change
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <Field label="Command / Unit Name" name="agencyName" placeholder={`e.g. ${selectedAgency.short} — Borno State Command`} />
                  <Field label="Contact Officer Name" name="contactName" placeholder="Full name and rank" />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field label="Official Email" name="email" type="email" placeholder="name@agency.gov.ng" />
                    <Field label="Phone Number" name="phone" placeholder="+234..." />
                  </div>

                  <div className="form-group">
                    <label className="form-label">State of Operation</label>
                    <select
                      className="form-input form-select"
                      value={form.state}
                      onChange={e => { setForm({ ...form, state: e.target.value }); setErrors({ ...errors, state: '' }); }}
                    >
                      <option value="">Select state...</option>
                      {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.state && <div style={{ fontSize: 11, color: '#f87171', marginTop: 4 }}>{errors.state}</div>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Field label="Password" name="password" type="password" placeholder="Min. 8 characters" />
                    <Field label="Confirm Password" name="confirmPassword" type="password" placeholder="Repeat password" />
                  </div>

                  <div style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 18, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <AlertTriangle size={11} style={{ display: 'inline', marginRight: 5 }} />
                    Registration requires verification by the CityAlert system administrator before access is granted. Use your official government email address.
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(1)}>
                      ← Back
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '11px' }}>
                      <Shield size={14} /> Register Agency
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
