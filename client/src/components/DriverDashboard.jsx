import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [dailyPoints, setDailyPoints] = useState(0);
  const [dailyTrips, setDailyTrips] = useState(0);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Données simulateur
  const driverData = {
    name: "Koffi Traoré",
    vehicle: "GB-123-AB",
    line: "Yopougon - Plateau",
    rating: 4.7,
    totalPoints: 12500,
    todayEarnings: 8500
  };

  // Alertes IA simulées
  const aiAlerts = [
    { id: 1, type: 'crowd', message: '📍 Station Williamsville: 25 clients en attente', time: '2 min', priority: 'high' },
    { id: 2, type: 'traffic', message: '🚦 Bouchon sur le pont Houphouët-Boigny', time: '5 min', priority: 'medium' },
    { id: 3, type: 'police', message: '👮 Barrage police à Cocody', time: '10 min', priority: 'high' },
  ];

  // Démarrer le suivi GPS
  const startTracking = () => {
    setIsActive(true);
    setIsSharing(true);
    
    // Simuler la position
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setSpeed(position.coords.speed || 0);
        
        // Simuler des points en fonction de la distance
        if (position.coords.speed > 0) {
          setDailyPoints(prev => prev + Math.floor(position.coords.speed / 10));
          setRevenue(prev => prev + Math.floor(position.coords.speed / 5));
        }
      },
      (error) => console.error('GPS Error:', error),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
    );

    // Sauvegarder l'ID pour nettoyer
    localStorage.setItem('gps_watch_id', watchId);
    
    // Démarrer le simulateur de trajet
    startTripSimulator();
    
    // Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🚀 Mode Chauffeur Activé', {
        body: 'Vous gagnez maintenant des points en temps réel !',
        icon: '/logo192.png'
      });
    }
  };

  // Arrêter le suivi
  const stopTracking = () => {
    setIsActive(false);
    setIsSharing(false);
    
    const watchId = localStorage.getItem('gps_watch_id');
    if (watchId) {
      navigator.geolocation.clearWatch(parseInt(watchId));
      localStorage.removeItem('gps_watch_id');
    }
    
    // Sauvegarder la session
    saveSession();
  };

  // Simuler un trajet
  const startTripSimulator = () => {
    const interval = setInterval(() => {
      if (isActive) {
        setDailyTrips(prev => prev + 0.1);
        setDailyPoints(prev => prev + 5);
        setRevenue(prev => prev + 100);
      } else {
        clearInterval(interval);
      }
    }, 10000); // Toutes les 10 secondes

    return () => clearInterval(interval);
  };

  // Sauvegarder la session
  const saveSession = () => {
    const session = {
      date: new Date().toISOString().split('T')[0],
      points: dailyPoints,
      trips: Math.floor(dailyTrips),
      revenue: revenue,
      duration: '8h 30min'
    };
    
    const sessions = JSON.parse(localStorage.getItem('driver_sessions') || '[]');
    sessions.push(session);
    localStorage.setItem('driver_sessions', JSON.stringify(sessions));
  };

  // Envoyer une alerte
  const sendAlert = (type) => {
    const alertTypes = {
      police: { icon: '👮', message: 'Barrage de police signalé', points: 15 },
      traffic: { icon: '🚦', message: 'Bouchon important signalé', points: 10 },
      accident: { icon: '🚨', message: 'Accident/panne signalé', points: 20 },
      crowd: { icon: '👥', message: 'Zone de clientèle signalée', points: 5 }
    };
    
    const alert = alertTypes[type];
    if (!alert) return;
    
    const newAlert = {
      id: Date.now(),
      type: type,
      message: alert.message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      points: alert.points
    };
    
    setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
    setDailyPoints(prev => prev + alert.points);
    
    // Envoyer au serveur (simulation)
    fetch('/api/driver/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAlert)
    }).catch(err => console.log('Mode hors-ligne, alerte sauvegardée localement'));
    
    // Notification
    alert(`✅ ${alert.message} ! +${alert.points} points`);
  };

  // Mode urgence/SOS
  const triggerEmergency = () => {
    setEmergencyMode(true);
    
    // Vibrer le téléphone
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
    
    // Envoyer alerte urgente
    fetch('/api/emergency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'sos',
        location: currentLocation,
        driver: driverData.name,
        vehicle: driverData.vehicle,
        timestamp: new Date().toISOString()
      })
    });
    
    // Appeler les secours si possible
    if (confirm('🚨 SOS - Voulez-vous appeler les secours ?')) {
      window.location.href = 'tel:185';
    }
    
    // Notification aux autres chauffeurs
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🚨 URGENCE - Chauffeur en détresse', {
        body: `${driverData.name} (${driverData.vehicle}) a activé le SOS`,
        tag: 'emergency',
        requireInteraction: true
      });
    }
  };

  // Charger les données au démarrage
  useEffect(() => {
    // Charger les sessions précédentes
    const sessions = JSON.parse(localStorage.getItem('driver_sessions') || '[]');
    const todaySession = sessions.find(s => s.date === new Date().toISOString().split('T')[0]);
    
    if (todaySession) {
      setDailyPoints(todaySession.points);
      setDailyTrips(todaySession.trips);
      setRevenue(todaySession.revenue);
    }
    
    // Demander la permission des notifications
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // Simuler des alertes IA
    const alertInterval = setInterval(() => {
      if (isActive && Math.random() > 0.7) {
        const randomAlert = aiAlerts[Math.floor(Math.random() * aiAlerts.length)];
        setAlerts(prev => [randomAlert, ...prev.slice(0, 9)]);
        
        // Notification push
        if (Notification.permission === 'granted') {
          new Notification('📢 Alerte IA Goudron', {
            body: randomAlert.message,
            icon: '/logo192.png'
          });
        }
      }
    }, 30000); // Toutes les 30 secondes
    
    return () => clearInterval(alertInterval);
  }, [isActive]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                ←
              </button>
              <div>
                <h1 className="text-xl font-bold">Mode Chauffeur</h1>
                <p className="text-xs text-gray-400">{driverData.name} • {driverData.vehicle}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-bold text-lg">{driverData.rating} ⭐</div>
                <div className="text-xs text-gray-400">Note</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center font-bold">
                🚌
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Bannière d'activation */}
        <div className={`rounded-2xl p-6 mb-6 ${
          isActive 
            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30'
            : 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {isActive ? '🚀 En route !' : 'Prêt à démarrer ?'}
              </h2>
              <p className="text-gray-300">
                {isActive 
                  ? `Vous gagnez des points en temps réel • Vitesse: ${Math.round(speed)} km/h`
                  : 'Activez le partage de position pour commencer à gagner des points'
                }
              </p>
            </div>
            
            <button
              onClick={isActive ? stopTracking : startTracking}
              className={`px-8 py-3 rounded-full font-bold text-lg ${
                isActive
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
              }`}
            >
              {isActive ? '🛑 Arrêter' : '🚀 Démarrer'}
            </button>
          </div>
          
          {isActive && currentLocation && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-black/30 rounded-xl p-3 text-center">
                <div className="text-sm text-gray-400">Position</div>
                <div className="font-mono text-xs">
                  {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}
                </div>
              </div>
              <div className="bg-black/30 rounded-xl p-3 text-center">
                <div className="text-sm text-gray-400">Vitesse</div>
                <div className="font-bold">{Math.round(speed)} km/h</div>
              </div>
              <div className="bg-black/30 rounded-xl p-3 text-center">
                <div className="text-sm text-gray-400">Précision</div>
                <div className="font-bold">±{Math.round(currentLocation.accuracy)}m</div>
              </div>
            </div>
          )}
        </div>

        {/* Grid principale */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche : Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats quotidiennes */}
            <div className="bg-black/40 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-4">📊 Recette du jour</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-4 text-center border border-orange-500/30">
                  <div className="text-3xl font-bold">{dailyPoints}</div>
                  <div className="text-sm text-gray-300">Points</div>
                  <div className="text-xs text-gray-400 mt-1">+5/min en route</div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 text-center border border-blue-500/30">
                  <div className="text-3xl font-bold">{Math.floor(dailyTrips)}</div>
                  <div className="text-sm text-gray-300">Trajets</div>
                  <div className="text-xs text-gray-400 mt-1">~{Math.round(dailyTrips * 45)} min</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 text-center border border-green-500/30">
                  <div className="text-3xl font-bold">{revenue.toLocaleString()} F</div>
                  <div className="text-sm text-gray-300">Recette</div>
                  <div className="text-xs text-gray-400 mt-1">+100F/min</div>
                </div>
              </div>
              
              {/* Progression */}
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Objectif journalier</span>
                  <span>{Math.min(100, Math.floor((dailyPoints / 500) * 100))}%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (dailyPoints / 500) * 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mt-2 text-center">
                  {500 - dailyPoints > 0 ? `${500 - dailyPoints} points restants` : '🎉 Objectif atteint !'}
                </div>
              </div>
            </div>

            {/* Alertes rapides */}
            <div className="bg-black/40 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-4">🚨 Alertes rapides</h3>
              <p className="text-gray-400 mb-4">Signalez pour aider la communauté</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => sendAlert('police')}
                  className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 hover:from-blue-600/30 hover:to-blue-700/30 border border-blue-500/30 rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:scale-105"
                >
                  <span className="text-2xl">👮</span>
                  <span className="font-medium">Police</span>
                  <span className="text-xs text-gray-400">+15 pts</span>
                </button>
                
                <button
                  onClick={() => sendAlert('traffic')}
                  className="bg-gradient-to-br from-red-500/20 to-red-600/20 hover:from-red-600/30 hover:to-red-700/30 border border-red-500/30 rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:scale-105"
                >
                  <span className="text-2xl">🚦</span>
                  <span className="font-medium">Bouchon</span>
                  <span className="text-xs text-gray-400">+10 pts</span>
                </button>
                
                <button
                  onClick={() => sendAlert('accident')}
                  className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 hover:from-yellow-600/30 hover:to-yellow-700/30 border border-yellow-500/30 rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:scale-105"
                >
                  <span className="text-2xl">🚨</span>
                  <span className="font-medium">Accident</span>
                  <span className="text-xs text-gray-400">+20 pts</span>
                </button>
                
                <button
                  onClick={() => sendAlert('crowd')}
                  className="bg-gradient-to-br from-green-500/20 to-green-600/20 hover:from-green-600/30 hover:to-green-700/30 border border-green-500/30 rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:scale-105"
                >
                  <span className="text-2xl">👥</span>
                  <span className="font-medium">Clients</span>
                  <span className="text-xs text-gray-400">+5 pts</span>
                </button>
              </div>
              
              {/* Bouton urgence */}
              <button
                onClick={triggerEmergency}
                className={`w-full mt-4 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 ${
                  emergencyMode
                    ? 'bg-gradient-to-r from-red-600 to-pink-700 animate-pulse'
                    : 'bg-gradient-to-r from-red-500/20 to-pink-600/20 border border-red-500/30 hover:from-red-600/30 hover:to-pink-700/30'
                }`}
              >
                <span className="text-2xl">🚨</span>
                <span>{emergencyMode ? 'SOS ACTIVÉ - Secours alertés' : 'URGENCE / SOS'}</span>
              </button>
              
              {emergencyMode && (
                <div className="mt-3 text-center text-sm text-red-300">
                  Les secours ont été alertés. Restez où vous êtes.
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite : Alertes IA & Historique */}
          <div className="space-y-6">
            {/* Alertes IA */}
            <div className="bg-black/40 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">🤖 Alertes IA</h3>
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                  Temps réel
                </span>
              </div>
              
              <div className="space-y-3">
                {aiAlerts.map(alert => (
                  <div 
                    key={alert.id}
                    className={`p-3 rounded-lg border ${
                      alert.priority === 'high'
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-blue-500/10 border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{alert.type === 'crowd' ? '📍' : 
                                                 alert.type === 'traffic' ? '🚦' : '👮'}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-400">Il y a {alert.time}</span>
                          <button className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded">
                            Voir carte
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm">
                Voir toutes les alertes →
              </button>
            </div>

            {/* Historique des alertes */}
            <div className="bg-black/40 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-4">📝 Vos signalements</h3>
              
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-3xl mb-2">📭</div>
                  <p>Aucun signalement aujourd'hui</p>
                  <p className="text-sm">Utilisez les boutons pour signaler</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {alerts.map(alert => (
                    <div key={alert.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {alert.type === 'police' ? '👮' :
                           alert.type === 'traffic' ? '🚦' :
                           alert.type === 'accident' ? '🚨' : '👥'}
                        </span>
                        <div>
                          <p className="text-sm font-medium">{alert.message}</p>
                          <p className="text-xs text-gray-400">{alert.time}</p>
                        </div>
                      </div>
                      <span className="text-green-400 font-bold">+{alert.points}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 text-center">
                <div className="text-3xl font-bold text-orange-400">{dailyPoints}</div>
                <div className="text-sm text-gray-400">Points gagnés aujourd'hui</div>
              </div>
            </div>

            {/* Ligne actuelle */}
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-6 border border-orange-500/30">
              <h3 className="text-xl font-bold mb-2">📍 Votre ligne</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{driverData.line}</div>
                  <div className="text-sm text-gray-300">Yopougon ↔ Plateau</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">12</div>
                  <div className="text-xs text-gray-400">Arrêts</div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <span className="text-sm font-bold">65%</span>
              </div>
              
              <button className="w-full mt-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium">
                Changer de ligne
              </button>
            </div>
          </div>
        </div>

        {/* Section infos véhicule */}
        <div className="mt-6 bg-black/40 rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold mb-4">🚗 Votre véhicule</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-sm text-gray-400">Immatriculation</div>
              <div className="text-lg font-bold font-mono">{driverData.vehicle}</div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-sm text-gray-400">Type</div>
              <div className="text-lg font-bold">Gbaka 22 places</div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-sm text-gray-400">Assurance</div>
              <div className="text-lg font-bold text-green-400">Valide</div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-sm text-gray-400">Contrôle technique</div>
              <div className="text-lg font-bold">Jusqu'au 15/12/2024</div>
            </div>
          </div>
        </div>
      </main>

      {/* Barre de statut basse */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isActive ? 'animate-pulse bg-green-500' : 'bg-gray-500'}`}></div>
                <span className="text-sm">{isActive ? 'Partage actif' : 'Partage inactif'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">💰</span>
                <span className="font-bold">{driverData.totalPoints.toLocaleString()}</span>
                <span className="text-xs text-gray-400">points totaux</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/coxer')}
                className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
              >
                Mode Coxer →
              </button>
              
              <button
                onClick={() => navigate('/wallet')}
                className="text-sm bg-gradient-to-r from-orange-500 to-red-500 px-4 py-1.5 rounded-lg font-bold"
              >
                Mon portefeuille
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;