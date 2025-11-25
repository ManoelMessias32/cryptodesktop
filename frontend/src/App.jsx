import React, { useState, useEffect, useCallback } from 'react';
import { TonConnectButton, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import MiningPage from './MiningPage';
import ShopPage from './ShopPage';
import UserPage from './UserPage';
import RankingsPage from './RankingsPage';
import GamesPage from './GamesPage';
import { economyData } from './economy';

const ONE_HOUR_IN_SECONDS = 3600;
const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 3600;
const initialSlots = [{ name: 'Slot 1', filled: true, free: true, type: 'free', tier: 1, repairCooldown: ONE_HOUR_IN_SECONDS, durability: SEVEN_DAYS_IN_SECONDS }];
const NEW_SLOT_COST = 500;
const SHOP_RECEIVER_ADDRESS = 'UQAcxItDorzIiYeZNuC51XlqCYDuP3vnDvVu18iFJhK1cFOx';
const TIER_PRICES = { 1: '3500000000', 2: '9000000000', 3: '17000000000', 'A': '10000000000', 'B': '20000000000', 'C': '30000000000' };
const BDG_COIN_PRICE = '1000000000';
const STORAGE_VERSION = 'v31'; // Correção final da economia e salvamento

export default function App() {
  const [route, setRoute] = useState('mine');
  const [status, setStatus] = useState('Bem-vindo! Conecte sua carteira quando quiser.');
  const [coinBdg, setCoinBdg] = useState(0);
  const [claimableBdg, setClaimableBdg] = useState(0);
  const [slots, setSlots] = useState([]);
  const [username, setUsername] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const [paidBoostTime, setPaidBoostTime] = useState(0);
  const [gamesPlayedToday, setGamesPlayedToday] = useState(0);
  const [lastGamePlayedDate, setLastGamePlayedDate] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  const userFriendlyAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  const saveData = useCallback(() => {
    if (!isInitialized || !username) return;
    const gameState = { slots, coinBdg, claimableBdg, username, paidBoostTime, gamesPlayedToday, lastGamePlayedDate, lastSaveTimestamp: Date.now() };
    localStorage.setItem(`gameState_${STORAGE_VERSION}`, JSON.stringify(gameState));
  }, [isInitialized, username, slots, coinBdg, claimableBdg, paidBoostTime, gamesPlayedToday, lastGamePlayedDate]);

  useEffect(() => {
      const savedStateJSON = localStorage.getItem(`gameState_${STORAGE_VERSION}`);
      if (savedStateJSON) {
          const savedState = JSON.parse(savedStateJSON);
          if (savedState.username) {
              const today = new Date().toISOString().split('T')[0];
              if(savedState.lastGamePlayedDate !== today) {
                  setGamesPlayedToday(0);
                  setLastGamePlayedDate(today);
              } else {
                  setGamesPlayedToday(savedState.gamesPlayedToday || 0);
                  setLastGamePlayedDate(savedState.lastGamePlayedDate);
              }
              
              const now = Date.now();
              const lastSave = savedState.lastSaveTimestamp || now;
              const offlineSeconds = Math.floor((now - lastSave) / 1000);

              let { coinBdg: savedCoinBdg, claimableBdg: savedClaimableBdg, slots: savedSlots, paidBoostTime: savedPaidBoostTime } = savedState;
              savedClaimableBdg = savedClaimableBdg || 0;

              if (offlineSeconds > 1) {
                  let accumulatedGain = 0;
                  const updatedOfflineSlots = savedSlots.map(slot => {
                      if (slot.filled && slot.repairCooldown > 0 && slot.durability > 0) {
                          const secondsToMine = Math.min(slot.repairCooldown, offlineSeconds);
                          const secondsOfDurability = Math.min(slot.durability, secondsToMine);
                          const econKey = slot.type === 'free' ? 'free' : (slot.type === 'special' ? slot.tier.toString().toUpperCase() : slot.tier);
                          const gainRatePerSecond = (economyData[econKey]?.gainPerHour || 0) / 3600;
                          let gainFromThisSlot = 0;
                          if (savedPaidBoostTime > 0) {
                              const boostDuration = Math.min(secondsOfDurability, savedPaidBoostTime);
                              gainFromThisSlot += (gainRatePerSecond * 1.5) * boostDuration;
                              const remainingMineTime = secondsOfDurability - boostDuration;
                              if (remainingMineTime > 0) gainFromThisSlot += gainRatePerSecond * remainingMineTime;
                          } else {
                              gainFromThisSlot += gainRatePerSecond * secondsOfDurability;
                          }
                          accumulatedGain += gainFromThisSlot;
                          return { ...slot, repairCooldown: Math.max(0, slot.repairCooldown - offlineSeconds), durability: Math.max(0, slot.durability - offlineSeconds) };
                      }
                      return slot;
                  });
                  
                  setSlots(updatedOfflineSlots);
                  setCoinBdg((savedCoinBdg || 0) + accumulatedGain);
                  setClaimableBdg((savedClaimableBdg || 0) + accumulatedGain);
                  setPaidBoostTime(Math.max(0, savedPaidBoostTime - offlineSeconds));
                  if (accumulatedGain > 0.0001) setStatus(`Você ganhou ${accumulatedGain.toFixed(4)} BDG enquanto esteve fora!`);
              } else {
                  setSlots(savedSlots);
                  setCoinBdg(savedCoinBdg || 0);
                  setClaimableBdg(savedClaimableBdg || 0);
              }
              setUsername(savedState.username);
          }
      } else {
          setSlots(initialSlots.map(slot => ({ ...slot, durability: SEVEN_DAYS_IN_SECONDS })));
          setLastGamePlayedDate(new Date().toISOString().split('T')[0]);
      }
      setIsInitialized(true);
  }, []);

  useEffect(() => {
    const saveInterval = setInterval(saveData, 5000);
    window.addEventListener('beforeunload', saveData);
    return () => { clearInterval(saveInterval); window.removeEventListener('beforeunload', saveData); };
  }, [saveData]);

  const handleUsernameSubmit = () => {
    if (tempUsername.trim()) {
        const newUsername = tempUsername.trim();
        setUsername(newUsername);
        setSlots(initialSlots);
        setCoinBdg(0);
        setClaimableBdg(0);
        setGamesPlayedToday(0);
        const today = new Date().toISOString().split('T')[0];
        setLastGamePlayedDate(today);
        const initialGameState = { slots: initialSlots, coinBdg: 0, claimableBdg: 0, username: newUsername, paidBoostTime: 0, gamesPlayedToday: 0, lastGamePlayedDate: today, lastSaveTimestamp: Date.now() };
        localStorage.setItem(`gameState_${STORAGE_VERSION}`, JSON.stringify(initialGameState));
    }
  };

  const gameLoop = useCallback(() => {
    if (!isInitialized || !username) return;
    let totalGain = 0;
    setSlots(currentSlots => {
        const updatedSlots = currentSlots.map(slot => {
            if (slot.filled && slot.repairCooldown > 0 && slot.durability > 0) {
                const econKey = slot.type === 'free' ? 'free' : (slot.type === 'special' ? slot.tier.toString().toUpperCase() : slot.tier);
                let gainRate = (economyData[econKey]?.gainPerHour || 0) / 3600;
                if (paidBoostTime > 0) gainRate *= 1.5;
                totalGain += gainRate;
                return { ...slot, repairCooldown: slot.repairCooldown - 1, durability: slot.durability - 1 };
            }
            return slot;
        });
        if (totalGain > 0) {
            setCoinBdg(prev => prev + totalGain);
            setClaimableBdg(prev => prev + totalGain);
        }
        return updatedSlots;
    });
    if (paidBoostTime > 0) setPaidBoostTime(prev => prev - 1);
  }, [isInitialized, username, paidBoostTime]);

  useEffect(() => {
    const gameInterval = setInterval(gameLoop, 1000);
    return () => clearInterval(gameInterval);
  }, [gameLoop]);

  const handleGameWin = useCallback(() => {
      const today = new Date().toISOString().split('T')[0];
      let currentGamesPlayed = gamesPlayedToday;
      if (lastGamePlayedDate !== today) {
          currentGamesPlayed = 0;
      }
      if (currentGamesPlayed < 9) {
          setCoinBdg(prev => prev + 10);
          setGamesPlayedToday(prev => prev + 1);
          setLastGamePlayedDate(today);
          setStatus(`🎉 Você ganhou 10 BDG Coin! (${currentGamesPlayed + 1}/9 jogos hoje)`);
      } else {
          setStatus("❌ Você já jogou todos os jogos de hoje.");
      }
  }, [gamesPlayedToday, lastGamePlayedDate]);

  useEffect(() => {
    if(isInitialized && username) {
      saveData();
    }
  }, [coinBdg, claimableBdg, slots, paidBoostTime, gamesPlayedToday, lastGamePlayedDate]);

  const handleBuyEnergyForAll = () => {
      const cost = 10 * slots.length;
      if (coinBdg >= cost) {
          setCoinBdg(prev => prev - cost);
          const updatedSlots = slots.map(slot => {
              if (slot.filled) return { ...slot, repairCooldown: ONE_HOUR_IN_SECONDS };
              return slot;
          });
          setSlots(updatedSlots);
          setStatus(`⚡ Energia de ${slots.length} gabinetes reabastecida por ${cost} BDG!`);
      } else {
          setStatus(`❌ Você precisa de ${cost} BDG para reabastecer a energia.`);
      }
  };

  const handleRepairCpu = (slotIndex) => {
    const slotToRepair = slots[slotIndex];
    if (!slotToRepair || !slotToRepair.filled) return;
    const tier = slotToRepair.tier;
    let repairCost = 0;
    if (slotToRepair.type === 'free') {
        repairCost = 100;
    } else if (slotToRepair.type === 'paid') {
        repairCost = 100 + (tier * 60);
    } else if (slotToRepair.type === 'special') {
        const specialTierIndex = ['A', 'B', 'C'].indexOf(tier);
        repairCost = 280 + (specialTierIndex * 120);
    }
    if (coinBdg >= repairCost) {
        setCoinBdg(prev => prev - repairCost);
        const updatedSlots = [...slots];
        updatedSlots[slotIndex].durability = SEVEN_DAYS_IN_SECONDS;
        setSlots(updatedSlots);
        setStatus(`✅ CPU do ${slotToRepair.name} reparada por ${repairCost} BDG!`);
    } else {
        setStatus(`❌ Você precisa de ${repairCost} BDG para reparar esta CPU.`);
    }
  };

  const addNewSlot = () => {
    if (slots.length >= 6) { setStatus('❌ Limite de 6 gabinetes atingido!'); return; }
    if (coinBdg >= NEW_SLOT_COST) {
        setCoinBdg(prev => prev - NEW_SLOT_COST);
        setSlots(prev => [...prev, { name: `Slot ${prev.length + 1}`, filled: false, free: false, repairCooldown: 0, durability: SEVEN_DAYS_IN_SECONDS }]);
        setStatus(`✅ Gabinete ${slots.length + 1} comprado com sucesso!`)
    } else {
        setStatus(`❌ BDG insuficiente! Você precisa de ${NEW_SLOT_COST} BDG.`);
    }
  };

  const handlePurchase = async (tierToBuy) => {
    if (!userFriendlyAddress) { setStatus('❌ Por favor, conecte sua carteira para comprar.'); return; }
    const transaction = { validUntil: Math.floor(Date.now() / 1000) + 60, messages: [{ address: SHOP_RECEIVER_ADDRESS, amount: TIER_PRICES[tierToBuy] }] };
    try {
        await tonConnectUI.sendTransaction(transaction);
        const emptySlotIndex = slots.findIndex(slot => !slot.filled);
        if (emptySlotIndex !== -1) {
            setSlots(prevSlots => prevSlots.map((slot, index) => {
                if (index === emptySlotIndex) {
                    const isSpecial = ['A', 'B', 'C'].includes(tierToBuy);
                    return { ...slot, filled: true, type: isSpecial ? 'special' : 'paid', tier: tierToBuy, repairCooldown: ONE_HOUR_IN_SECONDS, durability: SEVEN_DAYS_IN_SECONDS };
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

  const handleBuyBdgCoin = async () => {
    if (!userFriendlyAddress) { setStatus('❌ Por favor, conecte sua carteira para comprar.'); return; }
    const transaction = { validUntil: Math.floor(Date.now() / 1000) + 60, messages: [{ address: SHOP_RECEIVER_ADDRESS, amount: BDG_COIN_PRICE }] };
    try {
      await tonConnectUI.sendTransaction(transaction);
      setCoinBdg(prev => prev + 150);
      setStatus('✅ Compra realizada! Você recebeu 150 BDG Coin.');
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
                case 'mine': return <MiningPage coinBdg={coinBdg} slots={slots} setSlots={setSlots} status={status} setStatus={setStatus} addNewSlot={addNewSlot} paidBoostTime={paidBoostTime} setPaidBoostTime={setPaidBoostTime} economyData={economyData} handleBuyEnergyForAll={handleBuyEnergyForAll} handleRepairCpu={handleRepairCpu} />;
              case 'shop': return <ShopPage handlePurchase={handlePurchase} handleBuyBdgCoin={handleBuyBdgCoin} />;
              case 'games': return <GamesPage onGameWin={handleGameWin} />;
              case 'user': return <UserPage address={userFriendlyAddress} coinBdg={coinBdg} claimableBdg={claimableBdg} username={username} />;
              case 'rankings': return <RankingsPage />;
              default: return <MiningPage coinBdg={coinBdg} slots={slots} setSlots={setSlots} status={status} setStatus={setStatus} addNewSlot={addNewSlot} paidBoostTime={paidBoostTime} setPaidBoostTime={setPaidBoostTime} economyData={economyData} handleBuyEnergyForAll={handleBuyEnergyForAll} handleRepairCpu={handleRepairCpu} />;
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
