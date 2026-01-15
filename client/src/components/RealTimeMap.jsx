
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- CONFIGURATION LEAFLET ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// --- COMPOSANTS UTILITAIRES ---

// Bouton de géolocalisation flottant
function LocateButton({ onLocate }) {
  return (
    <button
      onClick={onLocate}
      className="leaflet-control absolute bottom-24 right-4 z-[900] bg-white p-3 rounded-full shadow-xl text-gray-700 hover:text-orange-600 active:scale-95 transition-all duration-200 border border-gray-100"
      aria-label="Ma position"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>
  );
}

// Gestion des événements de carte
function MapController({ setMapMoving }) {
  useMapEvents({
    dragstart: () => setMapMoving(true),
    dragend: () => setMapMoving(false),
    zoomstart: () => setMapMoving(true),
    zoomend: () => setMapMoving(false),
  });
  return null;
}

const RealTimeMap = ({ selectedLine = null, userLocation = null }) => {
  const mapRef = useRef(null);
  const [userPos, setUserPos] = useState(userLocation || [5.3599517, -4.0082563]); // Default: Abidjan
  const [gbakas, setGbakas] = useState([]);
  const [mapMoving, setMapMoving] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const intervalRef = useRef(null);

  // Données statiques des lignes (Simulées)
  const abidjanLines = [
    {
      id: 'ypg-plateau',
      name: 'Yopougon - Plateau',
      color: '#FF6B00',
      stations: [[5.325, -4.065], [5.335, -4.045], [5.350, -4.025], [5.365, -4.005]]
    },
    {
      id: 'adj-cocody',
      name: 'Adjamé - Cocody',
      color: '#10B981',
      stations: [[5.370, -4.040], [5.365, -4.020], [5.355, -4.010], [5.350, -3.995]]
    },
    {
      id: 't-marcory',
      name: 'Treichville - Marcory',
      color: '#3B82F6',
      stations: [[5.300, -4.010], [5.310, -3.990], [5.320, -3.970]]
    }
  ];

  // --- LOGIQUE DE SIMULATION ---
  useEffect(() => {
    // Initialisation des bus
    const initialGbakas = [
      { id: 'GB-01', line: 'ypg-plateau', position: [5.330, -4.055], speed: 40, capacity: 18, driver: 'Koffi', destination: 'Plateau' },
      { id: 'GB-02', line: 'adj-cocody', position: [5.360, -4.025], speed: 35, capacity: 22, driver: 'Aïcha', destination: 'Cocody' },
      { id: 'GB-03', line: 't-marcory', position: [5.310, -4.000], speed: 45, capacity: 20, driver: 'Jean', destination: 'Marcory' },
    ];
    setGbakas(initialGbakas);

    // Animation fluide
    intervalRef.current = setInterval(() => {
      setGbakas(prev => prev.map(gbaka => {
        const line = abidjanLines.find(l => l.id === gbaka.line);
        if (!line) return gbaka;

        // Logique simplifiée de déplacement aléatoire vers une station
        const target = line.stations[Math.floor(Math.random() * line.stations.length)];
        const latDiff = target[0] - gbaka.position[0];
        const lngDiff = target[1] - gbaka.position[1];
        const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

        if (distance < 0.001) return gbaka; // Pause à l'arrêt

        return {
          ...gbaka,
          position: [
            gbaka.position[0] + (latDiff / distance) * 0.0002,
            gbaka.position[1] + (lngDiff / distance) * 0.0002
          ]
        };
      }));
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  // --- GESTION GPS ---
  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert("Géolocalisation non supportée");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(newPos);
        mapRef.current?.flyTo(newPos, 16, { animate: true, duration: 1.5 });
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
  };

  // --- ICONS PERSONNALISÉES ---
  const createBusIcon = (lineId, isSelected) => {
    const line = abidjanLines.find(l => l.id === lineId);
    const color = line?.color || '#FF6B00';
    const size = isSelected ? 48 : 36;
    
    return L.divIcon({
      html: `
        <div class="relative transition-all duration-300">
          <div style="background-color: ${color}; width: ${size}px; height: ${size}px;" 
               class="rounded-full border-4 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-1/2 w-1/2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          ${isSelected ? `<div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black rounded-full animate-ping"></div>` : ''}
        </div>
      `,
      className: 'bg-transparent',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  const userIcon = L.divIcon({
    html: `
      <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-xl relative">
        <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
      </div>
    `,
    className: 'bg-transparent',
    iconSize: [16, 16],
  });

  // Filtrage
  const visibleGbakas = selectedLine ? gbakas.filter(g => g.line === selectedLine) : gbakas;
  const visibleLines = selectedLine ? abidjanLines.filter(l => l.id === selectedLine) : abidjanLines;

  return (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden rounded-xl">
      {/* HEADER FLOTTANT MOBILE */}
      <div className="absolute top-4 left-4 right-14 z-[900] pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-gray-100 pointer-events-auto inline-block max-w-full">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="font-semibold text-sm text-gray-800 truncate">
              {selectedLine ? abidjanLines.find(l => l.id === selectedLine)?.name : 'Réseau Abidjan'}
            </span>
          </div>
        </div>
      </div>

      <MapContainer
        ref={mapRef}
        center={userPos}
        zoom={13}
        zoomControl={false}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <MapController setMapMoving={setMapMoving} />

        {/* TRACÉS DES LIGNES */}
        {visibleLines.map(line => (
          <Polyline
            key={line.id}
            positions={line.stations}
            pathOptions={{ color: line.color, weight: 6, opacity: 0.6, lineCap: 'round' }}
          />
        ))}

        {/* MARKERS GBAKAS */}
        {visibleGbakas.map(bus => (
          <Marker
            key={bus.id}
            position={bus.position}
            icon={createBusIcon(bus.line, selectedBus?.id === bus.id)}
            eventHandlers={{
              click: () => {
                setSelectedBus(bus);
                mapRef.current?.flyTo(bus.position, 16, { duration: 1 });
              },
            }}
          />
        ))}

        {/* MARKER USER */}
        <Marker position={userPos} icon={userIcon} />
      </MapContainer>

      {/* BOUTON LOCALISER */}
      <LocateButton onLocate={handleLocate} />

      {/* BOTTOM SHEET / INFO PANEL */}
      {selectedBus ? (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl p-4 border border-gray-100">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm"
                     style={{ backgroundColor: abidjanLines.find(l => l.id === selectedBus.line)?.color }}>
                  {selectedBus.id.split('-')[1]}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{selectedBus.driver}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span>Vers</span>
                    <span className="font-medium text-gray-700">{selectedBus.destination}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedBus(null)}
                className="p-1 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-gray-50 p-2 rounded-lg text-center">
                <div className="text-xs text-gray-500">Vitesse</div>
                <div className="font-bold text-gray-900">{selectedBus.speed} <span className="text-[10px]">km/h</span></div>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg text-center">
                <div className="text-xs text-gray-500">Places</div>
                <div className="font-bold text-gray-900">{selectedBus.capacity}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded-lg text-center">
                <div className="text-xs text-gray-500">Arrivée</div>
                <div className="font-bold text-green-600">5 min</div>
              </div>
            </div>

            <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Scanner pour payer
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default RealTimeMap;
