// Configuration PWA pour Goudron-Connect
export const pwaConfig = {
  appName: 'Goudron-Connect',
  appShortName: 'Goudron',
  themeColor: '#FF6B00',
  backgroundColor: '#000000',
  
  // Fonctionnalités
  features: {
    offline: true,
    pushNotifications: true,
    backgroundSync: true,
    installPrompt: true,
    qrScanner: true,
    gpsTracking: true
  },
  
  // Cache stratégies
  cacheStrategies: {
    static: 'cache-first',
    api: 'network-first',
    images: 'cache-first',
    gps: 'network-only'
  },
  
  // URLs importantes
  urls: {
    scanner: '/scanner',
    map: '/carte',
    driver: '/chauffeur',
    coxer: '/coxer',
    admin: '/admin',
    wallet: '/wallet'
  },
  
  // Messages d'installation
  installMessages: {
    title: 'Installer Goudron-Connect',
    description: 'Installez l\'appli pour un accès rapide et le mode hors-ligne',
    button: '📱 Installer',
    installed: '✅ Application installée !'
  }
};

export default pwaConfig;