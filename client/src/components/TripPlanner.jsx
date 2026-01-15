import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';

// Fix icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Composant pour centrer la carte
function CenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15);
    }
  }, [position, map]);
  return null;
}

const TripPlanner = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  
  // États recherche
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [departureSuggestions, setDepartureSuggestions] = useState([]);
  const [arrivalSuggestions, setArrivalSuggestions] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchFocused, setSearchFocused] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [gbakas, setGbakas] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // Données des stations Abidjan
  const stations = [
    { id: 1, name: 'Gare Yopougon', lat: 5.325, lng: -4.065, type: 'major' },
    { id: 2, name: 'Williamsville', lat: 5.335, lng: -4.045, type: 'medium' },
    { id: 3, name: 'Cocody', lat: 5.350, lng: -4.025, type: 'major' },
    { id: 4, name: 'Plateau', lat: 5.365, lng: -4.005, type: 'major' },
    { id: 5, name: 'Adjamé', lat: 5.370, lng: -4.040, type: 'major' },
    { id: 6, name: 'Treichville', lat: 5.300, lng: -4.010, type: 'major' },
    { id: 7, name: 'Marcory', lat: 5.310, lng: -3.990, type: 'medium' },
    { id: 8, name: 'Koumassi', lat: 5.320, lng: -3.970, type: 'medium' },
  ];

  // Initialiser GPS et données
  useEffect(() => {
    // GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(loc);
          
          // Set départ automatique à "Ma position"
          setDeparture('📍 Ma position');
          
          // Centrer la carte
          if (mapRef.current) {
            mapRef.current.flyTo(loc, 15);
          }
        },
        (err) => {
          console.log('GPS non disponible, utilisation position par défaut');
          setUserLocation([5.3599517, -4.0082563]);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }

    // Simuler des Gbakas
    const initialGbakas = [
      { id: 'GB-123-AB', lat: 5.330, lng: -4.055, line: 'L1', destination: 'Plateau' },
      { id: 'GB-456-CD', lat: 5.360, lng: -4.025, line: 'L2', destination: 'Cocody' },
      { id: 'GB-789-EF', lat: 5.310, lng: -4.000, line: 'L3', destination: 'Marcory' },
    ];
    setGbakas(initialGbakas);

    // Animation Gbakas
    const interval = setInterval(() => {
      setGbakas(prev => 
        prev.map(gb => ({
          ...gb,
          lat: gb.lat + (Math.random() - 0.5) * 0.001,
          lng: gb.lng + (Math.random() - 0.5) * 0.001
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Recherche suggestions
  const searchSuggestions = (query, setSuggestions) => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }
    
    const results = stations.filter(station =>
      station.name.toLowerCase().includes(query.toLowerCase())
    );
    
    // Ajouter "Ma position" en premier
    if (userLocation && query.toLowerCase().includes('position')) {
      results.unshift({
        id: 'current',
        name: '📍 Ma position',
        lat: userLocation[0],
        lng: userLocation[1],
        type: 'current'
      });
    }
    
    // Ajouter stations populaires
    if (query.length === 0) {
      results.push(
        { id: 'popular1', name: '🏠 Maison', lat: 5.340, lng: -4.020, type: 'popular' },
        { id: 'popular2', name: '🏢 Travail', lat: 5.365, lng: -4.005, type: 'popular' },
        { id: 'popular3', name: '🛒 Marché', lat: 5.310, lng: -4.010, type: 'popular' }
      );
    }
    
    setSuggestions(results.slice(0, 5));
  };

  // Calculer l'itinéraire
  const calculateRoute = () => {
    if (!departure || !arrival) {
      alert('Veuillez choisir un départ et une arrivée');
      return;
    }

    setIsCalculating(true);

    // Simuler calcul
    setTimeout(() => {
      const depStation = stations.find(s => s.name === departure) || 
                        (departure === '📍 Ma position' ? { lat: userLocation[0], lng: userLocation[1] } : null);
      const arrStation = stations.find(s => s.name === arrival);

      if (!depStation || !arrStation) {
        alert('Stations non trouvées');
        setIsCalculating(false);
        return;
      }

      // Créer un itinéraire simulé
      const route = {
        id: 1,
        title: 'Trajet optimal',
        duration: '25-35 min',
        price: '250-350 FCFA',
        distance: '8.5 km',
        stations: [
          [depStation.lat, depStation.lng],
          [depStation.lat + 0.005, depStation.lng + 0.005], // Point intermédiaire
          [arrStation.lat, arrStation.lng]
        ]
      };

      // Centrer sur l'itinéraire
      if (mapRef.current) {
        const bounds = L.latLngBounds(route.stations);
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }

      setRoutePath(route.stations);
      setSelectedRoute(route);
      setShowResults(true);
      setIsCalculating(false);
    }, 1000);
  };

  // Icons personnalisés
  const stationIcon = L.divIcon({
    html: `<div style="background:#FF6B00;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  const currentLocationIcon = L.divIcon({
    html: `<div style="background:#0984E3;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 3px 10px rgba(9,132,227,0.4);display:flex;align-items:center;justify-content:center;color:white;font-size:12px;">📍</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  const busIcon = L.divIcon({
    html: `<div style="background:#00B894;width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;">🚌</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header minimal */}
      <div className="absolute top-0 left-0 right-0 z-50 pt-3 px-3">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center"
          >
            ←
          </button>
          
          <div className="flex-1 mx-2">
            <div className="bg-white rounded-xl shadow-lg">
              {/* Départ */}
              <div className="relative p-2 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="w-6 h-6 flex items-center justify-center mr-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <input
                    type="text"
                    value={departure}
                    onChange={(e) => {
                      setDeparture(e.target.value);
                      searchSuggestions(e.target.value, setDepartureSuggestions);
                    }}
                    onFocus={() => setSearchFocused('departure')}
                    placeholder="Départ"
                    className="flex-1 text-base border-0 focus:outline-none focus:ring-0 placeholder-gray-500"
                  />
                </div>
                
                {searchFocused === 'departure' && departureSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    {departureSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => {
                          setDeparture(suggestion.name);
                          setDepartureSuggestions([]);
                          setSearchFocused(null);
                        }}
                        className="w-full text-left p-3 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100 last:border-0"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          suggestion.type === 'current' ? 'bg-blue-100 text-blue-600' :
                          suggestion.type === 'popular' ? 'bg-green-100 text-green-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {suggestion.type === 'current' ? '📍' : '🚌'}
                        </div>
                        <span className="font-medium">{suggestion.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Arrivée */}
              <div className="relative p-2">
                <div className="flex items-center">
                  <div className="w-6 h-6 flex items-center justify-center mr-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  </div>
                  <input
                    type="text"
                    value={arrival}
                    onChange={(e) => {
                      setArrival(e.target.value);
                      searchSuggestions(e.target.value, setArrivalSuggestions);
                    }}
                    onFocus={() => setSearchFocused('arrival')}
                    placeholder="Destination"
                    className="flex-1 text-base border-0 focus:outline-none focus:ring-0 placeholder-gray-500"
                  />
                </div>
                
                {searchFocused === 'arrival' && arrivalSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    {arrivalSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => {
                          setArrival(suggestion.name);
                          setArrivalSuggestions([]);
                          setSearchFocused(null);
                        }}
                        className="w-full text-left p-3 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100 last:border-0"
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          🚌
                        </div>
                        <span className="font-medium">{suggestion.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
            ☰
          </button>
        </div>

        {/* Bouton GO */}
        <div className="flex justify-center mt-2">
          <button
            onClick={calculateRoute}
            disabled={!departure || !arrival || isCalculating}
            className={`px-6 py-2 rounded-full font-bold text-white shadow-lg ${
              departure && arrival && !isCalculating
                ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isCalculating ? 'Calcul...' : 'GO!'}
          </button>
        </div>
      </div>

      {/* Carte Leaflet */}
      <div className="h-screen pt-32">
        <MapContainer
          center={userLocation || [5.3599517, -4.0082563]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
          zoomControl={true}
          className="leaflet-touch leaflet-fade-anim"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <CenterMap position={userLocation} />

          {/* Stations */}
          {stations.map((station) => (
            <Marker
              key={station.id}
              position={[station.lat, station.lng]}
              icon={stationIcon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-gray-900">{station.name}</h3>
                  <p className="text-sm text-gray-600">Station {station.type}</p>
                  <button
                    onClick={() => {
                      if (!departure) {
                        setDeparture(station.name);
                      } else if (!arrival) {
                        setArrival(station.name);
                      }
                    }}
                    className="mt-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded"
                  >
                    Choisir
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Gbakas en mouvement */}
          {gbakas.map((bus) => (
            <Marker
              key={bus.id}
              position={[bus.lat, bus.lng]}
              icon={busIcon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-gray-900">{bus.id}</h3>
                  <p className="text-sm text-gray-600">Ligne {bus.line}</p>
                  <p className="text-sm">Destination: {bus.destination}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Position utilisateur */}
          {userLocation && (
            <Marker position={userLocation} icon={currentLocationIcon}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-gray-900">Votre position</h3>
                  <p className="text-sm text-gray-600">
                    {userLocation[0].toFixed(5)}, {userLocation[1].toFixed(5)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Itinéraire calculé */}
          {routePath.length > 0 && (
            <Polyline
              positions={routePath}
              pathOptions={{ 
                color: '#FF6B00', 
                weight: 4,
                opacity: 0.7,
                dashArray: '10, 10'
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Panneau résultats (drawer mobile) */}
      {showResults && selectedRoute && (
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-2/3">
          <div className="p-4">
            {/* Handle pour drag */}
            <div className="flex justify-center mb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Itinéraire trouvé</h3>
              <button
                onClick={() => setShowResults(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Carte résumé */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900">{selectedRoute.title}</h4>
                    <p className="text-sm text-gray-600">Trajet recommandé</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                    ⚡ Optimal
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 bg-white rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{selectedRoute.duration}</div>
                    <div className="text-xs text-gray-600">Durée</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{selectedRoute.distance}</div>
                    <div className="text-xs text-gray-600">Distance</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{selectedRoute.price}</div>
                    <div className="text-xs text-gray-600">Coût</div>
                  </div>
                </div>
              </div>

              {/* Étapes */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">📍</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{departure}</div>
                    <div className="text-sm text-gray-500">Départ</div>
                  </div>
                  <div className="text-sm text-gray-400">0 min</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">🚌</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Prendre Gbaka L1</div>
                    <div className="text-sm text-gray-500">Direction Plateau</div>
                  </div>
                  <div className="text-sm text-gray-400">5 min</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600">🎯</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{arrival}</div>
                    <div className="text-sm text-gray-500">Arrivée</div>
                  </div>
                  <div className="text-sm text-gray-400">{selectedRoute.duration}</div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3">
                <button className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold">
                  🗺️ Voir sur carte
                </button>
                <button className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold">
                  🚌 Démarrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contrôles carte */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <div className="flex gap-2 bg-white rounded-full shadow-2xl p-1">
          <button 
            onClick={() => userLocation && mapRef.current?.flyTo(userLocation, 16)}
            className="p-3 hover:bg-gray-100 rounded-full"
            title="Ma position"
          >
            <span className="text-xl">📍</span>
          </button>
          <button className="p-3 hover:bg-gray-100 rounded-full">
            <span className="text-xl">🔍</span>
          </button>
          <button className="p-3 hover:bg-gray-100 rounded-full">
            <span className="text-xl">🚌</span>
          </button>
        </div>
      </div>

      {/* Loading overlay */}
      {isCalculating && (
        <div className="absolute inset-0 bg-black/50 z-[100] flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-900 font-medium">Calcul de l'itinéraire...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripPlanner;