import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import QRScanner from './QRScanner';

const CoxerDashboard = () => {
  const navigate = useNavigate();
  const [stationName, setStationName] = useState("Gare de Yopougon");
  const [crowdLevel, setCrowdLevel] = useState(1); // 0: vide, 1: moyen, 2: plein
  const [todayStats, setTodayStats] = useState({
    vehicles: 42,
    passengers: 850,
    revenue: 425000,
    alerts: 3
  });
  const [pendingScans, setPendingScans] = useState([]);
  const [recentDepartures, setRecentDepartures] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [time, setTime] = useState(new Date());

  // Mettre à jour l'heure en temps réel
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Simuler des données de départ
  useEffect(() => {
    const departures = [
      { id: 1, vehicle: 'GB-123-AB', driver: 'Koffi', destination: 'Plateau', time: '08:30', status: 'departed' },
      { id: 2, vehicle: 'GB-456-CD', driver: 'Aïcha', destination: 'Cocody', time: '08:45', status: 'boarding' },
      { id: 3, vehicle: 'GB-789-EF', driver: 'Jean', destination: 'Adjamé', time: '09:00', status: 'waiting' },
      { id: 4, vehicle: 'GB-101-GH', driver: 'Moussa', destination: 'Marcory', time: '09:15', status: 'ready' },
    ];
    setRecentDepartures(departures);
  }, []);

  // Changer le niveau de foule
  const updateCrowdLevel = (level) => {
    setCrowdLevel(level);
    
    // Envoyer au serveur
    fetch('/api/coxer/crowd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ station: stationName, level: level, timestamp: new Date().toISOString() })
    }).then(() => {
      alert(`✅ Niveau de foule mis à jour: ${
        level === 0 ? 'Vide' : level === 1 ? 'Moyen' : 'Plein'
      }`);
    }).catch(err => {
      console.log('Mode hors-ligne, sauvegarde locale');
      localStorage.setItem('crowd_level', level.toString());
    });
  };

  // Scanner un départ
  const handleDepartureScan = (scanData) => {
    if (!scanData || !scanData.vehicleId) {
      alert('❌ Code QR invalide');
      return;
    }

    const newDeparture = {
      id: Date.now(),
      vehicle: scanData.vehicleId,
      driver: scanData.driver || 'Inconnu',
      destination: scanData.destination || 'Non spécifié',
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'departed',
      scannedAt: new Date().toISOString()
    };

    // Ajouter aux départs récents
    setRecentDepartures(prev => [newDeparture, ...prev.slice(0, 9)]);
    
    // Mettre à jour les stats
    setTodayStats(prev => ({
      ...prev,
      vehicles: prev.vehicles + 1,
      passengers: prev.passengers + Math.floor(Math.random() * 20) + 10,
      revenue: prev.revenue + 10000
    }));

    // Ajouter aux scans en attente de sync
    setPendingScans(prev => [...prev, newDeparture]);

    // Notification
    alert(`✅ Départ enregistré !\n${newDeparture.vehicle} → ${newDeparture.destination}`);
    
    // Fermer le scanner
    setShowScanner(false);
  };

  // Synchroniser les scans
  const syncScans = () => {
    if (pendingScans.length === 0) {
      alert('✅ Aucun scan à synchroniser');
      return;
    }

    fetch('/api/coxer/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scans: pendingScans })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setPendingScans([]);
        alert(`✅ ${pendingScans.length} scans synchronisés !`);
      }
    })
    .catch(err => {
      alert('⚠️ Synchronisation échouée, réessayez plus tard');
    });
  };

  // Voir les détails d'un véhicule
  const viewVehicleDetails = (vehicleId) => {
    navigate(`/vehicle/${vehicleId}`);
  };

  // Niveaux de foule avec couleurs
  const crowdLevels = [
    { level: 0, label: 'Vide', color: 'bg-green-500', icon: '😌', description: 'Moins de 10 personnes' },
    { level: 1, label: 'Moyen', color: 'bg-yellow-500', icon: '😊', description: '10-30 personnes' },
    { level: 2, label: 'Plein', color: 'bg-red-500', icon: '😅', description: 'Plus de 30 personnes' }
  ];

  // Format de l'heure
  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = time.toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

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
                <h1 className="text-xl font-bold">Mode Coxer</h1>
                <p className="text-xs text-gray-400">{stationName} • {formattedTime}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <div className="text-sm">{formattedDate}</div>
                <div className="text-xs text-gray-400">Journée active</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center font-bold">
                🏢
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Bannière d'affluence */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 mb-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Affluence de la gare</h2>
              <p className="text-gray-400">Informez les chauffeurs en temps réel</p>
            </div>
            
            <div className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 ${
              crowdLevel === 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
              crowdLevel === 1 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
              'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              <span className="text-xl">
                {crowdLevel === 0 ? '😌' : crowdLevel === 1 ? '😊' : '😅'}
              </span>
              <span>{crowdLevels[crowdLevel].label}</span>
            </div>
          </div>
          
          {/* Boutons de niveau */}
          <div className="grid grid-cols-3 gap-3">
            {crowdLevels.map((level) => (
              <button
                key={level.level}
                onClick={() => updateCrowdLevel(level.level)}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  crowdLevel === level.level
                    ? `${level.color} border-${level.color.replace('bg-', 'border-')} scale-105`
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <span className="text-3xl">{level.icon}</span>
                <span className="font-bold">{level.label}</span>
                <span className="text-xs text-gray-300 text-center">{level.description}</span>
              </button>
            ))}
          </div>
          
          <div className="mt-4 text-sm text-gray-400">
            💡 <strong>Conseil :</strong> Mettez à jour régulièrement pour attirer plus de chauffeurs.
          </div>
        </div>

        {/* Grid principale */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche : Scanner et Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scanner de départ */}
            <div className="bg-black/40 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">📷 Scanner un départ</h3>
                  <p className="text-gray-400">Scannez le sticker du Gbaka qui quitte la gare</p>
                </div>
                
                {pendingScans.length > 0 && (
                  <button
                    onClick={syncScans}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-bold flex items-center gap-2"
                  >
                    <span>🔄</span>
                    <span>Sync ({pendingScans.length})</span>
                  </button>
                )}
              </div>
              
              {showScanner ? (
                <div className="text-center">
                  <QRScanner onScan={handleDepartureScan} />
                  <button
                    onClick={() => setShowScanner(false)}
                    className="mt-4 text-gray-400 hover:text-white"
                  >
                    Annuler le scan
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📷</div>
                  <h4 className="text-lg font-bold mb-2">Prêt à scanner</h4>
                  <p className="text-gray-400 mb-6">Scannez le code QR sur le côté du Gbaka</p>
                  
                  <button
                    onClick={() => setShowScanner(true)}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 mx-auto"
                  >
                    <span>📷</span>
                    <span>Ouvrir le scanner</span>
                  </button>
                  
                  <div className="mt-6 text-sm text-gray-400">
                    <p>📍 Positionnez le code QR dans le cadre</p>
                    <p>✅ Le scan ajoute automatiquement 10 points au chauffeur</p>
                  </div>
                </div>
              )}
              
              {/* Simuler un scan (pour test) */}
              <div className="mt-6">
                <button
                  onClick={() => handleDepartureScan({
                    vehicleId: `GB-TEST-${Math.floor(Math.random() * 900) + 100}`,
                    driver: 'Test Driver',
                    destination: 'Plateau'
                  })}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg text-sm"
                >
                  🧪 Simuler un scan (pour test)
                </button>
              </div>
            </div>

            {/* Statistiques du jour */}
            <div className="bg-black/40 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-6">📊 Statistiques du jour</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 text-center border border-blue-500/30">
                  <div className="text-3xl font-bold">{todayStats.vehicles}</div>
                  <div className="text-sm text-gray-300">Véhicules</div>
                  <div className="text-xs text-gray-400 mt-1">Départs enregistrés</div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 text-center border border-green-500/30">
                  <div className="text-3xl font-bold">{todayStats.passengers}</div>
                  <div className="text-sm text-gray-300">Passagers</div>
                  <div className="text-xs text-gray-400 mt-1">Estimés</div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl p-4 text-center border border-yellow-500/30">
                  <div className="text-3xl font-bold">{(todayStats.revenue / 1000).toFixed(0)}K</div>
                  <div className="text-sm text-gray-300">Recette</div>
                  <div className="text-xs text-gray-400 mt-1">FCFA estimés</div>
                </div>
                
                <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl p-4 text-center border border-red-500/30">
                  <div className="text-3xl font-bold">{todayStats.alerts}</div>
                  <div className="text-sm text-gray-300">Alertes</div>
                  <div className="text-xs text-gray-400 mt-1">Envoyées</div>
                </div>
              </div>
              
              {/* Graphique simple */}
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Objectif journalier</span>
                  <span>{Math.min(100, Math.floor((todayStats.vehicles / 60) * 100))}%</span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (todayStats.vehicles / 60) * 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mt-2 text-center">
                  {todayStats.vehicles >= 60 ? '🎉 Objectif atteint !' : `${60 - todayStats.vehicles} départs restants`}
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite : Départs récents */}
          <div className="space-y-6">
            {/* Départs récents */}
            <div className="bg-black/40 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">🚌 Départs récents</h3>
                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                  {recentDepartures.length} aujourd'hui
                </span>
              </div>
              
              {recentDepartures.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">🚫</div>
                  <p>Aucun départ aujourd'hui</p>
                  <p className="text-sm">Scannez votre premier Gbaka</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentDepartures.map((departure) => (
                    <div
                      key={departure.id}
                      className="p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer"
                      onClick={() => viewVehicleDetails(departure.vehicle)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-xs">
                            🚌
                          </div>
                          <div>
                            <div className="font-bold">{departure.vehicle}</div>
                            <div className="text-xs text-gray-400">{departure.driver}</div>
                          </div>
                        </div>
                        
                        <div className={`px-2 py-1 rounded text-xs font-bold ${
                          departure.status === 'departed' ? 'bg-green-500/20 text-green-400' :
                          departure.status === 'boarding' ? 'bg-yellow-500/20 text-yellow-400' :
                          departure.status === 'waiting' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {departure.status === 'departed' ? 'Parti' :
                           departure.status === 'boarding' ? 'Embarquement' :
                           departure.status === 'waiting' ? 'En attente' : 'Prêt'}
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <span>📍</span>
                          <span>{departure.destination}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>🕐</span>
                          <span>{departure.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <button className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm">
                Voir l'historique complet →
              </button>
            </div>

            {/* Gares à proximité */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold mb-4">📍 Gares à proximité</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center">
                      😌
                    </div>
                    <div>
                      <div className="font-medium">Williamsville</div>
                      <div className="text-xs text-gray-300">2.3 km</div>
                    </div>
                  </div>
                  <div className="text-sm">Vide</div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center">
                      😅
                    </div>
                    <div>
                      <div className="font-medium">Siporex</div>
                      <div className="text-xs text-gray-300">3.1 km</div>
                    </div>
                  </div>
                  <div className="text-sm">Pleine</div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center justify-center">
                      😊
                    </div>
                    <div>
                      <div className="font-medium">Abobo</div>
                      <div className="text-xs text-gray-300">5.7 km</div>
                    </div>
                  </div>
                  <div className="text-sm">Moyen</div>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-300">
                <p>📊 <strong>Statut global :</strong> 65% des gares ont une affluence moyenne</p>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-black/40 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold mb-4">⚡ Actions rapides</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/chauffeur')}
                  className="w-full p-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 border border-orange-500/30 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🚌</span>
                    <span>Mode Chauffeur</span>
                  </div>
                  <span>→</span>
                </button>
                
                <button
                  onClick={() => alert('Fonctionnalité à venir!')}
                  className="w-full p-3 bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 border border-blue-500/30 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📋</span>
                    <span>Rapport journalier</span>
                  </div>
                  <span>→</span>
                </button>
                
                <button
                  onClick={() => alert('Support contacté!')}
                  className="w-full p-3 bg-gradient-to-r from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 border border-green-500/30 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📞</span>
                    <span>Support Coxer</span>
                  </div>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section gestion de gare */}
        <div className="mt-6 bg-black/40 rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold mb-4">🏢 Gestion de votre gare</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📊</span>
                </div>
                <div>
                  <div className="font-bold">Performance</div>
                  <div className="text-xs text-gray-400">Classement: #3 sur 12</div>
                </div>
              </div>
              <button className="w-full mt-2 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm">
                Voir détails
              </button>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl">👥</span>
                </div>
                <div>
                  <div className="font-bold">Équipe</div>
                  <div className="text-xs text-gray-400">3 coxers actifs</div>
                </div>
              </div>
              <button className="w-full mt-2 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm">
                Gérer l'équipe
              </button>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <span className="text-xl">💰</span>
                </div>
                <div>
                  <div className="font-bold">Commissions</div>
                  <div className="text-xs text-gray-400">25 000 FCFA ce mois</div>
                </div>
              </div>
              <button className="w-full mt-2 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm">
                Voir paiements
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-sm text-gray-400">
            <p>📌 <strong>Votre gare :</strong> {stationName}</p>
            <p>📍 <strong>Adresse :</strong> Rue du Commerce, Yopougon</p>
            <p>⏰ <strong>Horaires :</strong> 5h00 - 22h00, 7j/7</p>
          </div>
        </div>
      </main>

      {/* Barre de statut basse */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm">Connecté</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">📷</span>
                <span className="font-bold">{pendingScans.length}</span>
                <span className="text-xs text-gray-400">scans en attente</span>
              </div>
              
              <div className="hidden md:flex items-center gap-2">
                <span className="text-blue-400">🏢</span>
                <span className="text-xs text-gray-400">Dernière mise à jour: {formattedTime}</span>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/admin')}
              className="text-sm bg-gradient-to-r from-orange-500 to-red-500 px-4 py-1.5 rounded-lg font-bold"
            >
              Admin Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Scanner modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Scanner un départ</h3>
              <button
                onClick={() => setShowScanner(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center">
              <div className="relative w-64 h-64 mx-auto mb-4">
                <div className="absolute inset-0 border-2 border-orange-500 rounded-xl"></div>
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-orange-500 rounded-tl"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-orange-500 rounded-tr"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-orange-500 rounded-bl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-orange-500 rounded-br"></div>
              </div>
              
              <p className="text-gray-400 mb-4">
                Pointez la caméra vers le code QR sur le Gbaka
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => handleDepartureScan({
                    vehicleId: `GB-SCAN-${Math.floor(Math.random() * 1000)}`,
                    driver: 'Chauffeur scanné',
                    destination: 'Destination automatique'
                  })}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-bold"
                >
                  Simuler scan
                </button>
                
                <button
                  onClick={() => setShowScanner(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-3 rounded-lg"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoxerDashboard;