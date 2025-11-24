import React, { useState, useEffect, useCallback } from 'react';
import { TonConnectButton, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import MiningPage from './MiningPage';
import ShopPage from './ShopPage';
import UserPage from './UserPage';
import RankingsPage from './RankingsPage';
import GamesPage from './GamesPage';
import { economyData } from './economy';

const ONE_HOUR_IN_SECONDS = 3600;
const initialSlots = [{ name: 'Slot 1', filled: true, free: true, type: 'free', tier: 1, repairCooldown: ONE_HOUR_IN_SECONDS }];
const NEW_SLOT_COST = 500;
const SHOP_RECEIVER_ADDRESS = 'UQAcxItDorzIiYeZNuC51XlqCYDuP3vnDvVu18iFJhK1cFOx';
const TIER_PRICES = { 1: '3500000000', 2: '9000000000', 3: '17000000000', 'A': '10000000000', 'B': '20000000000', 'C': '30000000000' };
const STORAGE_VERSION = 'v23'; // Versão incrementada para garantir reset e nova estrutura

export default function App() {
  const [route, setRoute] = useState('mine');
  const [status, setStatus] = useState('Bem-vindo! Conecte sua carteira quando quiser.');
  const [coinBdg, setCoinBdg] = useState(0);
  const [slots, setSlots] = useState([]);
  const [username, setUsername] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const [paidBoostTime, setPaidBoostTime] = useState(0);
  const [energyEarnedInSession, setEnergyEarnedInSession] = useState(0);
  const [dailySessionsUsed, setDailySessionsUsed] = useState(0);
  const [lastSessionReset, setLastSessionReset] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  const userFriendlyAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  // Função ÚNICA para salvar todo o estado do jogo
  const saveData = useCallback(() => {
    // Não salvar se não estiver inicializado ou se não houver usuário (tela de login)
    if (!isInitialized || !username) return;
    const gameState = {
      slots,
      coinBdg,
      username,
      paidBoostTime,
      energyEarnedInSession,
      dailySessionsUsed,
      lastSessionReset,
      lastSaveTimestamp: Date.now(),
    };
    localStorage.setItem(`gameState_${STORAGE_VERSION}`, JSON.stringify(gameState));
  }, [isInitialized, username, slots, coinBdg, paidBoostTime, energyEarnedInSession, dailySessionsUsed, lastSessionReset]);

  // Efeito para carregar o jogo e calcular ganhos offline
  useEffect(() => {
    const savedStateJSON = localStorage.getItem(`gameState_${STORAGE_VERSION}`);
    
    if (savedStateJSON) {
      const savedState = JSON.parse(savedStateJSON);
      const now = Date.now();
      const lastSave = savedState.lastSaveTimestamp || now;
      const offlineSeconds = Math.floor((now - lastSave) / 1000);

      let { coinBdg: savedCoinBdg, slots: savedSlots, paidBoostTime: savedPaidBoostTime, username: savedUsername } = savedState;

      if (savedUsername) {
        if (offlineSeconds > 5) {
          let accumulatedGain = 0;
          const updatedOfflineSlots = savedSlots.map(slot => {
            if (slot.filled && slot.repairCooldown > 0) {
              const secondsToMine = Math.min(slot.repairCooldown, offlineSeconds);
              const econKey = slot.type === 'free' ? 'free' : (slot.type === 'special' ? slot.tier.toString().toUpperCase() : slot.tier);
              const gainRatePerSecond = (economyData[econKey]?.gainPerHour || 0) / 3600;

              let gainFromThisSlot = 0;
              if(savedPaidBoostTime > 0) {
                  const boostDuration = Math.min(secondsToMine, savedPaidBoostTime);
                  gainFromThisSlot += (gainRatePerSecond * 1.5) * boostDuration;
                  const remainingMineTime = secondsToMine - boostDuration;
                  if (remainingMineTime > 0) gainFromThisSlot += gainRatePerSecond * remainingMineTime;
              } else {
                  gainFromThisSlot += gainRatePerSecond * secondsToMine;
              }
              accumulatedGain += gainFromThisSlot;
              return { ...slot, repairCooldown: Math.max(0, slot.repairCooldown - offlineSeconds) };
            }
            return slot;
          });

          setSlots(updatedOfflineSlots);
          setCoinBdg(savedCoinBdg + accumulatedGain);
          setPaidBoostTime(Math.max(0, savedPaidBoostTime - offlineSeconds));
          if (accumulatedGain > 0.0001) setStatus(`Você ganhou ${accumulatedGain.toFixed(4)} BDG enquanto esteve fora!`);
        } else {
          setSlots(savedSlots);
          setCoinBdg(savedCoinBdg);
          setPaidBoostTime(savedPaidBoostTime);
        }

        setUsername(savedState.username || '');
        setEnergyEarnedInSession(savedState.energyEarnedInSession || 0);
        setDailySessionsUsed(savedState.dailySessionsUsed || 0);
        setLastSessionReset(savedState.lastSessionReset || new Date().toISOString().split('T')[0]);
      }
    } else {
      // Primeira vez jogando
      setSlots(initialSlots);
    }
    setIsInitialized(true);
  }, []);

  // Salva o jogo a cada 5 segundos e ao fechar a página
  useEffect(() => {
    const saveInterval = setInterval(saveData, 5000);
    window.addEventListener('beforeunload', saveData);
    return () => {
      clearInterval(saveInterval);
      window.removeEventListener('beforeunload', saveData);
    };
  }, [saveData]);

  const handleUsernameSubmit = () => {
      if (tempUsername.trim()) {
          setUsername(tempUsername.trim());
          // Força o salvamento inicial logo após o primeiro login
          const initialGameState = {
              slots: initialSlots,
              coinBdg: 0,
              username: tempUsername.trim(),
              paidBoostTime: 0,
              energyEarnedInSession: 0,
              dailySessionsUsed: 0,
              lastSessionReset: new Date().toISOString().split('T')[0],
              lastSaveTimestamp: Date.now(),
          };
          localStorage.setItem(`gameState_${STORAGE_VERSION}`, JSON.stringify(initialGameState));
      }
  };
  
  const gameLoop = useCallback(() => {
    if (!isInitialized || !username) return;
    setSlots(currentSlots => {
      let totalGain = 0;
      const updatedSlots = currentSlots.map(slot => {
        if (slot.filled && slot.repairCooldown > 0) {
          const econKey = slot.type === 'free' ? 'free' : (slot.type === 'special' ? slot.tier.toString().toUpperCase() : slot.tier);
          let gainRate = (economyData[econKey]?.gainPerHour || 0) / 3600;
          if (paidBoostTime > 0) gainRate *= 1.5;
          totalGain += gainRate;
          return { ...slot, repairCooldown: slot.repairCooldown - 1 };
        }
        return slot;
      });
      if (totalGain > 0) setCoinBdg(prev => prev + totalGain);
      return updatedSlots;
    });
    if (paidBoostTime > 0) setPaidBoostTime(prev => prev - 1);
  }, [isInitialized, username, paidBoostTime]);

  useEffect(() => {
    const gameInterval = setInterval(gameLoop, 1000);
    return () => clearInterval(gameInterval);
  }, [gameLoop]);

  // ... (O resto das funções permanecem iguais)
  const handleGameWin = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    if (lastSessionReset !== today) {
      setDailySessionsUsed(0);
      setEnergyEarnedInSession(0);
      setLastSessionReset(today);
    }
    if (dailySessionsUsed >= 3) {
      setStatus('❌ Você já usou suas 3 sessões de recarga de hoje.');
      return;
    }
    if (energyEarnedInSession >= 60) {
      setStatus('🕒 Limite de 1h de recarga atingido nesta sessão. Use outra sessão amanhã!');
      if(dailySessionsUsed < 3 && energyEarnedInSession >= 60) {
          setDailySessionsUsed(prev => prev + 1);
          setEnergyEarnedInSession(0);
      }
      return;
    }
    setSlots(prevSlots => prevSlots.map(slot => {
      if (slot.filled) {
        const newCooldown = Math.min(slot.repairCooldown + 10 * 60, ONE_HOUR_IN_SECONDS);
        return { ...slot, repairCooldown: newCooldown };
      }
      return slot;
    }));
    const newEnergyEarned = energyEarnedInSession + 10;
    setEnergyEarnedInSession(newEnergyEarned);
    setStatus(`🎉 Você ganhou 10 minutos de energia! Total na sessão: ${newEnergyEarned} min.`);
    if (newEnergyEarned >= 60) {
        setDailySessionsUsed(prev => prev + 1);
        setEnergyEarnedInSession(0);
        setStatus('✨ Sessão de recarga completa! Use as próximas amanhã.');
    }
  }, [dailySessionsUsed, energyEarnedInSession, lastSessionReset]);
  const addNewSlot = () => {
    if (slots.length >= 6) {
        setStatus('❌ Limite de 6 gabinetes atingido!');
        return;
    }
    if (coinBdg >= NEW_SLOT_COST) {
        setCoinBdg(prev => prev - NEW_SLOT_COST);
        setSlots(prev => [...prev, { name: `Slot ${prev.length + 1}`, filled: false, free: false, repairCooldown: 0 }]);
        setStatus(`✅ Gabinete ${slots.length + 1} comprado com sucesso!`)
    } else {
        setStatus(`❌ BDG insuficiente! Você precisa de ${NEW_SLOT_COST} BDG.`);
    }
  };
  const handlePurchase = async (tierToBuy) => {
    if (!userFriendlyAddress) {
        setStatus('❌ Por favor, conecte sua carteira para comprar.');
        return;
    }
    const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60,
        messages: [{ address: SHOP_RECEIVER_ADDRESS, amount: TIER_PRICES[tierToBuy] }]
    };
    try {
        await tonConnectUI.sendTransaction(transaction);
        const emptySlotIndex = slots.findIndex(slot => !slot.filled);
        if (emptySlotIndex !== -1) {
            setSlots(prevSlots => prevSlots.map((slot, index) => {
                if (index === emptySlotIndex) {
                    const isSpecial = ['A', 'B', 'C'].includes(tierToBuy);
                    return { ...slot, filled: true, type: isSpecial ? 'special' : 'paid', tier: tierToBuy, repairCooldown: ONE_HOUR_IN_SECONDS };
                }
                return slot;
            }));
            setStatus(`🎉 CPU comprada e montada com sucesso!`);
        } else {
            setStatus('✅ Compra aprovada, mas você não tem gabinetes vazios para instalar a CPU.');
        }
    } catch (error) {
        console.error(error);
        setStatus('❌ Transação cancelada ou falhou.');
    }
  };
  const navButtonStyle = (page) => ({ background: route === page ? '#5a67d8' : '#4a5568', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '10px 0', margin: '0 4px', fontSize: '1.5em', maxWidth: '60px' });

  const mainApp = (
    <>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}><p>Bem-vindo, {username}!</p><TonConnectButton /></header>
      <div style={{ textAlign: 'center', padding: '10px', minHeight: '40px', color: status.startsWith('❌') ? '#f87171' : '#34d399' }}><p>{status}</p></div>
        {(() => {
            switch (route) {
                case 'mine': return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} status={status} setStatus={setStatus} addNewSlot={addNewSlot} paidBoostTime={paidBoostTime} setPaidBoostTime={setPaidBoostTime} economyData={economyData} />;
                case 'shop': return <ShopPage handlePurchase={handlePurchase} />;
                case 'games': return <GamesPage onGameWin={handleGameWin} />;
                case 'user': return <UserPage address={userFriendlyAddress} coinBdg={coinBdg} username={username} />;
                case 'rankings': return <RankingsPage />;
                default: return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} status={status} setStatus={setStatus} addNewSlot={addNewSlot} paidBoostTime={paidBoostTime} setPaidBoostTime={setPaidBoostTime} economyData={economyData} />;
            }
        })()}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '0.5rem', background: '#2d3748', gap: '5px' }}>
        <button onClick={() => setRoute('mine')} style={navButtonStyle('mine')} title="Minerar">⛏️</button>
        <button onClick={() => setRoute('shop')} style={navButtonStyle('shop')} title="Loja">🛒</button>
        <button onClick={() => setRoute('games')} style={navButtonStyle('games')} title="Jogos">🎮</button>
        <button onClick={() => setRoute('user')} style={navButtonStyle('user')} title="Perfil">👤</button>
        <button onClick={() => setRoute('rankings')} style={navButtonStyle('rankings')} title="Rankings">🏆</button>
      </nav>
    </>
  );

  const loginScreen = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '20px', background: '#18181b', color: '#f4f4f5' }}>
      <h1 style={{ fontFamily: '"Press Start 2P", cursive', color: '#facc15' }}>CryptoDesk</h1>
      <p style={{ marginBottom: '30px' }}>Digite seu nome de usuário para começar</p>
      <input type="text" value={tempUsername} onChange={(e) => setTempUsername(e.target.value)} placeholder="Seu nome aqui" style={{ padding: '10px', borderRadius: '5px', border: '1px solid #4a5568', background: '#2d3748', color: 'white', marginBottom: '20px', width: '90%', maxWidth: '350px' }} />
      <button onClick={handleUsernameSubmit} style={{ padding: '10px 20px', borderRadius: '5px', border: 'none', background: '#6366f1', color: 'white', cursor: 'pointer', fontFamily: '"Press Start 2P", cursive' }}>Entrar</button>
    </div>
  );

  if (!isInitialized) {
    return <div style={{display: 'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#18181b', color:'#facc15', fontFamily: '"Press Start 2P", cursive'}}>Carregando Jogo...</div>;
  }

  return (
    <div style={{ background: '#18181b', color: '#f4f4f5', minHeight: '100vh', paddingBottom: '100px' }}>
      {!username ? loginScreen : mainApp}
    </div>
  );
}
