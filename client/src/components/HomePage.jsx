import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RealTimeMap from './RealTimeMap';
import LineSelector from './LineSelector';

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedLine, setSelectedLine] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [userPoints, setUserPoints] = useState(1250);
  const [activeView, setActiveView] = useState('map'); // 'map', 'lines', 'wallet'
  const [nearbyBuses, setNearbyBuses] = useState(3);

  // Obtenir la position
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          console.log('GPS non disponible, utilisation position par défaut');
          setUserLocation([5.3599517, -4.0082563]); // Abidjan par défaut
        }
      );
    }
  }, []);

  // Simuler des bus à proximité
  useEffect(() => {
    const interval = setInterval(() => {
      setNearbyBuses(prev => {
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, ou 1
        return Math.max(1, Math.min(10, prev + change));
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Scanner QR
  const handleScanQR = () => {
    if ('BarcodeDetector' in window) {
      // Scanner natif
      setShowScanner(true);
    } else {
      // Rediriger vers scanner avec camera
      navigate('/scanner');
    }
  };

  // Signaler un bus
  const handleReportBus = () => {
    // Enregistrer dans localStorage
    const reports = JSON.parse(localStorage.getItem('bus_reports') || '[]');
    reports.push({
      timestamp: new Date().toISOString(),
      location: userLocation,
      line: selectedLine
    });
    localStorage.setItem('bus_reports', JSON.stringify(reports));
    
    // Ajouter des points
    setUserPoints(prev => prev + 10);
    
    alert('✅ Bus signalé ! +10 points');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header PWA */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">🚌</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Goudron-Connect</h1>
                <p className="text-xs text-gray-400">Abidjan en temps réel</p>
              </div>
            </div>

            {/* Points utilisateur */}
            <button
              onClick={() => setActiveView('wallet')}
              className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-orange-500/30 transition-colors"
            >
              <span className="text-yellow-400">💰</span>
              <span className="font-bold">{userPoints.toLocaleString()}</span>
              <span className="text-xs text-gray-300">points</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation rapide */}
      <div className="fixed bottom-20 left-0 right-0 z-40 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-black/80 backdrop-blur-lg rounded-2xl border border-white/10 p-2">
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setActiveView('map')}
                className={`py-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  activeView === 'map' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <span className="text-xl">🗺️</span>
                <span className="text-xs font-medium">Carte</span>
              </button>
              
              <button
                onClick={() => setActiveView('lines')}
                className={`py-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  activeView === 'lines' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <span className="text-xl">🚌</span>
                <span className="text-xs font-medium">Lignes</span>
              </button>
              
              <button
                onClick={handleScanQR}
                className="py-3 rounded-xl flex flex-col items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white"
              >
                <span className="text-xl">📷</span>
                <span className="text-xs font-medium">Scanner</span>
              </button>
              
              <button
                onClick={() => navigate('/profile')}
                className="py-3 rounded-xl flex flex-col items-center gap-1 bg-white/5 hover:bg-white/10"
              >
                <span className="text-xl">👤</span>
                <span className="text-xs font-medium">Profil</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <main className="pt-16 pb-24">
        {activeView === 'map' ? (
          <div className="h-[calc(100vh-140px)] px-4">
            <RealTimeMap 
              selectedLine={selectedLine} 
              userLocation={userLocation}
            />
            
            {/* Bouton flottant signaler bus */}
            <button
              onClick={handleReportBus}
              className="fixed bottom-28 right-4 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full shadow-2xl shadow-orange-500/30 flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <span className="text-xl">🚨</span>
              <span className="font-bold">Signaler bus</span>
            </button>
          </div>
        ) : activeView === 'lines' ? (
          <div className="px-4 py-6">
            <LineSelector 
              onLineSelect={setSelectedLine} 
              selectedLine={selectedLine}
            />
            
            {selectedLine && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setActiveView('map')}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-shadow"
                >
                  🗺️ Voir sur la carte
                </button>
              </div>
            )}
          </div>
        ) : activeView === 'wallet' ? (
          <div className="px-4 py-6">
            <div className="max-w-md mx-auto">
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-6 mb-6">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">💰</div>
                  <div className="text-5xl font-bold">{userPoints.toLocaleString()}</div>
                  <div className="text-gray-300">points disponibles</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/50 rounded-xl p-4 text-center">
                    <div className="text-2xl">📱</div>
                    <div className="font-bold mt-2">100 MB</div>
                    <div className="text-sm text-gray-400">= 1000 points</div>
                  </div>
                  <div className="bg-black/50 rounded-xl p-4 text-center">
                    <div className="text-2xl">🎁</div>
                    <div className="font-bold mt-2">Cadeaux</div>
                    <div className="text-sm text-gray-400">Échanger points</div>
                  </div>
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-4">Comment gagner des points ?</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📷</span>
                    <div>
                      <div className="font-medium">Scanner un sticker</div>
                      <div className="text-sm text-gray-400">+10 points par scan</div>
                    </div>
                  </div>
                  <div className="text-green-400 font-bold">+10</div>
                </div>
                
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🚨</span>
                    <div>
                      <div className="font-medium">Signaler un bus</div>
                      <div className="text-sm text-gray-400">+10 points par signalement</div>
                    </div>
                  </div>
                  <div className="text-green-400 font-bold">+10</div>
                </div>
                
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">👥</span>
                    <div>
                      <div className="font-medium">Parrainer un ami</div>
                      <div className="text-sm text-gray-400">+100 points par parrainage</div>
                    </div>
                  </div>
                  <div className="text-green-400 font-bold">+100</div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Barre d'info en bas */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10 z-30">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-green-400">🚌</span>
                <span className="text-sm">{nearbyBuses} Gbakas proches</span>
              </div>
              {userLocation && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">📍</span>
                  <span className="text-sm">GPS actif</span>
                </div>
              )}
            </div>
            
            <button
              onClick={() => navigate('/chauffeur')}
              className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors"
            >
              Mode chauffeur →
            </button>
          </div>
        </div>
      </div>

      {/* Scanner overlay */}
      {showScanner && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="text-6xl mb-4">📷</div>
            <h3 className="text-2xl font-bold mb-2">Scanner un sticker</h3>
            <p className="text-gray-400 mb-6">Placez le code QR dans le cadre</p>
            
            <div className="relative w-64 h-64 mx-auto mb-6">
              <div className="absolute inset-0 border-2 border-orange-500 rounded-xl"></div>
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-orange-500 rounded-tl"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-orange-500 rounded-tr"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-orange-500 rounded-bl"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-orange-500 rounded-br"></div>
            </div>
            
            <button
              onClick={() => {
                setShowScanner(false);
                setUserPoints(prev => prev + 10);
                alert('✅ Sticker scanné ! +10 points');
              }}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-full font-bold"
            >
              Simuler scan
            </button>
            
            <button
              onClick={() => setShowScanner(false)}
              className="mt-4 text-gray-400 hover:text-white block mx-auto"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;