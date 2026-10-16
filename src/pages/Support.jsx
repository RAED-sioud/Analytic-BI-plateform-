import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, ResponsiveContainer,
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

export default function Support() {
  const [filters, setFilters] = useState(defaultFilters);
  const qs = buildQS(filters);

  const { data: annees }    = useApi('/api/support/annees', []);
  const { data: kpis }      = useApi(`/api/support/kpis${qs}`,              {});
  const { data: csat }      = useApi(`/api/support/csat-categorie${qs}`,    []);
  const { data: priorite }  = useApi(`/api/support/tickets-priorite${qs}`,  []);
  const { data: categorie } = useApi(`/api/support/tickets-categorie${qs}`, []);
  const { data: delai }     = useApi(`/api/support/delai-priorite${qs}`,    []);

  const csatMax  = csat.length      ? niceMax(Math.max(...csat.map(r => r.csat)))   : 5;
  const delaiMax = delai.length     ? niceMax(Math.max(...delai.map(r => r.delai))) : 300;
  const catMax   = categorie.length ? niceMax(Math.max(...categorie.map(r => r.nb))): 100;

  return (
    <>
      <div className="page-banner">
        <div>
          <div className="page-banner-title">Analytic BI Plateform | Support Client</div>
          <div className="page-banner-sub">Tickets · CSAT · SLA · Délais de résolution · Priorités</div>
        </div>
        <div className="page-banner-right">Données en temps réel<br />Entrepôt PostgreSQL</div>
      </div>

      <FilterBar filters={filters} onChange={setFilters} annees={annees} showCategorie={true} showPriorite={true} />

      <SectionHeader title="🎧 KPI — SUPPORT CLIENT" />
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <KPICard label="🎫 NB TICKETS"
          value={kpis.total_tickets || '—'}
          sub="Total ouverts" subColor="#9ca3af"
          iconBg="#dbeafe" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>} />
        <KPICard label="✅ TAUX RÉSOLUTION"
          value={kpis.taux_resolution_pct ? `${kpis.taux_resolution_pct}%` : '—'}
          sub="Cible : >85%" subColor="#d97706"
          iconBg="#d1fae5" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>} />
        <KPICard label="🚨 NB CRITIQUES"
          value={kpis.critiques || '—'}
          sub="À traiter" subColor="#dc2626"
          iconBg="#fee2e2" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>} />
        <KPICard label="⏰ DÉLAI RÉSOLUTION"
          value={kpis.delai_moyen_h || '—'}
          sub="En heures" subColor="#9ca3af"
          iconBg="#ede9fe" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} />
      </div>

      <SectionHeader title="📋 ANALYSES TICKETS" />
      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-card-title">😊 CSAT par Catégorie</div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={csat} margin={{ top: 24, right: 20, left: 10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="categorie" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                domain={[0, csatMax]} tickCount={5} allowDecimals={false} width={30} />
              <Tooltip formatter={(v) => [`${v}/5`, 'CSAT']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="csat" fill="#1e3a8a" radius={[4, 4, 0, 0]}
                label={{ position: 'top', fontSize: 10, fill: '#374151' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">🍩 Tickets par Priorité</div>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={priorite} cx="50%" cy="45%" innerRadius={60} outerRadius={90}
                dataKey="value" paddingAngle={2} label={false} labelLine={false}>
                {priorite.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
              </Pie>
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12, paddingTop: 4 }}
                formatter={(value, entry) => (
                  <span style={{ color: '#374151' }}>
                    {value}&nbsp;
                    <span style={{ color: '#111827', fontWeight: 700 }}>{entry.payload.value}</span>
                    <span style={{ color: '#9ca3af', marginLeft: 4 }}>({entry.payload.pct}%)</span>
                  </span>
                )} />
              <Tooltip formatter={(v) => [v, 'Tickets']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-card-title">📊 Tickets par Catégorie</div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={categorie} layout="vertical" margin={{ top: 4, right: 48, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                domain={[0, catMax]} tickCount={5} allowDecimals={false} />
              <YAxis dataKey="categorie" type="category" tick={{ fontSize: 11, fill: '#374151' }}
                axisLine={false} tickLine={false} width={110} />
              <Tooltip formatter={(v) => [v, 'Tickets']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="nb" fill="#1e3a8a" radius={[0, 4, 4, 0]}
                label={{ position: 'right', fontSize: 10, fill: '#374151' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">⏱️ Délai Résolution par Priorité (h)</div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={delai} margin={{ top: 24, right: 20, left: 10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="priorite" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                domain={[0, delaiMax]} tickCount={5} allowDecimals={false}
                tickFormatter={v => `${v}h`} width={38} />
              <Tooltip formatter={(v) => [`${v}h`, 'Délai moyen']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="delai" fill="#1e3a8a" radius={[4, 4, 0, 0]}
                label={{ position: 'top', fontSize: 10, fill: '#374151', formatter: v => `${v}h` }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
