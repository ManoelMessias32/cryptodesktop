import React from 'react';

const ENERGY_REFILL_COST = 10000; // Custo de 1 hora de energia do Tier Free
const PAID_BOOST_COST = 80;
const PAID_BOOST_DURATION = 1800; // 30 minutos
const REPAIR_COST_FACTOR = 2.5; // Fator para calcular custo de reparo

const specialCpuMap = { 1: 'A', 2: 'B', 3: 'C' };

const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

export default function MiningPage({ 
  coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus, economyData, 
  adBoostTime, paidBoostTime, setPaidBoostTime, adSessionsLeft, handleAdSessionClick 
}) {

  const handleMountFree = (idx) => { /* ... */ };

  const handleBuyEnergy = (idx) => {
      const slotToRefill = slots[idx];
      if (!slotToRefill.filled) return;
      
      const econData = economyData[slotToRefill.tier] || economyData.free;
      const energyCost = econData.energyCost; // Custo de 1h de energia para este tier

      if (coinBdg >= energyCost) {
          setCoinBdg(prev => prev - energyCost);
          setSlots(prevSlots => prevSlots.map((slot, i) => {
              if (i === idx) {
                  // Adiciona 1 hora ao timer, limitado a 24h
                  const newTimer = Math.min(slot.repairCooldown + 3600, 24 * 60 * 60);
                  return { ...slot, repairCooldown: newTimer };
              }
              return slot;
          }));
          setStatus(`✅ +1 hora de mineração comprada para o Slot ${idx + 1}!`);
      } else {
          setStatus('❌ Moedas insuficientes para comprar energia.');
      }
  };

  const handleRepairSlot = (idx) => { /* ... */ };

  return (
    <div>
      {/* Seção de Boosts */}
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: 24, padding: 12, border: '1px solid #007bff', borderRadius: 8, background: '#2a2a3e', maxWidth: 600, margin: '24px auto' }}>
        <div>
            <h4>Boost de Anúncio</h4>
            <button onClick={handleAdSessionClick} disabled={adSessionsLeft <= 0 || adBoostTime > 0}>Usar Anúncio (+20 min)</button>
            <p>{adSessionsLeft}/3 restantes hoje</p>
        </div>
        <div>
            <h4>Boost Pago</h4>
            <button disabled>Ativar (+30 min)</button> {/* Lógica a ser implementada */}
            <p>Custo: {PAID_BOOST_COST} Coin BDG</p>
        </div>
      </div>

       <div style={{textAlign: 'center', marginTop: '12px', minHeight: '40px'}}>
        {adBoostTime > 0 && <p>Boost de Anúncio: {formatTime(adBoostTime)}</p>}
        {paidBoostTime > 0 && <p>Boost Pago: {formatTime(paidBoostTime)}</p>}
      </div>

      <div style={{ textAlign: 'center', margin: '24px 0' }}>
        <button onClick={addNewSlot} disabled={slots.length >= 6}>Comprar Novo Gabinete</button>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ textAlign: 'center' }}>Sua Sala de Mineração</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {slots.map((slot, idx) => {
            // ... (lógica de renderização do slot)
            if (slot.filled) {
              return (
                <div key={idx} style={{ border: '2px solid #aaa', /*...*/ }}>
                  {/* ... (imagem e título) */}
                  {slot.isBroken ? (
                      <button onClick={() => handleRepairSlot(idx)}>Reparar</button>
                  ) : (
                    <div>
                      <p>Tempo Restante: {formatTime(slot.repairCooldown)}</p>
                      <button onClick={() => handleBuyEnergy(idx)}>+1h de Energia</button>
                    </div>
                  )}
                </div>
              )
            }
            // ... (renderiza slot vazio ou grátis)
          })}
        </div>
      </div>
    </div>
  );
}
