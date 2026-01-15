import React, { useState, useEffect, useRef } from 'react';

const QRScanner = ({ onScan }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Détection mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Demander la permission caméra
  useEffect(() => {
    const requestCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
          
          // Lister les caméras disponibles
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          setDevices(videoDevices);
          if (videoDevices.length > 0) {
            setSelectedDevice(videoDevices[0].deviceId);
          }
        }
      } catch (err) {
        console.error('Erreur caméra:', err);
        setHasPermission(false);
      }
    };

    requestCamera();
  }, []);

  // Démarrer/Arrêter le scan
  const toggleScan = () => {
    setIsScanning(!isScanning);
    if (!isScanning) {
      startQRDetection();
    }
  };

  // Détection QR (simulée pour l'exemple)
  const startQRDetection = () => {
    // Simulation de scan
    setTimeout(() => {
      if (Math.random() > 0.5 && isScanning) {
        const fakeData = {
          vehicleId: `GB-${Math.floor(Math.random() * 1000)}-AB`,
          driver: 'Chauffeur Test',
          destination: 'Plateau',
          timestamp: new Date().toISOString()
        };
        onScan(fakeData);
        
        // Feedback visuel
        if (videoRef.current) {
          videoRef.current.style.filter = 'brightness(0.5)';
          setTimeout(() => {
            if (videoRef.current) videoRef.current.style.filter = 'brightness(1)';
          }, 300);
        }
        
        // Vibration sur mobile
        if (isMobile && navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }
        
        // Son de succès
        playSuccessSound();
      }
    }, 2000);
  };

  const playSuccessSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQ=');
    audio.play().catch(e => console.log('Audio non joué:', e));
  };

  // Changer de caméra
  const switchCamera = async () => {
    const currentStream = videoRef.current?.srcObject;
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
    }

    try {
      const constraints = {
        video: { deviceId: { exact: selectedDevice } }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Erreur changement caméra:', err);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Scanner UI */}
      <div className="relative bg-black rounded-2xl overflow-hidden">
        {/* Vidéo */}
        <div className="relative aspect-[4/3]">
          {hasPermission === false ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center p-6">
                <div className="text-6xl mb-4">📵</div>
                <h3 className="text-xl font-bold text-white mb-2">Caméra bloquée</h3>
                <p className="text-gray-400">Autorisez la caméra pour scanner</p>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Overlay de scan */}
              <div className="absolute inset-0">
                {/* Cadre de scan */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64">
                  <div className="absolute inset-0 border-2 border-orange-500 rounded-xl"></div>
                  
                  {/* Coins animés */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-orange-500 rounded-tl animate-pulse"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-orange-500 rounded-tr animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-orange-500 rounded-bl animate-pulse"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-orange-500 rounded-br animate-pulse"></div>
                  
                  {/* Ligne de scan animée */}
                  <div className="absolute left-0 right-0 h-1 bg-orange-500 animate-scan"></div>
                </div>
                
                {/* Instructions */}
                <div className="absolute bottom-6 left-0 right-0 text-center">
                  <p className="text-white text-sm bg-black/50 backdrop-blur-sm inline-block px-4 py-2 rounded-full">
                    📍 Positionnez le QR code dans le cadre
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Contrôles */}
        <div className="p-4 bg-gray-900">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleScan}
              className={`px-6 py-3 rounded-lg font-bold text-white flex items-center gap-2 ${
                isScanning
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
              }`}
            >
              <span>{isScanning ? '🛑' : '📷'}</span>
              <span>{isScanning ? 'Arrêter' : 'Scanner'}</span>
            </button>
            
            {devices.length > 1 && (
              <button
                onClick={switchCamera}
                className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white"
                title="Changer de caméra"
              >
                🔄
              </button>
            )}
            
            <button
              onClick={() => onScan({
                vehicleId: `GB-TEST-${Math.floor(Math.random() * 1000)}`,
                driver: 'Test Simulé',
                destination: 'Plateau'
              })}
              className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm"
            >
              🧪 Simuler
            </button>
          </div>
        </div>
      </div>

      {/* Canvas caché pour la détection */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Instructions détaillées */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
        <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span>💡</span>
          Comment scanner ?
        </h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-500">1.</span>
            <span>Trouvez le sticker QR sur le Gbaka (côté droit)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">2.</span>
            <span>Positionnez le code dans le cadre orange</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">3.</span>
            <span>Maintenez stable pendant 2 secondes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">4.</span>
            <span>Le scan ajoute automatiquement 10 points au chauffeur</span>
          </li>
        </ul>
      </div>

      {/* Statistiques de scan */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">24</div>
          <div className="text-xs text-gray-600">Scans aujourd'hui</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">240</div>
          <div className="text-xs text-gray-600">Points distribués</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">98%</div>
          <div className="text-xs text-gray-600">Taux de réussite</div>
        </div>
      </div>

      {/* Animation CSS */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 1; }
          50% { opacity: 0.7; }
          100% { top: 100%; opacity: 1; }
        }
        
        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }
        
        @media (max-width: 640px) {
          .absolute.top-1\\/2.left-1\\/2.transform.-translate-x-1\\/2.-translate-y-1\\/2 {
            width: 240px;
            height: 240px;
          }
        }
      `}</style>
    </div>
  );
};

export default QRScanner;