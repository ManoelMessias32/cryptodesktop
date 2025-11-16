import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import MiningPage from './MiningPage';
import ShopPage from './ShopPage';
import UserPage from './UserPage';
import RankingsPage from './RankingsPage';
import { connectWallet } from './wallet';

// --- Constants ---
const TOKEN_ADDRESS = '0xcB2e51011e60841B56e278291831E8A4b0D301B2';
const TOKEN_ABI = ['function balanceOf(address owner) view returns (uint256)', 'function decimals() view returns (uint8)'];
const SHOP_ADDRESS = '0x35878269EF4051Df5f82593b4819E518bA8903A3';
const SHOP_ABI = ['function buyWithBNB(uint256,address) external payable'];
const MAX_SLOTS = 6;
const TWENTY_FOUR_HOURS_IN_SECONDS = 24 * 60 * 60;
const getTodayString = () => new Date().toISOString().split('T')[0];

const initialSlots = [{
  name: 'CPU 1 (Grátis)',
  filled: false,
  free: true,
  type: 'free',
  repairCooldown: TWENTY_FOUR_HOURS_IN_SECONDS,
  isBroken: false
}];

export const economyData = {
  free: { tier: 0, gain: 12000, energyCost: 10000, coolerCost: 1250, repairCost: 30000 },
  1: { tier: 1, gain: 16000, energyCost: 12000, coolerCost: 1667, repairCost: 50000 },
  2: { tier: 2, gain: 21000, energyCost: 15000, coolerCost: 2083, repairCost: 80000 },
  3: { tier: 3, gain: 26000, energyCost: 18000, coolerCost: 2083, repairCost: 120000 },
  A: { tier: 1, gain: 16000, energyCost: 20000, coolerCost: 0, repairCost: 150000 }, // Usando ganho do T1 como placeholder
  B: { tier: 2, gain: 21000, energyCost: 30000, coolerCost: 0, repairCost: 200000 }, // Usando ganho do T2 como placeholder
  C: { tier: 3, gain: 26000, energyCost: 40000, coolerCost: 0, repairCost: 250000 }, // Usando ganho do T3 como placeholder
};

export default function App() {
  // --- State ---
  const [route, setRoute] = useState('mine');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('Conecte sua carteira para começar.');
  const [coinBdg, setCoinBdg] = useState(() => Number(localStorage.getItem('cryptoDesktopMined_v6')) || 0);
  const [tokenBdg, setTokenBdg] = useState('0');
  const [slots, setSlots] = useState(() => {
    try {
      const savedSlots = localStorage.getItem('cryptoDesktopSlots_v6');
      return savedSlots ? JSON.parse(savedSlots) : initialSlots;
    } catch (e) { return initialSlots; }
  });
  const [adBoostTime, setAdBoostTime] = useState(() => Number(localStorage.getItem('adBoostTime_v4')) || 0);
  const [paidBoostTime, setPaidBoostTime] = useState(() => Number(localStorage.getItem('paidBoostTime_v3')) || 0);
  const [adSessionsLeft, setAdSessionsLeft] = useState(3);
  const [lastAdSessionDate, setLastAdSessionDate] = useState(() => localStorage.getItem('lastAdSessionDate_v4') || '');

  const tierPrices = { 1: '0.10', 2: '0.20', 3: '0.30' };

  // --- Effects ---
  useEffect(() => { localStorage.setItem('cryptoDesktopSlots_v6', JSON.stringify(slots)); }, [slots]);
  useEffect(() => { localStorage.setItem('cryptoDesktopMined_v6', coinBdg); }, [coinBdg]);
  useEffect(() => { localStorage.setItem('adBoostTime_v4', adBoostTime); }, [adBoostTime]);
  useEffect(() => { localStorage.setItem('paidBoostTime_v3', paidBoostTime); }, [paidBoostTime]);
  
  useEffect(() => { /* Efeito para resetar boost diário */ }, []);

  // Auto-reconnect wallet
  useEffect(() => {
    const autoConnect = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setStatus('Carteira reconectada.');
          }
        } catch (error) {}
      }
    };
    autoConnect();
  }, []);

  // Main Game Loop
  useEffect(() => {
    if (!address) return; // Não roda o loop se não estiver conectado
    const gameLoop = setInterval(() => {
      let totalGainPerHour = 0;
      let totalCostPerHour = 0;

      const isBoostActive = adBoostTime > 0 || paidBoostTime > 0;
      if (adBoostTime > 0) setAdBoostTime(prev => prev - 1);
      if (paidBoostTime > 0) setPaidBoostTime(prev => prev - 1);

      const newSlots = slots.map(slot => {
        if (!slot.filled || slot.isBroken) return slot;

        const econKey = slot.type === 'special' ? Object.keys(economyData).find(k => economyData[k].tier === slot.tier && k.length === 1) : (slot.type === 'free' ? 'free' : slot.tier);
        const slotEcon = economyData[econKey];

        if (slotEcon) {
          totalGainPerHour += slotEcon.gain;
          totalCostPerHour += (slotEcon.energyCost + slotEcon.coolerCost);
        }

        const newRepairCooldown = slot.repairCooldown > 0 ? slot.repairCooldown - 1 : 0;
        const isBroken = newRepairCooldown <= 0;

        return { ...slot, repairCooldown: newRepairCooldown, isBroken };
      });
      
      setSlots(newSlots);
      
      const netChangePerSecond = (totalGainPerHour - totalCostPerHour) / 3600;
      if (!isBoostActive && netChangePerSecond !== 0) {
        setCoinBdg(prevCoins => Math.max(0, prevCoins + netChangePerSecond));
      } else if (isBoostActive && totalGainPerHour > 0) {
        setCoinBdg(prevCoins => prevCoins + (totalGainPerHour / 3600));
      }

    }, 1000);

    return () => clearInterval(gameLoop);
  }, [slots, address, adBoostTime, paidBoostTime]);
  
  const handleConnect = async () => { /* ... */ };
  const handlePurchase = async (tierToBuy, purchaseType) => { /* ... */ };
  const addNewSlot = () => { /* ... */ };

  const renderPage = () => {
    const pageProps = { coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus, adBoostTime, paidBoostTime, setPaidBoostTime, adSessionsLeft, REPAIR_TIME };
    // ... (switch para renderizar a página)
  };

  if (!address) { /* ... renderiza o botão de conectar */ }

  return ( /* ... renderiza o app principal */ );
}
