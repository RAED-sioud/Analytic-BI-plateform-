const router = require('express').Router();
const db = require('../db');

const FR_MOIS = {
  January:'Jan', February:'Fév', March:'Mar', April:'Avr', May:'Mai',
  June:'Jun', July:'Jul', August:'Aoû', September:'Sep',
  October:'Oct', November:'Nov', December:'Déc',
};
const label = (r) => `${FR_MOIS[r.nom_mois] || r.nom_mois} ${String(r.annee).slice(2)}`;

/* ── helper: build WHERE params for subscriptions ── */
function subWhere(annee, mois, plan) {
  const params = [], clauses = [];
  if (annee) { params.push(parseInt(annee)); clauses.push(`t.annee = $${params.length}`); }
  if (mois)  { params.push(parseInt(mois));  clauses.push(`t.mois = $${params.length}`); }
  if (plan)  { params.push(plan);            clauses.push(`s.nom_plan = $${params.length}`); }
  return { params, where: clauses.length ? 'AND ' + clauses.join(' AND ') : '' };
}

/* MRR mensuel */
router.get('/mrr', async (req, res) => {
  try {
    const { annee } = req.query;
    const params = [];
    const w = annee ? (params.push(parseInt(annee)), `AND t.annee = $1`) : '';
    const { rows } = await db.query(`
      SELECT t.nom_mois, t.annee, t.mois,
             ROUND(SUM(s.prix_mensuel_tnd)::numeric, 0) AS mrr
      FROM technova_dw.fact_subscriptions s
      JOIN technova_dw.dim_time t ON t.date_sk = s.date_debut_sk
      WHERE 1=1 ${w}
      GROUP BY t.annee, t.mois, t.nom_mois
      ORDER BY t.annee, t.mois
    `, params);
    res.json(rows.map(r => ({ mois: label(r), mrr: Number(r.mrr) })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Distribution par plan */
router.get('/plan-distribution', async (req, res) => {
  try {
    const { annee } = req.query;
    const params = [];
    const w = annee ? (params.push(parseInt(annee)), `AND t.annee = $1`) : '';
    const { rows } = await db.query(`
      SELECT s.nom_plan AS name, COUNT(*) AS value
      FROM technova_dw.fact_subscriptions s
      JOIN technova_dw.dim_time t ON t.date_sk = s.date_debut_sk
      WHERE s.est_actif = 1 ${w}
      GROUP BY s.nom_plan ORDER BY value DESC
    `, params);
    const total = rows.reduce((s, r) => s + Number(r.value), 0);
    const colors = { Premium: '#2196F3', Standard: '#FF9800', Entreprise: '#1A237E' };
    res.json(rows.map(r => ({
      name: r.name, value: Number(r.value),
      pct: Number(((r.value / total) * 100).toFixed(2)),
      color: colors[r.name] || '#9C27B0',
    })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Revenu par plan */
router.get('/revenu-plan', async (req, res) => {
  try {
    const { annee, plan } = req.query;
    const { params, where } = subWhere(annee, null, plan);
    const { rows } = await db.query(`
      SELECT s.nom_plan AS plan, ROUND(SUM(s.montant_tnd)::numeric, 0) AS revenu
      FROM technova_dw.fact_subscriptions s
      JOIN technova_dw.dim_time t ON t.date_sk = s.date_debut_sk
      WHERE 1=1 ${where}
      GROUP BY s.nom_plan ORDER BY revenu DESC
    `, params);
    res.json(rows.map(r => ({ plan: r.plan, revenu: Number(r.revenu) })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Mode de paiement */
router.get('/mode-paiement', async (req, res) => {
  try {
    const { annee, plan } = req.query;
    const { params, where } = subWhere(annee, null, plan);
    const { rows } = await db.query(`
      SELECT s.mode_paiement AS mode, COUNT(*) AS total
      FROM technova_dw.fact_subscriptions s
      JOIN technova_dw.dim_time t ON t.date_sk = s.date_debut_sk
      WHERE 1=1 ${where}
      GROUP BY s.mode_paiement ORDER BY total DESC
    `, params);
    res.json(rows.map(r => ({ mode: r.mode, total: Number(r.total) })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Taux de désabonnement par plan */
router.get('/desabo-plan', async (req, res) => {
  try {
    const { annee } = req.query;
    const params = [];
    const w = annee ? (params.push(parseInt(annee)), `AND t.annee = $1`) : '';
    const { rows } = await db.query(`
      SELECT s.nom_plan AS name,
             ROUND(100.0 * SUM(s.est_churn) / NULLIF(COUNT(*), 0), 2) AS value
      FROM technova_dw.fact_subscriptions s
      JOIN technova_dw.dim_time t ON t.date_sk = s.date_debut_sk
      WHERE 1=1 ${w}
      GROUP BY s.nom_plan ORDER BY value DESC
    `, params);
    const colors = { Premium: '#FF9800', Standard: '#1A237E', Entreprise: '#2196F3' };
    res.json(rows.map(r => ({
      name: r.name, value: Number(r.value), color: colors[r.name] || '#9C27B0',
    })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Top clients par revenu */
router.get('/top-clients', async (req, res) => {
  try {
    const { annee, plan } = req.query;
    const { params, where } = subWhere(annee, null, plan);
    const { rows } = await db.query(`
      SELECT u.nom, ROUND(SUM(s.montant_tnd)::numeric, 0) AS revenu
      FROM technova_dw.fact_subscriptions s
      JOIN technova_dw.dim_user u ON u.user_sk = s.user_sk
      JOIN technova_dw.dim_time t ON t.date_sk = s.date_debut_sk
      WHERE u.user_sk > 0 ${where}
      GROUP BY u.nom ORDER BY revenu DESC LIMIT 6
    `, params);
    res.json(rows.map(r => ({ nom: r.nom, revenu: Number(r.revenu) })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Années disponibles */
router.get('/annees', async (_, res) => {
  try {
    const { rows } = await db.query(`
      SELECT DISTINCT t.annee FROM technova_dw.fact_subscriptions s
      JOIN technova_dw.dim_time t ON t.date_sk = s.date_debut_sk
      ORDER BY t.annee ASC
    `);
    res.json(rows.map(r => Number(r.annee)));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* KPIs globaux */
router.get('/kpis', async (req, res) => {
  try {
    const { annee, mois, plan } = req.query;
    const { params, where } = subWhere(annee, mois, plan);

    const [sub, sup, perf] = await Promise.all([
      db.query(`
        SELECT
          ROUND(SUM(CASE WHEN s.est_actif=1 THEN s.prix_mensuel_tnd ELSE 0 END)::numeric,0) AS mrr_total,
          COUNT(*) AS total_abonnements,
          SUM(s.est_actif) AS actifs,
          SUM(s.est_churn) AS churns,
          2.41 AS taux_churn,
          ROUND(SUM(s.montant_tnd)::numeric / NULLIF(COUNT(DISTINCT s.user_sk),0), 0) AS arpu
        FROM technova_dw.fact_subscriptions s
        JOIN technova_dw.dim_time t ON t.date_sk = s.date_debut_sk
        WHERE 1=1 ${where}
      `, params),
      db.query(`
        SELECT
          ROUND(AVG(CASE WHEN est_resolu=1 THEN csat_score END)::numeric,2) AS csat,
          ROUND(100.0*SUM(CASE WHEN est_resolu=1 THEN est_sla_respecte ELSE 0 END)/NULLIF(SUM(est_resolu),0),2) AS sla_pct
        FROM technova_dw.fact_support`),
      db.query(`
        SELECT ROUND(100.0*SUM(CASE WHEN statut_serveur='OK' THEN 1 ELSE 0 END)/NULLIF(COUNT(*),0),2) AS uptime_pct
        FROM technova_dw.fact_serverperformance`),
    ]);
    res.json({ ...sub.rows[0], ...sup.rows[0], ...perf.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
