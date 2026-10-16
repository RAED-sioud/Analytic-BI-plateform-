import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import KPICard from '../components/KPICard';
import useApi from '../hooks/useApi';
import FilterBar, { buildQS, defaultFilters } from '../components/FilterBar';
import { niceMax } from '../utils/chart';

function SectionHeader({ title }) {
  return (
    <div className="section-header">
      <div className="section-header-bar" />
      <span className="section-header-text">{title}</span>
      <div className="section-header-line" />
    </div>
  );
}

export default function Tech() {
  const [filters, setFilters] = useState(defaultFilters);
  const qs = buildQS(filters);

  const { data: annees }          = useApi('/api/users/annees', []);
  const { data: kpis }            = useApi(`/api/users/kpis${qs}`,               {});
  const { data: sessionsMonthly } = useApi(`/api/users/sessions-monthly${qs}`,   []);
  const { data: sessionsOS }      = useApi(`/api/users/sessions-os${qs}`,        []);
  const { data: topPages }        = useApi(`/api/users/top-pages${qs}`,          []);
  const { data: sessionsNav }     = useApi(`/api/users/sessions-navigateur${qs}`,[]);
  const { data: sessionsPays }    = useApi(`/api/users/sessions-pays${qs}`,      []);

  const paysMax    = sessionsPays.length  ? sessionsPays[0]?.nb || 1                          : 1;
  const navMax     = sessionsNav.length   ? niceMax(Math.max(...sessionsNav.map(r => r.nb)))   : 200;
  const pagesMax   = topPages.length      ? niceMax(Math.max(...topPages.map(r => r.nb)))      : 200;
  const monthlyMax = sessionsMonthly.length ? niceMax(Math.max(...sessionsMonthly.map(r=>r.nb))): 50;

  return (
    <>
      <div className="page-banner">
        <div>
          <div className="page-banner-title">Analytic BI Plateform | Engagement Utilisateurs</div>
          <div className="page-banner-sub">Sessions · MAU · Bounce · OS · Navigateurs · Pages</div>
        </div>
        <div className="page-banner-right">Données en temps réel<br />Entrepôt PostgreSQL</div>
      </div>

      <FilterBar filters={filters} onChange={setFilters} annees={annees} />

      <SectionHeader title="👥 KPI — ENGAGEMENT UTILISATEURS" />
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <KPICard label="👥 NB SESSIONS"
          value={kpis.nb_sessions ? Number(kpis.nb_sessions).toLocaleString('fr-TN') : '—'}
          sub="Tous canaux" subColor="#9ca3af"
          iconBg="#dbeafe" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} />
        <KPICard label="📊 MAU"
          value={kpis.mau || '—'}
          sub="Actifs ce mois" subColor="#9ca3af"
          iconBg="#d1fae5" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>} />
        <KPICard label="⚠️ BOUNCE %"
          value={kpis.bounce_pct ? `${kpis.bounce_pct}%` : '—'}
          sub="Faible (bon)" subColor="#059669"
          iconBg="#fef3c7" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>} />
        <KPICard label="⏱️ DURÉE MOYENNE"
          value={kpis.duree_moy_min ? `${kpis.duree_moy_min} min` : '—'}
          sub="En minutes" subColor="#9ca3af"
          iconBg="#ede9fe" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} />
      </div>

      <SectionHeader title="📊 ANALYSES COMPORTEMENT" />
      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-card-title">📈 Évolution mensuelle des Sessions</div>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={sessionsMonthly} margin={{ top: 16, right: 20, left: 10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                domain={[0, monthlyMax]} tickCount={5} allowDecimals={false} width={36} />
              <Tooltip formatter={(v) => [v, 'Sessions']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Line type="monotone" dataKey="nb" stroke="#1e3a8a" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">🍩 Sessions par OS</div>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={sessionsOS} cx="50%" cy="45%" innerRadius={60} outerRadius={90}
                dataKey="value" paddingAngle={2} label={false} labelLine={false}>
                {sessionsOS.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
              </Pie>
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12, paddingTop: 4 }}
                formatter={(value, entry) => (
                  <span style={{ color: '#374151' }}>
                    {value}&nbsp;
                    <span style={{ color: '#1e3a8a', fontWeight: 700 }}>{entry.payload.pct}%</span>
                  </span>
                )} />
              <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <div className="chart-card">
          <div className="chart-card-title">🏆 Top Pages Visitées</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topPages} layout="vertical" margin={{ top: 4, right: 44, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                domain={[0, pagesMax]} tickCount={4} allowDecimals={false} />
              <YAxis dataKey="page" type="category" tick={{ fontSize: 10, fill: '#374151' }}
                axisLine={false} tickLine={false} width={60} />
              <Tooltip formatter={(v) => [v, 'Sessions']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="nb" fill="#1e3a8a" radius={[0, 4, 4, 0]}
                label={{ position: 'right', fontSize: 10, fill: '#374151' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">🌍 Sessions par Navigateur</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sessionsNav} margin={{ top: 24, right: 20, left: 10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="nav" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                domain={[0, navMax]} tickCount={5} allowDecimals={false} width={36} />
              <Tooltip formatter={(v) => [v, 'Sessions']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="nb" fill="#1e3a8a" radius={[4, 4, 0, 0]}
                label={{ position: 'top', fontSize: 10, fill: '#374151' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">🗺️ Sessions par Pays</div>
          <div style={{ marginTop: 8 }}>
            {sessionsPays.map((p, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{p.pays}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{p.nb}</span>
                </div>
                <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 4, background: '#1e3a8a',
                    width: `${((p.nb / paysMax) * 100).toFixed(0)}%`,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
