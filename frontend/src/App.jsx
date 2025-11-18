import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import MiningPage from './MiningPage';
import ShopPage from './ShopPage';
import UserPage from './UserPage';
import RankingsPage from './RankingsPage';
import { connectWallet, disconnectWallet } from './wallet'; // Removido checkConnectedWallet

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

  const gameLoop = useCallback(() => {
      // ... (código do gameLoop existente)
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
        setStatus('Conectando carteira... Siga as instruções no seu app de carteira ou escaneie o QR Code.');
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
    setAddress('');
    setStatus('Você foi desconectado.');
    window.location.reload(); // Força o recarregamento para limpar completamente o estado
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
    <div style={{ background: '#18181b', color: '#f4f4f5', minHeight: '100vh' }}>
        {!address ? (
          // TELA DE ONBOARDING
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '20px' }}>
            <h1 style={{ fontSize: '2.5em' }}>Cryptodesk</h1>
            <p style={{color: '#a1a1aa'}}>Seu jogo de mineração Web3</p>
            <input type="text" placeholder="Crie seu nome de usuário" value={inputUsername} onChange={(e) => setInputUsername(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #3f3f46', background: '#27272a', color: 'white', width: '90%', maxWidth: '350px' }} />
            <button onClick={handleConnect} style={{ background: '#6366f1', color: 'white', border: 'none', padding: '15px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '20px' }}>Conectar e Jogar</button>
            <p style={{ marginTop: '20px' }}>{status}</p>
          </div>
        ) : (
          // TELA PRINCIPAL DO JOGO
          <>
            <header style={{ padding: '15px 20px', background: '#27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1>Cryptodesk</h1>
              <div>
                <span style={{ marginRight: '15px' }}>{`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}</span>
                <button onClick={handleDisconnect} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px' }}>Sair</button>
              </div>
            </header>
            <main style={{ padding: '20px' }}>{renderPage()}</main>
            <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#27272a', display: 'flex', justifyContent: 'space-around', borderTop: '1px solid #3f3f46' }}>
                 {/* ... (botões de navegação existentes) */}
            </nav>
          </>
        )}
    </div>
  );
}
