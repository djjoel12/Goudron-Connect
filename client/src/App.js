import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import TripPlanner from './components/TripPlanner';
import MapPage from './components/MapPage';
import QRScanner from './components/QRScanner';
import DriverDashboard from './components/DriverDashboard';
import DriverWallet from './components/DriverWallet';
import CoxerDashboard from './components/CoxerDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Page d'accueil avec recherche */}
        <Route path="/" element={<HomePage />} />
        
        {/* Planificateur de trajets */}
        <Route path="/planner" element={<TripPlanner />} />
        
        {/* Carte temps réel */}
        <Route path="/map" element={<MapPage />} />
        
        {/* Scanner QR */}
        <Route path="/scanner" element={<QRScanner />} />
        
        {/* Interface chauffeur */}
        <Route path="/chauffeur" element={<DriverDashboard />} />
        <Route path="/chauffeur/wallet" element={<DriverWallet />} />
        
        {/* Interface coxer */}
        <Route path="/coxer" element={<CoxerDashboard />} />
        
        {/* Interface admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* Redirections pour compatibilité */}
        <Route path="/driver" element={<DriverDashboard />} />
        <Route path="/driver/wallet" element={<DriverWallet />} />
        <Route path="/station" element={<CoxerDashboard />} />
        
        {/* Route 404 */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;