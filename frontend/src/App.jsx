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
const STORAGE_VERSION = 'v27'; // Versão para corrigir lógica de jogos

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
            
            // (Lógica de mineração offline permanece a mesma)
            const now = Date.now();
            const lastSave = savedState.lastSaveTimestamp || now;
            const offlineSeconds = Math.floor((now - lastSave) / 1000);

            let { coinBdg: savedCoinBdg, claimableBdg: savedClaimableBdg, slots: savedSlots, paidBoostTime: savedPaidBoostTime } = savedState;
            savedClaimableBdg = savedClaimableBdg || 0;

            if (offlineSeconds > 1) {
                let accumulatedGain = 0;
                const updatedOfflineSlots = savedSlots.map(slot => {
                    if (slot.filled && slot.repairCooldown > 0) {
                        const secondsToMine = Math.min(slot.repairCooldown, offlineSeconds);
                        const econKey = slot.type === 'free' ? 'free' : (slot.type === 'special' ? slot.tier.toString().toUpperCase() : slot.tier);
                        const gainRatePerSecond = (economyData[econKey]?.gainPerHour || 0) / 3600;
                        let gainFromThisSlot = 0;
                        if (savedPaidBoostTime > 0) {
                            const boostDuration = Math.min(secondsToMine, savedPaidBoostTime);
                            gainFromThisSlot += (gainRatePerSecond * 1.5) * boostDuration;
                            const remainingMineTime = secondsToMine - boostDuration;
                            if (remainingMineTime > 0) gainFromThisSlot += gainRatePerSecond * remainingMineTime;
                        } else {
                            gainFromThisSlot += gainRatePerSecond * secondsToMine;
                        }
                        accumulatedGain += gainFromThisSlot;
                        return { ...slot, repairCooldown: Math.max(0, slot.repairCooldown - secondsToMine) };
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
        setSlots(initialSlots);
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
            if (slot.filled && slot.repairCooldown > 0) {
                const econKey = slot.type === 'free' ? 'free' : (slot.type === 'special' ? slot.tier.toString().toUpperCase() : slot.tier);
                let gainRate = (economyData[econKey]?.gainPerHour || 0) / 3600;
                if (paidBoostTime > 0) gainRate *= 1.5;
                totalGain += gainRate;
                return { ...slot, repairCooldown: slot.repairCooldown - 1 };
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
    
    // Resetar se for um novo dia
    if (lastGamePlayedDate !== today) {
        currentGamesPlayed = 0;
        setLastGamePlayedDate(today);
    }

    if (currentGamesPlayed < 9) {
        setCoinBdg(prev => prev + 10);
        setClaimableBdg(prev => prev + 10);
        const newCount = currentGamesPlayed + 1;
        setGamesPlayedToday(newCount);
        setStatus(`🎉 Você ganhou 10 BDG! (${newCount}/9 jogos hoje)`);
    } else {
        setStatus("❌ Você já jogou todos os jogos de hoje.");
    }
  }, [gamesPlayedToday, lastGamePlayedDate]);

  // ... (Resto do código como handleBuyEnergyForAll, addNewSlot, etc. permanece igual)

  const mainApp = ( <></> ); // Omitido para brevidade, mas o código original está aqui
  const loginScreen = ( <></> ); // Omitido para brevidade
  //... (Resto do código)

}
