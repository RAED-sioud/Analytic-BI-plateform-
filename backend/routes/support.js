const router = require('express').Router();
const db = require('../db');

function supWhere(annee, mois, categorie, priorite) {
  const params = [], clauses = [];
  if (annee)     { params.push(parseInt(annee)); clauses.push(`t.annee = $${params.length}`); }
  if (mois)      { params.push(parseInt(mois));  clauses.push(`t.mois = $${params.length}`); }
  if (categorie) { params.push(categorie);       clauses.push(`f.categorie = $${params.length}`); }
  if (priorite)  { params.push(priorite);        clauses.push(`f.priorite = $${params.length}`); }
  return { params, where: clauses.length ? 'AND ' + clauses.join(' AND ') : '' };
}

/* Années disponibles */
router.get('/annees', async (_, res) => {
  try {
    const { rows } = await db.query(`
      SELECT DISTINCT t.annee FROM technova_dw.fact_support f
      JOIN technova_dw.dim_time t ON t.date_sk = f.date_creation_sk
      ORDER BY t.annee ASC
    `);
    res.json(rows.map(r => Number(r.annee)));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* KPIs support */
router.get('/kpis', async (req, res) => {
  try {
    const { annee, mois, categorie, priorite } = req.query;
    const { params, where } = supWhere(annee, mois, categorie, priorite);
    const { rows } = await db.query(`
      SELECT
        COUNT(*)                                                                          AS total_tickets,
        SUM(f.est_resolu)                                                                 AS resolus,
        COUNT(*) - SUM(f.est_resolu)                                                      AS ouverts,
        ROUND(AVG(CASE WHEN f.est_resolu=1 THEN f.csat_score END)::numeric, 2)            AS csat_moyen,
        ROUND(AVG(f.resolution_heures)::numeric, 1)                                       AS delai_moyen_h,
        SUM(f.est_critique)                                                               AS critiques,
        ROUND(100.0*SUM(f.est_resolu)/NULLIF(COUNT(*),0), 2)                              AS taux_resolution_pct,
        ROUND(100.0*SUM(CASE WHEN f.est_resolu=1 THEN f.est_sla_respecte ELSE 0 END)/NULLIF(SUM(f.est_resolu),0), 2) AS sla_pct
      FROM technova_dw.fact_support f
      JOIN technova_dw.dim_time t ON t.date_sk = f.date_creation_sk
      WHERE 1=1 ${where}
    `, params);
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Tickets par catégorie */
router.get('/tickets-categorie', async (req, res) => {
  try {
    const { annee, mois, priorite } = req.query;
    const { params, where } = supWhere(annee, mois, null, priorite);
    const { rows } = await db.query(`
      SELECT f.categorie, COUNT(*) AS nb
      FROM technova_dw.fact_support f
      JOIN technova_dw.dim_time t ON t.date_sk = f.date_creation_sk
      WHERE 1=1 ${where}
      GROUP BY f.categorie ORDER BY nb DESC
    `, params);
    res.json(rows.map(r => ({ categorie: r.categorie, nb: Number(r.nb) })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Tickets par priorité */
router.get('/tickets-priorite', async (req, res) => {
  try {
    const { annee, mois, categorie } = req.query;
    const { params, where } = supWhere(annee, mois, categorie, null);
    const { rows } = await db.query(`
      SELECT f.priorite AS name, COUNT(*) AS value
      FROM technova_dw.fact_support f
      JOIN technova_dw.dim_time t ON t.date_sk = f.date_creation_sk
      WHERE 1=1 ${where}
      GROUP BY f.priorite ORDER BY value DESC
    `, params);
    const total = rows.reduce((s, r) => s + Number(r.value), 0);
    const colors = { Moyenne: '#2196F3', Basse: '#1A237E', Haute: '#FF9800', Critique: '#9C27B0' };
    res.json(rows.map(r => ({
      name: r.name, value: Number(r.value),
      pct: Number(((r.value / total) * 100).toFixed(2)),
      color: colors[r.name] || '#607D8B',
    })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* CSAT par catégorie */
router.get('/csat-categorie', async (req, res) => {
  try {
    const { annee, mois, priorite } = req.query;
    const { params, where } = supWhere(annee, mois, null, priorite);
    const { rows } = await db.query(`
      SELECT f.categorie, ROUND(AVG(f.csat_score)::numeric, 2) AS csat
      FROM technova_dw.fact_support f
      JOIN technova_dw.dim_time t ON t.date_sk = f.date_creation_sk
      WHERE f.csat_score IS NOT NULL ${where}
      GROUP BY f.categorie ORDER BY csat DESC
    `, params);
    res.json(rows.map(r => ({ categorie: r.categorie, csat: Number(r.csat) })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* Délai résolution par priorité */
router.get('/delai-priorite', async (req, res) => {
  try {
    const { annee, mois, categorie } = req.query;
    const { params, where } = supWhere(annee, mois, categorie, null);
    const { rows } = await db.query(`
      SELECT f.priorite, ROUND(AVG(f.resolution_heures)::numeric, 0) AS delai
      FROM technova_dw.fact_support f
      JOIN technova_dw.dim_time t ON t.date_sk = f.date_creation_sk
      WHERE f.resolution_heures IS NOT NULL ${where}
      GROUP BY f.priorite ORDER BY delai DESC
    `, params);
    res.json(rows.map(r => ({ priorite: r.priorite, delai: Number(r.delai) })));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
