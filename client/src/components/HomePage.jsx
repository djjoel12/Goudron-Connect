import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix icônes
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function LocateButton() {
  const map = useMap();
  
  const locateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map.flyTo([position.coords.latitude, position.coords.longitude], 16);
        },
        null,
        { enableHighAccuracy: true }
      );
    }
  };

  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control leaflet-bar">
        <button
          onClick={locateUser}
          className="leaflet-control-locate"
          title="Ma position"
          style={{
            width: '44px',
            height: '44px',
            fontSize: '20px',
            background: '#FF6B00',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          📍
        </button>
      </div>
    </div>
  );
}

const HomePage = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [gbakas, setGbakas] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  // Lignes Abidjan
  const abidjanLines = [
    { id: 'ypg-plateau', name: 'Yopougon - Plateau', color: '#FF6B00', stations: [
      [5.325, -4.065], [5.335, -4.045], [5.350, -4.025], [5.365, -4.005]
    ]},
    { id: 'adj-cocody', name: 'Adjamé - Cocody', color: '#00B894', stations: [
      [5.370, -4.040], [5.365, -4.020], [5.355, -4.010], [5.350, -3.995]
    ]},
    { id: 't-marcory', name: 'Treichville - Marcory', color: '#0984E3', stations: [
      [5.300, -4.010], [5.310, -3.990], [5.320, -3.970]
    ]}
  ];

  // Récupérer la position utilisateur
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          setUserLocation([5.3599517, -4.0082563]); // Position par défaut Abidjan
        }
      );
    }
  }, []);

  // Initialiser Gbakas
  useEffect(() => {
    const initialGbakas = [
      { id: 'gb1', line: 'ypg-plateau', position: [5.330, -4.055], speed: 40, driver: 'Koffi', destination: 'Plateau' },
      { id: 'gb2', line: 'adj-cocody', position: [5.360, -4.025], speed: 35, driver: 'Aïcha', destination: 'Cocody' },
      { id: 'gb3', line: 't-marcory', position: [5.310, -4.000], speed: 45, driver: 'Jean', destination: 'Marcory' },
      { id: 'gb4', line: 'ypg-plateau', position: [5.345, -4.015], speed: 30, driver: 'Moussa', destination: 'Plateau' },
    ];
    
    setGbakas(initialGbakas);

    // Animation
    const interval = setInterval(() => {
      setGbakas(prev => 
        prev.map(bus => ({
          ...bus,
          position: [
            bus.position[0] + (Math.random() - 0.5) * 0.0005,
            bus.position[1] + (Math.random() - 0.5) * 0.0005
          ]
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Icons
  const busIcon = (lineId) => {
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
      iconAnchor: [18, 18]
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
      ">
        👤
      </div>
    `,
    className: '',
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

  // Options de navigation
  const menuOptions = [
    { id: 'scanner', icon: '📷', label: 'Scanner', color: 'bg-green-500 hover:bg-green-600', route: '/scanner' },
    { id: 'planner', icon: '🔍', label: 'Recherche', color: 'bg-blue-500 hover:bg-blue-600', route: '/planner' },
    { id: 'chauffeur', icon: '👨‍✈️', label: 'Chauffeur', color: 'bg-purple-500 hover:bg-purple-600', route: '/chauffeur' },
    { id: 'coxer', icon: '🏢', label: 'Coxer', color: 'bg-indigo-500 hover:bg-indigo-600', route: '/coxer' },
  ];

  return (
    <div className="h-screen w-full bg-white">
      {/* Header transparent */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-4">
        <div className="flex items-center justify-between">
          <div className="bg-black/40 backdrop-blur-lg rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🚌</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Goudron</h1>
                <p className="text-sm text-white/80">{gbakas.length} Gbakas actifs</p>
              </div>
            </div>
          </div>
          
          {/* Menu burger transparent pour mobile */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="bg-black/40 backdrop-blur-lg w-12 h-12 rounded-xl flex items-center justify-center"
          >
            <span className="text-white text-xl">{showMenu ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {/* Carte principale */}
      <div className="h-full w-full pt-0">
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
            maxZoom={19}
          />

          <LocateButton />

          {/* Stations */}
          {abidjanLines.flatMap(line => 
            line.stations.map((position, idx) => (
              <Marker
                key={`${line.id}-${idx}`}
                position={position}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold">{line.name}</h3>
                    <p className="text-sm text-gray-600">Station {idx + 1}</p>
                  </div>
                </Popup>
              </Marker>
            ))
          )}

          {/* Gbakas */}
          {gbakas.map(bus => (
            <Marker
              key={bus.id}
              position={bus.position}
              icon={busIcon(bus.line)}
              eventHandlers={{
                click: () => setSelectedBus(bus)
              }}
            >
              <Popup>
                <div className="p-3 min-w-[200px]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white">
                      🚌
                    </div>
                    <div>
                      <h3 className="font-bold">{bus.id}</h3>
                      <p className="text-sm text-gray-600">{bus.driver}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>📍 <span className="font-medium">{bus.destination}</span></p>
                    <p>⚡ <span className="font-medium">{bus.speed} km/h</span></p>
                    <p>🕐 <span className="font-medium">Prochain arrêt: 3min</span></p>
                  </div>
                  <button 
                    onClick={() => navigate('/scanner')}
                    className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-medium"
                  >
                    📷 Scanner ce Gbaka
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Position utilisateur */}
          {userLocation && (
            <Marker position={userLocation} icon={userIcon}>
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold">Vous êtes ici</h3>
                  <p className="text-sm text-gray-600">
                    {userLocation[0].toFixed(5)}, {userLocation[1].toFixed(5)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Menu des options - Desktop (à droite, transparent) */}
        <div className="hidden md:block absolute top-1/2 right-4 transform -translate-y-1/2 z-[1000]">
          <div className="space-y-3">
            {menuOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => navigate(option.route)}
                className="group relative w-14 h-14"
                title={option.label}
              >
                {/* Tooltip */}
                <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-black/80 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {option.label}
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-black/80"></div>
                </div>
                
                {/* Bouton principal */}
                <div className={`w-14 h-14 ${option.color} rounded-xl flex items-center justify-center text-white text-2xl shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-12`}>
                  {option.icon}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Menu des options - Mobile (en bas, transparent) */}
        {showMenu && (
          <div className="md:hidden absolute bottom-24 left-0 right-0 z-[1000] px-4">
            <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <div className="grid grid-cols-4 gap-2">
                {menuOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      navigate(option.route);
                      setShowMenu(false);
                    }}
                    className="flex flex-col items-center p-2 rounded-xl hover:bg-white/10 transition-all"
                  >
                    <div className={`w-12 h-12 ${option.color} rounded-xl flex items-center justify-center text-white text-xl mb-1 shadow-lg`}>
                      {option.icon}
                    </div>
                    <div className="text-xs font-medium text-white">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Panneau info bus sélectionné */}
        {selectedBus && (
          <div className="absolute bottom-24 left-4 right-4 md:right-auto md:left-4 md:w-80 z-[1000]">
            <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white text-xl">
                    🚌
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{selectedBus.id}</h3>
                    <p className="text-sm text-white/80">{selectedBus.driver}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBus(null)}
                  className="text-white/60 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 bg-white/10 rounded-lg">
                  <div className="text-lg font-bold text-orange-400">{selectedBus.speed}</div>
                  <div className="text-xs text-white/60">km/h</div>
                </div>
                <div className="text-center p-2 bg-white/10 rounded-lg">
                  <div className="text-lg font-bold text-blue-400">5</div>
                  <div className="text-xs text-white/60">min</div>
                </div>
                <div className="text-center p-2 bg-white/10 rounded-lg">
                  <div className="text-lg font-bold text-green-400">18/22</div>
                  <div className="text-xs text-white/60">places</div>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/scanner')}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                📷 Scanner ce Gbaka
              </button>
            </div>
          </div>
        )}

        {/* Légende transparente */}
        <div className="absolute top-24 left-4 z-[1000]">
          <div className="bg-black/60 backdrop-blur-xl text-white rounded-xl p-3 border border-white/20 max-w-[160px]">
            <h4 className="font-bold mb-2 text-sm">Légende</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF6B00] shadow-lg"></div>
                <span className="text-white/90">Gbakas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-300 shadow"></div>
                <span className="text-white/90">Stations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#0984E3] shadow-lg"></div>
                <span className="text-white/90">Vous</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bouton d'options flottant pour mobile */}
        {!showMenu && (
          <div className="md:hidden fixed bottom-24 right-4 z-[1000]">
            <button
              onClick={() => setShowMenu(true)}
              className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-2xl shadow-2xl hover:scale-110 transition-transform"
            >
              +
            </button>
          </div>
        )}
      </div>

      {/* Navigation bottom transparente pour mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[1000] p-3">
        <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-3 border border-white/20">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-white text-lg mb-1">🚌</div>
              <div className="text-xs font-medium text-white">{gbakas.length}</div>
              <div className="text-[10px] text-white/60">Gbakas</div>
            </div>
            <div className="text-center">
              <div className="text-white text-lg mb-1">📍</div>
              <div className="text-xs font-medium text-white">Position</div>
              <div className="text-[10px] text-white/60">Active</div>
            </div>
            <div className="text-center">
              <div className="text-white text-lg mb-1">🏪</div>
              <div className="text-xs font-medium text-white">12</div>
              <div className="text-[10px] text-white/60">Stations</div>
            </div>
            <div className="text-center">
              <div className="text-white text-lg mb-1">⚡</div>
              <div className="text-xs font-medium text-white">98%</div>
              <div className="text-[10px] text-white/60">À l'heure</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;