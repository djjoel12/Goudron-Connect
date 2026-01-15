import React, { useState } from 'react';

const LineSelector = ({ onLineSelect, selectedLine = null }) => {
  const lines = [
    { id: 'ypg-plateau', name: 'Yopougon - Plateau', color: '#FF6B00', stations: 12, frequency: '5-8min' },
    { id: 'adj-cocody', name: 'Adjamé - Cocody', color: '#00B894', stations: 10, frequency: '7-10min' },
    { id: 't-marcory', name: 'Treichville - Marcory', color: '#0984E3', stations: 8, frequency: '10-15min' },
    { id: 'coc-yop', name: 'Cocody - Yopougon', color: '#6C5CE7', stations: 14, frequency: '8-12min' },
    { id: 'plateau-adj', name: 'Plateau - Adjamé', color: '#FD79A8', stations: 9, frequency: '6-9min' },
    { id: 'marc-koum', name: 'Marcory - Koumassi', color: '#00CEC9', stations: 7, frequency: '12-15min' },
  ];

  const [searchTerm, setSearchTerm] = useState('');

  const filteredLines = lines.filter(line =>
    line.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full">
      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Rechercher une ligne..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-base"
            style={{ WebkitAppearance: 'none' }}
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </div>
        </div>
      </div>

      {/* Grille responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLines.map((line) => (
          <button
            key={line.id}
            onClick={() => onLineSelect(line.id)}
            className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
              selectedLine === line.id
                ? 'border-orange-500 bg-orange-50 shadow-lg scale-[1.02]'
                : 'border-gray-200 hover:border-orange-300 hover:shadow-md bg-white'
            }`}
          >
            {selectedLine === line.id && (
              <div className="absolute -top-2 -right-2 bg-orange-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm">
                ✓
              </div>
            )}

            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: line.color }}
              >
                🚌
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded">
                {line.frequency}
              </span>
            </div>

            <h3 className="font-bold text-gray-900 text-left mb-2 text-sm sm:text-base leading-tight">
              {line.name}
            </h3>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span>📍</span>
                {line.stations} arrêts
              </span>
              <span className="flex items-center gap-1">
                <span>⏱️</span>
                {line.frequency}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Aucun résultat */}
      {filteredLines.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🚫</div>
          <h4 className="text-lg font-bold text-gray-900 mb-2">Aucune ligne trouvée</h4>
          <p className="text-gray-600">Essayez un autre terme de recherche</p>
        </div>
      )}

      {/* Ligne sélectionnée - Mobile Friendly */}
      {selectedLine && (
        <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                  style={{ backgroundColor: lines.find(l => l.id === selectedLine)?.color }}
                >
                  🚌
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                    {lines.find(l => l.id === selectedLine)?.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Suivez les Gbakas en temps réel
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => onLineSelect(null)}
              className="text-orange-600 hover:text-orange-700 font-medium text-sm px-4 py-2 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
            >
              Changer
            </button>
          </div>
        </div>
      )}

      {/* Stats - Optimisé mobile */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{lines.length}</div>
            <div className="text-xs sm:text-sm text-gray-500">Lignes actives</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">24/7</div>
            <div className="text-xs sm:text-sm text-gray-500">Disponibilité</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">500+</div>
            <div className="text-xs sm:text-sm text-gray-500">Gbakas</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">98%</div>
            <div className="text-xs sm:text-sm text-gray-500">Fiabilité</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineSelector;