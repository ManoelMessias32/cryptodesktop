import React from 'react';

const specialCpuMap = { 1: 'A', 2: 'B', 3: 'C' };

export default function MiningPage({ coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus }) {

  // A lógica de consumíveis e mineração simulada vai aqui
  const doMine = () => setCoinBdg(prev => prev + 1);

  const handleMountFree = (idx) => {
    setSlots(prev => prev.map((s, i) => (i === idx ? { ...s, filled: true } : s)));
    setStatus('✅ CPU Grátis montado e pronto para minerar!');
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <button onClick={doMine} style={{ padding: '10px 20px', fontSize: '1em' }}>Simular Mineração</button>
      </div>

      {/* Itens Consumíveis - A lógica será adicionada aqui */}
      
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
              if (slot.type === 'free') {
                imageUrl = '/tier1.png'; 
                title = 'CPU Grátis';
              } else if (slot.type === 'standard') {
                imageUrl = `/tier${slot.tier}.png`;
                title = `Padrão Tier ${slot.tier}`;
              } else { // special
                const specialKey = specialCpuMap[slot.tier];
                imageUrl = `/special_${specialKey.toLowerCase()}.png`;
                title = `Especial CPU ${specialKey}`;
              }
            }

            return (
              <div key={idx} style={{ border: '2px dashed #aaa', borderRadius: 8, padding: '12px', width: 220, height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#162447' }}>
                <div style={{ fontWeight: 'bold', marginBottom: 8, height: '20px' }}>{slot.name}</div>
                {slot.filled ? (
                  <div style={{ textAlign: 'center' }}>
                    <img src={imageUrl} alt={title} style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                    <p style={{ margin: '8px 0 0 0', fontWeight: 'bold' }}>{title}</p>
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
