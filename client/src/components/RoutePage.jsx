// src/components/RoutePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

const RoutePage = () => {
  const { departure, arrival } = useParams();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seoLoading, setSeoLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentBackground, setCurrentBackground] = useState(0);
  
  // Images de fond pour le carrousel
  const backgroundImages = [
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.1&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.1&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.1&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?ixlib=rb-4.0.1&auto=format&fit=crop&w=2000&q=80',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.1&auto=format&fit=crop&w=2000&q=80'
  ];

  const defaultSeo = {
    title: `Bus ${departure} - ${arrival} | Comparateur & Réservation`,
    h1: `Bus ${departure} - ${arrival}`,
    description: `Horaires, prix et réservation de bus pour le trajet ${departure} vers ${arrival}.`,
    content: `Trouvez le meilleur trajet de bus entre ${departure} et ${arrival}. Comparez les prix et réservez.`
  };

  const [seoData, setSeoData] = useState(defaultSeo);
  const [geminiStatus, setGeminiStatus] = useState('pending');
  
  const [leadForm, setLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    departure: departure,
    arrival: arrival
  });

  const hasFetched = useRef(false);

  // Effet pour le carrousel d'images de fond
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBackground((prev) => (prev + 1) % backgroundImages.length);
    }, 5000); // Change toutes les 5 secondes

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const routeKey = `${departure}-${arrival}`.toLowerCase().replace(/ /g, '-');
        console.log('🚀 [FAST LOAD] Chargement trajets:', routeKey);
        
        const response = await fetch(`/api/enhanced-routes/comparison/${departure}/${arrival}`);
        let routesData = [];
        
        if (response.ok) {
          routesData = await response.json();
        } else {
          console.warn('⚠️ API non disponible, mode démo');
          routesData = getDemoRoutes(); 
        }
        
        setRoutes(routesData);
        setLoading(false);

        setSeoLoading(true);
        setGeminiStatus('loading');
        
        try {
          const geminiResponse = await fetch('/api/gemini/generate-seo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              departure,
              arrival,
              routesData: routesData.slice(0, 2)
            })
          });

          const geminiResult = await geminiResponse.json();
          
          if (geminiResult.success && geminiResult.data) {
             setSeoData(geminiResult.data);
             setGeminiStatus('success');
             updateMetaTags(geminiResult.data);
          } else {
             throw new Error('Pas de données SEO');
          }
        } catch (seoErr) {
          console.warn('⚠️ Fallback SEO Manuel (IA indisponible)');
          const manualSeo = getManualSeo(departure, arrival, routesData);
          setSeoData(manualSeo);
          setGeminiStatus('fallback');
          updateMetaTags(manualSeo);
        } finally {
          setSeoLoading(false);
        }

      } catch (err) {
        console.error('Erreur critique:', err);
        setError('Impossible de charger les trajets.');
        setRoutes(getDemoRoutes());
        setLoading(false);
      }
    };

    loadData();
  }, [departure, arrival]);

  const updateMetaTags = (data) => {
    document.title = data.title;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = data.description;
  };

  const getManualSeo = (dep, arr, routes) => {
    const minPrice = routes.length > 0 ? Math.min(...routes.map(r => r.priceRange?.min || r.price || 0)) : 0;
    return {
      title: `Bus ${dep} → ${arr} dès ${minPrice} FCFA | Goudron-Connect`,
      h1: `Bus ${dep} - ${arr} : Comparaison et Réservation`,
      description: `Voyagez de ${dep} à ${arr} en bus. ${routes.length} compagnies disponibles dès ${minPrice} FCFA.`,
      content: `Réservez votre billet de bus ${dep} ${arr} au meilleur prix avec notre service de conciergerie.`
    };
  };

  const getDemoRoutes = () => [
    {
      _id: 1,
      companyName: "STL Transport",
      priceRange: { min: 6000, max: 7500 },
      busType: "vip",
      estimatedDuration: "5-6h",
      amenities: ["wifi", "ac"],
      contactPhone: "+225 0707...",
      rating: 4.5
    },
    {
      _id: 2,
      companyName: "UTB Express", 
      priceRange: { min: 5500, max: 6500 },
      busType: "comfort",
      estimatedDuration: "6h",
      amenities: ["ac"],
      contactPhone: "+225 0505...",
      rating: 4.2
    }
  ];

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    alert('✅ Demande reçue ! Un agent vous contactera sous 15 min.');
    setLeadForm({...leadForm, name: '', phone: ''});
  };

  const handleDirectCall = (route) => {
    window.location.href = `tel:${route.contactPhone}`;
  };

  const companyCount = routes.length;
  const minPrice = routes.length > 0 ? Math.min(...routes.map(r => r.priceRange?.min || r.price || 0)) : 0;
  const maxPrice = routes.length > 0 ? Math.max(...routes.map(r => r.priceRange?.max || r.price || 0)) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 flex flex-col items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-sky-500 mb-4"></div>
        <p className="text-slate-600 font-medium animate-pulse">Recherche des meilleurs trajets...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 font-sans relative overflow-hidden">
      {/* Carrousel d'images de fond */}
      <div className="fixed inset-0 z-0">
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentBackground ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        ))}
        {/* Overlay pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* HEADER */}
          <header className="mb-8 md:mb-12 text-center">
            <div className="h-6 mb-2">
              {seoLoading ? (
                <span className="inline-flex items-center text-xs text-white animate-pulse">
                  <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
                  Optimisation IA en cours...
                </span>
              ) : (
                <span className={`inline-block px-3 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full ${geminiStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-white bg-opacity-90 text-slate-600'}`}>
                   {geminiStatus === 'success' ? 'Mise à jour IA ✅' : 'Info Trajet'}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 md:mb-6 leading-tight drop-shadow-lg">
              {seoData.h1}
            </h1>
            <p className="text-base md:text-xl text-white max-w-3xl mx-auto mb-6 md:mb-8 leading-relaxed px-2 drop-shadow-md">
              {seoData.content}
            </p>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto px-2">
              <div className="bg-white bg-opacity-95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white border-opacity-20 flex flex-col items-center">
                <span className="text-2xl mb-1">🚌</span>
                <span className="font-bold text-slate-800 text-sm md:text-base">{companyCount} compagnies</span>
              </div>
              <div className="bg-white bg-opacity-95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-sky-100 flex flex-col items-center ring-1 ring-sky-50">
                <span className="text-2xl mb-1">💰</span>
                <span className="font-bold text-sky-600 text-sm md:text-base">Dès {minPrice.toLocaleString()} F</span>
              </div>
              <div className="bg-white bg-opacity-95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white border-opacity-20 flex flex-col items-center">
                <span className="text-2xl mb-1">⏱️</span>
                <span className="font-bold text-slate-800 text-sm md:text-base">{routes[0]?.estimatedDuration || '6h'}</span>
              </div>
              <div className="bg-white bg-opacity-95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-amber-100 flex flex-col items-center">
                <span className="text-2xl mb-1">⭐</span>
                <span className="font-bold text-amber-500 text-sm md:text-base">Service 7j/7</span>
              </div>
            </div>
          </header>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LISTE DES BUS */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6 order-2 lg:order-1">
              <div className="flex items-center justify-between mb-2 px-1">
                <h2 className="text-xl md:text-2xl font-bold text-white drop-shadow-md">
                  Départs disponibles
                </h2>
              </div>

              {routes.map(route => (
                <div key={route._id} className="group bg-white bg-opacity-95 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-white border-opacity-30 hover:border-sky-300 hover:shadow-xl transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    
                    {/* Infos Trajet */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                          {route.companyName}
                        </h3>
                        {route.rating && (
                          <div className="flex items-center bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                            <span className="text-amber-600 font-bold text-sm">{route.rating}</span>
                            <span className="text-amber-500 ml-1 text-xs">⭐</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-3 text-sm text-slate-600 mb-3">
                        <div className="flex items-center bg-slate-50 px-2 py-1 rounded">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mr-2"></span>
                          {route.estimatedDuration || 'Temps standard'}
                        </div>
                        <div className="flex items-center bg-slate-50 px-2 py-1 rounded">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-2"></span>
                          <span className="capitalize">{route.busType || 'Standard'}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {route.amenities?.slice(0,3).map((amenity, idx) => (
                          <span key={idx} className="text-xs text-slate-400 border border-slate-100 px-2 py-0.5 rounded-full capitalize">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Bloc Prix & Action */}
                    <div className="mt-2 pt-3 border-t border-slate-100 md:mt-0 md:pt-0 md:border-t-0 md:border-l md:pl-6 flex flex-row items-center justify-between md:flex-col md:items-end md:min-w-[120px]">
                      <div className="text-left md:text-right mb-0 md:mb-3">
                        <p className="text-xs text-slate-400 uppercase font-semibold">Dès</p>
                        <p className="text-xl font-extrabold text-slate-900">
                          {(route.priceRange?.min || route.price || 0).toLocaleString()} <span className="text-sm font-normal text-slate-500">F</span>
                        </p>
                      </div>
                      
                      <button 
                        onClick={() => handleDirectCall(route)}
                        className="bg-sky-500 active:bg-sky-600 md:hover:bg-sky-600 text-white px-6 py-2.5 rounded-lg font-semibold shadow-sm shadow-sky-200 transition-transform active:scale-95 text-sm md:text-base"
                      >
                        📞 Appeler
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-4 mt-6 text-sm text-slate-600 text-center">
                Goudron-Connect est un service indépendant. Les prix peuvent varier selon la saison.
              </div>
            </div>

            {/* SIDEBAR / FORMULAIRE */}
            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="lg:sticky lg:top-24">
                <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl p-1 shadow-2xl shadow-sky-200">
                  <div className="bg-white rounded-xl p-5 md:p-6">
                    <div className="flex items-center mb-4 lg:block lg:text-center lg:mb-6">
                      <div className="p-2 bg-amber-100 rounded-full mr-3 lg:mr-0 lg:inline-block lg:mb-3 lg:p-3">
                        <span className="text-xl lg:text-2xl">⚡️</span>
                      </div>
                      <div>
                        <h2 className="text-lg lg:text-xl font-bold text-slate-900">Réservation Express</h2>
                        <p className="text-slate-500 text-xs lg:text-sm">On s'occupe de tout sous 15 min</p>
                      </div>
                    </div>
                    
                    <form onSubmit={handleLeadSubmit} className="space-y-3">
                      <input 
                        type="text" 
                        placeholder="Nom complet"
                        className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-amber-400 outline-none transition-all"
                        value={leadForm.name}
                        onChange={(e) => setLeadForm({...leadForm, name: e.target.value})}
                        required
                      />
                      <input 
                        type="tel" 
                        placeholder="Téléphone"
                        className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:ring-2 focus:ring-amber-400 outline-none transition-all"
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({...leadForm, phone: e.target.value})}
                        required
                      />
                      
                      <button 
                        type="submit"
                        className="w-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-3.5 rounded-lg shadow-md shadow-amber-100 transition-all active:scale-95 flex justify-center items-center gap-2"
                      >
                        <span>🚀</span>
                        <span>Me faire rappeler</span>
                      </button>
                    </form>
                    
                    <div className="mt-3 text-center">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide">Gratuit & Sans engagement</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePage;