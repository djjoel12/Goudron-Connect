import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// ============================================
// INSTALLATION PWA & SERVICE WORKER
// ============================================

// Variables globales pour l'installation
window.goudronApp = {
  deferredPrompt: null,
  isStandalone: window.matchMedia('(display-mode: standalone)').matches ||
                window.navigator.standalone ||
                document.referrer.includes('android-app://'),
  
  // Vérifier si on peut installer
  canInstall: () => {
    return window.goudronApp.deferredPrompt !== null;
  },
  
  // Proposer l'installation
  showInstallPrompt: () => {
    if (window.goudronApp.deferredPrompt) {
      window.goudronApp.deferredPrompt.prompt();
      
      window.goudronApp.deferredPrompt.userChoice.then(choiceResult => {
        if (choiceResult.outcome === 'accepted') {
          console.log('📱 Application installée !');
          localStorage.setItem('goudron_installed', 'true');
          
          // Envoyer analytics
          if (window.gtag) {
            window.gtag('event', 'pwa_installed');
          }
        }
        
        window.goudronApp.deferredPrompt = null;
        document.getElementById('installButton')?.remove();
      });
    }
  },
  
  // Vérifier si l'app est installée
  checkInstallation: () => {
    return localStorage.getItem('goudron_installed') === 'true' || window.goudronApp.isStandalone;
  }
};

// Écouter l'événement d'installation
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.goudronApp.deferredPrompt = e;
  
  console.log('📲 Installation PWA disponible');
  
  // Afficher un bouton d'installation si pas déjà installé
  if (!window.goudronApp.checkInstallation()) {
    setTimeout(() => {
      // Vérifier si le bouton n'existe pas déjà
      if (!document.getElementById('installButton')) {
        const installButton = document.createElement('button');
        installButton.id = 'installButton';
        installButton.innerHTML = `
          <div style="
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #FF6B00, #FF8E00);
            color: white;
            border: none;
            border-radius: 50px;
            padding: 12px 24px;
            font-weight: bold;
            box-shadow: 0 4px 20px rgba(255, 107, 0, 0.3);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            animation: pulse 2s infinite;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          ">
            <span>📱</span>
            <span>Installer Goudron</span>
          </div>
        `;
        
        installButton.onclick = () => {
          window.goudronApp.showInstallPrompt();
          // Suivre l'action
          if (window.gtag) {
            window.gtag('event', 'install_button_clicked');
          }
        };
        
        document.body.appendChild(installButton);
        
        // Ajouter l'animation
        const style = document.createElement('style');
        style.textContent = `
          @keyframes pulse {
            0% { transform: scale(1); box-shadow: 0 4px 20px rgba(255, 107, 0, 0.3); }
            50% { transform: scale(1.05); box-shadow: 0 6px 25px rgba(255, 107, 0, 0.4); }
            100% { transform: scale(1); box-shadow: 0 4px 20px rgba(255, 107, 0, 0.3); }
          }
          
          #installButton div:hover {
            background: linear-gradient(135deg, #FF8E00, #FF6B00);
            transform: translateY(-2px);
            transition: all 0.3s ease;
          }
        `;
        document.head.appendChild(style);
      }
    }, 3000); // Attendre 3 secondes avant d'afficher
  }
});

