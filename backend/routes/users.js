const router = require('express').Router();
const db = require('../db');

const FR_MOIS = {
  January:'Jan', February:'Fév', March:'Mar', April:'Avr', May:'Mai',
  June:'Jun', July:'Jul', August:'Aoû', September:'Sep',
  October:'Oct', November:'Nov', December:'Déc',
};
const label = (r) => `${FR_MOIS[r.nom_mois] || r.nom_mois} ${String(r.annee).slice(2)}`;

function sesWhere(annee, mois) {
  const params = [], clauses = [];
  if (annee) { params.push(parseInt(annee)); clauses.push(`t.annee = $${params.length}`); }
  if (mois)  { params.push(parseInt(mois));  clauses.push(`t.mois = $${params.length}`); }
  return { params, where: clauses.length ? 'AND ' + clauses.join(' AND ') : '' };
}

/* Années disponibles */
router.get('/annees', async (_, res) => {
  try {
    const { rows } = await db.query(`
      SELECT DISTINCT t.annee FROM technova_dw.fact_sessions s
      JOIN technova_dw.dim_time t ON t.date_sk = s.date_sk
      ORDER BY t.annee ASC
    `);
    res.json(rows.map(r => Number(r.annee)));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* KPIs engagement */
router.get('/kpis', async (req, res) => {
  try {
    const { annee, mois } = req.query;
    const { params, where } = sesWhere(annee, mois);
    const [u, s] = await Promise.all([
      db.query(`SELECT COUNT(*) AS total_users, COUNT(DISTINCT pays) AS nb_pays
                FROM technova_dw.dim_user WHERE user_sk > 0`),
      db.query(`
        SELECT COUNT(DISTINCT s.user_sk)                         AS mau,
               ROUND(100.0*SUM(s.bounce)/NULLIF(COUNT(*),0), 2) AS bounce_pct,
               ROUND(AVG(s.duree_minutes)::numeric, 2)          AS duree_moy_min,
               COUNT(*)                                         AS nb_sessions
        FROM technova_dw.fact_sessions s
        JOIN technova_dw.dim_time t ON t.date_sk = s.date_sk
        WHERE 1=1 ${where}
      `, params),
    ]);
    res.json({ ...u.rows[0], ...s.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Sessions par device */
router.get('/sessions-device', async (req, res) => {
  try {
    const { annee, mois } = req.query;
    const { params, where } = sesWhere(annee, mois);
    const { rows } = await db.query(`
      SELECT s.device, COUNT(*) AS nb
      FROM technova_dw.fact_sessions s
      JOIN technova_dw.dim_time t ON t.date_sk = s.date_sk
      WHERE 1=1 ${where}
      GROUP BY s.device ORDER BY nb DESC
    `, params);
    res.json(rows.map(r => ({ device: r.device, nb: Number(r.nb) })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Sessions par OS */
router.get('/sessions-os', async (req, res) => {
  try {
    const { annee, mois } = req.query;
    const { params, where } = sesWhere(annee, mois);
    const { rows } = await db.query(`
      SELECT s.os AS name, COUNT(*) AS value
      FROM technova_dw.fact_sessions s
      JOIN technova_dw.dim_time t ON t.date_sk = s.date_sk
      WHERE 1=1 ${where}
      GROUP BY s.os ORDER BY value DESC
    `, params);
    const total = rows.reduce((a, r) => a + Number(r.value), 0);
    const colors = ['#2196F3','#1A237E','#FF9800','#9C27B0','#E91E63'];
    res.json(rows.map((r, i) => ({
      name: r.name, value: Number(r.value),
      pct: Number(((r.value / total) * 100).toFixed(2)),
      color: colors[i] || '#607D8B',
    })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Sessions par navigateur */
router.get('/sessions-navigateur', async (req, res) => {
  try {
    const { annee, mois } = req.query;
    const { params, where } = sesWhere(annee, mois);
    const { rows } = await db.query(`
      SELECT s.navigateur AS nav, COUNT(*) AS nb
      FROM technova_dw.fact_sessions s
      JOIN technova_dw.dim_time t ON t.date_sk = s.date_sk
      WHERE 1=1 ${where}
      GROUP BY s.navigateur ORDER BY nb DESC
    `, params);
    res.json(rows.map(r => ({ nav: r.nav, nb: Number(r.nb) })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Sessions par pays */
router.get('/sessions-pays', async (req, res) => {
  try {
    const { annee, mois } = req.query;
    const { params, where } = sesWhere(annee, mois);
    const { rows } = await db.query(`
      SELECT u.pays, COUNT(*) AS nb
      FROM technova_dw.fact_sessions s
      JOIN technova_dw.dim_user u ON u.user_sk = s.user_sk
      JOIN technova_dw.dim_time t ON t.date_sk = s.date_sk
      WHERE u.pays IS NOT NULL AND u.user_sk > 0 ${where}
      GROUP BY u.pays ORDER BY nb DESC LIMIT 10
    `, params);
    res.json(rows.map(r => ({ pays: r.pays, nb: Number(r.nb) })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Sessions mensuelles */
router.get('/sessions-monthly', async (req, res) => {
  try {
    const { annee } = req.query;
    const params = [];
    const w = annee ? (params.push(parseInt(annee)), `AND t.annee = $1`) : '';
    const { rows } = await db.query(`
      SELECT t.nom_mois, t.annee, t.mois, COUNT(*) AS nb
      FROM technova_dw.fact_sessions s
      JOIN technova_dw.dim_time t ON t.date_sk = s.date_sk
      WHERE 1=1 ${w}
      GROUP BY t.annee, t.mois, t.nom_mois
      ORDER BY t.annee, t.mois
    `, params);
    res.json(rows.map(r => ({ mois: label(r), nb: Number(r.nb) })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Top pages */
router.get('/top-pages', async (req, res) => {
  try {
    const { annee, mois } = req.query;
    const { params, where } = sesWhere(annee, mois);
    const { rows } = await db.query(`
      SELECT s.top_page_categorie AS page, COUNT(*) AS nb
      FROM technova_dw.fact_sessions s
      JOIN technova_dw.dim_time t ON t.date_sk = s.date_sk
      WHERE s.top_page_categorie IS NOT NULL ${where}
      GROUP BY s.top_page_categorie ORDER BY nb DESC LIMIT 6
    `, params);
    res.json(rows.map(r => ({ page: r.page, nb: Number(r.nb) })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
