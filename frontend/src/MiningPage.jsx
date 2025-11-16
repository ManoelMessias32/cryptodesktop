import React from 'react';

export default function MiningPage({ slots, addNewSlot, setCoinBdg, mined }) {

  // Lógica para consumíveis
  const handleBuyEnergy = () => {
    // ... (a lógica que implementamos antes)
  };

  return (
    <div>
      {/* ... (seção de simulação de mineração, boost de anúncio, etc.) ... */}

      {/* Seção de Itens Consumíveis */}
      <div style={{ marginTop: 24, padding: 12, border: '1px solid #ffc107', borderRadius: 8, background: '#2a2a3e', maxWidth: 420, margin: '24px auto' }}>
        <h4 style={{ color: '#ffc107', marginBottom: 16, textAlign: 'center' }}>Itens Consumíveis (Coin BDG)</h4>
        {/* ... (botões de comprar energia e boost) ... */}
      </div>

      {/* Botão para Adicionar Novo Slot */}
      <div style={{ textAlign: 'center', margin: '24px 0' }}>
        <button onClick={addNewSlot} disabled={slots.length >= 6} style={{ padding: '12px 20px', fontSize: '1em'}}>
          Comprar Novo Gabinete ({slots.length}/6)
        </button>
      </div>

      {/* Sala de Mineração */}
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
                const specialKey = Object.keys({ A: { tier: 1 }, B: { tier: 2 }, C: { tier: 3 } }).find(k => ({ A: { tier: 1 }, B: { tier: 2 }, C: { tier: 3 } })[k].tier === slot.tier);
                imageUrl = `/special_${specialKey.toLowerCase()}.png`;
                title = `Especial CPU ${specialKey}`;
              }
            }

            return (
              <div key={idx} style={{ border: '2px dashed #aaa', borderRadius: 8, padding: '12px', width: 220, height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#162447' }}>
                {slot.filled ? (
                  <div style={{ textAlign: 'center' }}>
                    <img src={imageUrl} alt={title} style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                    <p style={{ margin: '8px 0 0 0', fontWeight: 'bold' }}>{title}</p>
                  </div>
                ) : slot.free ? (
                  <button style={{ fontSize: '1em', padding: '10px' }} onClick={() => setSlots(prev => prev.map((s, i) => i === idx ? {...s, filled: true} : s)) }>Montar CPU Grátis</button>
                ) : (
                  <p>{title}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
