import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DriverWallet = () => {
  const navigate = useNavigate();
  const [points, setPoints] = useState(12500);
  const [balance, setBalance] = useState(8500);
  const [transactions, setTransactions] = useState([]);
  const [conversionRate] = useState(10); // 1 point = 10 FCFA
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Transactions simulées
  const sampleTransactions = [
    { id: 1, type: 'earned', amount: 150, description: 'Points trajet Yopougon', date: 'Aujourd\'hui 08:30', points: 15 },
    { id: 2, type: 'earned', amount: 100, description: 'Alerte bouchon signalée', date: 'Aujourd\'hui 09:15', points: 10 },
    { id: 3, type: 'withdrawal', amount: -5000, description: 'Retrait Orange Money', date: 'Hier 16:45', points: -500 },
    { id: 4, type: 'earned', amount: 300, description: 'Trajet complet Plateau', date: 'Hier 14:20', points: 30 },
    { id: 5, type: 'bonus', amount: 1000, description: 'Bonus parrainage', date: '05/12 11:10', points: 100 },
    { id: 6, type: 'withdrawal', amount: -3000, description: 'Retrait MTN Mobile Money', date: '04/12 18:30', points: -300 },
  ];

  // Charger les données
  useEffect(() => {
    const savedPoints = localStorage.getItem('driver_points');
    const savedBalance = localStorage.getItem('driver_balance');
    const savedTransactions = localStorage.getItem('driver_transactions');
    
    if (savedPoints) setPoints(parseInt(savedPoints));
    if (savedBalance) setBalance(parseInt(savedBalance));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    else setTransactions(sampleTransactions);
    
    // Simuler des gains en temps réel si en mode actif
    const interval = setInterval(() => {
      const isActive = localStorage.getItem('driver_active') === 'true';
      if (isActive && Math.random() > 0.7) {
        const gain = Math.floor(Math.random() * 10) + 5;
        setPoints(prev => prev + gain);
        setBalance(prev => prev + (gain * conversionRate));
        
        // Ajouter transaction
        const newTransaction = {
          id: Date.now(),
          type: 'earned',
          amount: gain * conversionRate,
          description: 'Gain automatique en route',
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          points: gain
        };
        
        setTransactions(prev => [newTransaction, ...prev.slice(0, 19)]);
      }
    }, 30000); // Toutes les 30 secondes
    
    return () => clearInterval(interval);
  }, []);

  // Sauvegarder les données
  useEffect(() => {
    localStorage.setItem('driver_points', points.toString());
    localStorage.setItem('driver_balance', balance.toString());
    localStorage.setItem('driver_transactions', JSON.stringify(transactions.slice(0, 20)));
  }, [points, balance, transactions]);

  // Convertir points en argent
  const convertPoints = () => {
    if (points < 100) {
      alert('❌ Minimum 100 points requis');
      return;
    }
    
    const amount = points * conversionRate;
    setBalance(prev => prev + amount);
    
    const newTransaction = {
      id: Date.now(),
      type: 'conversion',
      amount: amount,
      description: 'Conversion points → Argent',
      date: new Date().toLocaleString(),
      points: -points
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    setPoints(0);
    
    alert(`✅ ${points} points convertis en ${amount.toLocaleString()} FCFA !`);
  };

  // Retirer de l'argent
  const withdrawMoney = (method) => {
    const amount = parseInt(withdrawAmount) || 0;
    
    if (amount < 1000) {
      alert('❌ Montant minimum: 1 000 FCFA');
      return;
    }
    
    if (amount > balance) {
      alert('❌ Solde insuffisant');
      return;
    }
    
    if (!confirm(`Retirer ${amount.toLocaleString()} FCFA vers ${method} ?`)) {
      return;
    }
    
    setBalance(prev => prev - amount);
    setWithdrawAmount('');
    
    const newTransaction = {
      id: Date.now(),
      type: 'withdrawal',
      amount: -amount,
      description: `Retrait ${method}`,
      date: new Date().toLocaleString(),
      points: 0
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    
    alert(`✅ Retrait de ${amount.toLocaleString()} FCFA initié !\nLes fonds arriveront sous 24h.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/chauffeur')}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                ← Retour
              </button>
              <div>
                <h1 className="text-xl font-bold">Portefeuille Chauffeur</h1>
                <p className="text-xs text-gray-400">Gérez vos gains et retraits</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xs text-gray-400">Taux de conversion</div>
              <div className="font-bold">1 point = {conversionRate} FCFA</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Cartes de solde */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Carte Points */}
          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-6 border border-orange-500/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">Mes Points</h3>
                <p className="text-sm text-gray-300">Gagnés en roulant</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
            
            <div className="text-center py-4">
              <div className="text-5xl font-bold">{points.toLocaleString()}</div>
              <div className="text-gray-300">points</div>
            </div>
            
            <div className="text-center mb-2">
              <div className="text-sm text-gray-400">
                Valeur: <span className="font-bold text-white">{(points * conversionRate).toLocaleString()} FCFA</span>
              </div>
            </div>
            
            <button
              onClick={convertPoints}
              disabled={points < 100}
              className={`w-full py-3 rounded-xl font-bold ${
                points >= 100
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                  : 'bg-gray-700 cursor-not-allowed'
              }`}
            >
              {points >= 100 ? '🔄 Convertir en argent' : `Minimum 100 points requis`}
            </button>
          </div>

          {/* Carte Argent */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">Mon Argent</h3>
                <p className="text-sm text-gray-300">Disponible au retrait</p>
              </div>
              <div className="text-3xl">💵</div>
            </div>
            
            <div className="text-center py-4">
              <div className="text-5xl font-bold">{balance.toLocaleString()}</div>
              <div className="text-gray-300">Francs CFA</div>
            </div>
            
            {/* Retrait rapide */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Montant à retirer"
                  className="flex-1 bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                />
                <button
                  onClick={() => withdrawMoney('Orange Money')}
                  disabled={!withdrawAmount || parseInt(withdrawAmount) < 1000}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg font-bold disabled:opacity-50"
                >
                  Retirer
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setWithdrawAmount('5000');
                    withdrawMoney('Orange Money');
                  }}
                  className="py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm"
                >
                  <div className="font-bold">5 000 F</div>
                  <div className="text-xs text-gray-400">Orange Money</div>
                </button>
                
                <button
                  onClick={() => {
                    setWithdrawAmount('10000');
                    withdrawMoney('MTN Mobile Money');
                  }}
                  className="py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm"
                >
                  <div className="font-bold">10 000 F</div>
                  <div className="text-xs text-gray-400">MTN MoMo</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Méthodes de retrait */}
        <div className="bg-black/40 rounded-2xl p-6 border border-white/10 mb-8">
          <h3 className="text-xl font-bold mb-4">📲 Retirer vers...</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => withdrawMoney('Orange Money')}
              className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 hover:from-orange-600/30 hover:to-orange-700/30 border border-orange-500/30 rounded-xl p-4 flex items-center gap-4 transition-all hover:scale-105"
            >
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-2xl">
                🍊
              </div>
              <div className="text-left">
                <div className="font-bold">Orange Money</div>
                <div className="text-sm text-gray-400">Frais: 1%</div>
              </div>
            </button>
            
            <button
              onClick={() => withdrawMoney('MTN Mobile Money')}
              className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 hover:from-yellow-600/30 hover:to-yellow-700/30 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-4 transition-all hover:scale-105"
            >
              <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center text-2xl">
                📱
              </div>
              <div className="text-left">
                <div className="font-bold">MTN MoMo</div>
                <div className="text-sm text-gray-400">Frais: 1.5%</div>
              </div>
            </button>
            
            <button
              onClick={() => withdrawMoney('Wave')}
              className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-600/30 hover:to-blue-700/30 border border-blue-500/30 rounded-xl p-4 flex items-center gap-4 transition-all hover:scale-105"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-2xl">
                🌊
              </div>
              <div className="text-left">
                <div className="font-bold">Wave</div>
                <div className="text-sm text-gray-400">Frais: 0%</div>
              </div>
            </button>
          </div>
          
          <div className="mt-6 text-sm text-gray-400">
            <p>💡 <strong>Conseil :</strong> Les retraits sont traités sous 24h maximum.</p>
            <p>📞 Contact support retrait: <strong>07 07 07 07 07</strong></p>
          </div>
        </div>

        {/* Historique des transactions */}
        <div className="bg-black/40 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">📝 Historique des transactions</h3>
            <button className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg">
              Voir tout →
            </button>
          </div>
          
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-2">📭</div>
              <p>Aucune transaction</p>
              <p className="text-sm">Activez le mode chauffeur pour gagner</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transactions.map(transaction => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'earned' || transaction.type === 'bonus'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {transaction.type === 'earned' ? '💰' :
                       transaction.type === 'bonus' ? '🎁' :
                       transaction.type === 'withdrawal' ? '💸' : '🔄'}
                    </div>
                    
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-gray-400">{transaction.date}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-bold ${
                      transaction.amount > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} F
                    </div>
                    {transaction.points !== 0 && (
                      <div className="text-xs text-gray-400">
                        {transaction.points > 0 ? '+' : ''}{transaction.points} points
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Statistiques */}
          <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {transactions.filter(t => t.amount > 0).length}
              </div>
              <div className="text-sm text-gray-400">Entrées</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {transactions.filter(t => t.amount < 0).length}
              </div>
              <div className="text-sm text-gray-400">Sorties</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">
                {transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()} F
              </div>
              <div className="text-sm text-gray-400">Solde net</div>
            </div>
          </div>
        </div>

        {/* Conseils */}
        <div className="mt-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-500/30">
          <h3 className="text-lg font-bold mb-3">💡 Comment gagner plus ?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/30 p-4 rounded-xl">
              <div className="text-2xl mb-2">🚀</div>
              <div className="font-bold mb-1">Roulez plus</div>
              <div className="text-sm text-gray-300">5 points/minute en mode actif</div>
            </div>
            
            <div className="bg-black/30 p-4 rounded-xl">
              <div className="text-2xl mb-2">🚨</div>
              <div className="font-bold mb-1">Signalez</div>
              <div className="text-sm text-gray-300">Jusqu'à 20 points/alerte</div>
            </div>
            
            <div className="bg-black/30 p-4 rounded-xl">
              <div className="text-2xl mb-2">👥</div>
              <div className="font-bold mb-1">Parrainez</div>
              <div className="text-sm text-gray-300">100 points/parrainage réussi</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DriverWallet;