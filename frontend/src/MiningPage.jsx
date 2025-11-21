import React from 'react';

const TWENTY_FOUR_HOURS_IN_SECONDS = 24 * 60 * 60;

const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

// Componente da Barra de Energia
const EnergyBar = ({ currentTime, maxTime }) => {
  const percentage = (currentTime / maxTime) * 100;
  return (
    <div style={{ width: '100%', backgroundColor: '#4a5568', borderRadius: '5px', overflow: 'hidden' }}>
      <div style={{ width: `${percentage}%`, backgroundColor: '#6366f1', height: '10px' }}></div>
    </div>
  );
};

export default function MiningPage({ 
  coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus
}) {

  const handleMountFree = (idx) => {
    setSlots(prev => prev.map((s, i) => (i === idx ? { ...s, filled: true, type: 'free', repairCooldown: TWENTY_FOUR_HOURS_IN_SECONDS } : s)));
    setStatus('✅ CPU Grátis montado e pronto para minerar!');
  };

  const handleReactivateEnergy = (idx) => {
    setSlots(prevSlots => prevSlots.map((slot, i) => {
        if (i === idx) {
            return { ...slot, repairCooldown: 3600 };
        }
        return slot;
    }));
    setStatus(`✅ Energia do Slot ${idx + 1} reativada por 1 hora!`);
  };

  // ... (outras funções)

  const buttonStyle = { background: '#6366f1', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', width: '100%' };

  return (
    <div style={{padding: '0 10px 80px 10px'}}>
      {/* SALDO DE BDG EM DESTAQUE */}
      <div style={{ textAlign: 'center', margin: '20px 0', padding: '20px', background: '#2d3748', borderRadius: '10px' }}>
        <p style={{ margin: 0, color: '#a1a1aa', fontFamily: '"Press Start 2P", cursive', fontSize: '0.8em'}}>Seu Saldo</p>
        <h2 style={{ fontSize: '2.5em', margin: '10px 0 0 0', color: '#facc15', fontFamily: '"Press Start 2P", cursive' }}>{coinBdg.toFixed(4)}</h2>
        <p style={{ margin: '5px 0', color: '#a1a1aa' }}>BDG</p>
      </div>

      {/* ... (seção de recarga) */}

      <div style={{ marginTop: 24 }}>
        <h3 style={{ textAlign: 'center', color: '#e4e4e7', fontFamily: '"Press Start 2P", cursive', fontSize: '1em' }}>Sua Sala de Mineração</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '20px' }}>
          {slots.map((slot, idx) => {
            // ... (lógica para pegar imagem e título)

            return (
              <div key={idx} style={{ border: '1px solid #3f3f46', borderRadius: '8px', padding: '10px', width: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', background: '#27272a' }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.9em', color: '#a1a1aa' }}>{slot.name}</div>
                {slot.filled ? (
                  <div style={{ textAlign: 'center', width: '100%' }}>
                    <img src={'/tier1.png'} alt={title} style={{ width: '60px', height: '60px', objectFit: 'contain', margin: '10px 0' }} />
                    <p style={{ margin: '8px 0', fontWeight: 'bold' }}>{title}</p>
                    
                    {slot.repairCooldown > 0 ? (
                      <div style={{width: '100%'}}>
                        <p style={{fontSize: '0.8em'}}>Energia: {formatTime(slot.repairCooldown)}</p>
                        {/* BARRA DE ENERGIA */}
                        <EnergyBar currentTime={slot.repairCooldown} maxTime={TWENTY_FOUR_HOURS_IN_SECONDS} />
                      </div>
                    ) : (
                      <button onClick={() => handleReactivateEnergy(idx)} style={{...buttonStyle, background:'#34d399'}}>Reativar Energia</button>
                    )}
                  </div>
                ) : (
                   <button onClick={() => handleMountFree(idx)} style={buttonStyle}>Montar CPU Grátis</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
