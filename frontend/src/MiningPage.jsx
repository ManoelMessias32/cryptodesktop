import React from 'react';
import AdComponent from './AdComponent';
import { economyData } from './App';

const specialCpuMap = { 1: 'A', 2: 'B', 3: 'C' };

const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

export default function MiningPage({ 
  coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus, 
}) {

  const handleRepairSlot = (idx) => {
      const slotToRepair = slots[idx];
      const econKey = slotToRepair.type === 'free' ? 'free' : (slotToRepair.type === 'standard' ? slotToRepair.tier : Object.keys(economyData).find(k => economyData[k].tier === slotToRepair.tier && k.length === 1));
      const repairCost = economyData[econKey]?.repairCost || 0;

      if (coinBdg >= repairCost) {
          setCoinBdg(prev => prev - repairCost);
          setSlots(prevSlots => prevSlots.map((slot, i) => i === idx ? { ...slot, repairCooldown: 24 * 60 * 60, isBroken: false } : slot));
          setStatus(`✅ Slot reparado! (-${repairCost} Coin BDG)`);
      } else {
          setStatus(`❌ Moedas insuficientes para o reparo!`);
      }
  };

  return (
    <div>
        <AdComponent />

        {/* ... Seção de Boosts ... */}

        <div style={{ textAlign: 'center', margin: '24px 0' }}>
            <button onClick={addNewSlot} disabled={slots.length >= 6}>Comprar Novo Gabinete ({slots.length}/6)</button>
        </div>

        <div style={{ marginTop: 24 }}>
            <h3 style={{ textAlign: 'center' }}>Sua Sala de Mineração</h3>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {slots.map((slot, idx) => {
                    let imageUrl = '';
                    let title = 'Gabinete Vazio';
                    if (slot.filled) {
                        const tier = slot.tier || 1;
                        imageUrl = slot.type === 'free' ? '/tier1.png' : (slot.type === 'standard' ? `/tier${tier}.png` : `/special_${specialCpuMap[tier]?.toLowerCase()}.png`);
                        title = slot.type === 'free' ? 'CPU Grátis' : (slot.type === 'standard' ? `Padrão Tier ${tier}` : `Especial CPU ${specialCpuMap[tier]}`);
                    }

                    return (
                        <div key={idx} style={{ border: '2px dashed #aaa', borderRadius: '16px', padding: '10px', width: '180px', height: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', background: '#162447' }}>
                            <div style={{ fontWeight: 'bold', height: '20px' }}>{slot.name}</div>
                            {slot.filled ? (
                                <div style={{ textAlign: 'center' }}>
                                    <img src={imageUrl} alt={title} style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                                    <p style={{ margin: '8px 0', fontWeight: 'bold' }}>{title}</p>
                                    {slot.isBroken ? (
                                        <button onClick={() => handleRepairSlot(idx)} style={{marginTop: '8px', background:'#f44336', color:'white'}}>Reparar</button>
                                    ) : (
                                    <div>
                                        <p style={{fontSize: '0.9em'}}>Tempo: {formatTime(slot.repairCooldown)}</p>
                                        <button>+1h Energia</button>
                                    </div>
                                    )}
                                </div>
                            ) : slot.free ? (
                                <button>Montar CPU Grátis</button>
                            ) : (
                                <p style={{ color: '#888' }}>{title}</p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
}
