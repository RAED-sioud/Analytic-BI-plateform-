import { useState } from 'react';

const NAV_ITEMS = [
  {
    id: 'business', label: 'Vue Exécutive',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  },
  {
    id: 'users', label: 'Monétisation',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  },
  {
    id: 'tech', label: 'Engagement',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    id: 'support', label: 'Support Client',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
  {
    id: 'performance', label: 'Performance',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
  },
  {
    id: 'prediction', label: 'Prédiction ML',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>,
    isNew: true,
  },
];

export default function Sidebar({ activePage, onNavigate }) {
  const [promoVisible, setPromoVisible] = useState(true);

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: '#4f46e5', borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="8" width="3" height="7" rx="1" fill="white"/>
              <rect x="6" y="5" width="3" height="10" rx="1" fill="white"/>
              <rect x="11" y="2" width="3" height="13" rx="1" fill="white"/>
            </svg>
          </div>
          <div>
            <div className="sidebar-logo-title">Analytic BI Plateform</div>
            <div className="sidebar-logo-sub">Analytics Platform</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Dashboards</div>
        {NAV_ITEMS.map(item => (
          <div
            key={item.id}
            className={`sidebar-nav-item${activePage === item.id ? ' active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            {item.label}
            {item.isNew && <span className="sidebar-badge new-badge">New</span>}
          </div>
        ))}
      </nav>

      {/* Promo */}
      {promoVisible && (
        <div className="sidebar-promo">
          <button className="sidebar-promo-close" onClick={() => setPromoVisible(false)}>×</button>
          <div className="sidebar-promo-tag">PFE 2025</div>
          <div className="sidebar-promo-title">Prédiction ML activée</div>
          <div className="sidebar-promo-sub">Rég. Log. · AUC 0.54 · F1 0.71</div>
          <button className="sidebar-promo-btn" onClick={() => onNavigate('prediction')}>
            Explorer ↗
          </button>
        </div>
      )}
    </aside>
  );
}
