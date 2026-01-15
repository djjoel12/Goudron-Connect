import React from 'react';
import { useNavigate } from 'react-router-dom';
import RealTimeMap from './RealTimeMap';

const MapPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header simple */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate('/')}
            className="bg-black/70 backdrop-blur-lg text-white p-3 rounded-xl"
          >
            ← Retour
          </button>
          <div className="bg-black/70 backdrop-blur-lg text-white px-4 py-2 rounded-xl">
            <h1 className="font-bold">Carte temps réel</h1>
          </div>
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </header>

      {/* Carte en plein écran */}
      <div className="h-screen pt-16">
        <RealTimeMap />
      </div>

      {/* Contrôles */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
        <div className="flex gap-2 bg-black/70 backdrop-blur-lg rounded-2xl p-2">
          <button className="px-4 py-3 bg-orange-500 text-white rounded-xl font-medium">
            📍 Ma position
          </button>
          <button className="px-4 py-3 bg-blue-500 text-white rounded-xl font-medium">
            🔍 Rechercher
          </button>
          <button className="px-4 py-3 bg-green-500 text-white rounded-xl font-medium">
            🚌 Lignes
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapPage;