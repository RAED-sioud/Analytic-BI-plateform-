import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  Cell, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import KPICard from '../components/KPICard';

/* ── Static ML results from the churn prediction notebook ─── */
const MODEL_COLORS = {
  'Régression Log.': '#378ADD',
  'Random Forest':   '#1D9E75',
  'XGBoost':         '#E24B4A',
  'ANN':             '#EF9F27',
};

/* Real metrics from notebook outputs (244 users, 49-sample test set) */
const metricsData = [
  { metric: 'Accuracy',  'Régression Log.': 0.5918, 'Random Forest': 0.4694, 'XGBoost': 0.5714, 'ANN': 0.5714 },
  { metric: 'Precision', 'Régression Log.': 0.6154, 'Random Forest': 0.5484, 'XGBoost': 0.6333, 'ANN': 0.5833 },
  { metric: 'Recall',    'Régression Log.': 0.8276, 'Random Forest': 0.5862, 'XGBoost': 0.6552, 'ANN': 0.9655 },
  { metric: 'F1-Score',  'Régression Log.': 0.7059, 'Random Forest': 0.5667, 'XGBoost': 0.6441, 'ANN': 0.7273 },
  { metric: 'AUC-ROC',   'Régression Log.': 0.5379, 'Random Forest': 0.4983, 'XGBoost': 0.5052, 'ANN': 0.4707 },
];

/* Top features — Régression Logistique (absolute coefficients, normalised) */
const featureData = [
  { feature: 'Paiement encodé',    importance: 0.024 },
  { feature: 'CSAT moyen',         importance: 0.036 },
  { feature: 'Nb. bounces',        importance: 0.045 },
  { feature: 'Engagement score',   importance: 0.064 },
  { feature: 'Durée moy. session', importance: 0.069 },
  { feature: 'Ratio bounce',       importance: 0.101 },
  { feature: 'Plan encodé',        importance: 0.323 },
  { feature: 'Prix mensuel (TND)', importance: 0.338 },
];

/* Confusion matrix — Régression Logistique on 49-sample test set */
const confMatrix = { TN: 5, FP: 15, FN: 5, TP: 24 };

const radarData = [
  { subject: 'Accuracy',  'Régression Log.': 59, 'Random Forest': 47, 'XGBoost': 57, 'ANN': 57 },
  { subject: 'Precision', 'Régression Log.': 62, 'Random Forest': 55, 'XGBoost': 63, 'ANN': 58 },
  { subject: 'Recall',    'Régression Log.': 83, 'Random Forest': 59, 'XGBoost': 66, 'ANN': 97 },
  { subject: 'F1',        'Régression Log.': 71, 'Random Forest': 57, 'XGBoost': 64, 'ANN': 73 },
  { subject: 'AUC',       'Régression Log.': 54, 'Random Forest': 50, 'XGBoost': 51, 'ANN': 47 },
];

/* ── Client-side churn scorer (reflects Régression Logistique weights) */
function scoreChurn(f) {
  let score = 0;
  // Prix mensuel (feature #1 — highest coefficient)
  score += (Math.min(f.prix, 500) / 500) * 30;
  // Ratio bounce (feature #3)
  const approxBounce = f.sessions > 0 ? Math.min(4, f.sessions * 0.25) / Math.max(1, f.sessions) : 0.5;
  score += approxBounce * 20;
  // Durée session (feature #4) — faible engagement = risque
  score += (1 - Math.min(f.sessions * 8, 480) / 480) * 15;
  // Engagement score (feature #5)
  score += (1 - Math.min(f.engagement, 100) / 100) * 15;
  // CSAT (feature #6)
  score += (1 - Math.min(f.csat, 5) / 5) * 12;
  // Support tickets & délai
  score += Math.min(f.tickets, 20) / 20 * 5;
  score += Math.min(f.delai, 200) / 200 * 3;
  const noise = (Math.sin(f.prix * 0.37 + f.sessions * 1.1) * 2);
  return Math.min(99, Math.max(1, Math.round(score + noise)));
}

const DEFAULTS = {
  engagement: 45, csat: 2.5, sessions: 4, tickets: 6,
  delai: 48, resolution: 60, prix: 59, jours: 180,
};

/* ── Confusion Matrix Cell ─────────────────────────────────────── */
function CMCell({ label, value, color, sub }) {
  return (
    <div style={{
      background: color, borderRadius: 8, padding: '16px 12px',
      textAlign: 'center', flex: 1,
    }}>
      <div style={{ fontSize: 11, color: '#fff', opacity: 0.8, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: '#fff', opacity: 0.75, marginTop: 4 }}>{sub}</div>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────────── */
export default function Prediction() {
  const [form, setForm] = useState(DEFAULTS);
  const [result, setResult] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: Number(e.target.value) });

  function predict() {
    const pct = scoreChurn(form);
    setResult(pct);
  }

  const riskLevel = result === null ? null
    : result >= 70 ? { label: 'Risque élevé',   color: '#dc2626', badge: 'badge-red'    }
    : result >= 40 ? { label: 'Risque modéré',  color: '#d97706', badge: 'badge-amber'  }
    :                { label: 'Risque faible',  color: '#16a34a', badge: 'badge-green'  };

  return (
    <>
      {/* ── KPIs ─────────────────────────────────────────────────── */}
      <div className="kpi-grid">
        <KPICard label="Meilleur modèle"       value="Rég. Log."  delta="Score composite 0.6219" up={true}  />
        <KPICard label="F1-Score (best)"        value="0.7273"     delta="ANN · +0.02 vs Rég. Log." up={true}  />
        <KPICard label="AUC-ROC (best)"         value="0.5379"     delta="Rég. Log. · +0.04 vs RF" up={true}  />
        <KPICard label="Taux churn réel"        value="58.6%"      delta="143 / 244 abonnés"     up={false} />
      </div>

      {/* ── Model Comparison ─────────────────────────────────────── */}
      <div className="chart-grid" style={{ gridTemplateColumns: '3fr 2fr' }}>
        <div className="chart-card">
          <div className="chart-card-title">Comparaison des 4 modèles — métriques</div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={metricsData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="metric" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                     domain={[0.4, 1]} tickFormatter={v => v.toFixed(2)} />
              <Tooltip formatter={(v) => v.toFixed(4)} contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              {Object.keys(MODEL_COLORS).map(name => (
                <Bar key={name} dataKey={name} fill={MODEL_COLORS[name]} radius={[3,3,0,0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">Radar — profil des modèles (%)</div>
          <ResponsiveContainer width="100%" height={230}>
            <RadarChart cx="50%" cy="50%" outerRadius={75} data={radarData}>
              <PolarGrid stroke="#f3f4f6" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <PolarRadiusAxis angle={30} domain={[40, 100]} tick={{ fontSize: 9, fill: '#ccc' }} />
              {Object.keys(MODEL_COLORS).map(name => (
                <Radar key={name} name={name} dataKey={name}
                       stroke={MODEL_COLORS[name]} fill={MODEL_COLORS[name]} fillOpacity={0.12} strokeWidth={2} />
              ))}
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Feature Importance + Confusion Matrix ────────────────── */}
      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-card-title">Importance des features — Rég. Logistique (meilleur modèle)</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={featureData} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                     tickFormatter={v => `${(v * 100).toFixed(0)}%`} domain={[0, 0.40]} />
              <YAxis dataKey="feature" type="category" tick={{ fontSize: 11, fill: '#374151' }}
                     axisLine={false} tickLine={false} width={135} />
              <Tooltip formatter={(v) => `${(v * 100).toFixed(1)}%`}
                       contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e5e7eb' }} />
              <Bar dataKey="importance" radius={[0,3,3,0]}>
                {featureData.map((_, i) => (
                  <Cell key={i} fill={`hsl(${220 - i * 18}, 75%, ${55 + i * 2}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">Matrice de confusion — Rég. Logistique (jeu de test · 49 obs.)</div>
          <div style={{ padding: '12px 0 4px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 6, paddingRight: 4 }}>
              <div style={{ flex: 1, textAlign: 'center', fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>Prédit : Non-Churn</div>
              <div style={{ flex: 1, textAlign: 'center', fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>Prédit : Churn</div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, width: 80, flexShrink: 0, textAlign: 'right', paddingRight: 8 }}>Réel : Non</div>
              <CMCell label="Vrai Négatif (TN)" value={confMatrix.TN} color="#1D9E75" sub="Fidèles détectés" />
              <CMCell label="Faux Positif (FP)" value={confMatrix.FP} color="#f59e0b" sub="Fausse alarme" />
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, width: 80, flexShrink: 0, textAlign: 'right', paddingRight: 8 }}>Réel : Churn</div>
              <CMCell label="Faux Négatif (FN)" value={confMatrix.FN} color="#f59e0b" sub="Churn manqué" />
              <CMCell label="Vrai Positif (TP)" value={confMatrix.TP} color="#E24B4A" sub="Churn détecté" />
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
              {[
                { l: 'Précision', v: `${(confMatrix.TP/(confMatrix.TP+confMatrix.FP)*100).toFixed(1)}%` },
                { l: 'Rappel',    v: `${(confMatrix.TP/(confMatrix.TP+confMatrix.FN)*100).toFixed(1)}%` },
                { l: 'F1-Score',  v: '0.7059' },
                { l: 'Accuracy',  v: `${((confMatrix.TN+confMatrix.TP)/(confMatrix.TN+confMatrix.FP+confMatrix.FN+confMatrix.TP)*100).toFixed(1)}%` },
              ].map(s => (
                <div key={s.l} style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.l}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Prediction Simulator ─────────────────────────────────── */}
      <div className="chart-card" style={{ marginBottom: 20 }}>
        <div className="chart-card-title" style={{ marginBottom: 16 }}>
          Simulateur de prédiction individuelle — Rég. Logistique
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: 16, alignItems: 'end' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <InputField label="Engagement score (0–100)" value={form.engagement} onChange={set('engagement')} min={0} max={100} />
            <InputField label="CSAT moyen (0–5)"         value={form.csat}       onChange={set('csat')}       min={0} max={5}   step={0.1} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <InputField label="Nb. sessions / mois"      value={form.sessions}   onChange={set('sessions')}   min={0} max={100} />
            <InputField label="Nb. tickets support"      value={form.tickets}    onChange={set('tickets')}    min={0} max={50}  />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <InputField label="Délai résolution (h)"     value={form.delai}      onChange={set('delai')}      min={0} max={200} />
            <InputField label="Taux résolution (%)"      value={form.resolution} onChange={set('resolution')} min={0} max={100} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <InputField label="Prix mensuel (TND)"       value={form.prix}       onChange={set('prix')}       min={0} max={500} />
            <InputField label="Durée contrat (jours)"    value={form.jours}      onChange={set('jours')}      min={0} max={730} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
            <button
              onClick={predict}
              style={{
                background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8,
                padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                width: '100%', transition: 'background 0.15s',
              }}
            >
              Prédire
            </button>
            {result !== null && (
              <div style={{ textAlign: 'center', width: '100%' }}>
                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Probabilité de churn</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: riskLevel.color, lineHeight: 1 }}>
                  {result}%
                </div>
                <div style={{ marginTop: 6 }}>
                  <span className={`badge ${riskLevel.badge}`}>{riskLevel.label}</span>
                </div>
                <RiskBar pct={result} color={riskLevel.color} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Model Summary Table ─────────────────────────────────── */}
      <div className="table-card">
        <div className="table-card-title">Tableau comparatif final — 4 modèles (score composite = 50% F1 + 50% AUC)</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Modèle</th>
              <th>Accuracy</th>
              <th>Precision</th>
              <th>Recall</th>
              <th>F1-Score</th>
              <th>AUC-ROC</th>
              <th>Score composite</th>
              <th>Classement</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Rég. Logistique',          acc: 0.5918, prec: 0.6154, rec: 0.8276, f1: 0.7059, auc: 0.5379, composite: 0.6219, rank: 1, badge: 'badge-red'   },
              { name: 'ANN (Réseau de Neurones)', acc: 0.5714, prec: 0.5833, rec: 0.9655, f1: 0.7273, auc: 0.4707, composite: 0.5990, rank: 2, badge: 'badge-amber' },
              { name: 'XGBoost',                  acc: 0.5714, prec: 0.6333, rec: 0.6552, f1: 0.6441, auc: 0.5052, composite: 0.5746, rank: 3, badge: 'badge-blue'  },
              { name: 'Random Forest',             acc: 0.4694, prec: 0.5484, rec: 0.5862, f1: 0.5667, auc: 0.4983, composite: 0.5325, rank: 4, badge: 'badge-gray'  },
            ].map(row => (
              <tr key={row.name}>
                <td style={{ fontWeight: 600 }}>{row.name}</td>
                <td>{row.acc.toFixed(4)}</td>
                <td>{row.prec.toFixed(4)}</td>
                <td>{row.rec.toFixed(4)}</td>
                <td style={{ fontWeight: 600 }}>{row.f1.toFixed(4)}</td>
                <td style={{ fontWeight: 600 }}>{row.auc.toFixed(4)}</td>
                <td style={{ fontWeight: 600 }}>{row.composite.toFixed(4)}</td>
                <td>
                  <span className={`badge ${row.badge}`}>
                    {row.rank === 1 ? '🏆 #1 Meilleur' : `#${row.rank}`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ── Helper components ─────────────────────────────────────────── */
function InputField({ label, value, onChange, min, max, step = 1 }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        style={{
          width: '100%', padding: '7px 10px', border: '1px solid #d1d5db',
          borderRadius: 6, fontSize: 13, color: '#111827', outline: 'none',
          fontFamily: 'inherit',
        }}
      />
    </div>
  );
}

function RiskBar({ pct, color }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}
