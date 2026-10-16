export default function KPICard({ label, value, delta, up, icon, iconBg, sub, subColor }) {
  return (
    <div className="kpi-card">
      {icon && (
        <div className="kpi-icon" style={{ background: iconBg || '#ede9fe' }}>
          {icon}
        </div>
      )}
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sub ? (
        <div style={{ fontSize: 11, color: subColor || '#9ca3af', marginTop: 4, fontWeight: 500 }}>
          ● {sub}
        </div>
      ) : (
        <div className={`kpi-delta ${up ? 'up' : 'down'}`}>
          {up ? '▲' : '▼'} {delta}
        </div>
      )}
    </div>
  );
}
