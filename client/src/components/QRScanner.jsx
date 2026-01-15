import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = ({ onScan }) => {
  const scannerRef = useRef(null);
  const [scanner, setScanner] = useState(null);
  const [cameraId, setCameraId] = useState(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // Initialiser le scanner
  useEffect(() => {
    if (!scannerRef.current) return;

    const html5QrcodeScanner = new Html5QrcodeScanner(
      scannerRef.current.id,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        supportedScanTypes: []
      },
      false
    );

    setScanner(html5QrcodeScanner);

    // Démarrer le scan
    html5QrcodeScanner.render(
      (decodedText, decodedResult) => {
        handleSuccess(decodedText, decodedResult);
      },
      (errorMessage) => {
        handleError(errorMessage);
      }
    );

    setIsScanning(true);

    // Nettoyer
    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(error => {
          console.error("Erreur nettoyage scanner:", error);
        });
      }
    };
  }, []);

  const handleSuccess = (decodedText, decodedResult) => {
    console.log("QR Code scanné:", decodedText);
    
    try {
      // Essayer de parser le QR comme JSON
      let scanData;
      try {
        scanData = JSON.parse(decodedText);
      } catch (e) {
        // Si pas JSON, créer un objet simple
        scanData = {
          raw: decodedText,
          vehicleId: decodedText,
          timestamp: new Date().toISOString()
        };
      }

      // Arrêter le scanner
      if (scanner) {
        scanner.clear();
        setIsScanning(false);
      }

      // Passer les données au parent
      if (onScan) {
        onScan(scanData);
      }
    } catch (error) {
      setError("Erreur traitement QR: " + error.message);
    }
  };

  const handleError = (errorMessage) => {
    console.error("Erreur scanner:", errorMessage);
    setError(errorMessage);
  };

  const stopScanner = () => {
    if (scanner) {
      scanner.clear().then(() => {
        setIsScanning(false);
      }).catch(err => {
        console.error("Erreur arrêt scanner:", err);
      });
    }
  };

  const startScanner = () => {
    if (scanner && !isScanning) {
      scanner.render(
        handleSuccess,
        handleError
      );
      setIsScanning(true);
      setError(null);
    }
  };

  // Vérifier la compatibilité
  const isCompatible = () => {
    return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
  };

  if (!isCompatible()) {
    return (
      <div className="text-center p-8">
        <div className="text-4xl mb-4">📵</div>
        <h3 className="text-xl font-bold mb-2">Scanner non supporté</h3>
        <p className="text-gray-400 mb-4">
          Votre navigateur ne supporte pas l'accès à la caméra.
        </p>
        <p className="text-sm text-gray-500">
          Essayez avec Chrome ou Safari sur mobile.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold">Scanner QR Code</h4>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-xs">{isScanning ? 'Scan actif' : 'Scan arrêté'}</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-400 mb-4">
          Pointez la caméra vers le code QR du Gbaka
        </div>
      </div>

      {/* Zone du scanner */}
      <div className="relative">
        <div
          id="qr-scanner"
          ref={scannerRef}
          className="w-full h-64 bg-black rounded-xl overflow-hidden"
        ></div>
        
        {/* Overlay de guidage */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-48 h-48 border-2 border-orange-500 rounded-lg relative">
            {/* Coins */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-orange-500 rounded-tl"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-orange-500 rounded-tr"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-orange-500 rounded-bl"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-orange-500 rounded-br"></div>
          </div>
        </div>
      </div>

      {/* Contrôles */}
      <div className="mt-4 flex gap-3">
        <button
          onClick={startScanner}
          disabled={isScanning}
          className={`flex-1 py-2 rounded-lg font-medium ${
            isScanning
              ? 'bg-gray-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
          }`}
        >
          ▶️ Démarrer
        </button>
        
        <button
          onClick={stopScanner}
          disabled={!isScanning}
          className={`flex-1 py-2 rounded-lg font-medium ${
            !isScanning
              ? 'bg-gray-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
          }`}
        >
          ⏹️ Arrêter
        </button>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="text-red-400 text-sm">{error}</div>
          <button
            onClick={() => setError(null)}
            className="text-xs text-red-300 hover:text-red-200 mt-1"
          >
            Masquer
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <h5 className="font-bold text-sm mb-1">💡 Instructions</h5>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>• Assurez-vous d'avoir une bonne luminosité</li>
          <li>• Tenez le téléphone stable</li>
          <li>• Le QR est généralement sur la portière avant droite</li>
          <li>• Le scan enregistre automatiquement le départ</li>
        </ul>
      </div>

      {/* Scanner manuel (fallback) */}
      <div className="mt-4">
        <button
          onClick={() => {
            const vehicleId = prompt("Entrez l'immatriculation du Gbaka:");
            if (vehicleId) {
              onScan({
                vehicleId: vehicleId,
                driver: prompt("Nom du chauffeur (optionnel):") || "Inconnu",
                destination: prompt("Destination:") || "Non spécifié",
                manualEntry: true
              });
            }
          }}
          className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm"
        >
          ✏️ Entrée manuelle
        </button>
      </div>
    </div>
  );
};

export default QRScanner;