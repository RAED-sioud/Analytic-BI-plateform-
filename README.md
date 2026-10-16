Plateform — Plateforme d'Analytics

>  · ISIMA 2026  · Raed Sioud
> **Stack** : React 18 · Node.js / Express · PostgreSQL · Recharts

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   NAVIGATEUR                        │
│           React 18  +  Recharts                     │
└──────────────────────┬──────────────────────────────┘
                       │  HTTP /api/*
                       ▼
┌─────────────────────────────────────────────────────┐
│              Node.js / Express (port 5000)          │
│   /api/business    /api/support                     │
│   /api/users       /api/performance                 │
└──────────────────────┬──────────────────────────────┘
                       │  SQL paramétré
                       ▼
┌─────────────────────────────────────────────────────┐
│        PostgreSQL — Entrepôt technova_dw            │
│  fact_subscriptions   fact_support                  │
│  fact_sessions        fact_serverperformance        │
│  dim_time             dim_user                      │
└─────────────────────────────────────────────────────┘
```

---

## Flux de données

```
1. Utilisateur ouvre l'app → page Login
         │
         ▼
2. Connexion admin (admin / admin123)
   → App.jsx stocke l'utilisateur en state React
         │
         ▼
3. Dashboard s'affiche (Vue Exécutive par défaut)
   → Chaque page appelle useApi('/api/...')
         │
         ▼
4. L'utilisateur applique un filtre (Année / Mois / Plan…)
   → buildQS() construit les query params (?annee=2024&mois=3)
   → useApi re-fetch automatiquement avec les nouveaux params
         │
         ▼
5. Express reçoit la requête filtrée
   → Construit la clause WHERE dynamique (subWhere / sesWhere…)
   → Exécute la requête SQL paramétrée sur PostgreSQL
         │
         ▼
6. PostgreSQL retourne les données filtrées
   → Express formate en JSON → res.json(...)
         │
         ▼
7. React reçoit le JSON → met à jour le state
   → Recharts redessine les graphiques
   → KPICard affiche les nouvelles valeurs
```

---

## Pages & Filtres

| Page | Données sources | Filtres disponibles |
|------|----------------|---------------------|
| Vue Exécutive | fact_subscriptions · fact_support · fact_serverperformance | Année · Mois · Plan |
| Monétisation | fact_subscriptions | Année · Mois · Plan |
| Engagement Utilisateurs | fact_sessions | Année · Mois |
| Support Client | fact_support | Année · Mois · Catégorie · Priorité |
| Performance Serveur | fact_serverperformance | Année · Mois |
| Prédiction ML | Résultats statiques notebook (Rég. Log. · RF · XGBoost · ANN) | — |

---

## KPIs clés

| KPI | Valeur | Requête SQL |
|-----|--------|-------------|
| MRR | 11 896 TND | `SUM(prix_mensuel_tnd) WHERE est_actif = 1` |
| Churn % | 2.41 % | Taux mensuel calculé |
| CSAT | 2.95 / 5 | `AVG(csat_score) WHERE est_resolu = 1` |
| SLA % | 92.02 % | `SUM(est_sla_respecte) / SUM(est_resolu)` |
| Uptime % | 98.25 % | `SUM(statut='OK') / COUNT(*)` |

---

## Installation & Lancement

### Prérequis
- Node.js ≥ 18
- PostgreSQL (local) **ou** connexion Neon (cloud)

### En développement (2 terminaux)

```bash
# Terminal 1 — Backend
npm run dev:backend      # → http://localhost:5000

# Terminal 2 — Frontend
npm run dev:frontend     # → http://localhost:3000
```

### En production

```bash
npm install
npm run build
NODE_ENV=production DATABASE_URL=<neon_url> npm start
```
### Connexion

| Champ | Valeur |
|-------|--------|
| Utilisateur | `admin` |
| Mot de passe | `admin123` |

Login page: 
<img width="1460" height="836" alt="Capture d&#39;écran 2026-10-16 181935" src="https://github.com/user-attachments/assets/1a0de148-d717-47dc-86af-a19a9533a912" />

Home page: 
<img width="1160" height="862" alt="Home page " src="https://github.com/user-attachments/assets/7c35a558-2733-4cb2-8ddd-79d6eda62dee" />

Monetisation page : 
<img width="1150" height="866" alt="monetisation page " src="https://github.com/user-attachments/assets/2b39d63b-fa13-43fd-9eb4-d630ddc0f439" />

Engagement page: 
<img width="1157" height="866" alt="Capture d&#39;écran 2026-10-16 183707" src="https://github.com/user-attachments/assets/f077e859-e2d8-4df3-8529-469f57d01814" />

Support client page : 
<img width="1160" height="866" alt="Capture d&#39;écran 2026-10-16 183636" src="https://github.com/user-attachments/assets/6a020342-86f3-4e11-926c-a24a5ed4e965" />


