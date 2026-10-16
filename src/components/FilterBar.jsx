const MOIS_FR = [
  { v: 1,  l: 'Janvier' }, { v: 2,  l: 'Février' },  { v: 3,  l: 'Mars' },
  { v: 4,  l: 'Avril' },   { v: 5,  l: 'Mai' },       { v: 6,  l: 'Juin' },
  { v: 7,  l: 'Juillet' }, { v: 8,  l: 'Août' },      { v: 9,  l: 'Septembre' },
  { v: 10, l: 'Octobre' }, { v: 11, l: 'Novembre' },  { v: 12, l: 'Décembre' },
];

const PLANS = ['Premium', 'Standard', 'Entreprise'];
const CATS  = ['Bug', 'Fonctionnalité', 'Performance', 'Facturation', 'Sécurité', 'Autre'];
const PRIOS = ['Critique', 'Haute', 'Moyenne', 'Basse'];

function Select({ value, onChange, options, allLabel }) {
  const active = value !== '';
  return (
    <div className={`fb-select-wrap ${active ? 'active' : ''}`}>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
      </svg>
      <select value={value} onChange={e => onChange(e.target.value)}>
        <option value="">{allLabel}</option>
        {options.map(o => (
          <option key={o.v ?? o} value={o.v ?? o}>{o.l ?? o}</option>
        ))}
      </select>
    </div>
  );
}

export default function FilterBar({
  filters, onChange, annees = [],
  showPlan = false, showCategorie = false, showPriorite = false,
}) {
  const activeCount = Object.values(filters).filter(v => v !== '').length;
  const set = (key) => (val) => onChange({ ...filters, [key]: val });
  const reset = () => onChange({ annee: '', mois: '', plan: '', categorie: '', priorite: '' });

  return (
    <div className="filter-bar">
      <div className="filter-bar-left">
        <span className="filter-bar-icon">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" strokeWidth="2.5">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
        </span>
        <span className="filter-bar-label">Filtres</span>
        {activeCount > 0 && <span className="filter-bar-badge">{activeCount}</span>}
      </div>

      <div className="filter-bar-selects">
        <Select value={filters.annee} onChange={set('annee')}
          options={annees.map(a => ({ v: a, l: String(a) }))} allLabel="Toutes les années" />

        <Select value={filters.mois} onChange={set('mois')}
          options={MOIS_FR} allLabel="Tous les mois" />

        {showPlan && (
          <Select value={filters.plan} onChange={set('plan')}
            options={PLANS} allLabel="Tous les plans" />
        )}
        {showCategorie && (
          <Select value={filters.categorie} onChange={set('categorie')}
            options={CATS} allLabel="Toutes les catégories" />
        )}
        {showPriorite && (
          <Select value={filters.priorite} onChange={set('priorite')}
            options={PRIOS} allLabel="Toutes les priorités" />
        )}
      </div>

      {activeCount > 0 && (
        <button className="filter-bar-reset" onClick={reset}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 .49-3.65"/>
          </svg>
          Réinitialiser
        </button>
      )}
    </div>
  );
}

export function buildQS(filters) {
  const p = new URLSearchParams();
  if (filters.annee)     p.set('annee',     filters.annee);
  if (filters.mois)      p.set('mois',      filters.mois);
  if (filters.plan)      p.set('plan',      filters.plan);
  if (filters.categorie) p.set('categorie', filters.categorie);
  if (filters.priorite)  p.set('priorite',  filters.priorite);
  const qs = p.toString();
  return qs ? `?${qs}` : '';
}

export const defaultFilters = { annee: '', mois: '', plan: '', categorie: '', priorite: '' };
