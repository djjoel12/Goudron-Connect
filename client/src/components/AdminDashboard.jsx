import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 1250,
    activeDrivers: 420,
    activeCoxers: 85,
    totalRevenue: 12500000,
    dailyTrips: 3850,
    systemHealth: 98.7
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [time, setTime] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Détection mobile
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Données simulées
    const activities = [
      { id: 1, user: 'Koffi Traoré', action: 'Scanner QR', location: 'Yopougon', time: '2 min', points: 10 },
      { id: 2, user: 'Gbaka GB-123', action: 'Départ enregistré', location: 'Plateau', time: '5 min' },
      { id: 3, user: 'Station Williams', action: 'Affluence mise à jour', location: 'Williamsville', time: '10 min' },
      { id: 4, user: 'Aïcha Koné', action: 'Retrait effectué', location: 'Mobile Money', time: '15 min', amount: '5000 FCFA' },
      { id: 5, user: 'System', action: 'Backup automatique', location: 'Server 01', time: '30 min' },
    ];

    const systemAlerts = [
      { id: 1, type: 'warning', message: 'Station Cocody: Forte affluence', time: '5 min' },
      { id: 2, type: 'info', message: 'Mise à jour des lignes programmée', time: '15 min' },
      { id: 3, type: 'success', message: '5000 points distribués aujourd\'hui', time: '1h' },
    ];

    setRecentActivities(activities);
    setAlerts(systemAlerts);

    // Horloge
    const timer = setInterval(() => setTime(new Date()), 60000);

    return () => {
      window.removeEventListener('resize', checkMobile);
      clearInterval(timer);
    };
  }, []);

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = time.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header Admin */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">👑</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Supervision Goudron-Connect</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-gray-700">{formattedTime}</div>
                <div className="text-xs text-gray-500">{formattedDate}</div>
              </div>
              <Link 
                to="/" 
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium text-sm transition-colors"
              >
                ← Retour
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </h3>
                <div className={`p-2 rounded-lg ${
                  key.includes('Health') ? 'bg-green-100 text-green-600' :
                  key.includes('Revenue') ? 'bg-purple-100 text-purple-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {key.includes('Revenue') ? '💰' :
                   key.includes('Health') ? '🟢' :
                   key.includes('Users') ? '👥' : '📊'}
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {key.includes('Revenue') 
                  ? `${(value / 1000000).toFixed(1)}M FCFA`
                  : key.includes('Health')
                  ? `${value}%`
                  : value.toLocaleString()}
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    key.includes('Health') ? 'bg-green-500' :
                    key.includes('Revenue') ? 'bg-purple-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, value / (key.includes('Users') ? 2000 : 100))}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activités récentes */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Activités récentes</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Voir tout →
                </button>
              </div>
              
              <div className="space-y-4">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-100 to-orange-200 rounded-lg flex items-center justify-center mr-4">
                      <span className="text-orange-600">
                        {activity.user.includes('Gbaka') ? '🚌' :
                         activity.user.includes('Station') ? '🏢' :
                         activity.user.includes('System') ? '🤖' : '👤'}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-1 sm:mb-0">
                          <p className="font-medium text-gray-900 truncate">{activity.user}</p>
                          <p className="text-sm text-gray-600">{activity.action}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{activity.location}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                      
                      {activity.points && (
                        <div className="mt-2 inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          <span className="mr-1">+{activity.points}</span>
                          <span>points</span>
                        </div>
                      )}
                      {activity.amount && (
                        <div className="mt-2 inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          <span>{activity.amount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carte de supervision */}
            <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Supervision cartographique</h2>
              <div className="h-64 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-3">🗺️</div>
                  <p className="text-gray-600">Carte de supervision en temps réel</p>
                  <button className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium">
                    Ouvrir la carte complète
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Alertes système */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Alertes système</h2>
              
              <div className="space-y-3">
                {alerts.map(alert => (
                  <div key={alert.id} className={`p-3 rounded-lg border ${
                    alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                    alert.type === 'info' ? 'bg-blue-50 border-blue-200' :
                    'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <span className={`text-lg ${
                        alert.type === 'warning' ? 'text-yellow-600' :
                        alert.type === 'info' ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {alert.type === 'warning' ? '⚠️' :
                         alert.type === 'info' ? 'ℹ️' : '✅'}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">Il y a {alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium">
                Marquer tout comme lu
              </button>
            </div>

            {/* Actions rapides */}
            <div className="bg-gradient-to-r from-gray-900 to-black rounded-2xl p-6 text-white">
              <h2 className="text-xl font-bold mb-4">Actions rapides</h2>
              
              <div className="space-y-3">
                <button className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-3">
                    <span>👥</span>
                    <span>Gérer utilisateurs</span>
                  </div>
                  <span>→</span>
                </button>
                
                <button className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-3">
                    <span>💰</span>
                    <span>Voir transactions</span>
                  </div>
                  <span>→</span>
                </button>
                
                <button className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-3">
                    <span>📊</span>
                    <span>Générer rapport</span>
                  </div>
                  <span>→</span>
                </button>
                
                <button className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-3">
                    <span>⚙️</span>
                    <span>Paramètres système</span>
                  </div>
                  <span>→</span>
                </button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{stats.systemHealth}%</div>
                  <div className="text-sm text-gray-300">Santé du système</div>
                </div>
              </div>
            </div>

            {/* Informations système */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Informations système</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Version</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Dernière sauvegarde</span>
                  <span className="font-medium">02:30</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Uptime</span>
                  <span className="font-medium">99.8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Utilisateurs actifs</span>
                  <span className="font-medium">247</span>
                </div>
              </div>
              
              <button className="w-full mt-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-bold">
                🔄 Forcer synchronisation
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Admin */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} Goudron-Connect • Panel Admin
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Accès restreint • Dernière connexion: {formattedTime}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="text-sm text-gray-400 hover:text-white transition-colors">
                📋 Logs
              </button>
              <button className="text-sm text-gray-400 hover:text-white transition-colors">
                🛡️ Sécurité
              </button>
              <button className="text-sm px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium">
                🚪 Déconnexion
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* FAB Mobile pour Admin */}
      {isMobile && (
        <div className="fixed bottom-6 right-6 z-40">
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl active:scale-95 transition-all">
            <span className="text-2xl">⚡</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;