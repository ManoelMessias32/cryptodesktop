import React, { useState, useEffect, useCallback } from 'react';
import { TonConnectButton, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import MiningPage from './MiningPage';
import ShopPage from './ShopPage';
import UserPage from './UserPage';
import RankingsPage from './RankingsPage';
import { economyData } from './economy';

const initialSlots = Array(1).fill({ name: 'Slot 1', filled: false, free: true, repairCooldown: 0, isBroken: false });

// O SEU ENDEREÇO DA CARTEIRA TON PARA RECEBER PAGAMENTOS
const SHOP_RECEIVER_ADDRESS = 'UQAcxItDorzIiYeZNuC51XlqCYDuP3vnDvVu18iFJhK1cFOx';

// Preços em TON
const TIER_PRICES = {
  1: '3500000000', // 3.5 TON em nanoTONs
  2: '9000000000', // 9.0 TON em nanoTONs
  3: '17000000000', // 17.0 TON em nanoTONs
};

export default function App() {
  const [route, setRoute] = useState('mine');
  const [status, setStatus] = useState('Bem-vindo! Conecte sua carteira quando quiser.');
  const [coinBdg, setCoinBdg] = useState(() => Number(localStorage.getItem('cryptoDesktopMined_v14')) || 0);
  const [slots, setSlots] = useState(() => {
    try {
      const savedSlots = localStorage.getItem('cryptoDesktopSlots_v14');
      return savedSlots ? JSON.parse(savedSlots) : initialSlots;
    } catch (e) { return initialSlots; }
  });
  const [username, setUsername] = useState(() => localStorage.getItem('cryptoDesktopUsername') || '');
  const [tempUsername, setTempUsername] = useState('');

  const userFriendlyAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  useEffect(() => {
    localStorage.setItem('cryptoDesktopSlots_v14', JSON.stringify(slots));
  }, [slots]);
  useEffect(() => {
    localStorage.setItem('cryptoDesktopMined_v14', coinBdg);
  }, [coinBdg]);
  useEffect(() => {
    localStorage.setItem('cryptoDesktopUsername', username);
  }, [username]);

  const handleUsernameSubmit = () => {
    if (tempUsername.trim()) {
      setUsername(tempUsername.trim());
    }
  };

  // LÓGICA DE COMPRA COM TON
  const handlePurchase = async (tierToBuy) => {
    if (!tonConnectUI.connected) {
      setStatus('❌ Por favor, conecte sua carteira primeiro.');
      return;
    }

    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60, // 60 segundos de validade
      messages: [
        {
          address: SHOP_RECEIVER_ADDRESS,
          amount: TIER_PRICES[tierToBuy],
        },
      ],
    };

    try {
      setStatus('⏳ Aguardando aprovação na sua carteira...');
      await tonConnectUI.sendTransaction(transaction);
      setStatus('✅ Compra realizada com sucesso! (Aguarde a confirmação do slot)');

      // Lógica para adicionar o slot após a compra (simplificada)
      const emptySlotIndex = slots.findIndex(slot => !slot.filled && !slot.free);
      if (emptySlotIndex !== -1) {
          setSlots(prev => prev.map((slot, i) => (i === emptySlotIndex ? { ...slot, filled: true, type: 'standard', tier: tierToBuy, repairCooldown: 24 * 3600, isBroken: false } : slot)));
      } else {
          setStatus('✅ Compra realizada, mas você não tem gabinetes vazios!');
      }

    } catch (error) {
      setStatus(`❌ Erro na compra: ${error.message}`);
    }
  };

  const gameLoop = useCallback(() => {
    let totalGain = 0;
    const updatedSlots = slots.map(slot => {
      if (slot.filled && !slot.isBroken && slot.repairCooldown > 0) {
        const econKey = slot.type === 'free' ? 'free' : (slot.type === 'standard' ? slot.tier : slot.tier);
        const gainRate = (economyData[econKey]?.gain || 0) / 3600;
        totalGain += gainRate;
        
        const newRepairCooldown = slot.repairCooldown - 1;
        const isNowBroken = newRepairCooldown <= 0;
        return { ...slot, repairCooldown: newRepairCooldown, isBroken: isNowBroken };
      }
      return slot;
    });

    if (totalGain > 0) {
      setCoinBdg(prev => prev + totalGain);
    }
    setSlots(updatedSlots);

  }, [slots, setCoinBdg, setSlots]);

  useEffect(() => {
    const gameInterval = setInterval(gameLoop, 1000);
    return () => clearInterval(gameInterval);
  }, [gameLoop]);

  const navButtonStyle = (page) => ({
    padding: '10px 20px',
    margin: '0 5px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    backgroundColor: route === page ? '#5a67d8' : '#4a5568',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  });

  const renderPage = () => {
    switch (route) {
      case 'mine':
        return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} economyData={economyData} status={status} setStatus={setStatus} />; 
      case 'shop':
        return <ShopPage handlePurchase={handlePurchase} />; 
      case 'user':
        return <UserPage address={userFriendlyAddress} coinBdg={coinBdg} />; 
      case 'rankings':
        return <RankingsPage />;
      default:
        return <MiningPage coinBdg={coinBdg} setCoinBdg={setCoinBdg} slots={slots} setSlots={setSlots} economyData={economyData} status={status} setStatus={setStatus} />;
    }
  };

  if (!username) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#18181b', color: '#f4f4f5' }}>
        <h1>Cryptodesk</h1>
        <input placeholder="Crie seu nome de usuário" value={tempUsername} onChange={(e) => setTempUsername(e.target.value)} />
        <button onClick={handleUsernameSubmit} style={{marginTop: '10px'}}>Entrar e Jogar</button>
      </div>
    );
  }

  return (
    <div style={{ background: '#18181b', color: '#f4f4f5', minHeight: '100vh', paddingBottom: '80px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
        <p>Bem-vindo, {username}!</p>
        <TonConnectButton />
      </header>
      
      {renderPage()}

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', padding: '1rem', background: '#2d3748' }}>
        <button onClick={() => setRoute('mine')} style={navButtonStyle('mine')}>⛏️ Minerar</button>
        <button onClick={() => setRoute('shop')} style={navButtonStyle('shop')}>🛒 Loja</button>
        <button onClick={() => setRoute('user')} style={navButtonStyle('user')}>👤 Perfil</button>
        <button onClick={() => setRoute('rankings')} style={navButtonStyle('rankings')}>🏆 Rankings</button>
      </nav>
    </div>
  );
}
