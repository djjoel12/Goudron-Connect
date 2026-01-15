import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RealTimeMap from './RealTimeMap';
import LineSelector from './LineSelector';

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedLine, setSelectedLine] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [time, setTime] = useState(new Date());

  // Détection mobile et orientation
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Horloge en temps réel
    const timer = setInterval(() => setTime(new Date()), 60000);
    
    // GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => console.log('GPS non disponible'),
        { enableHighAccuracy: true }
      );
    }
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearInterval(timer);
    };
  }, []);

  // Format de l'heure
  const formattedTime = time.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">🚌</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Goudron-Connect</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Vos Gbakas en temps réel</p>
              </div>
            </div>

            {/* Menu Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                to="/chauffeur" 
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium text-sm transition-colors"
              >
                🚌 Chauffeur
              </Link>
              <Link 
                to="/coxer" 
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium text-sm transition-colors"
              >
                🏢 Coxer
              </Link>
              <Link 
                to="/admin" 
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium text-sm hover:from-orange-600 hover:to-red-600 transition-all"
              >
                👑 Admin
              </Link>
            </div>

            {/* Menu Mobile */}
            <button 
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              onClick={() => document.getElementById('mobileMenu').classList.toggle('hidden')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Menu Mobile Dropdown */}
        <div id="mobileMenu" className="md:hidden bg-white border-b border-gray-200 px-4 py-3 hidden">
          <div className="space-y-2">
            <Link 
              to="/chauffeur" 
              className="block px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 font-medium"
            >
              🚌 Mode Chauffeur
            </Link>
            <Link 
              to="/coxer" 
              className="block px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 font-medium"
            >
              🏢 Mode Coxer
            </Link>
            <Link 
              to="/admin" 
              className="block px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium text-center"
            >
              👑 Panel Admin
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 sm:p-8 mb-6 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                Trouvez votre Gbaka en temps réel
              </h1>
              <p className="text-orange-100 text-lg mb-6">
                Localisation précise • Temps d'attente • Scanner QR
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowMap(true)}
                  className="bg-white text-orange-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-50 transition-all active:scale-95"
                >
                  <span>🗺️</span>
                  <span>Voir la carte</span>
                </button>
                <button
                  onClick={() => document.getElementById('lines').scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white/30 transition-all"
                >
                  <span>🚌</span>
                  <span>Choisir une ligne</span>
                </button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 min-w-[280px]">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">42</div>
                  <div className="text-sm text-orange-100">Gbakas actifs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">98%</div>
                  <div className="text-sm text-orange-100">Fiabilité</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">24/7</div>
                  <div className="text-sm text-orange-100">Disponibilité</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">12</div>
                  <div className="text-sm text-orange-100">Lignes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carte ou Sélecteur */}
        {showMap ? (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Carte temps réel</h2>
              <button
                onClick={() => setShowMap(false)}
                className="text-gray-600 hover:text-gray-900 p-2"
              >
                <span className="sm:hidden">✕</span>
                <span className="hidden sm:inline">← Retour aux lignes</span>
              </button>
            </div>
            
            <div className="h-[500px] sm:h-[600px] rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
              <RealTimeMap selectedLine={selectedLine} userLocation={userLocation} />
            </div>
          </div>
        ) : (
          <div id="lines" className="mb-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Choisissez votre ligne</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Sélectionnez votre trajet pour voir les Gbakas disponibles et leurs horaires
              </p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <LineSelector onLineSelect={setSelectedLine} selectedLine={selectedLine} />
              
              {selectedLine && (
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setShowMap(true)}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:from-orange-600 hover:to-red-600 transition-all active:scale-95"
                  >
                    <span>🗺️</span>
                    <span>Voir sur la carte</span>
                  </button>
                  <button
                    onClick={() => alert('Scanner activé !')}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:from-blue-600 hover:to-blue-700 transition-all"
                  >
                    <span>📷</span>
                    <span>Scanner un QR</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
              📍
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">GPS Temps Réel</h3>
            <p className="text-gray-600">
              Suivez votre Gbaka en direct avec précision, estimations d'arrivée exactes.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
              📱
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">PWA Offline</h3>
            <p className="text-gray-600">
              Installez l'appli et utilisez-la même sans connexion internet.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
              💰
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Points Data</h3>
            <p className="text-gray-600">
              Gagnez des points et convertissez-les en argent avec Orange Money.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-gray-900 to-black rounded-2xl p-6 sm:p-8 text-white">
          <h2 className="text-2xl font-bold mb-6 text-center">Vous êtes chauffeur ou coxer ?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link 
              to="/chauffeur"
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🚌
                </div>
                <div>
                  <h3 className="text-xl font-bold">Mode Chauffeur</h3>
                  <p className="text-gray-300 text-sm">Gagnez des points en partageant votre position</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>✅ +10 points par trajet</li>
                <li>✅ Alertes trafic en temps réel</li>
                <li>✅ Portefeuille numérique</li>
                <li>✅ Retraits instantanés</li>
              </ul>
            </Link>
            
            <Link 
              to="/coxer"
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  🏢
                </div>
                <div>
                  <h3 className="text-xl font-bold">Mode Coxer</h3>
                  <p className="text-gray-300 text-sm">Gérez votre gare et scannez les départs</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>✅ Scanner QR des Gbakas</li>
                <li>✅ Statistiques de gare</li>
                <li>✅ Gestion d'équipe</li>
                <li>✅ Commissions automatiques</li>
              </ul>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg"></div>
                <span className="text-xl font-bold">Goudron-Connect</span>
              </div>
              <p className="text-gray-400 text-sm">
                La connexion intelligente des Gbakas d'Abidjan
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Pour vous</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/" className="hover:text-orange-400 transition-colors">Passager</Link></li>
                <li><Link to="/chauffeur" className="hover:text-orange-400 transition-colors">Chauffeur</Link></li>
                <li><Link to="/coxer" className="hover:text-orange-400 transition-colors">Coxer</Link></li>
                <li><Link to="/admin" className="hover:text-orange-400 transition-colors">Admin</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Fonctionnalités</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>🗺️ Carte temps réel</li>
                <li>📷 Scanner QR</li>
                <li>💰 Points Data</li>
                <li>🤖 IA Intelligente</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>📞 07 07 07 07 07</li>
                <li>📧 contact@goudron-connect.ci</li>
                <li>📍 Abidjan, Côte d'Ivoire</li>
                <li>⏰ Support 7j/7</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Goudron-Connect. Tous droits réservés.</p>
            <p className="mt-1">Service indépendant - 🇨🇮 Made in Abidjan</p>
          </div>
        </div>
      </footer>

      {/* Floating Action Button Mobile */}
      {isMobile && (
        <div className="fixed bottom-6 right-6 z-40">
          <div className="flex flex-col gap-3 items-end">
            <button
              onClick={() => setShowMap(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl active:scale-95 transition-all"
            >
              <span className="text-2xl">🗺️</span>
            </button>
            <button
              onClick={() => navigate('/scanner')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl active:scale-95 transition-all"
            >
              <span className="text-2xl">📷</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;