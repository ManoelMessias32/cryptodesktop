import React, { useState, useEffect, useCallback } from 'react';
import MiningPage from './MiningPage';
import ShopPage from './ShopPage';
import UserPage from './UserPage';
import RankingsPage from './RankingsPage';

import { useWeb3Modal, useWeb3ModalState } from '@reown/appkit-adapter-wagmi/react';
import { useAccount, useDisconnect } from 'wagmi';
import { writeContract } from 'wagmi/actions';
import { ethers } from 'ethers';

const SHOP_ADDRESS = '0xA7730c7FAAF932C158d5B10aA3A768CBfD97b98D';
const SHOP_ABI = ['function buyWithBNB(uint256,address) external payable'];
const MAX_SLOTS = 6;
const TWENTY_FOUR_HOURS_IN_SECONDS = 24 * 60 * 60;

export const economyData = {
    free: { repairCost: 10, energyCost: 5, gainRate: 0.01 },
    1: { repairCost: 20, energyCost: 10, gainRate: 0.000135 },
    2: { repairCost: 40, energyCost: 20, gainRate: 0.00025 },
    3: { repairCost: 60, energyCost: 30, gainRate: 0.000367 },
};

const initialSlots = Array(1).fill({ name: 'Slot 1', filled: false, free: true, repairCooldown: 0, isBroken: false });

export default function App() {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { selectedNetworkId } = useWeb3ModalState();

  const [route, setRoute] = useState('mine');
  const [status, setStatus] = useState('Crie um nome e conecte sua carteira para jogar.');
  const [inputUsername, setInputUsername] = useState('');
  const [coinBdg, setCoinBdg] = useState(() => Number(localStorage.getItem('cryptoDesktopMined_v14')) || 0);
  const [slots, setSlots] = useState(() => {
    try {
      const savedSlots = localStorage.getItem('cryptoDesktopSlots_v14');
      return savedSlots ? JSON.parse(savedSlots) : initialSlots;
    } catch (e) { return initialSlots; }
  });
  const [paidBoostTime, setPaidBoostTime] = useState(0);
  const tierPrices = { 1: '0.035', 2: '0.090', 3: '0.170' };

  useEffect(() => {
    localStorage.setItem('cryptoDesktopSlots_v14', JSON.stringify(slots));
  }, [slots]);

  useEffect(() => {
    localStorage.setItem('cryptoDesktopMined_v14', coinBdg);
  }, [coinBdg]);

  useEffect(() => {
    const savedUser = localStorage.getItem('cryptoDesktopUsername');
    if (savedUser) setInputUsername(savedUser);
  }, []);

  const isBnbChain = selectedNetworkId === 56;

  const handleConnect = () => {
    if (!inputUsername.trim()) {
      setStatus('❌ Por favor, insira um nome de usuário.');
      return;
    }
    localStorage.setItem('cryptoDesktopUsername', inputUsername.trim());
    open();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handlePurchase = async (tierToBuy) => {
    if (!isBnbChain) {
      setStatus('❌ Por favor, mude para a rede BNB Smart Chain para comprar.');
      return;
    }
    const emptySlotIndex = slots.findIndex(slot => !slot.filled && !slot.free);
    if (emptySlotIndex === -1) {
      setStatus('❌ Você precisa de um gabinete vazio!');
      return;
    }
    try {
      setStatus(`Enviando ${tierPrices[tierToBuy]} BNB... Por favor, aprove a transação.`);
      await writeContract({
        address: SHOP_ADDRESS,
        abi: SHOP_ABI,
        functionName: 'buyWithBNB',
        args: [tierToBuy, '0x35878269EF4051Df5f82593b4819E518bA8903A3'],
        value: ethers.utils.parseEther(tierPrices[tierToBuy])
      });
      setStatus('✅ Transação enviada! Aguardando confirmação...');
      // Idealmente, você esperaria a transação ser confirmada antes de atualizar o estado
      setSlots(prev => prev.map((slot, i) => (i === emptySlotIndex ? { ...slot, filled: true, type: 'standard', tier: tierToBuy, repairCooldown: TWENTY_FOUR_HOURS_IN_SECONDS, isBroken: false } : slot)));
    } catch (e) {
      setStatus(`❌ Erro na compra: ${e.message}`);
    }
  };

  const gameLoop = useCallback(() => { /* ... sua lógica de game loop aqui ... */ }, []);
  useEffect(() => { const i = setInterval(gameLoop, 1000); return () => clearInterval(i); }, [gameLoop]);
  const addNewSlot = () => { /* ... */ };

  const renderPage = () => {
    const props = { coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus, paidBoostTime, setPaidBoostTime, economyData };
    switch (route) {
      case 'mine': return <MiningPage {...props} />;
      case 'shop': return <ShopPage handlePurchase={handlePurchase} />;
      case 'user': return <UserPage address={address} />;
      case 'rankings': return <RankingsPage />;
      default: return <MiningPage {...props} />;
    }
  };
  
  const getStatusStyle = () => { /* ... */ };
  const navButtonStyle = (page) => ({ /* ... */ });

  return (
    <div style={{ background: '#18181b', color: '#f4f4f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: isConnected ? '60px' : '0' }}>
        {!isConnected ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <h1>Cryptodesk</h1>
            <input placeholder="Crie seu nome de usuário" value={inputUsername} onChange={(e) => setInputUsername(e.target.value)} />
            <button onClick={handleConnect}>Conectar e Jogar</button>
            <p>{status}</p>
          </div>
        ) : (
          <>
            <header>
              <p>{`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}</p>
              {!isBnbChain && <p style={{color: 'orange'}}>Rede Incorreta! Por favor, mude para BNB Chain.</p>}
              <button onClick={handleDisconnect}>Sair</button>
            </header>
            {renderPage()}
            <nav>{/* ... seus botões de navegação ... */}</nav>
          </>
        )}
      </div>
    </div>
  );
}
