import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import MiningPage from './MiningPage';
import ShopPage from './ShopPage';
import UserPage from './UserPage';
import RankingsPage from './RankingsPage';
import { connectWallet } from './wallet';

// --- Constants for BNB MAINNET ---
const SHOP_ADDRESS = '0xA7730c7FAAF932C158d5B10aA3A768CBfD97b98D';
const SHOP_ABI = ['function buyWithBNB(uint256,address) external payable'];
const MAX_SLOTS = 6;
const TWENTY_FOUR_HOURS_IN_SECONDS = 24 * 60 * 60;

export const economyData = {
    free: { repairCost: 10, energyCost: 5, gainRate: 0.01 },
    1: { repairCost: 20, energyCost: 10, gainRate: 0.000135 }, // ~350 BDG/month
    2: { repairCost: 40, energyCost: 20, gainRate: 0.00025 },  // ~650 BDG/month
    3: { repairCost: 60, energyCost: 30, gainRate: 0.000367 }, // ~950 BDG/month
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

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            const savedUser = localStorage.getItem('cryptoDesktopUsername');
            if(savedUser) setInputUsername(savedUser);
            setStatus('✅ Bem-vindo de volta!');
          }
        } catch (error) {
          console.error("Erro ao verificar conexão:", error);
        }
      }
    };
    setTimeout(checkConnection, 500); // Adiciona um pequeno delay para dar tempo da carteira carregar
  }, []);

  const gameLoop = useCallback(() => {
    const boostMultiplier = paidBoostTime > 0 ? 2 : 1;
    const specialCpuMap = { 1: 'A', 2: 'B', 3: 'C' };
    
    setSlots(prevSlots => {
        let totalGain = 0;
        const updatedSlots = prevSlots.map(slot => {
            if (slot.filled && !slot.isBroken && slot.repairCooldown > 0) {
                const newCooldown = slot.repairCooldown - 1;
                let econKey;

                if (slot.type === 'free') econKey = 'free';
                else if (slot.type === 'standard') econKey = slot.tier;
                else if (slot.type === 'special') econKey = specialCpuMap[slot.tier];
                
                const gainRate = economyData[econKey]?.gainRate || 0;
                totalGain += gainRate * boostMultiplier;

                if (newCooldown <= 0) return { ...slot, repairCooldown: 0, isBroken: true };
                return { ...slot, repairCooldown: newCooldown };
            }
            return slot;
        });

        if (totalGain > 0) setCoinBdg(prev => prev + totalGain);
        return updatedSlots;
    });

    setPaidBoostTime(prev => Math.max(0, prev - 1));
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
    
    const connectAction = async () => {
        try {
            localStorage.setItem('cryptoDesktopUsername', inputUsername.trim());
            await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x38' }] });
            const { address: userAddress } = await connectWallet();
            setAddress(userAddress);
            setStatus('✅ Carteira conectada!');
        } catch (e) {
            if (e.code === 4902) {
                setStatus('❌ Por favor, adicione a rede BNB Mainnet à sua MetaMask.');
            } else {
                setStatus(`❌ Falha ao conectar: ${e.message}`);
            }
        }
    };

    if (window.ethereum) {
        connectAction();
    } else {
        setStatus('Buscando carteira...');
        setTimeout(() => {
            if (window.ethereum) {
                connectAction();
            } else {
                setStatus('❌ Carteira não detectada. Certifique-se de estar em um navegador compatível (ex: MetaMask app ou Telegram).');
            }
        }, 1500);
    }
  };

  const handlePurchase = async (tierToBuy, purchaseType) => {
    // ... (código existente)
  };
  const addNewSlot = () => {
    // ... (código existente)
  };

  const renderPage = () => {
    const props = { coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus, paidBoostTime, setPaidBoostTime, economyData };
    // ... (código existente)
  };

  // --- STYLES ---
  // ... (código de estilos existente)

  return (
    // ... (JSX existente)
  );
}
