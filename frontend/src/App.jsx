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

const initialSlots = [{
  name: 'CPU 1 (Grátis)',
  filled: false,
  free: true,
  type: 'free',
  repairCooldown: TWENTY_FOUR_HOURS_IN_SECONDS,
  isBroken: false
}];

// Nova tabela de economia
const economyData = {
  free: { tier: 0, gain: 12000, energyCost: 10000, coolerCost: 1250, repairCost: 30000 },
  1: { tier: 1, gain: 16000, energyCost: 12000, coolerCost: 1667, repairCost: 50000 },
  2: { tier: 2, gain: 21000, energyCost: 15000, coolerCost: 2083, repairCost: 80000 },
  3: { tier: 3, gain: 26000, energyCost: 18000, coolerCost: 2083, repairCost: 120000 },
  A: { tier: 1, repairCost: 150000 }, // Ganho e custo/h ainda indefinidos
  B: { tier: 2, repairCost: 200000 },
  C: { tier: 3, repairCost: 250000 },
};

export default function App() {
  // --- State ---
  const [route, setRoute] = useState('mine');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('Conecte sua carteira para começar.');
  const [coinBdg, setCoinBdg] = useState(() => Number(localStorage.getItem('cryptoDesktopMined_v5')) || 0);
  const [tokenBdg, setTokenBdg] = useState('0');
  const [slots, setSlots] = useState(() => {
    try {
      const savedSlots = localStorage.getItem('cryptoDesktopSlots_v5');
      return savedSlots ? JSON.parse(savedSlots) : initialSlots;
    } catch (e) { return initialSlots; }
  });
  const [adBoostTime, setAdBoostTime] = useState(() => Number(localStorage.getItem('adBoostTime_v3')) || 0);
  const [paidBoostTime, setPaidBoostTime] = useState(() => Number(localStorage.getItem('paidBoostTime_v2')) || 0);

  const tierPrices = { 1: '0.10', 2: '0.20', 3: '0.30' };

  // --- Effects ---
  useEffect(() => { localStorage.setItem('cryptoDesktopSlots_v5', JSON.stringify(slots)); }, [slots]);
  useEffect(() => { localStorage.setItem('cryptoDesktopMined_v5', coinBdg); }, [coinBdg]);
  // ... (outros effects)

  // Main Game Loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      let totalGainPerHour = 0;
      let totalCostPerHour = 0;

      const newSlots = slots.map(slot => {
        if (!slot.filled || slot.isBroken) return slot;

        // Determina os dados econômicos para o slot
        let slotEcon = economyData[slot.tier] || economyData.free;
        if (slot.type === 'special') {
            // Temporário: usa a economia do tier padrão pois o ganho da CPU especial é desconhecido
            slotEcon = economyData[slot.tier]; 
        }

        totalGainPerHour += slotEcon.gain;
        totalCostPerHour += slotEcon.energyCost + slotEcon.coolerCost;

        // Lógica de reparo
        const newRepairCooldown = slot.repairCooldown > 0 ? slot.repairCooldown - 1 : 0;
        const isBroken = newRepairCooldown <= 0;

        return { ...slot, repairCooldown: newRepairCooldown, isBroken };
      });

      setSlots(newSlots);

      // Calcula a mudança de moedas por segundo
      const netChangePerSecond = (totalGainPerHour - totalCostPerHour) / 3600;
      
      if (netChangePerSecond > 0 || coinBdg > 0) {
        setCoinBdg(prevCoins => prevCoins + netChangePerSecond);
      }

    }, 1000);

    return () => clearInterval(gameLoop);
  }, [slots]);

  const handleConnect = async () => { /* ... */ };
  const handlePurchase = async (tierToBuy, purchaseType) => { /* ... */ };

  const addNewSlot = () => {
    if (slots.length < MAX_SLOTS) {
      setSlots(prev => [...prev, { name: `Gabinete ${prev.length + 1}`, filled: false, free: false, repairCooldown: TWENTY_FOUR_HOURS_IN_SECONDS, isBroken: false }]);
    } else {
      setStatus('Máximo de gabinetes atingido.');
    }
  };

  const renderPage = () => {
    const pageProps = { coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus, economyData };
    switch (route) {
      case 'user': return <UserPage address={address} />;
      case 'shop': return <ShopPage onPurchase={handlePurchase} />;
      case 'mine': return <MiningPage {...pageProps} />;
      case 'rank': return <RankingsPage />;
      default: return <MiningPage {...pageProps} />;
    }
  };

  // ... (código de renderização)
}
