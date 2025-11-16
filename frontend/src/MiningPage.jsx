import React, { useState, useEffect } from 'react';
import { connectWallet } from './wallet';
import { ethers } from 'ethers';

// --- Constants ---
const MAX_SLOTS = 6;
const initialSlot = [{ name: 'CPU 1 (Grátis)', filled: false, free: true, type: 'free' }];

export default function MiningPage({ setCoinBdg }) {
  // --- State Variables ---
  const [slots, setSlots] = useState(() => {
    try {
      const savedSlots = localStorage.getItem('cryptoDesktopSlots_v3');
      return savedSlots ? JSON.parse(savedSlots) : initialSlot;
    } catch (e) {
      return initialSlot;
    }
  });

  const [mined, setMined] = useState(() => Number(localStorage.getItem('cryptoDesktopMined_v3')) || 0);
  
  // ... (other states remain the same)
  const [status, setStatus] = useState('');

  // --- Game Data ---
  const tierPrices = { 1: '0.10', 2: '0.20', 3: '0.30' };
  const specialCpuData = {
    A: { price: '0.10', tier: 1 },
    B: { price: '0.20', tier: 2 },
    C: { price: '0.30', tier: 3 },
  };

  // --- Effects for State Management ---
  useEffect(() => {
    setCoinBdg(mined);
    localStorage.setItem('cryptoDesktopMined_v3', mined);
  }, [mined, setCoinBdg]);

  useEffect(() => {
    localStorage.setItem('cryptoDesktopSlots_v3', JSON.stringify(slots));
  }, [slots]);

  // --- Core Game Functions ---
  const addNewSlot = () => {
    if (slots.length < MAX_SLOTS) {
      const newSlot = {
        name: `Gabinete ${slots.length + 1}`,
        filled: false,
        free: false,
        tier: 1,
        purchaseMode: 'standard'
      };
      setSlots(prevSlots => [...prevSlots, newSlot]);
    } else {
      setStatus('Você atingiu o número máximo de gabinetes.');
    }
  };

  async function handleBuy(idx, tierToBuy, purchaseType) {
    try {
      setStatus('Conectando carteira...');
      const { signer } = await connectWallet();
      const price = tierPrices[tierToBuy];
      
      const shop = new ethers.Contract('0xeD266DC6Fd8b5124eec783c58BB351E0Bc3C7d59', ['function buyWithBNB(uint256,address) external payable'], signer);
      setStatus(`Enviando BNB...`);
      
      const value = ethers.utils.parseEther(price);
      // O contrato inteligente não diferencia os tipos, apenas o tier.
      // Usamos o `tierToBuy` para ambos os casos.
      const tx = await shop.buyWithBNB(tierToBuy, ethers.constants.AddressZero, { value });
      await tx.wait();
      
      setSlots((prev) => prev.map((slot, i) => (i === idx ? { ...slot, filled: true, type: purchaseType, tier: tierToBuy } : slot)));
      setStatus(`Compra realizada com sucesso!`);

    } catch (e) {
      setStatus('Erro na compra: ' + (e.message || e));
    }
  }
  
  function handleMountFree(idx) {
    setSlots((prev) => prev.map((slot, i) => (i === idx ? { ...slot, filled: true, type: 'free' } : slot)));
    setStatus(`CPU Grátis montado!`);
  }

  const setPurchaseMode = (idx, mode) => {
    setSlots(prev => prev.map((s, i) => i === idx ? { ...s, purchaseMode: mode } : s));
  };
  
  // --- JSX Render --- 
  return (
    <div>
      {/* ... (other sections like boost and mining simulation) ... */}

      <div style={{ textAlign: 'center', margin: '24px 0' }}>
        <button onClick={addNewSlot} disabled={slots.length >= MAX_SLOTS} style={{ padding: '12px 20px', fontSize: '1em', cursor: 'pointer', background: '#1f4068', color: 'white', border: 'none', borderRadius: '8px' }}>
          Comprar Novo Gabinete ({slots.length}/{MAX_SLOTS})
        </button>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ textAlign: 'center' }}>Sua Sala de Mineração</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {slots.map((slot, idx) => {
            let imageUrl = '';
            let title = '';
            if (slot.filled) {
              if (slot.type === 'free') {
                imageUrl = '/tier1.png'; // Usando a imagem do tier 1 para o grátis
                title = 'CPU Grátis';
              } else if (slot.type === 'standard'){
                imageUrl = `/tier${slot.tier}.png`;
                title = `Padrão Tier ${slot.tier}`;
              } else { // special
                const specialKey = Object.keys(specialCpuData).find(k => specialCpuData[k].tier === slot.tier);
                imageUrl = `/special_${specialKey.toLowerCase()}.png`;
                title = `Especial CPU ${specialKey}`;
              }
            }

            return (
              <div key={idx} style={{ border: '2px dashed #aaa', borderRadius: 8, padding: '12px', width: 220, minHeight: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#162447' }}>
                <div style={{ fontWeight: 'bold', marginBottom: 8, height: '20px' }}>{slot.name}</div>

                {slot.filled ? (
                  <div style={{ textAlign: 'center' }}>
                    <img src={imageUrl} alt={title} style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                    <p style={{ margin: '8px 0 0 0', fontWeight: 'bold' }}>{title}</p>
                  </div>
                ) : slot.free ? (
                   <button style={{ fontSize: '1em', padding: '10px' }} onClick={() => handleMountFree(idx)}>Montar CPU Grátis</button>
                ) : (
                  <div style={{width: '100%'}}>
                    <div style={{ display: 'flex', width: '100%', marginBottom: '12px' }}>
                      <button onClick={() => setPurchaseMode(idx, 'standard')} style={{ flex: 1, padding: '4px', border: slot.purchaseMode === 'standard' ? '2px solid #007bff' : '1px solid #ccc', background: '#f0f2f5' }}>Padrão</button>
                      <button onClick={() => setPurchaseMode(idx, 'special')} style={{ flex: 1, padding: '4px', border: slot.purchaseMode === 'special' ? '2px solid #007bff' : '1px solid #ccc', background: '#f0f2f5' }}>Especial</button>
                    </div>

                    {slot.purchaseMode === 'standard' ? (
                      <div style={{ textAlign: 'center' }}>
                        <label>Tier:</label>
                        <select value={slot.tier} onChange={e => setSlots(prev => prev.map((s, i) => i === idx ? { ...s, tier: Number(e.target.value) } : s))}>
                          <option value={1}>Tier 1</option>
                          <option value={2}>Tier 2</option>
                          <option value={3}>Tier 3</option>
                        </select>
                        <p style={{ fontWeight: 'bold', marginTop: '8px' }}>Total: {tierPrices[slot.tier]} BNB</p>
                        <button onClick={() => handleBuy(idx, slot.tier, 'standard')}>Comprar Componentes</button>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <label>CPU Especial:</label>
                        <select value={slot.tier} onChange={e => setSlots(prev => prev.map((s, i) => i === idx ? { ...s, tier: Number(e.target.value) } : s))}>
                          <option value={1}>CPU A</option>
                          <option value={2}>CPU B</option>
                          <option value={3}>CPU C</option>
                        </select>
                        <p style={{ fontWeight: 'bold', marginTop: '8px' }}>Preço: {tierPrices[slot.tier]} BNB</p>
                        <button onClick={() => handleBuy(idx, slot.tier, 'special')}>Comprar CPU Especial</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
