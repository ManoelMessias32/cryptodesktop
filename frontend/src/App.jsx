import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import MiningPage from './MiningPage';
import ShopPage from './ShopPage';
import UserPage from './UserPage';
import RankingsPage from './RankingsPage';
import { connectWallet, disconnectWallet, checkConnectedWallet } from './wallet';

// --- Constants ---
const SHOP_ADDRESS = '0xA7730c7FAAF932C158d5B10aA3A768CBfD97b98D';
const SHOP_ABI = ['function buyWithBNB(uint256,address) external payable'];
const MAX_SLOTS = 6;
const TWENTY_FOUR_HOURS_IN_SECONDS = 24 * 60 * 60;

export const economyData = {
    free: { repairCost: 10, energyCost: 5, gainRate: 0.01 },
    1: { repairCost: 20, energyCost: 10, gainRate: 0.000135 },
    2: { repairCost: 40, energyCost: 20, gainRate: 0.00025 },
    3: { repairCost: 60, energyCost: 30, gainRate: 0.000367 },
    A: { repairCost: 0, energyCost: 0, gainRate: 0.3 },
    B: { repairCost: 0, energyCost: 0, gainRate: 0.4 },
    C: { repairCost: 0, energyCost: 0, gainRate: 0.5 },
};

const initialSlots = Array(1).fill({ name: 'Slot 1', filled: false, free: true, repairCooldown: 0, isBroken: false });

export default function App() {
  const [route, setRoute] = useState('mine');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('Crie um nome e conecte sua carteira para jogar.');
  const [coinBdg, setCoinBdg] = useState(() => Number(localStorage.getItem('cryptoDesktopMined_v14')) || 0);
  const [slots, setSlots] = useState(() => {
    try {
      const savedSlots = localStorage.getItem('cryptoDesktopSlots_v14');
      return savedSlots ? JSON.parse(savedSlots) : initialSlots;
    } catch (e) { return initialSlots; }
  });
  const [paidBoostTime, setPaidBoostTime] = useState(0);
  const [inputUsername, setInputUsername] = useState('');
  const tierPrices = { 1: '0.035', 2: '0.090', 3: '0.170' };

  useEffect(() => { localStorage.setItem('cryptoDesktopSlots_v14', JSON.stringify(slots)); }, [slots]);
  useEffect(() => { localStorage.setItem('cryptoDesktopMined_v14', coinBdg); }, [coinBdg]);

  // Efeito para reconectar automaticamente
  useEffect(() => {
    const autoConnect = async () => {
      const connection = await checkConnectedWallet();
      if (connection) {
        setAddress(connection.address);
        const savedUser = localStorage.getItem('cryptoDesktopUsername');
        if(savedUser) setInputUsername(savedUser);
        setStatus('✅ Bem-vindo de volta!');
      }
    };
    autoConnect();
  }, []);

  const gameLoop = useCallback(() => {
      // ... (código do gameLoop existente, não precisa mudar)
  }, [paidBoostTime, setSlots, setCoinBdg]);

  useEffect(() => {
    const interval = setInterval(gameLoop, 1000);
    return () => clearInterval(interval);
  }, [gameLoop]);

  const handleConnect = async () => {
    if (!inputUsername.trim()) {
        setStatus('❌ Por favor, insira um nome de usuário.');
        return;
    }
    
    try {
        setStatus('Aguardando conexão da carteira...');
        localStorage.setItem('cryptoDesktopUsername', inputUsername.trim());
        const { address: userAddress } = await connectWallet();
        setAddress(userAddress);
        setStatus('✅ Carteira conectada!');
    } catch (e) {
        setStatus(`❌ ${e.message}`);
    }
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
  };

  const handlePurchase = async (tierToBuy, purchaseType) => {
    // ... (código de compra existente)
  };

  const addNewSlot = () => {
     // ... (código existente)
  };

  const renderPage = () => {
    // ... (código existente)
  };

  // --- STYLES ---
  // ... (código de estilos existente)

  return (
    // ... (JSX existente)
  );
}
