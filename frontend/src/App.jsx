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
    1: { repairCost: 20, energyCost: 10, gainRate: 0.05 },
    2: { repairCost: 40, energyCost: 20, gainRate: 0.1 },
    3: { repairCost: 60, energyCost: 30, gainRate: 0.2 },
    A: { repairCost: 0, energyCost: 0, gainRate: 0.3 },
    B: { repairCost: 0, energyCost: 0, gainRate: 0.4 },
    C: { repairCost: 0, energyCost: 0, gainRate: 0.5 },
};

const initialSlots = Array(1).fill({ name: 'Slot 1', filled: false, free: true, repairCooldown: 0, isBroken: false });

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

  const [paidBoostTime, setPaidBoostTime] = useState(0);
  const tierPrices = { 1: '0.10', 2: '0.20', 3: '0.30' };

  useEffect(() => { localStorage.setItem('cryptoDesktopSlots_v14', JSON.stringify(slots)); }, [slots]);
  useEffect(() => { localStorage.setItem('cryptoDesktopMined_v14', coinBdg); }, [coinBdg]);

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

                if (newCooldown <= 0) {
                    return { ...slot, repairCooldown: 0, isBroken: true };
                }
                return { ...slot, repairCooldown: newCooldown };
            }
            return slot;
        });

        if (totalGain > 0) {
            setCoinBdg(prev => prev + totalGain);
        }
        return updatedSlots;
    });

    setPaidBoostTime(prev => Math.max(0, prev - 1));
  }, [paidBoostTime]);

  useEffect(() => {
    const interval = setInterval(gameLoop, 1000);
    return () => clearInterval(interval);
  }, [gameLoop]);


  const handleConnect = async () => {
    try {
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x38' }] });
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
      setSlots(prev => prev.map((slot, i) => (i === emptySlotIndex ? { ...slot, filled: true, type: purchaseType, tier: tierToBuy, repairCooldown: TWENTY_FOUR_HOURS_IN_SECONDS, isBroken: false } : slot)));
      setStatus(`✅ Compra realizada!`);
    } catch (e) {
      setStatus(`❌ Erro na compra: ${e.message || 'Transação cancelada.'}`);
    }
  };

  const addNewSlot = () => {
     if (slots.length < MAX_SLOTS) {
      setSlots(prev => [...prev, { name: `Slot ${prev.length + 1}`, filled: false, free: false, repairCooldown: 0, isBroken: false }]);
      setStatus('Gabinete adicionado! Vá para a loja para comprar uma CPU.');
    } else {
      setStatus('Número máximo de gabinetes atingido.');
    }
  };

  const renderPage = () => {
    const props = { coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus, paidBoostTime, setPaidBoostTime, economyData };
    switch (route) {
      case 'mine': return <MiningPage {...props} />;
      case 'shop': return <ShopPage handlePurchase={handlePurchase} />;
      case 'user': return <UserPage address={address} coinBdg={coinBdg} />;
      case 'rankings': return <RankingsPage />;
      default: return <MiningPage {...props} />;
    }
  };

  const navButtonStyle = (page) => ({
    background: route === page ? '#4f46e5' : '#374151',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: '#0f172a', color: 'white', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ padding: '10px 20px', background: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={{ fontSize: '1.5em', margin: 0 }}>Cryptodesk</h1>
        {address ? (
          <p style={{ margin: 0, fontSize: '0.9em', background: '#27272a', padding: '8px 12px', borderRadius: '8px' }}>
            {`Conectado: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`}
          </p>
        ) : (
          <button onClick={handleConnect} style={navButtonStyle('connect')}>Conectar Carteira</button>
        )}
      </header>
      
      <p style={{ textAlign: 'center', minHeight: '24px', color: '#94a3b8', margin: '20px 0' }}>{status}</p>

      <main style={{ flex: 1, padding: '0 20px' }}>
        {address ? (
          <>
            {renderPage()}
          </>
        ) : (
          <div style={{ textAlign: 'center', paddingTop: '50px' }}>
            <h2 style={{ fontSize: '1.2em' }}>Por favor, conecte sua carteira para começar.</h2>
          </div>
        )}
      </main>

      {address && (
        <nav style={{ display: 'flex', justifyContent: 'space-around', padding: '10px', background: '#1e293b', borderTop: '1px solid #334155' }}>
          <button onClick={() => setRoute('mine')} style={navButtonStyle('mine')}>Mineração</button>
          <button onClick={() => setRoute('shop')} style={navButtonStyle('shop')}>Loja</button>
          <button onClick={() => setRoute('user')} style={navButtonStyle('user')}>Usuário</button>
          <button onClick={() => setRoute('rankings')} style={navButtonStyle('rankings')}>Rankings</button>
        </nav>
      )}
    </div>
  );
}
