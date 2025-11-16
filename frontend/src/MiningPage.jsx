import React from 'react';
import { economyData } from './App'; // Importa a tabela de economia

const specialCpuMap = { 1: 'A', 2: 'B', 3: 'C' };

const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

export default function MiningPage({ 
  coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus,
  adBoostTime, paidBoostTime, setPaidBoostTime, adSessionsLeft, REPAIR_TIME
}) {

  const handleMountFree = (idx) => {
    setSlots(prev => prev.map((s, i) => (i === idx ? { ...s, filled: true } : s)));
    setStatus('✅ CPU Grátis montado e pronto para minerar!');
  };

  const handleRepairSlot = (idx) => {
    const slotToRepair = slots[idx];
    const econKey = slotToRepair.type === 'free' ? 'free' : (slotToRepair.type === 'standard' ? slotToRepair.tier : Object.keys(economyData).find(k => economyData[k].tier === slotToRepair.tier && k.length === 1));
    const repairCost = economyData[econKey]?.repairCost || 0;

    if (coinBdg >= repairCost) {
      setCoinBdg(prev => prev - repairCost);
      setSlots(prevSlots => prevSlots.map((slot, i) => {
          if (i === idx) {
              return { ...slot, repairCooldown: TWENTY_FOUR_HOURS_IN_SECONDS, isBroken: false };
          }
          return slot;
      }));
      setStatus(`✅ Slot reparado! (-${repairCost} Coin BDG)`);
    } else {
        setStatus(`❌ Moedas insuficientes para o reparo!`);
    }
  };

  // ... (funções de compra de energia e boost)

  return (
    <div>
      {/* Seção de Boosts e Consumíveis */}
      <div style={{ /* ... */ }}>
        {/* Botões de boost e energia */}
      </div>

      {/* Sala de Mineração */}
      <div style={{ marginTop: 24 }}>
        <h3 style={{ textAlign: 'center' }}>Sua Sala de Mineração</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {slots.map((slot, idx) => {
            // ... (lógica de renderização do slot)
            return (
              <div key={idx} style={{ /* ... */ }}>
                {/* ... (renderização do slot, imagem, título, etc.) */}
                {slot.filled && slot.isBroken ? (
                    <button onClick={() => handleRepairSlot(idx)}>Reparar</button>
                ) : slot.filled ? (
                    <p>Tempo Restante: {formatTime(slot.repairCooldown)}</p>
                ) : ( /* ... */ )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
