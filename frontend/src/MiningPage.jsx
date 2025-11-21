import React from 'react';

const TWENTY_FOUR_HOURS_IN_SECONDS = 24 * 60 * 60;
const SECONDS_IN_A_MONTH = 30 * 24 * 3600;
const ENERGY_REFILL_ALL_COST = 50;
const PAID_BOOST_COST = 80;

const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

// NOVA FUNÇÃO: Formata o tempo para minerar 1 BDG
const formatTimeToMine = (monthlyGain) => {
  if (!monthlyGain || monthlyGain === 0) return 'N/A';
  const secondsToMineOneBdg = SECONDS_IN_A_MONTH / monthlyGain;
  const hours = Math.floor(secondsToMineOneBdg / 3600);
  const minutes = Math.floor((secondsToMineOneBdg % 3600) / 60);
  
  if (hours > 0) {
    return `~${hours}h ${minutes}min`;
  }
  return `~${minutes}min`;
};

const EnergyBar = ({ currentTime, maxTime }) => {
  const percentage = (currentTime / maxTime) * 100;
  return (
    <div style={{ width: '100%', backgroundColor: '#4a5568', borderRadius: '5px', overflow: 'hidden', height: '10px' }}>
      <div style={{ width: `${percentage}%`, backgroundColor: '#6366f1', height: '100%' }}></div>
    </div>
  );
};

export default function MiningPage({ 
  coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus, 
  paidBoostTime, setPaidBoostTime, economyData
}) {

  // ... (suas funções handle* existentes)
  const handleMountFree = (idx) => {
    setSlots(prev => prev.map((s, i) => (i === idx ? { ...s, filled: true, type: 'free', repairCooldown: TWENTY_FOUR_HOURS_IN_SECONDS } : s)));
    setStatus('✅ CPU Grátis montado e pronto para minerar!');
  };

  const handleReactivateEnergy = (idx) => {
    setSlots(prevSlots => prevSlots.map((slot, i) => {
        if (i === idx) return { ...slot, repairCooldown: 3600 };
        return slot;
    }));
    setStatus(`✅ Energia do Slot ${idx + 1} reativada por 1 hora!`);
  };
  
  const handleBuyEnergyForAll = () => { /* ... */ };
  const handleBuyPaidBoost = () => { /* ... */ };

  const buttonStyle = { /* ... */ };

  return (
    <div style={{padding: '0 10px 80px 10px'}}>
      {/* ... (Contador de Saldo e Botões de Compra) ... */}

      <div style={{ marginTop: 24 }}>
        <h3 style={{ textAlign: 'center', color: '#e4e4e7', fontFamily: '"Press Start 2P", cursive', fontSize: '1em' }}>Sua Sala de Mineração</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '20px' }}>
          {slots.map((slot, idx) => {
            const title = slot.filled ? (slot.type === 'free' ? 'CPU Grátis' : `Padrão Tier ${slot.tier}`) : 'Gabinete Vazio';
            const imageUrl = slot.filled ? `/tier${slot.tier || 1}.png` : '/placeholder.png';
            
            // CALCULA A EFICIÊNCIA DA CPU
            const econKey = slot.filled ? (slot.type === 'free' ? 'free' : (slot.type === 'special' ? slot.tier.toString().toUpperCase() : slot.tier)) : null;
            const timeToMine = econKey ? formatTimeToMine(economyData[econKey]?.gain) : null;

            return (
              <div key={idx} style={{ border: '1px solid #3f3f46', borderRadius: '8px', padding: '10px', width: '160px', minHeight: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', background: '#27272a' }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.9em', color: '#a1a1aa' }}>{slot.name}</div>
                
                {slot.filled ? (
                  <div style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1, justifyContent: 'center' }}>
                    <img src={imageUrl} alt={title} style={{ width: '60px', height: '60px', objectFit: 'contain', margin: '10px 0' }} />
                    <p style={{ margin: '8px 0', fontWeight: 'bold' }}>{title}</p>
                    
                    {/* EXIBE O TEMPO PARA MINERAR 1 BDG */}
                    {timeToMine && <p style={{fontSize: '0.75em', color: '#a1a1aa', margin: '4px 0'}}>1 BDG em {timeToMine}</p>}

                    {slot.repairCooldown > 0 ? (
                      <div style={{width: '100%', marginTop: '10px'}}>
                        <p style={{fontSize: '0.8em', margin: '5px 0'}}>Energia: {formatTime(slot.repairCooldown)}</p>
                        <EnergyBar currentTime={slot.repairCooldown} maxTime={TWENTY_FOUR_HOURS_IN_SECONDS} />
                      </div>
                    ) : (
                      <button onClick={() => handleReactivateEnergy(idx)} style={{...buttonStyle, background:'#34d399', marginTop: '10px', width:'auto', padding: '8px 12px'}}>Reativar</button>
                    )}
                  </div>
                ) : (
                   <button onClick={() => handleMountFree(idx)} style={{...buttonStyle, marginTop: 'auto'}}>Montar CPU Grátis</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
