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

export default function Business() {
  const [filters, setFilters] = useState(defaultFilters);
  const qs = buildQS(filters);

  const { data: annees }  = useApi('/api/business/annees', []);
  const { data: mrr }     = useApi(`/api/business/mrr${qs}`,               []);
  const { data: plans }   = useApi(`/api/business/plan-distribution${qs}`, []);
  const { data: tickets } = useApi(`/api/support/tickets-categorie${qs}`,  []);
  const { data: devices } = useApi(`/api/users/sessions-device${qs}`,      []);
  const { data: kpis }    = useApi(`/api/business/kpis${qs}`,              {});

  const mrrMax    = mrr.length     ? niceMax(Math.max(...mrr.map(r => r.mrr)))    : 2000;
  const ticketMax = tickets.length ? niceMax(Math.max(...tickets.map(r => r.nb))) : 100;
  const deviceMax = devices.length ? niceMax(Math.max(...devices.map(r => r.nb))) : 300;

  return (
    <>
      <div className="page-banner">
        <div>
          <div className="page-banner-title">Analytic BI Plateform | Vue Exécutive</div>
          <div className="page-banner-sub">Tableau de bord stratégique — Indicateurs clés de performance</div>
        </div>
        <div className="page-banner-right">Données en temps réel<br />Entrepôt PostgreSQL</div>
      </div>

      <FilterBar filters={filters} onChange={setFilters} annees={annees} showPlan={true} />

      <SectionHeader title="📊 KPI — INDICATEURS STRATÉGIQUES" />
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5,1fr)', marginBottom: 24 }}>
        <KPICard label="📈 MRR"
          value={kpis.mrr_total ? `${Number(kpis.mrr_total).toLocaleString('fr-TN')} TND` : '—'}
          delta="+8.3% vs M-1" up={true}
          iconBg="#dbeafe" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} />
        <KPICard label="📉 CHURN %"
          value={kpis.taux_churn ? `${kpis.taux_churn}%` : '—'}
          sub="niveau acceptable" subColor="#059669"
          iconBg="#fee2e2" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>} />
        <KPICard label="😊 CSAT"
          value={kpis.csat || '—'}
          sub="Sous l'objectif (4)" subColor="#d97706"
          iconBg="#fef3c7" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>} />
        <KPICard label="🕐 SLA %"
          value={kpis.sla_pct ? `${kpis.sla_pct}%` : '—'}
          sub="Cible : >95%" subColor="#d97706"
          iconBg="#ede9fe" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} />
        <KPICard label="💻 UPTIME %"
          value={kpis.uptime_pct ? `${kpis.uptime_pct}%` : '—'}
          sub="Cible : >99,5%" subColor="#d97706"
          iconBg="#d1fae5" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>} />
      </div>

      <SectionHeader title="📈 ANALYSES DÉTAILLÉES" />
      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-card-title">📈 Évolution du MRR</div>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={mrr} margin={{ top: 16, right: 20, left: 10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                domain={[0, mrrMax]} tickCount={5} allowDecimals={false}
                tickFormatter={v => `${(v/1000).toFixed(0)}K`} width={40} />
              <Tooltip formatter={(v) => [`${Number(v).toLocaleString('fr-TN')} TND`, 'MRR']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Line type="monotone" dataKey="mrr" stroke="#1e3a8a" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#1e3a8a' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">🍩 Répartition par Plan</div>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={plans} cx="50%" cy="45%" innerRadius={60} outerRadius={90}
                dataKey="value" paddingAngle={2} label={false} labelLine={false}>
                {plans.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
              </Pie>
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12, paddingTop: 4 }}
                formatter={(value, entry) => (
                  <span style={{ color: '#374151' }}>
                    {value}&nbsp;
                    <span style={{ color: '#1e3a8a', fontWeight: 700 }}>{entry.payload.value}</span>
                    <span style={{ color: '#9ca3af', marginLeft: 4 }}>({entry.payload.pct}%)</span>
                  </span>
                )} />
              <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-card-title">📊 Tickets par Catégorie</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={tickets} layout="vertical" margin={{ top: 4, right: 48, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                domain={[0, ticketMax]} tickCount={5} allowDecimals={false} />
              <YAxis dataKey="categorie" type="category" tick={{ fontSize: 11, fill: '#374151' }}
                axisLine={false} tickLine={false} width={110} />
              <Tooltip formatter={(v) => [v, 'Tickets']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="nb" fill="#1e3a8a" radius={[0, 4, 4, 0]}
                label={{ position: 'right', fontSize: 10, fill: '#374151' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">📱 Sessions par Device</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={devices} margin={{ top: 24, right: 20, left: 10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="device" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                domain={[0, deviceMax]} tickCount={5} allowDecimals={false} width={38} />
              <Tooltip formatter={(v) => [v, 'Sessions']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="nb" fill="#1e3a8a" radius={[4, 4, 0, 0]}
                label={{ position: 'top', fontSize: 10, fill: '#374151' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
