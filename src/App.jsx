import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Business    from './pages/Business';
import Users       from './pages/Users';
import Tech        from './pages/Tech';
import Support     from './pages/Support';
import Performance from './pages/Performance';
import Prediction  from './pages/Prediction';
import Login       from './pages/Login';

const PAGE_META = {
  business:    { title: 'Vue Exécutive',      subtitle: 'MRR · Churn · CSAT · SLA · Uptime' },
  users:       { title: 'Monétisation',        subtitle: 'ARPU · Abonnements · Revenus · Désabonnements' },
  tech:        { title: 'Engagement',          subtitle: 'Sessions · MAU · Bounce · OS · Navigateurs' },
  support:     { title: 'Support Client',      subtitle: 'Tickets · CSAT · Priorités · Délais résolution' },
  performance: { title: 'Performance Serveur', subtitle: 'CPU · RAM · Incidents · Temps réponse' },
  prediction:  { title: 'Prédiction ML',       subtitle: 'Rég. Log. · Random Forest · XGBoost · ANN · Simulateur' },
};

export default function App() {
  const [user,       setUser]       = useState(null);
  const [activePage, setActivePage] = useState('business');

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const meta = PAGE_META[activePage];

  const renderPage = () => {
    switch (activePage) {
      case 'business':    return <Business />;
      case 'users':       return <Users />;
      case 'tech':        return <Tech />;
      case 'support':     return <Support />;
      case 'performance': return <Performance />;
      case 'prediction':  return <Prediction />;
      default:            return <Business />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="main-area">
        <Topbar
          title={meta.title}
          subtitle={meta.subtitle}
          user={user}
          onLogout={() => setUser(null)}
        />
        <div className="page-content">{renderPage()}</div>
      </div>
    </div>
  );
}