// Enregistrer le Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${process.env.PUBLIC_URL || ''}/service-worker.js`;
    
    // Enregistrer le service worker
    navigator.serviceWorker.register(swUrl)
      .then(registration => {
        console.log('✅ Service Worker enregistré avec succès:', registration.scope);
        
        // Vérifier les mises à jour
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('🔄 Nouvelle version du Service Worker détectée');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🆕 Nouvelle version disponible ! Mise à jour prête.');
              
              // Afficher une notification de mise à jour
              const updateNotification = document.createElement('div');
              updateNotification.id = 'updateNotification';
              updateNotification.innerHTML = `
                <div style="
                  position: fixed;
                  bottom: 80px;
                  left: 50%;
                  transform: translateX(-50%);
                  background: rgba(0, 0, 0, 0.95);
                  color: #FF6B00;
                  padding: 15px 25px;
                  border-radius: 12px;
                  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.5);
                  z-index: 10001;
                  display: flex;
                  align-items: center;
                  gap: 15px;
                  border: 2px solid #FF6B00;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  min-width: 300px;
                  max-width: 90%;
                  backdrop-filter: blur(10px);
                ">
                  <span style="font-size: 24px;">🔄</span>
                  <div style="flex-grow: 1;">
                    <div style="font-weight: bold; margin-bottom: 5px; color: white;">Mise à jour disponible</div>
                    <div style="font-size: 14px; color: #aaa;">Une nouvelle version est prête.</div>
                  </div>
                  <button onclick="window.location.reload()" style="
                    background: #FF6B00;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    transition: background 0.3s;
                  " onmouseover="this.style.background='#FF8E00'" onmouseout="this.style.background='#FF6B00'">
                    Mettre à jour
                  </button>
                </div>
              `;
              
              // Supprimer l'ancienne notification si elle existe
              document.getElementById('updateNotification')?.remove();
              document.body.appendChild(updateNotification);
              
              // Supprimer automatiquement après 15 secondes
              setTimeout(() => {
                updateNotification.remove();
              }, 15000);
            }
          });
        });
        
        // Demander la permission pour les notifications
        if ('Notification' in window && Notification.permission === 'default') {
          // Attendre un peu avant de demander
          setTimeout(() => {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                console.log('🔔 Notifications autorisées');
                
                // Créer une notification de bienvenue
                if (registration.showNotification) {
                  registration.showNotification('Bienvenue sur Goudron', {
                    body: 'Vous recevrez des notifications importantes',
                    icon: '/logo192.png',
                    badge: '/logo192.png',
                    vibrate: [200, 100, 200],
                    tag: 'welcome-notification'
                  });
                }
              }
            });
          }, 5000); // Attendre 5 secondes
        }
        
        // Vérifier la connexion
        const updateOnlineStatus = () => {
          if (!navigator.onLine) {
            console.log('🌐 Mode hors-ligne détecté');
            document.body.classList.add('offline');
            
            // Créer une bannière hors ligne
            if (!document.getElementById('offlineBanner')) {
              const offlineBanner = document.createElement('div');
              offlineBanner.id = 'offlineBanner';
              offlineBanner.innerHTML = `
                <div style="
                  position: fixed;
                  top: 0;
                  left: 0;
                  right: 0;
                  background: linear-gradient(90deg, #333, #555);
                  color: #FF6B00;
                  text-align: center;
                  padding: 10px;
                  font-size: 14px;
                  font-weight: bold;
                  z-index: 10000;
                  border-bottom: 2px solid #FF6B00;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                ">
                  <span style="margin-right: 10px;">🌐</span>
                  Mode hors-ligne - Les données seront synchronisées à la reconnexion
                </div>
              `;
              document.body.appendChild(offlineBanner);
            }
          } else {
            document.body.classList.remove('offline');
            document.getElementById('offlineBanner')?.remove();
            
            // Synchroniser les données
            if (registration.sync) {
              try {
                registration.sync.register('sync-goudron-data')
                  .then(() => console.log('🔄 Synchronisation démarrée'))
                  .catch(err => console.log('⚠️ Synchronisation non disponible:', err));
              } catch (e) {
                console.log('⚠️ Background Sync non supporté');
              }
            }
          }
        };
        
        // Initialiser l'état de connexion
        updateOnlineStatus();
        
        // Écouter les changements de connexion
        window.addEventListener('online', () => {
          console.log('🌐 Connexion rétablie');
          updateOnlineStatus();
          
          // Afficher une notification temporaire
          const onlineToast = document.createElement('div');
          onlineToast.innerHTML = `
            <div style="
              position: fixed;
              top: 60px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(0, 200, 0, 0.9);
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              z-index: 10002;
              font-size: 14px;
              animation: slideDown 0.5s ease;
            ">
              ✅ Connexion rétablie
            </div>
          `;
          document.body.appendChild(onlineToast);
          setTimeout(() => onlineToast.remove(), 3000);
        });
        
        window.addEventListener('offline', () => {
          console.log('🌐 Connexion perdue');
          updateOnlineStatus();
        });
        
      })
      .catch(error => {
        console.error('❌ Erreur lors de l\'enregistrement du Service Worker:', error);
        
        // Afficher un message d'erreur en développement
        if (process.env.NODE_ENV === 'development') {
          const errorDiv = document.createElement('div');
          errorDiv.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #ff4444;
            color: white;
            padding: 10px;
            border-radius: 5px;
            z-index: 10000;
            font-family: monospace;
            font-size: 12px;
            max-width: 300px;
          `;
          errorDiv.textContent = `SW Error: ${error.message}`;
          document.body.appendChild(errorDiv);
          setTimeout(() => errorDiv.remove(), 10000);
        }
      });
  });
} else {
  console.log('⚠️ Service Worker non supporté par ce navigateur');
}

// Fonction utilitaire pour VAPID key (pour les notifications push)
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Exposer pour le débogage en développement
if (process.env.NODE_ENV === 'development') {
  window.__GOUDRON_DEBUG = {
    serviceWorker: navigator.serviceWorker?.controller,
    isStandalone: window.goudronApp.isStandalone,
    canInstall: window.goudronApp.canInstall(),
    checkInstallation: window.goudronApp.checkInstallation(),
    pwa: window.goudronApp
  };
  
  console.log('🔧 Mode développement - Debug PWA activé:', window.__GOUDRON_DEBUG);
}

// Animation CSS pour les notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
  @keyframes slideDown {
    from {
      transform: translateX(-50%) translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }
  
  body.offline {
    opacity: 0.95;
  }
  
  @media (max-width: 768px) {
    #installButton div {
      bottom: 70px !important;
      right: 10px !important;
      font-size: 14px;
      padding: 10px 20px;
    }
    
    #updateNotification > div {
      min-width: 280px !important;
      bottom: 120px !important;
    }
  }
`;
document.head.appendChild(notificationStyles);

// ============================================
// RENDU DE L'APPLICATION REACT
// ============================================

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Signal que le PWA est chargé
console.log('🚀 Goudron Connect PWA initialisée');