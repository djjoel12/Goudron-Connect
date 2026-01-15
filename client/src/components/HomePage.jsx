
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RealTimeMap from './RealTimeMap';
import LineSelector from './LineSelector'; // Assurez-vous d'avoir ce composant ou remplacez-le

const HomePage = () => {
  const navigate = useNavigate();
  const [selectedLine, setSelectedLine] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Détection du scroll pour l'effet sticky header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* --- HEADER --- */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-lg shadow-sm py-2' : 'bg-transparent py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900">Goudron<span className="text-orange-600">Connect</span></h1>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/chauffeur" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">Espace Chauffeur</Link>
              <Link to="/coxer" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">Espace Coxer</Link>
              <Link to="/admin" className="px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm font-medium hover:bg-black transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Admin Panel
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-lg bg-gray-100 text-gray-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-xl p-4 animate-in slide-in-from-top-5">
            <div className="flex flex-col gap-3">
              <Link to="/chauffeur" className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 font-medium text-gray-700">🚌 Mode Chauffeur</Link>
              <Link to="/coxer" className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 font-medium text-gray-700">🏢 Mode Coxer</Link>
              <Link to="/admin" className="p-3 rounded-lg bg-orange-50 text-orange-700 font-medium">👑 Admin</Link>
            </div>
          </div>
        )}
      </header>

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* --- HERO SECTION --- */}
        <div className="relative overflow-hidden rounded-3xl bg-gray-900 text-white shadow-2xl mb-10">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center md:text-left">
              <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold tracking-wide uppercase mb-4 border border-white/10">
                v2.0 • Live Abidjan
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
                Ne ratez plus jamais <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-200">votre Gbaka.</span>
              </h1>
              <p className="text-lg text-orange-100 mb-8 leading-relaxed max-w-md mx-auto md:mx-0">
                Localisation en temps réel, estimation d'arrivée précise et paiement digital sécurisé.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <button 
                  onClick={() => setShowMap(true)}
                  className="px-8 py-4 rounded-2xl bg-white text-orange-600 font-bold shadow-lg hover:shadow-white/20 hover:scale-105 transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Ouvrir la Carte
                </button>
                <button 
                  onClick={() => document.getElementById('features').scrollIntoView({behavior: 'smooth'})}
                  className="px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold hover:bg-white/20 transition-all"
                >
                  En savoir plus
                </button>
              </div>
            </div>

            {/* Stats Card */}
            <div className="hidden md:block w-72 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="space-y-6">
                <div>
                  <div className="text-3xl font-bold">142</div>
                  <div className="text-sm text-orange-200">Gbakas en ligne</div>
                </div>
                <div className="h-px bg-white/20"></div>
                <div>
                  <div className="text-3xl font-bold">12 min</div>
                  <div className="text-sm text-orange-200">Temps d'attente moy.</div>
                </div>
                <div className="h-px bg-white/20"></div>
                <div>
                  <div className="text-3xl font-bold">98%</div>
                  <div className="text-sm text-orange-200">Fiabilité GPS</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- MAP VIEW OR SELECTOR --- */}
        <div id="app-content" className="scroll-mt-24">
          {showMap ? (
            <div className="animate-in fade-in zoom-in duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Carte du réseau</h2>
                <button 
                  onClick={() => setShowMap(false)}
                  className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-200"
                >
                  ← Retour
                </button>
              </div>
              {/* Conteneur Carte avec hauteur dynamique */}
              <div className="h-[65vh] sm:h-[75vh] w-full rounded-2xl shadow-xl overflow-hidden border border-gray-200 relative">
                <RealTimeMap selectedLine={selectedLine} />
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900">Où allez-vous aujourd'hui ?</h2>
                <p className="text-gray-500 mt-2">Sélectionnez une ligne pour voir les disponibilités</p>
              </div>
              
              <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100">
                <LineSelector onLineSelect={setSelectedLine} selectedLine={selectedLine} />
                
                {selectedLine && (
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => setShowMap(true)}
                      className="group relative flex items-center justify-center gap-3 w-full py-4 bg-gray-900 text-white rounded-xl font-bold overflow-hidden transition-all hover:scale-[1.02] active:scale-95"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <span className="relative z-10 flex items-center gap-2">
                        🗺️ Voir les Gbakas
                      </span>
                    </button>
                    
                    <button
                      onClick={() => navigate('/scanner')}
                      className="flex items-center justify-center gap-3 w-full py-4 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                    >
                      📷 Scanner QR Code
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* --- FEATURES GRID --- */}
        <div id="features" className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: "📍", title: "Précision GPS", desc: "Algorithme optimisé pour le réseau ivoirien.", color: "bg-blue-100 text-blue-600" },
            { icon: "💰", title: "Gain de points", desc: "Convertissez vos trajets en crédit Orange Money.", color: "bg-green-100 text-green-600" },
            { icon: "📱", title: "Mode Hors-ligne", desc: "Fonctionne même quand la connexion flanche.", color: "bg-purple-100 text-purple-600" }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center text-2xl mb-4`}>
                {feature.icon}
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

      </main>

      {/* --- FOOTER SIMPLIFIÉ --- */}
      <footer className="bg-white border-t border-gray-100 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Goudron-Connect. Fait avec ❤️ à Abidjan.
          </p>
        </div>
      </footer>
      
      {/* --- FAB MOBILE (Bouton flottant) --- */}
      <div className="md:hidden fixed bottom-6 right-6 z-40 flex flex-col gap-3">
         {!showMap && (
           <button
             onClick={() => setShowMap(true)}
             className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full shadow-2xl flex items-center justify-center text-2xl active:scale-90 transition-transform"
           >
             🗺️
           </button>
         )}
      </div>

    </div>
  );
};

export default HomePage;
