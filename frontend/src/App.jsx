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
const STORAGE_VERSION = 'v29'; // Versão com economia de jogos corrigida

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
    // ... (lógica de carregamento permanece a mesma)
  }, []);

  useEffect(() => {
    const saveInterval = setInterval(saveData, 5000);
    window.addEventListener('beforeunload', saveData);
    return () => { clearInterval(saveInterval); window.removeEventListener('beforeunload', saveData); };
  }, [saveData]);

  const handleUsernameSubmit = () => {
    // ... (lógica de login permanece a mesma)
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
            // Mineração aumenta AMBOS os saldos
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
        const newCoinBdg = coinBdg + 10;
        const newGamesPlayed = currentGamesPlayed + 1;
        
        // Atualiza o estado
        setCoinBdg(newCoinBdg);
        setGamesPlayedToday(newGamesPlayed);
        setLastGamePlayedDate(today);
        setStatus(`🎉 Você ganhou 10 BDG Coin! (${newGamesPlayed}/9 jogos hoje)`);

        // Força o salvamento imediato do estado atualizado
        const gameState = JSON.parse(localStorage.getItem(`gameState_${STORAGE_VERSION}`)) || {};
        const updatedGameState = {
            ...gameState,
            coinBdg: newCoinBdg,
            gamesPlayedToday: newGamesPlayed,
            lastGamePlayedDate: today,
            lastSaveTimestamp: Date.now()
        };
        localStorage.setItem(`gameState_${STORAGE_VERSION}`, JSON.stringify(updatedGameState));

    } else {
        setStatus("❌ Você já jogou todos os jogos de hoje.");
    }
  }, [coinBdg, gamesPlayedToday, lastGamePlayedDate]);

  // ... (Resto do código como handleBuyEnergyForAll, addNewSlot, etc. permanece igual)

  const mainApp = ( <></> );
  const loginScreen = ( <></> );
  // ...
}
