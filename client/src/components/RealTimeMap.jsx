import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import * as ELG from 'esri-leaflet-geocoder';

// Fix pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const RealTimeMap = ({ selectedLine = null, userLocation = null }) => {
  const mapRef = useRef(null);
  const [mapCenter, setMapCenter] = useState([5.3599517, -4.0082563]); // Abidjan
  const [zoom, setZoom] = useState(12);
  const [userPos, setUserPos] = useState(userLocation);
  const [gbakas, setGbakas] = useState([]);
  const [lines, setLines] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [nextBusTimes, setNextBusTimes] = useState({});
  
  // Lignes principales d'Abidjan
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

  // Simuler des Gbakas en mouvement
  useEffect(() => {
    const interval = setInterval(() => {
      setGbakas(prev => 
        prev.map(gbaka => ({
          ...gbaka,
          position: [
            gbaka.position[0] + (Math.random() - 0.5) * 0.001,
            gbaka.position[1] + (Math.random() - 0.5) * 0.001
          ],
          lastUpdate: Date.now()
        }))
      );
    }, 5000); // Mettre à jour toutes les 5 secondes

    return () => clearInterval(interval);
  }, []);

  // Charger les données initiales
  useEffect(() => {
    // Simuler des Gbakas
    const initialGbakas = [
      { id: 'gb1', line: 'ypg-plateau', position: [5.330, -4.055], speed: 40, capacity: 18, driver: 'Koffi' },
      { id: 'gb2', line: 'adj-cocody', position: [5.360, -4.025], speed: 35, capacity: 22, driver: 'Aïcha' },
      { id: 'gb3', line: 't-marcory', position: [5.310, -4.000], speed: 45, capacity: 20, driver: 'Jean' },
      { id: 'gb4', line: 'ypg-plateau', position: [5.345, -4.015], speed: 30, capacity: 16, driver: 'Moussa' },
    ];
    
    setGbakas(initialGbakas);
    setLines(abidjanLines);
    
    // Simuler les stations
    const allStations = abidjanLines.flatMap(line => 
      line.stations.map((pos, idx) => ({
        id: `${line.id}-st${idx}`,
        name: `Station ${idx + 1}`,
        position: pos,
        line: line.id,
        crowd: Math.floor(Math.random() * 3) // 0: vide, 1: moyen, 2: plein
      }))
    );
    
    setStations(allStations);
    
    // Calculer les prochains passages
    const times = {};
    allStations.forEach(station => {
      const busesOnLine = initialGbakas.filter(b => b.line === station.line);
      if (busesOnLine.length > 0) {
        const nextBus = busesOnLine[0];
        const distance = calculateDistance(station.position, nextBus.position);
        const time = Math.round((distance / 0.02) * 60); // Estimation en minutes
        times[station.id] = Math.max(1, time);
      }
    });
    
    setNextBusTimes(times);
  }, []);

  // Obtenir la position de l'utilisateur
  useEffect(() => {
    if (navigator.geolocation && !userLocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = [pos.coords.latitude, pos.coords.longitude];
          setUserPos(newPos);
          if (mapRef.current) {
            mapRef.current.setView(newPos, 15);
          }
        },
        (err) => {
          console.warn('GPS non disponible:', err);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [userLocation]);

  // Suivre la position en temps réel
  useEffect(() => {
    let watchId = null;
    
    if (isTracking && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const newPos = [pos.coords.latitude, pos.coords.longitude];
          setUserPos(newPos);
        },
        null,
        { enableHighAccuracy: true }
      );
    }
    
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking]);

  // Calculer la distance entre deux points
  const calculateDistance = (pos1, pos2) => {
    const latDiff = pos1[0] - pos2[0];
    const lngDiff = pos1[1] - pos2[1];
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  };

  // Trouver le Gbaka le plus proche
  const findNearestBus = () => {
    if (!userPos || gbakas.length === 0) return null;
    
    let nearest = null;
    let minDistance = Infinity;
    
    gbakas.forEach(bus => {
      const distance = calculateDistance(userPos, bus.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = bus;
      }
    });
    
    return nearest;
  };

  // Custom icons
  const busIcon = (lineId) => {
    const line = abidjanLines.find(l => l.id === lineId);
    return L.divIcon({
      html: `
        <div style="
          background: ${line?.color || '#FF6B00'};
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 16px;
        ">
          🚌
        </div>
      `,
      className: 'bus-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
  };

  const stationIcon = (crowdLevel) => {
    const colors = ['#00B894', '#FDCB6E', '#FF7675']; // Vert, Orange, Rouge
    return L.divIcon({
      html: `
        <div style="
          background: ${colors[crowdLevel] || '#00B894'};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        "></div>
      `,
      className: 'station-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  const userIcon = L.divIcon({
    html: `
      <div style="
        background: #0984E3;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(9,132,227,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 14px;
      ">
        👤
      </div>
    `,
    className: 'user-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  // Filtrer par ligne sélectionnée
  const filteredGbakas = selectedLine 
    ? gbakas.filter(bus => bus.line === selectedLine)
    : gbakas;
  
  const filteredStations = selectedLine
    ? stations.filter(station => station.line === selectedLine)
    : stations;
  
  const filteredLines = selectedLine
    ? abidjanLines.filter(line => line.id === selectedLine)
    : abidjanLines;

  // Bus le plus proche
  const nearestBus = findNearestBus();

  return (
    <div className="relative w-full h-full">
      {/* Contrôles de la carte */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <div className="bg-white rounded-xl shadow-xl p-3 min-w-[280px]">
          <h3 className="font-bold text-gray-900 mb-2">🗺️ Carte Goudron-Connect</h3>
          
          <div className="space-y-2">
            <button
              onClick={() => {
                if (mapRef.current && userPos) {
                  mapRef.current.setView(userPos, 16);
                }
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
            >
              <span>📍</span>
              Ma position
            </button>
            
            <button
              onClick={() => setIsTracking(!isTracking)}
              className={`w-full py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
                isTracking 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <span>{isTracking ? '🔒' : '📍'}</span>
              {isTracking ? 'Suivi activé' : 'Activer suivi'}
            </button>
            
            {nearestBus && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mt-2">
                <p className="text-xs text-orange-800 font-semibold">
                  🚌 Gbaka le plus proche: {Math.round(calculateDistance(userPos || mapCenter, nearestBus.position) * 100000)}m
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Légende */}
        <div className="bg-white rounded-xl shadow-xl p-3">
          <h4 className="font-bold text-gray-900 mb-2 text-sm">Légende</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#FF6B00]"></div>
              <span className="text-xs text-gray-600">Gbaka en mouvement</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00B894]"></div>
              <span className="text-xs text-gray-600">Station peu fréquentée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF7675]"></div>
              <span className="text-xs text-gray-600">Station bondée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#0984E3]"></div>
              <span className="text-xs text-gray-600">Votre position</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques en haut à droite */}
      <div className="absolute top-4 right-4 z-[1000]">
        <div className="bg-white rounded-xl shadow-xl p-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{gbakas.length}</div>
              <div className="text-xs text-gray-500">Gbakas actifs</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{stations.length}</div>
              <div className="text-xs text-gray-500">Stations</div>
            </div>
          </div>
        </div>
      </div>

      {/* La carte */}
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%', borderRadius: '12px' }}
        ref={mapRef}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Lignes de bus */}
        {filteredLines.map(line => (
          <Polyline
            key={line.id}
            positions={line.stations}
            pathOptions={{ color: line.color, weight: 4, opacity: 0.7 }}
          />
        ))}

        {/* Stations */}
        {filteredStations.map(station => (
          <Marker
            key={station.id}
            position={station.position}
            icon={stationIcon(station.crowd)}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-gray-900">{station.name}</h3>
                <p className="text-sm text-gray-600 mb-2">Ligne: {station.line}</p>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${
                    station.crowd === 0 ? 'bg-green-500' :
                    station.crowd === 1 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm">
                    {station.crowd === 0 ? 'Peu fréquenté' :
                     station.crowd === 1 ? 'Fréquentation moyenne' : 'Très fréquenté'}
                  </span>
                </div>
                
                {nextBusTimes[station.id] && (
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-sm font-semibold text-blue-700">
                      🕐 Prochain Gbaka: {nextBusTimes[station.id]} min
                    </p>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Gbakas */}
        {filteredGbakas.map(bus => (
          <Marker
            key={bus.id}
            position={bus.position}
            icon={busIcon(bus.line)}
            eventHandlers={{
              click: () => setSelectedBus(bus)
            }}
          >
            <Popup>
              <div className="p-2 min-w-[220px]">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <span>🚌</span>
                  Gbaka {bus.id.toUpperCase()}
                </h3>
                
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ligne:</span>
                    <span className="font-semibold">{bus.line}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Vitesse:</span>
                    <span className="font-semibold">{bus.speed} km/h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Places:</span>
                    <span className="font-semibold">{bus.capacity} personnes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Chauffeur:</span>
                    <span className="font-semibold">{bus.driver}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    // Action: Signaler ce bus
                    console.log('Signaler bus:', bus.id);
                  }}
                  className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white py-1.5 px-3 rounded text-sm font-medium"
                >
                  🚨 Signaler en vue
                </button>
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
              </div>
            </Popup>
          </Marker>
        )}

        {/* Cercle autour de l'utilisateur */}
        {userPos && (
          <CircleMarker
            center={userPos}
            radius={100}
            pathOptions={{
              fillColor: '#0984E3',
              fillOpacity: 0.1,
              color: '#0984E3',
              weight: 1
            }}
          />
        )}
      </MapContainer>

      {/* Panneau d'info bas */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000]">
        <div className="bg-white rounded-xl shadow-xl p-3 min-w-[300px]">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Calculateur d'attente</h4>
              {nearestBus ? (
                <p className="text-xs text-gray-600">
                  Prochain Gbaka dans: <span className="font-bold text-orange-600">
                    {Math.round(calculateDistance(userPos || mapCenter, nearestBus.position) * 100000 / 40)} min
                  </span>
                </p>
              ) : (
                <p className="text-xs text-gray-600">Aucun Gbaka à proximité</p>
              )}
            </div>
            
            <button
              onClick={() => {
                // Simuler un scan
                console.log('Scanner un sticker');
              }}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-lg font-bold flex items-center gap-2"
            >
              <span>📷</span>
              Scanner
            </button>
          </div>
        </div>
      </div>

      {/* Sélecteur de ligne mobile */}
      <div className="absolute bottom-20 left-4 z-[1000]">
        <div className="bg-white rounded-xl shadow-xl p-2">
          <select
            value={selectedLine || ''}
            onChange={(e) => setSelectedBus(null)}
            className="border-0 text-sm font-medium focus:ring-0"
          >
            <option value="">Toutes les lignes</option>
            {abidjanLines.map(line => (
              <option key={line.id} value={line.id}>
                {line.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMap;