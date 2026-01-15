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

  return (
    <div className="h-screen w-full bg-white">
      {/* Header minimal */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-white/90 backdrop-blur-sm p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🚌</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Carte Goudron</h1>
              <p className="text-sm text-gray-600">{gbakas.length} Gbakas actifs</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/scanner')}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium"
          >
            Scanner
          </button>
        </div>
      </div>

      {/* Carte principale */}
      <div className="h-full w-full pt-16">
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

        {/* Panneau info bus sélectionné */}
        {selectedBus && (
          <div className="absolute bottom-24 left-4 right-4 z-[1000]">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white text-xl">
                    🚌
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{selectedBus.id}</h3>
                    <p className="text-sm text-gray-600">{selectedBus.driver}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBus(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">{selectedBus.speed}</div>
                  <div className="text-xs text-gray-600">km/h</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">5</div>
                  <div className="text-xs text-gray-600">min</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">18/22</div>
                  <div className="text-xs text-gray-600">places</div>
                </div>
              </div>
              
              <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold">
                📍 Suivre ce Gbaka
              </button>
            </div>
          </div>
        )}

        {/* Légende */}
        <div className="absolute top-24 left-4 z-[1000]">
          <div className="bg-black/70 backdrop-blur-sm text-white rounded-xl p-3">
            <h4 className="font-bold mb-2 text-sm">Légende</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF6B00]"></div>
                <span>Gbakas en mouvement</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                <span>Stations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#0984E3]"></div>
                <span>Votre position</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation bottom simplifiée */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-[1000]">
        <div className="flex justify-around">
          <button
            onClick={() => navigate('/planner')}
            className="flex flex-col items-center p-2 text-gray-500 hover:text-orange-600"
          >
            <span className="text-2xl">🔍</span>
            <span className="text-xs mt-1">Recherche</span>
          </button>
          
          <button
            onClick={() => navigate('/chauffeur')}
            className="flex flex-col items-center p-2 text-gray-500 hover:text-orange-600"
          >
            <span className="text-2xl">👨‍✈️</span>
            <span className="text-xs mt-1">Chauffeur</span>
          </button>
          
          <button
            onClick={() => navigate('/scanner')}
            className="flex flex-col items-center p-2 text-gray-500 hover:text-orange-600"
          >
            <span className="text-2xl">📷</span>
            <span className="text-xs mt-1">Scanner</span>
          </button>
          
          <button
            onClick={() => navigate('/coxer')}
            className="flex flex-col items-center p-2 text-gray-500 hover:text-orange-600"
          >
            <span className="text-2xl">🏢</span>
            <span className="text-xs mt-1">Coxer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;