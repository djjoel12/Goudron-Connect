import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes Leaflet sur mobile
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Composant pour centrer la carte sur la position utilisateur
function LocateButton() {
  const map = useMap();
  
  const locateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map.flyTo(
            [position.coords.latitude, position.coords.longitude],
            16,
            { animate: true, duration: 1 }
          );
        },
        () => {
          alert("Impossible d'obtenir votre position");
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  return (
    <button
      onClick={locateUser}
      className="leaflet-control-locate absolute bottom-24 right-4 z-[1000] bg-white p-3 rounded-full shadow-lg"
      style={{ touchAction: 'manipulation' }}
    >
      <span className="text-xl">📍</span>
    </button>
  );
}

// Composant pour suivre les événements tactiles
function MapEvents() {
  const map = useMapEvents({
    touchstart: () => {
      // Désactiver temporairement les popups pendant le déplacement
      map.dragging.enable();
    },
    touchend: () => {
      // Réactiver après un délai
      setTimeout(() => {
        // Rien de spécial
      }, 100);
    }
  });
  return null;
}

const RealTimeMap = ({ selectedLine = null, userLocation = null }) => {
  const mapRef = useRef(null);
  const [mapCenter, setMapCenter] = useState([5.3599517, -4.0082563]); // Abidjan
  const [zoom, setZoom] = useState(13);
  const [userPos, setUserPos] = useState(userLocation);
  const [gbakas, setGbakas] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [mapHeight, setMapHeight] = useState('calc(100vh - 60px)');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  // Référence pour l'intervalle
  const intervalRef = useRef(null);

  // Lignes principales d'Abidjan avec positions réelles
  const abidjanLines = [
    {
      id: 'ypg-plateau',
      name: 'Yopougon - Plateau',
      color: '#FF6B00',
      stations: [
        [5.325, -4.065], // Yopougon
        [5.335, -4.045], // Williamsville
        [5.350, -4.025], // Cocody
        [5.365, -4.005]  // Plateau
      ]
    },
    {
      id: 'adj-cocody',
      name: 'Adjamé - Cocody',
      color: '#00B894',
      stations: [
        [5.370, -4.040], // Adjamé
        [5.365, -4.020], // Treichville
        [5.355, -4.010], // Marcory
        [5.350, -3.995]  // Cocody
      ]
    },
    {
      id: 't-marcory',
      name: 'Treichville - Marcory',
      color: '#0984E3',
      stations: [
        [5.300, -4.010], // Treichville
        [5.310, -3.990], // Marcory
        [5.320, -3.970]  // Koumassi
      ]
    }
  ];

  // Optimiser l'expérience tactile
  useEffect(() => {
    // Détection mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Ajuster la hauteur pour mobile
      const calculateHeight = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        setMapHeight('calc(var(--vh, 1vh) * 100 - 60px)');
      };
      
      calculateHeight();
      window.addEventListener('resize', calculateHeight);
      window.addEventListener('orientationchange', calculateHeight);
      
      return () => {
        window.removeEventListener('resize', calculateHeight);
        window.removeEventListener('orientationchange', calculateHeight);
      };
    }
  }, []);

  // Simuler des Gbakas en mouvement (optimisé pour mobile)
  useEffect(() => {
    // Arrêter l'ancien intervalle
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    // Initialiser les Gbakas
    const initialGbakas = [
      { 
        id: 'gb1', 
        line: 'ypg-plateau', 
        position: [5.330, -4.055], 
        speed: 40, 
        capacity: 18, 
        driver: 'Koffi',
        destination: 'Plateau'
      },
      { 
        id: 'gb2', 
        line: 'adj-cocody', 
        position: [5.360, -4.025], 
        speed: 35, 
        capacity: 22, 
        driver: 'Aïcha',
        destination: 'Cocody'
      },
      { 
        id: 'gb3', 
        line: 't-marcory', 
        position: [5.310, -4.000], 
        speed: 45, 
        capacity: 20, 
        driver: 'Jean',
        destination: 'Marcory'
      },
    ];
    
    setGbakas(initialGbakas);
    
    // Animation fluide pour mobile
    intervalRef.current = setInterval(() => {
      setGbakas(prev => 
        prev.map(gbaka => {
          // Mouvement réaliste suivant la ligne
          const line = abidjanLines.find(l => l.id === gbaka.line);
          if (!line) return gbaka;
          
          // Trouver la station la plus proche et avancer vers elle
          const targetStation = line.stations[Math.floor(Math.random() * line.stations.length)];
          const latDiff = targetStation[0] - gbaka.position[0];
          const lngDiff = targetStation[1] - gbaka.position[1];
          const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
          
          // Si proche de la station, choisir une nouvelle cible
          if (distance < 0.001) {
            return {
              ...gbaka,
              position: [
                gbaka.position[0] + (Math.random() - 0.5) * 0.0005,
                gbaka.position[1] + (Math.random() - 0.5) * 0.0005
              ],
              lastUpdate: Date.now()
            };
          }
          
          // Avancer vers la cible
          return {
            ...gbaka,
            position: [
              gbaka.position[0] + (latDiff / distance) * 0.0002,
              gbaka.position[1] + (lngDiff / distance) * 0.0002
            ],
            lastUpdate: Date.now()
          };
        })
      );
    }, 2000); // Mise à jour moins fréquente pour économiser la batterie

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Obtenir la position de l'utilisateur
  useEffect(() => {
    if (navigator.geolocation && !userLocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };
      
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = [pos.coords.latitude, pos.coords.longitude];
          setUserPos(newPos);
          if (mapRef.current) {
            mapRef.current.setView(newPos, 16);
          }
        },
        (err) => {
          console.log('GPS:', err.message);
          // Position par défaut Abidjan
          setUserPos([5.3599517, -4.0082563]);
        },
        options
      );
    }
  }, [userLocation]);

  // Suivre la position en temps réel (optimisé mobile)
  useEffect(() => {
    let watchId = null;
    
    if (isTracking && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const newPos = [pos.coords.latitude, pos.coords.longitude];
          setUserPos(newPos);
          // Suivre doucement la position
          if (mapRef.current) {
            mapRef.current.flyTo(newPos, mapRef.current.getZoom(), {
              animate: true,
              duration: 1
            });
          }
        },
        null,
        { 
          enableHighAccuracy: true,
          maximumAge: 30000,
          timeout: 27000
        }
      );
    }
    
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking]);

  // Custom icons optimisés pour mobile
  const createBusIcon = (lineId) => {
    const line = abidjanLines.find(l => l.id === lineId);
    return L.divIcon({
      html: `
        <div style="
          background: ${line?.color || '#FF6B00'};
          width: 36px;
          height: 36px;
          border-radius: 18px;
          border: 3px solid white;
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
          transform: translate(-50%, -50%);
        ">
          🚌
        </div>
      `,
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18]
    });
  };

  const createStationIcon = (crowdLevel) => {
    const colors = ['#00B894', '#FDCB6E', '#FF7675'];
    const size = 28; // Plus grand pour mobile
    return L.divIcon({
      html: `
        <div style="
          background: ${colors[crowdLevel] || '#00B894'};
          width: ${size}px;
          height: ${size}px;
          border-radius: ${size/2}px;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transform: translate(-50%, -50%);
        "></div>
      `,
      className: '',
      iconSize: [size, size],
      iconAnchor: [size/2, size/2],
      popupAnchor: [0, -size/2]
    });
  };

  const userIcon = L.divIcon({
    html: `
      <div style="
        background: #0984E3;
        width: 34px;
        height: 34px;
        border-radius: 17px;
        border: 4px solid white;
        box-shadow: 0 3px 12px rgba(9,132,227,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 16px;
        transform: translate(-50%, -50%);
        animation: pulse 2s infinite;
      ">
        👤
      </div>
      <style>
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(9,132,227,0.7); }
          70% { box-shadow: 0 0 0 10px rgba(9,132,227,0); }
          100% { box-shadow: 0 0 0 0 rgba(9,132,227,0); }
        }
      </style>
    `,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17]
  });

  // Filtrer par ligne
  const filteredGbakas = selectedLine 
    ? gbakas.filter(bus => bus.line === selectedLine)
    : gbakas;
  
  const filteredLines = selectedLine
    ? abidjanLines.filter(line => line.id === selectedLine)
    : abidjanLines;

  // Toggle plein écran
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setShowControls(!isFullscreen);
    
    if (!isFullscreen) {
      // Entrer en plein écran
      setMapHeight('100vh');
      document.documentElement.style.overflow = 'hidden';
    } else {
      // Quitter le plein écran
      setMapHeight('calc(100vh - 60px)');
      document.documentElement.style.overflow = 'auto';
    }
  };

  // Calculer le Gbaka le plus proche
  const nearestBus = userPos && gbakas.length > 0 
    ? gbakas.reduce((nearest, bus) => {
        const distance = Math.sqrt(
          Math.pow(bus.position[0] - userPos[0], 2) + 
          Math.pow(bus.position[1] - userPos[1], 2)
        ) * 111000; // Convertir en mètres
        
        if (!nearest || distance < nearest.distance) {
          return { ...bus, distance };
        }
        return nearest;
      }, null)
    : null;

  return (
    <div className="relative w-full" style={{ height: mapHeight }}>
      {/* Styles CSS pour mobile */}
      <style>{`
        .leaflet-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          touch-action: manipulation;
        }
        
        .leaflet-popup-content {
          font-size: 14px;
          min-width: 200px;
        }
        
        .leaflet-control-zoom {
          margin-top: 70px !important;
        }
        
        /* Améliorer l'expérience tactile */
        .leaflet-touch .leaflet-control-layers, 
        .leaflet-touch .leaflet-bar {
          border: 2px solid rgba(0,0,0,0.1);
        }
        
        /* Popups plus grands sur mobile */
        @media (max-width: 768px) {
          .leaflet-popup-content {
            font-size: 16px;
            min-width: 250px;
          }
          
          .leaflet-popup-content-wrapper {
            border-radius: 12px;
          }
        }
      `}</style>

      {/* Contrôles mobiles simplifiés */}
      {showControls && (
        <div className="absolute top-2 left-0 right-0 z-[1000] px-2">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-3 mx-auto max-w-md">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-sm truncate">
                  {selectedLine 
                    ? abidjanLines.find(l => l.id === selectedLine)?.name 
                    : 'Toutes les lignes'}
                </h3>
                {nearestBus && (
                  <p className="text-xs text-gray-600 truncate">
                    🚌 Plus proche: {Math.round(nearestBus?.distance || 0)}m
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTracking(!isTracking)}
                  className={`p-2 rounded-full ${isTracking ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
                  title={isTracking ? 'Suivi activé' : 'Activer suivi'}
                >
                  {isTracking ? '📍' : '📌'}
                </button>
                
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-full bg-gray-100 text-gray-600"
                  title={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
                >
                  {isFullscreen ? '📱' : '🔲'}
                </button>
              </div>
            </div>
            
            {/* Légende rapide */}
            <div className="flex justify-center gap-4 mt-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#FF6B00]"></div>
                <span>Gbaka</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#00B894]"></div>
                <span>Station</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#0984E3]"></div>
                <span>Vous</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bouton pour réafficher les contrôles en plein écran */}
      {isFullscreen && !showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="absolute top-4 right-4 z-[1000] bg-white/90 p-3 rounded-full shadow-lg"
        >
          <span className="text-xl">📱</span>
        </button>
      )}

      {/* La carte Leaflet */}
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ 
          height: '100%', 
          width: '100%',
          borderRadius: isFullscreen ? '0' : '12px'
        }}
        ref={mapRef}
        zoomControl={false}
        dragging={true}
        touchZoom={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        boxZoom={true}
        keyboard={true}
        attributionControl={true}
        className="leaflet-touch leaflet-fade-anim"
        maxZoom={18}
        minZoom={10}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          detectRetina={true} // Meilleure qualité sur écran Retina
        />

        {/* Contrôles de zoom personnalisés pour mobile */}
        <div className="leaflet-top leaflet-right">
          <div className="leaflet-control leaflet-bar">
            <button
              className="leaflet-control-zoom-in"
              onClick={() => mapRef.current && mapRef.current.zoomIn()}
              style={{
                width: '44px',
                height: '44px',
                fontSize: '20px',
                lineHeight: '44px'
              }}
            >
              +
            </button>
            <button
              className="leaflet-control-zoom-out"
              onClick={() => mapRef.current && mapRef.current.zoomOut()}
              style={{
                width: '44px',
                height: '44px',
                fontSize: '20px',
                lineHeight: '44px'
              }}
            >
              −
            </button>
          </div>
        </div>

        {/* Lignes de bus */}
        {filteredLines.map(line => (
          <Polyline
            key={line.id}
            positions={line.stations}
            pathOptions={{ 
              color: line.color, 
              weight: 5, 
              opacity: 0.6,
              lineCap: 'round',
              lineJoin: 'round'
            }}
          />
        ))}

        {/* Stations */}
        {filteredLines.flatMap(line => 
          line.stations.map((position, idx) => {
            const crowdLevel = Math.floor(Math.random() * 3);
            return (
              <Marker
                key={`${line.id}-${idx}`}
                position={position}
                icon={createStationIcon(crowdLevel)}
                riseOnHover={true}
              >
                <Popup
                  closeButton={true}
                  closeOnClick={true}
                  autoClose={true}
                  autoPan={true}
                  className="custom-popup"
                >
                  <div className="p-2 min-w-[180px]">
                    <h3 className="font-bold text-gray-900 mb-1">
                      {line.name} - Station {idx + 1}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        crowdLevel === 0 ? 'bg-green-500' :
                        crowdLevel === 1 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm">
                        {crowdLevel === 0 ? 'Peu fréquenté' :
                         crowdLevel === 1 ? 'Moyen' : 'Bondé'}
                      </span>
                    </div>
                    <button
                      className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-3 rounded text-sm"
                      onClick={() => {
                        if (mapRef.current) {
                          mapRef.current.flyTo(position, 17, { duration: 1 });
                        }
                      }}
                    >
                      📍 Y aller
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })
        )}

        {/* Gbakas */}
        {filteredGbakas.map(bus => (
          <Marker
            key={bus.id}
            position={bus.position}
            icon={createBusIcon(bus.line)}
            riseOnHover={true}
          >
            <Popup
              closeButton={true}
              closeOnClick={false}
              autoClose={false}
              autoPan={true}
            >
              <div className="p-2 min-w-[220px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
                    🚌
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{bus.id.toUpperCase()}</h3>
                    <p className="text-sm text-gray-600">{bus.driver}</p>
                  </div>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ligne:</span>
                    <span className="font-semibold">{bus.line}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Destination:</span>
                    <span className="font-semibold">{bus.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vitesse:</span>
                    <span className="font-semibold">{bus.speed} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Places:</span>
                    <span className="font-semibold">{bus.capacity}/22</span>
                  </div>
                </div>
                
                <div className="mt-3 flex gap-2">
                  <button
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded text-sm font-medium"
                    onClick={() => {
                      // Simuler un scan
                      alert(`Scanné: ${bus.id} - ${bus.driver}`);
                    }}
                  >
                    📷 Scanner
                  </button>
                  <button
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-sm font-medium"
                    onClick={() => {
                      if (mapRef.current) {
                        mapRef.current.flyTo(bus.position, 17, { duration: 1 });
                      }
                    }}
                  >
                    🗺️ Suivre
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Position utilisateur */}
        {userPos && (
          <Marker position={userPos} icon={userIcon}>
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-gray-900">Vous êtes ici</h3>
                <p className="text-sm text-gray-600">
                  {userPos[0].toFixed(6)}, {userPos[1].toFixed(6)}
                </p>
                <button
                  className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-3 rounded text-sm"
                  onClick={() => {
                    // Partager la position
                    if (navigator.share) {
                      navigator.share({
                        title: 'Ma position',
                        text: `Je suis ici: ${window.location.href}`,
                        url: window.location.href,
                      });
                    }
                  }}
                >
                  📤 Partager
                </button>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Composants utilitaires */}
        <LocateButton />
        <MapEvents />
      </MapContainer>

      {/* Panneau inférieur pour mobile */}
      {showControls && (
        <div className="absolute bottom-4 left-0 right-0 z-[1000] px-2">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 mx-auto max-w-lg">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-bold text-gray-900">Calculateur d'attente</h4>
                {nearestBus ? (
                  <p className="text-sm text-gray-600">
                    Prochain Gbaka: <span className="font-bold text-orange-600">
                      {Math.round((nearestBus?.distance || 0) / 400)} min
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">Recherche de Gbakas...</p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  {gbakas.length} actifs
                </span>
              </div>
            </div>
            
            {/* Bouton d'action principal */}
            <button
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-transform"
              onClick={() => {
                // Action principale
                alert('Fonctionnalité à venir !');
              }}
            >
              <span className="text-xl">🚌</span>
              <span>Voir horaires complets</span>
            </button>
          </div>
        </div>
      )}

      {/* Overlay de chargement sur mobile */}
      {!userPos && (
        <div className="absolute inset-0 bg-black/50 z-[2000] flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-2xl text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-900 font-medium">Chargement de la carte...</p>
            <p className="text-sm text-gray-600 mt-1">Activez le GPS pour de meilleurs résultats</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeMap;