import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import MiningPage from './MiningPage';
import ShopPage from './ShopPage';
import UserPage from './UserPage';
import RankingsPage from './RankingsPage';
import { connectWallet } from './wallet';

// --- Constants ---
const TOKEN_ADDRESS = '0xcB2e51011e60841B56e278291831E8A4b0D301B2';
const SHOP_ADDRESS = '0xeD266DC6Fd8b5124eec783c58BB351E0Bc3C7d59';
const TOKEN_ABI = ['function balanceOf(address owner) view returns (uint256)', 'function decimals() view returns (uint8)'];
const SHOP_ABI = ['function buyWithBNB(uint256,address) external payable'];
const MAX_SLOTS = 6;
const TWENTY_FOUR_HOURS_IN_SECONDS = 24 * 60 * 60;

export const economyData = {
  free: { tier: 0, gain: 12000, energyCost: 10000, coolerCost: 1250, repairCost: 30000 },
  1: { tier: 1, gain: 16000, energyCost: 12000, coolerCost: 1667, repairCost: 50000 },
  2: { tier: 2, gain: 21000, energyCost: 15000, coolerCost: 2083, repairCost: 80000 },
  3: { tier: 3, gain: 26000, energyCost: 18000, coolerCost: 2083, repairCost: 120000 },
  A: { tier: 1, gain: 16000, energyCost: 20000, coolerCost: 0, repairCost: 150000 },
  B: { tier: 2, gain: 21000, energyCost: 30000, coolerCost: 0, repairCost: 200000 },
  C: { tier: 3, gain: 26000, energyCost: 40000, coolerCost: 0, repairCost: 250000 },
};

const initialSlots = [{
  name: 'CPU 1 (Grátis)',
  filled: false,
  free: true,
  type: 'free',
  repairCooldown: TWENTY_FOUR_HOURS_IN_SECONDS,
  isBroken: false
}];

export default function App() {
  const [route, setRoute] = useState('mine');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('Conecte sua carteira para começar.');
  const [coinBdg, setCoinBdg] = useState(() => Number(localStorage.getItem('cryptoDesktopMined_v13')) || 0);
  const [slots, setSlots] = useState(() => {
    try {
      const savedSlots = localStorage.getItem('cryptoDesktopSlots_v13');
      return savedSlots ? JSON.parse(savedSlots) : initialSlots;
    } catch (e) { return initialSlots; }
  });
  const [adBoostTime, setAdBoostTime] = useState(() => Number(localStorage.getItem('adBoostTime_v10')) || 0);
  const [paidBoostTime, setPaidBoostTime] = useState(() => Number(localStorage.getItem('paidBoostTime_v9')) || 0);

  const tierPrices = { 1: '0.10', 2: '0.20', 3: '0.30' };

  useEffect(() => { localStorage.setItem('cryptoDesktopSlots_v13', JSON.stringify(slots)); }, [slots]);
  useEffect(() => { localStorage.setItem('cryptoDesktopMined_v13', coinBdg); }, [coinBdg]);
  useEffect(() => { localStorage.setItem('adBoostTime_v10', adBoostTime); }, [adBoostTime]);
  useEffect(() => { localStorage.setItem('paidBoostTime_v9', paidBoostTime); }, [paidBoostTime]);

  const gameLoopCallback = useRef();

  useEffect(() => {
    gameLoopCallback.current = () => {
      const isBoostActive = adBoostTime > 0 || paidBoostTime > 0;
      if (adBoostTime > 0) setAdBoostTime(prev => Math.max(0, prev - 1));
      if (paidBoostTime > 0) setPaidBoostTime(prev => Math.max(0, prev - 1));

      let totalGainPerHour = 0;
      let totalCostPerHour = 0;

      setSlots(currentSlots => 
        currentSlots.map(slot => {
          if (!slot.filled || slot.isBroken) return slot;

          const econKey = slot.type === 'free' ? 'free' : (slot.type === 'standard' ? slot.tier : Object.keys(economyData).find(k => economyData[k].tier === slot.tier && k.length === 1));
          const slotEcon = economyData[econKey];
          
          if (slotEcon) {
            totalGainPerHour += slotEcon.gain;
            if (!isBoostActive) {
              totalCostPerHour += (slotEcon.energyCost + slotEcon.coolerCost);
            }
          }

          const newRepairCooldown = slot.repairCooldown > 0 ? slot.repairCooldown - 1 : 0;
          return { ...slot, repairCooldown: newRepairCooldown, isBroken: newRepairCooldown <= 0 };
        })
      );
      
      const netChangePerSecond = (totalGainPerHour - totalCostPerHour) / 3600;
      if (netChangePerSecond !== 0) {
        setCoinBdg(prevCoins => Math.max(0, prevCoins + netChangePerSecond));
      }
    };
  });

  useEffect(() => {
    if (address) {
      const interval = setInterval(() => gameLoopCallback.current && gameLoopCallback.current(), 1000);
      return () => clearInterval(interval);
    }
  }, [address]);

  const handleConnect = async () => {
    try {
      const { address: userAddress } = await connectWallet();
      setAddress(userAddress);
      setStatus('Carteira conectada com sucesso!');
    } catch (e) {
      setStatus(`Falha ao conectar: ${e.message}`);
    }
  };

  const handlePurchase = async (tierToBuy, purchaseType) => {
    // ... Purchase logic ...
  };

  const addNewSlot = () => {
    setSlots(prev => {
        if (prev.length < MAX_SLOTS) {
            return [...prev, { name: `Gabinete ${prev.length + 1}`, filled: false, free: false, type: 'empty', repairCooldown: 0, isBroken: true }];
        }
        setStatus('Máximo de gabinetes atingido.');
        return prev;
    });
  };

  const renderPage = () => {
    const pageProps = { coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus };
    return <MiningPage {...pageProps} />;
  };

  if (!address) {
    return ( <div> {/* Login Screen */} </div> );
  }

  return ( <div> {/* Main App Screen */} </div> );
}
