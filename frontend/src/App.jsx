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
const initialSlots = [{ name: 'CPU 1 (Grátis)', filled: false, free: true, type: 'free', energy: 100, timer: 60 }];
const MAX_ENERGY = 100;
const REPAIR_TIME = 60;

export default function App() {
  // --- State ---
  const [route, setRoute] = useState('mine');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('Conecte sua carteira para começar.');
  const [coinBdg, setCoinBdg] = useState(() => Number(localStorage.getItem('cryptoDesktopMined_v4')) || 0);
  const [tokenBdg, setTokenBdg] = useState('0');
  const [slots, setSlots] = useState(() => {
    try {
      const savedSlots = localStorage.getItem('cryptoDesktopSlots_v4');
      const parsed = savedSlots ? JSON.parse(savedSlots) : initialSlots;
      return parsed.map(s => ({ ...s, energy: s.energy || MAX_ENERGY, timer: s.timer || REPAIR_TIME, needsRepair: s.needsRepair || false }));
    } catch (e) { return initialSlots; }
  });
  const [adBoostTime, setAdBoostTime] = useState(() => Number(localStorage.getItem('adBoostTime_v3')) || 0);
  const [paidBoostTime, setPaidBoostTime] = useState(() => Number(localStorage.getItem('paidBoostTime_v2')) || 0);

  const tierPrices = { 1: '0.10', 2: '0.20', 3: '0.30' };

  // --- Effects ---
  useEffect(() => { localStorage.setItem('cryptoDesktopSlots_v4', JSON.stringify(slots)); }, [slots]);
  useEffect(() => { localStorage.setItem('cryptoDesktopMined_v4', coinBdg); }, [coinBdg]);
  useEffect(() => { localStorage.setItem('adBoostTime_v3', adBoostTime); }, [adBoostTime]);
  useEffect(() => { localStorage.setItem('paidBoostTime_v2', paidBoostTime); }, [paidBoostTime]);

  // Main Game Loop
  useEffect(() => {
    const gameLoop = setInterval(() => {
      const isAdBoostActive = adBoostTime > 0;
      const isPaidBoostActive = paidBoostTime > 0;

      if (isAdBoostActive) setAdBoostTime(prev => prev - 1);
      if (isPaidBoostActive) setPaidBoostTime(prev => prev - 1);

      if (isAdBoostActive || isPaidBoostActive) return;

      setSlots(currentSlots => 
        currentSlots.map(slot => {
          if (!slot.filled || slot.needsRepair) return slot;

          const newTimer = slot.timer > 0 ? slot.timer - 1 : 0;
          const newEnergy = newTimer > 0 ? slot.energy - 1 : slot.energy;
          const needsRepair = newEnergy <= 0 || newTimer <= 0;

          return { ...slot, timer: newTimer, energy: newEnergy, needsRepair };
        })
      );
    }, 1000);

    return () => clearInterval(gameLoop);
  }, [adBoostTime, paidBoostTime]);
  
  const handleConnect = async () => { /* ... */ };
  const handlePurchase = async (tierToBuy, purchaseType) => { /* ... */ };

  const addNewSlot = () => {
    if (slots.length < MAX_SLOTS) {
      setSlots(prev => [...prev, { name: `Gabinete ${prev.length + 1}`, filled: false, free: false, energy: MAX_ENERGY, timer: REPAIR_TIME, needsRepair: false }]);
    } else {
      setStatus('Máximo de gabinetes atingido.');
    }
  };

  const renderPage = () => {
    const pageProps = { coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus, adBoostTime, paidBoostTime, setPaidBoostTime, MAX_ENERGY, REPAIR_TIME };
    switch (route) {
      case 'user': return <UserPage address={address} />;
      case 'shop': return <ShopPage onPurchase={handlePurchase} />;
      case 'mine': return <MiningPage {...pageProps} />;
      case 'rank': return <RankingsPage />;
      default: return <MiningPage {...pageProps} />;
    }
  };

  // --- Render ---
  if (!address) { /* ... render connect button ... */ }
  return ( /* ... render main app ... */ );
}
