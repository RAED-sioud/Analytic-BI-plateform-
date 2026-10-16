export default function Topbar({ title, subtitle, user, onLogout }) {
  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">{title}</div>
        <div className="topbar-subtitle">{subtitle}</div>
      </div>

      <div className="topbar-right">
        {/* Search */}
        <div className="search-bar">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input placeholder="Rechercher…" />
        </div>

        {/* Live badge */}
        <div className="etl-badge">
          <span className="etl-dot" />
          ETL · En direct
        </div>

        {/* User info + logout */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{user.username}</div>
              <div style={{ fontSize: 10, color: '#9ca3af' }}>{user.role}</div>
            </div>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: '#1e3a8a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {user.initials || user.username.slice(0, 2).toUpperCase()}
            </div>
            <button onClick={onLogout} title="Déconnexion" style={{
              background: 'none', border: '1px solid #e5e7eb', borderRadius: 8,
              padding: '5px 8px', cursor: 'pointer', color: '#6b7280', display: 'flex',
              alignItems: 'center', transition: 'all 0.15s',
            }}
              onMouseOver={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.color = '#dc2626'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
