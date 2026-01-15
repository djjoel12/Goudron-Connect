import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./components/HomePage";
import CompanyRegisterForm from "./components/CompanyRegisterForm";
import CompanyLogin from "./components/CompanyLogin";

import CompanyDashboard from './components/CompanyDashboard';
import RoutePage from "./components/RoutePage";

// ===== IMPORT DES NOUVEAUX COMPOSANTS GOUDRON =====
import DriverDashboard from "./components/DriverDashboard";
import DriverWallet from "./components/DriverWallet";
import CoxerDashboard from "./components/CoxerDashboard";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation bar - MODIFIÉE POUR GOUDRON */}
        <nav className="p-4 bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-green-500 rounded-lg"></div>
              <span className="text-xl font-bold text-gray-900">Goudron-Connect</span>
            </Link>
            <div className="space-x-4 flex items-center">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-orange-600 font-medium transition-colors text-sm"
              >
                🏠 Passager
              </Link>
              <Link 
                to="/chauffeur" 
                className="text-gray-700 hover:text-orange-600 font-medium transition-colors text-sm"
              >
                🚌 Chauffeur
              </Link>
              <Link 
                to="/coxer" 
                className="text-gray-700 hover:text-orange-600 font-medium transition-colors text-sm"
              >
                🏢 Coxer
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <Link 
                to="/login-company" 
                className="text-gray-700 hover:text-orange-600 font-medium transition-colors text-sm"
              >
                Connexion
              </Link>
              <Link 
                to="/admin" 
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                👑 Admin
              </Link>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          {/* Routes existantes TransportTicket */}
          <Route path="/" element={<HomePage />} />
          <Route path="/register-company" element={<CompanyRegisterForm />} />
          <Route path="/login-company" element={<CompanyLogin />} />
          <Route path="/trajet/:departure/:arrival" element={<RoutePage />} />
      
          <Route path="/company-dashboard" element={<CompanyDashboard />} />
          
          {/* ===== NOUVELLES ROUTES GOUDRON-CONNECT ===== */}
          
          {/* Interface Chauffeur */}
          <Route path="/chauffeur" element={<DriverDashboard />} />
          <Route path="/chauffeur/wallet" element={<DriverWallet />} />
          <Route path="/driver" element={<DriverDashboard />} />
          <Route path="/driver/wallet" element={<DriverWallet />} />
          
          {/* Interface Coxer */}
          <Route path="/coxer" element={<CoxerDashboard />} />
          <Route path="/station" element={<CoxerDashboard />} />
          
          {/* Interface Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
          {/* Route de fallback */}
          <Route path="*" element={
            <div className="container mx-auto p-8 text-center">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">🚧</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Page en construction
                </h2>
                <p className="text-gray-600 mb-6">
                  Cette fonctionnalité arrive bientôt sur Goudron-Connect !
                </p>
                <div className="space-y-3">
                  <Link 
                    to="/" 
                    className="block bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-medium"
                  >
                    🏠 Retour à l'accueil
                  </Link>
                  <Link 
                    to="/chauffeur" 
                    className="block bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                  >
                    🚌 Mode Chauffeur
                  </Link>
                  <Link 
                    to="/admin" 
                    className="block bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-lg font-medium"
                  >
                    👑 Panel Admin
                  </Link>
                </div>
              </div>
            </div>
          } />
        </Routes>
        
        {/* Footer Goudron-Connect */}
        <footer className="bg-gray-900 text-white mt-12">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg"></div>
                  <span className="text-xl font-bold">Goudron-Connect</span>
                </div>
                <p className="text-gray-400 text-sm">
                  La connexion intelligente des Gbakas d'Abidjan
                </p>
              </div>
              
              <div>
                <h4 className="font-bold mb-4">Pour vous</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link to="/" className="hover:text-orange-400">Passager</Link></li>
                  <li><Link to="/chauffeur" className="hover:text-orange-400">Chauffeur</Link></li>
                  <li><Link to="/coxer" className="hover:text-orange-400">Coxer</Link></li>
                  <li><Link to="/admin" className="hover:text-orange-400">Admin</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-4">Fonctionnalités</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>🗺️ Carte temps réel</li>
                  <li>📷 Scanner QR</li>
                  <li>💰 Points Data</li>
                  <li>🤖 IA Intelligente</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-4">Contact</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>📞 07 07 07 07 07</li>
                  <li>📧 contact@goudron-connect.ci</li>
                  <li>📍 Abidjan, Côte d'Ivoire</li>
                  <li>⏰ Support 7j/7</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
              <p>© 2024 Goudron-Connect. Tous droits réservés.</p>
              <p className="mt-1">Service indépendant - 🇨🇮 Made in Abidjan</p>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;