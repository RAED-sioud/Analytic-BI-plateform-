const router = require('express').Router();
const db = require('../db');

const FR_MOIS = {
  January:'Jan', February:'Fév', March:'Mar', April:'Avr', May:'Mai',
  June:'Jun', July:'Jul', August:'Aoû', September:'Sep',
  October:'Oct', November:'Nov', December:'Déc',
};
const label = (r) => `${FR_MOIS[r.nom_mois] || r.nom_mois} ${String(r.annee).slice(2)}`;

function perfWhere(annee, mois) {
  const params = [], clauses = [];
  if (annee) { params.push(parseInt(annee)); clauses.push(`t.annee = $${params.length}`); }
  if (mois)  { params.push(parseInt(mois));  clauses.push(`t.mois = $${params.length}`); }
  return { params, where: clauses.length ? 'AND ' + clauses.join(' AND ') : '' };
}

/* Années disponibles */
router.get('/annees', async (_, res) => {
  try {
    const { rows } = await db.query(`
      SELECT DISTINCT t.annee FROM technova_dw.fact_serverperformance p
      JOIN technova_dw.dim_time t ON t.date_sk = p.date_sk
      ORDER BY t.annee ASC
    `);
    res.json(rows.map(r => Number(r.annee)));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* KPIs performance */
router.get('/kpis', async (req, res) => {
  try {
    const { annee, mois } = req.query;
    const { params, where } = perfWhere(annee, mois);
    const { rows } = await db.query(`
      SELECT
        ROUND(AVG(p.temps_reponse_ms)::numeric, 0)  AS temps_reponse_moyen,
        ROUND(AVG(p.taux_erreur_pct)::numeric, 2)   AS taux_erreur_moyen,
        ROUND(AVG(p.cpu_usage_pct)::numeric, 1)     AS cpu_moyen,
        ROUND(AVG(p.ram_usage_pct)::numeric, 1)     AS ram_moyen,
        SUM(p.nb_requetes)                           AS total_requetes,
        ROUND(100.0*SUM(CASE WHEN p.statut_serveur='OK' THEN 1 ELSE 0 END)/NULLIF(COUNT(*),0),2) AS uptime_pct,
        SUM(CASE WHEN p.statut_serveur<>'OK' THEN 1 ELSE 0 END) AS nb_incidents
      FROM technova_dw.fact_serverperformance p
      JOIN technova_dw.dim_time t ON t.date_sk = p.date_sk
      WHERE 1=1 ${where}
    `, params);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* CPU & RAM mensuel */
router.get('/cpu-ram-monthly', async (req, res) => {
  try {
    const { annee } = req.query;
    const params = [];
    const w = annee ? (params.push(parseInt(annee)), `AND t.annee = $1`) : '';
    const { rows } = await db.query(`
      SELECT t.nom_mois, t.annee, t.mois,
             ROUND(AVG(p.cpu_usage_pct)::numeric, 1) AS cpu,
             ROUND(AVG(p.ram_usage_pct)::numeric, 1) AS ram
      FROM technova_dw.fact_serverperformance p
      JOIN technova_dw.dim_time t ON t.date_sk = p.date_sk
      WHERE 1=1 ${w}
      GROUP BY t.annee, t.mois, t.nom_mois
      ORDER BY t.annee, t.mois
    `, params);
    res.json(rows.map(r => ({ mois: label(r), cpu: Number(r.cpu), ram: Number(r.ram) })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Temps de réponse mensuel */
router.get('/temps-reponse-monthly', async (req, res) => {
  try {
    const { annee } = req.query;
    const params = [];
    const w = annee ? (params.push(parseInt(annee)), `AND t.annee = $1`) : '';
    const { rows } = await db.query(`
      SELECT t.nom_mois, t.annee, t.mois,
             ROUND(AVG(p.temps_reponse_ms)::numeric, 0) AS ms
      FROM technova_dw.fact_serverperformance p
      JOIN technova_dw.dim_time t ON t.date_sk = p.date_sk
      WHERE 1=1 ${w}
      GROUP BY t.annee, t.mois, t.nom_mois
      ORDER BY t.annee, t.mois
    `, params);
    res.json(rows.map(r => ({ mois: label(r), ms: Number(r.ms) })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Charge serveur mensuelle */
router.get('/charge-monthly', async (req, res) => {
  try {
    const { annee } = req.query;
    const params = [];
    const w = annee ? (params.push(parseInt(annee)), `AND t.annee = $1`) : '';
    const { rows } = await db.query(`
      SELECT t.nom_mois, t.annee, t.mois,
             SUM(p.nb_requetes)                          AS requetes,
             ROUND(AVG(p.taux_erreur_pct)::numeric, 2)  AS erreur
      FROM technova_dw.fact_serverperformance p
      JOIN technova_dw.dim_time t ON t.date_sk = p.date_sk
      WHERE 1=1 ${w}
      GROUP BY t.annee, t.mois, t.nom_mois
      ORDER BY t.annee, t.mois
    `, params);
    res.json(rows.map(r => ({ mois: label(r), requetes: Number(r.requetes), erreur: Number(r.erreur) })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* État du serveur */
router.get('/etat-serveur', async (req, res) => {
  try {
    const { annee, mois } = req.query;
    const { params, where } = perfWhere(annee, mois);
    const { rows } = await db.query(`
      SELECT p.statut_serveur AS name, COUNT(*) AS value
      FROM technova_dw.fact_serverperformance p
      JOIN technova_dw.dim_time t ON t.date_sk = p.date_sk
      WHERE 1=1 ${where}
      GROUP BY p.statut_serveur ORDER BY value DESC
    `, params);
    const total = rows.reduce((s, r) => s + Number(r.value), 0);
    const colors = { OK: '#2196F3', 'En panne': '#1A237E', Dégradé: '#FF9800' };
    res.json(rows.map(r => ({
      name: r.name, value: Number(r.value),
      pct: Number(((r.value / total) * 100).toFixed(2)),
      color: colors[r.name] || '#607D8B',
    })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
