import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
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

export default function Performance() {
  const [filters, setFilters] = useState(defaultFilters);
  const qs = buildQS(filters);

  const { data: annees }  = useApi('/api/performance/annees', []);
  const { data: kpis }    = useApi(`/api/performance/kpis${qs}`,                  {});
  const { data: cpuRam }  = useApi(`/api/performance/cpu-ram-monthly${qs}`,       []);
  const { data: etat }    = useApi(`/api/performance/etat-serveur${qs}`,          []);
  const { data: charge }  = useApi(`/api/performance/charge-monthly${qs}`,        []);
  const { data: reponse } = useApi(`/api/performance/temps-reponse-monthly${qs}`, []);

  const reponseMax = reponse.length ? niceMax(Math.max(...reponse.map(r => r.ms)))       : 1500;
  const chargeMax  = charge.length  ? niceMax(Math.max(...charge.map(r => r.requetes)))  : 500000;
  const incidents  = kpis.nb_incidents ?? etat.filter(e => e.name !== 'OK').reduce((s, e) => s + e.value, 0);

  return (
    <>
      <div className="page-banner">
        <div>
          <div className="page-banner-title">Analytic BI Plateform | Performance Serveur</div>
          <div className="page-banner-sub">CPU · RAM · Uptime · Incidents · Temps de réponse</div>
        </div>
        <div className="page-banner-right">Données en temps réel<br />Entrepôt PostgreSQL</div>
      </div>

      <FilterBar filters={filters} onChange={setFilters} annees={annees} />

      <SectionHeader title="🖥️ KPI — PERFORMANCE TECHNIQUE" />
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <KPICard label="⚡ TEMPS RÉPONSE"
          value={kpis.temps_reponse_moyen ? `${kpis.temps_reponse_moyen} ms` : '—'}
          sub="En millisecondes" subColor="#9ca3af"
          iconBg="#fef3c7" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>} />
        <KPICard label="💾 RAM MOYEN"
          value={kpis.ram_moyen ? `${kpis.ram_moyen}%` : '—'}
          sub="Cible : <70%" subColor="#059669"
          iconBg="#d1fae5" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>} />
        <KPICard label="🚨 NB INCIDENTS"
          value={incidents || '0'}
          sub="Niveau normal" subColor="#059669"
          iconBg="#fee2e2" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>} />
        <KPICard label="🖥️ CPU MOYEN"
          value={kpis.cpu_moyen ? `${kpis.cpu_moyen}%` : '—'}
          sub="Cible : <60%" subColor="#059669"
          iconBg="#dbeafe" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>} />
      </div>

      <SectionHeader title="📊 ANALYSES INFRASTRUCTURE" />
      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-card-title">📈 CPU & RAM — Évolution</div>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={cpuRam} margin={{ top: 16, right: 20, left: 10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                domain={[0, 100]} tickCount={6} allowDecimals={false}
                tickFormatter={v => `${v}%`} width={38} />
              <Tooltip formatter={(v) => [`${v}%`]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="ram" name="RAM" stroke="#2196F3" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="cpu" name="CPU" stroke="#1e3a8a" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">🍩 État du Serveur</div>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={etat} cx="50%" cy="45%" innerRadius={60} outerRadius={90}
                dataKey="value" paddingAngle={2} label={false} labelLine={false}>
                {etat.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
              </Pie>
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12, paddingTop: 4 }}
                formatter={(value, entry) => (
                  <span style={{ color: '#374151' }}>
                    {value}&nbsp;
                    <span style={{ color: '#1e3a8a', fontWeight: 700 }}>{entry.payload.pct}%</span>
                  </span>
                )} />
              <Tooltip formatter={(v) => [v.toLocaleString(), 'Entrées']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-card-title">📊 Charge Serveur & Taux d'erreur</div>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={charge} margin={{ top: 16, right: 44, left: 10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 8, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis yAxisId="left" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                domain={[0, chargeMax]} tickCount={5} allowDecimals={false}
                tickFormatter={v => `${(v/1000).toFixed(0)}K`} width={40} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: '#d97706' }}
                axisLine={false} tickLine={false} tickFormatter={v => `${v}%`}
                domain={[0, 30]} tickCount={4} allowDecimals={false} width={36} />
              <Tooltip formatter={(v, n) => [n === 'erreur' ? `${v}%` : Number(v).toLocaleString(), n === 'erreur' ? "Taux d'erreur" : 'Requêtes']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="left" dataKey="requetes" name="Requêtes" fill="#1e3a8a" radius={[2, 2, 0, 0]} opacity={0.8} />
              <Line yAxisId="right" type="monotone" dataKey="erreur" name="Taux d'erreur %" stroke="#d97706" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">⏱️ Temps de Réponse par mois (ms)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={reponse} margin={{ top: 16, right: 20, left: 10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 8, fill: '#9ca3af' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                domain={[0, reponseMax]} tickCount={5} allowDecimals={false}
                tickFormatter={v => `${v}ms`} width={50} />
              <Tooltip formatter={(v) => [`${v} ms`, 'Temps réponse']} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="ms" fill="#1e3a8a" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
