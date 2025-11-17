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

// Placeholder data - you should expand this with your actual game economy
export const economyData = {
    free: { repairCost: 10, energyCost: 5 },
    1: { repairCost: 20, energyCost: 10 },
    2: { repairCost: 40, energyCost: 20 },
    3: { repairCost: 60, energyCost: 30 },
};

// Initial state for slots
const initialSlots = Array(1).fill({ name: 'Slot 1', filled: false, free: true });


export default function App() {
  const [route, setRoute] = useState('mine');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('Conecte sua carteira para começar.');
  const [coinBdg, setCoinBdg] = useState(() => Number(localStorage.getItem('cryptoDesktopMined_v14')) || 0);
  const [slots, setSlots] = useState(() => {
    try {
      const savedSlots = localStorage.getItem('cryptoDesktopSlots_v14');
      return savedSlots ? JSON.parse(savedSlots) : initialSlots;
    } catch (e) { return initialSlots; }
  });

  // --- States required by MiningPage ---
  const [adBoostTime, setAdBoostTime] = useState(0);
  const [paidBoostTime, setPaidBoostTime] = useState(0);
  const [adSessionsLeft, setAdSessionsLeft] = useState(3);
  // ---

  const tierPrices = { 1: '0.10', 2: '0.20', 3: '0.30' };

  useEffect(() => { localStorage.setItem('cryptoDesktopSlots_v14', JSON.stringify(slots)); }, [slots]);
  useEffect(() => { localStorage.setItem('cryptoDesktopMined_v14', coinBdg); }, [coinBdg]);

  // --- Main Game Loop (Placeholder) ---
  const gameLoop = useCallback(() => {
    // This is where you would decrease timers, check for broken slots, and generate coins.
    // This is a complex piece of logic that needs to be implemented.
  }, [slots, adBoostTime, paidBoostTime]);

  useEffect(() => {
    const interval = setInterval(gameLoop, 1000);
    return () => clearInterval(interval);
  }, [gameLoop]);
  // ---

  const handleConnect = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }],
      });
      const { address: userAddress } = await connectWallet();
      setAddress(userAddress);
      setStatus('Carteira conectada na BNB Mainnet!');
    } catch (e) {
      if (e.code === 4902) {
        setStatus('Por favor, adicione a rede BNB Mainnet à sua MetaMask.');
      } else {
        setStatus(`Falha ao conectar: ${e.message}`);
      }
    }
  };

  const handlePurchase = async (tierToBuy, purchaseType) => {
    const emptySlotIndex = slots.findIndex(slot => !slot.filled && !slot.free);
    if (emptySlotIndex === -1) {
      setStatus('❌ Você precisa de um gabinete vazio!');
      return;
    }
    try {
      const { signer } = await connectWallet();
      const price = tierPrices[tierToBuy];
      const shopContract = new ethers.Contract(SHOP_ADDRESS, SHOP_ABI, signer);
      setStatus(`Enviando ${price} BNB... Confirme na MetaMask.`);
      const value = ethers.utils.parseEther(price);
      
      const tx = await shopContract.buyWithBNB(tierToBuy, '0x35878269EF4051Df5f82593b4819E518bA8903A3', { value });
      
      await tx.wait();
      setSlots(prev => prev.map((slot, i) => (i === emptySlotIndex ? { ...slot, filled: true, type: purchaseType, tier: tierToBuy } : slot)));
      setStatus(`✅ Compra realizada!`);
    } catch (e) {
      setStatus(`❌ Erro na compra: ${e.message || 'Transação cancelada.'}`);
    }
  };

  // --- Functions required by MiningPage (Placeholders) ---
  const addNewSlot = () => {
     if (slots.length < MAX_SLOTS) {
      setSlots(prev => [...prev, { name: `Slot ${prev.length + 1}`, filled: false, free: false }]);
      setStatus('Gabinete adicionado! Vá para a loja para comprar uma CPU.');
    } else {
      setStatus('Número máximo de gabinetes atingido.');
    }
  };

  const handleAdSessionClick = () => {
    if (adSessionsLeft > 0 && adBoostTime <= 0) {
      setAdSessionsLeft(prev => prev - 1);
      setAdBoostTime(1200); // 20 minutes
      setStatus('Boost de anúncio ativado!');
    }
  };
  // ---

  const renderPage = () => {
    const props = {
      coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus,
      adBoostTime, paidBoostTime, setPaidBoostTime, adSessionsLeft, handleAdSessionClick, economyData
    };

    switch (route) {
      case 'mine':
        return <MiningPage {...props} />;
      case 'shop':
        return <ShopPage handlePurchase={handlePurchase} />;
      case 'user':
        return <UserPage address={address} coinBdg={coinBdg} />;
      case 'rankings':
        return <RankingsPage />;
      default:
        return <MiningPage {...props} />;
    }
  };

  return (
    <div style={{ padding: '20px', background: '#0f172a', color: 'white', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '1.5em' }}>Jogo Mineração Web3</h1>
        {address ? (
          <p style={{ background: '#27272a', padding: '8px 12px', borderRadius: '8px', fontSize: '0.9em' }}>
            Conectado: {`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}
          </p>
        ) : (
          <button onClick={handleConnect}>Conectar Carteira</button>
        )}
      </header>
      
      <p style={{ textAlign: 'center', minHeight: '24px', color: '#94a3b8', marginBottom: '20px' }}>{status}</p>

      {address && (
        <nav style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button onClick={() => setRoute('mine')}>Mineração</button>
          <button onClick={() => setRoute('shop')}>Loja</button>
          <button onClick={() => setRoute('user')}>Usuário</button>
          <button onClick={() => setRoute('rankings')}>Rankings</button>
        </nav>
      )}

      <main>
        {address ? renderPage() : (
          <div style={{ textAlign: 'center', paddingTop: '50px' }}>
            <h2 style={{ fontSize: '1.2em' }}>Por favor, conecte sua carteira para começar.</h2>
          </div>
        )}
      </main>

      <footer style={{ textAlign: 'center', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #334155', color: '#64748b' }}>
        <p>Demonstração de Jogo Web3</p>
      </footer>
    </div>
  );
}
