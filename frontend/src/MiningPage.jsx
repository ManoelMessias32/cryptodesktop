import React from 'react';

const specialCpuMap = { 1: 'A', 2: 'B', 3: 'C' };

const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

export default function MiningPage({ 
  coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus, economyData 
}) {

  const handleMountFree = (idx) => {
    setSlots(prev => prev.map((s, i) => (i === idx ? { ...s, filled: true } : s)));
    setStatus('✅ CPU Grátis montado e pronto para minerar!');
  };

  const handleRepairSlot = (idx) => {
    const slotToRepair = slots[idx];
    let repairCost = 0;
    
    if (slotToRepair.type === 'free') repairCost = economyData.free.repairCost;
    else if (slotToRepair.type === 'standard') repairCost = economyData[slotToRepair.tier].repairCost;
    else { // special
        const specialKey = Object.keys(economyData).find(k => economyData[k].tier === slotToRepair.tier && k.length === 1); // A, B, C
        repairCost = economyData[specialKey].repairCost;
    }

    if (coinBdg >= repairCost) {
      setCoinBdg(prev => prev - repairCost);
      setSlots(prevSlots => prevSlots.map((slot, i) => {
          if (i === idx) {
              return { ...slot, repairCooldown: 24 * 60 * 60, isBroken: false };
          }
          return slot;
      }));
      setStatus(`✅ Slot ${idx + 1} reparado! (-${repairCost} Coin BDG)`);
    } else {
        setStatus(`❌ Moedas insuficientes para o reparo!`);
    }
  };

  return (
    <div>
      {/* Seção de Consumíveis e Boosts pode ser adicionada aqui se necessário */}

      <div style={{ textAlign: 'center', margin: '24px 0' }}>
        <button onClick={addNewSlot} disabled={slots.length >= 6} style={{ padding: '12px 20px', fontSize: '1em'}}>
          Comprar Novo Gabinete ({slots.length}/6)
        </button>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ textAlign: 'center' }}>Sua Sala de Mineração</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {slots.map((slot, idx) => {
            let imageUrl = '';
            let title = 'Gabinete Vazio';

            if (slot.filled) {
              if (slot.type === 'free') { imageUrl = '/tier1.png'; title = 'CPU Grátis'; }
              else if (slot.type === 'standard') { imageUrl = `/tier${slot.tier}.png`; title = `Padrão Tier ${slot.tier}`; }
              else { const key = specialCpuMap[slot.tier]; imageUrl = `/special_${key.toLowerCase()}.png`; title = `Especial CPU ${key}`; }
            }

            return (
              <div key={idx} style={{ border: '2px dashed #aaa', borderRadius: 8, padding: '12px', width: 220, height: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', background: '#162447' }}>
                <div style={{ fontWeight: 'bold', height: '20px' }}>{slot.name}</div>
                {slot.filled ? (
                  <div style={{ textAlign: 'center' }}>
                    <img src={imageUrl} alt={title} style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                    <p style={{ margin: '8px 0', fontWeight: 'bold' }}>{title}</p>
                    {slot.isBroken ? (
                        <button onClick={() => handleRepairSlot(idx)} style={{marginTop: '8px', background:'#f44336', color:'white'}}>Reparar</button>
                    ) : (
                        <p style={{fontSize: '0.9em'}}>Próximo Reparo em:<br/> {formatTime(slot.repairCooldown)}</p>
                    )}
                  </div>
                ) : slot.free ? (
                  <button style={{ fontSize: '1em', padding: '10px' }} onClick={() => handleMountFree(idx)}>Montar CPU Grátis</button>
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
