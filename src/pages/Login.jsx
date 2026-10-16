import { useState } from 'react';

const ADMIN = { username: 'admin', password: 'admin123', role: 'Administrateur', initials: 'AD' };

const STATS = [
  { icon: '📈', label: 'MRR',    value: '11 896 TND', color: '#60a5fa' },
  { icon: '😊', label: 'CSAT',   value: '2.95 / 5',   color: '#34d399' },
  { icon: '💻', label: 'Uptime', value: '98.25 %',    color: '#a78bfa' },
  { icon: '🕐', label: 'SLA',    value: '92.02 %',    color: '#fbbf24' },
];

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (username.trim() === ADMIN.username && password === ADMIN.password) {
        setError('');
        onLogin(ADMIN);
      } else {
        setError('Identifiants incorrects. Veuillez réessayer.');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="login-root">
      {/* ── LEFT: Form ── */}
      <div className="login-left">
        <div className="login-form-wrap">
          {/* Logo */}
          <div className="login-brand">
            <div className="login-brand-icon">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="8" width="3" height="7" rx="1" fill="white"/>
                <rect x="6" y="5" width="3" height="10" rx="1" fill="white"/>
                <rect x="11" y="2" width="3" height="13" rx="1" fill="white"/>
              </svg>
            </div>
            <div>
              <div className="login-brand-name">Analytic BI Plateform</div>
              <div className="login-brand-sub">Analytics Platform</div>
            </div>
          </div>

          <div className="login-heading">Bon retour 👋</div>
          <div className="login-sub">Connectez-vous à votre espace analytique</div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="login-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <div className="login-field">
              <label>Nom d'utilisateur</label>
              <div className="login-input-wrap">
                <svg className="login-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input
                  type="text"
                  placeholder="Entrez votre identifiant"
                  value={username}
                  autoComplete="username"
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label>Mot de passe</label>
              <div className="login-input-wrap">
                <svg className="login-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  autoComplete="current-password"
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="login-eye" onClick={() => setShowPwd(p => !p)}>
                  {showPwd
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? (
                <span className="login-spinner" />
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                  Se connecter
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="login-demo">
            <div className="login-demo-title">Compte de démonstration</div>
            <div className="login-demo-grid">
              <button className="login-demo-chip"
                onClick={() => { setUsername(ADMIN.username); setPassword(ADMIN.password); setError(''); }}>
                <span className="login-demo-avatar">{ADMIN.initials}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 11 }}>{ADMIN.username}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af' }}>{ADMIN.role}</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Visual ── */}
      <div className="login-right">
        <div className="login-right-content">
          {/* Brand */}
          <div className="login-right-brand">
            <div className="login-right-icon">
              <svg width="36" height="36" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="8" width="3" height="7" rx="1" fill="white"/>
                <rect x="6" y="5" width="3" height="10" rx="1" fill="white"/>
                <rect x="11" y="2" width="3" height="13" rx="1" fill="white"/>
              </svg>
            </div>
            <h1 className="login-right-title">Analytic BI Plateform</h1>
            <p className="login-right-tagline">
              Transformez vos données en<br />décisions stratégiques
            </p>
          </div>

          {/* Live KPI cards */}
          <div className="login-kpi-grid">
            {STATS.map((s, i) => (
              <div key={i} className="login-kpi-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="login-kpi-icon" style={{ color: s.color }}>{s.icon}</div>
                <div className="login-kpi-value" style={{ color: s.color }}>{s.value}</div>
                <div className="login-kpi-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="login-features">
            {['Entrepôt PostgreSQL', '5 Dashboards interactifs', 'Prédiction ML · XGBoost', 'Données en temps réel'].map((f, i) => (
              <div key={i} className="login-feature-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {f}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="login-right-footer">
            2026 · ISIMA · RAED SIOUD
          </div>
        </div>
      </div>
    </div>
  );
}
