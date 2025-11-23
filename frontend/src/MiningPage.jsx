import React from 'react';

const ONE_HOUR_IN_SECONDS = 3600;
const SECONDS_IN_A_MONTH = 30 * 24 * 3600;
const ENERGY_REFILL_ALL_COST = 50;
const PAID_BOOST_COST = 80;

const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

const formatTimeToMine = (monthlyGain) => {
  if (!monthlyGain || monthlyGain === 0) return 'N/A';
  const secondsToMineOneBdg = SECONDS_IN_A_MONTH / monthlyGain;
  const hours = Math.floor(secondsToMineOneBdg / 3600);
  const minutes = Math.floor((secondsToMineOneBdg % 3600) / 60);
  
  if (hours > 0) return `~${hours}h ${minutes}min`;
  return `~${minutes}min`;
};

// A barra de energia agora usa ONE_HOUR_IN_SECONDS como o máximo
const EnergyBar = ({ currentTime }) => {
  const percentage = (currentTime / ONE_HOUR_IN_SECONDS) * 100;
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

  // Montar CPU Grátis agora dá 1 HORA de energia
  const handleMountFree = (idx) => {
    setSlots(prev => prev.map((s, i) => (i === idx ? { ...s, filled: true, type: 'free', repairCooldown: ONE_HOUR_IN_SECONDS } : s)));
    setStatus('✅ CPU Grátis montado e minerando por 1 hora!');
  };

  // Reativar também dá 1 HORA de energia
  const handleReactivateEnergy = (idx) => {
    setSlots(prevSlots => prevSlots.map((slot, i) => {
        if (i === idx) return { ...slot, repairCooldown: ONE_HOUR_IN_SECONDS };
        return slot;
    }));
    setStatus(`✅ Energia do Slot ${idx + 1} reativada por 1 hora!`);
  };
  
  // Reabastecer TODOS os slots com 1 HORA de energia
  const handleBuyEnergyForAll = () => {
    if (coinBdg >= ENERGY_REFILL_ALL_COST) {
      setCoinBdg(prev => prev - ENERGY_REFILL_ALL_COST);
      setSlots(prevSlots => prevSlots.map(slot => slot.filled ? { ...slot, repairCooldown: ONE_HOUR_IN_SECONDS } : slot));
      setStatus(`✅ Energia de todos os slots reabastecida por 1 hora!`);
    } else {
      setStatus(`❌ Moedas insuficientes! Custo: ${ENERGY_REFILL_ALL_COST} BDG`);
    }
  };

  const handleBuyPaidBoost = () => {
    if (coinBdg >= PAID_BOOST_COST) {
      if (paidBoostTime > 0) return setStatus('Um boost pago já está ativo.');
      setCoinBdg(prev => prev - PAID_BOOST_COST);
      setPaidBoostTime(1800);
      setStatus(`✅ Boost de 30 minutos ativado!`);
    } else {
      setStatus('❌ Moedas insuficientes para ativar o boost.');
    }
  };

  const buttonStyle = { background: '#6366f1', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', width: '100%', fontFamily: '"Press Start 2P", cursive', fontSize: '0.8em' };

  return (
    <div style={{padding: '0 10px 80px 10px'}}>
      {/* ... (código do cabeçalho e saldo) ... */}

      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', margin: '24px auto', flexWrap: 'wrap' }}>
        <button onClick={handleBuyEnergyForAll} style={{...buttonStyle, width: 'auto'}}>
          Reabastecer Tudo ({ENERGY_REFILL_ALL_COST} BDG)
        </button>
        <button onClick={handleBuyPaidBoost} disabled={paidBoostTime > 0} style={{...buttonStyle, width: 'auto'}}>
          Ativar Boost ({PAID_BOOST_COST} BDG)
        </button>
      </div>
      <div style={{textAlign: 'center', minHeight: '20px'}}>{paidBoostTime > 0 && <p>Boost: {formatTime(paidBoostTime)}</p>}</div>

      <div style={{ textAlign: 'center', margin: '24px 0' }}>
        <button onClick={addNewSlot} disabled={slots.length >= 6} style={buttonStyle}>Comprar Gabinete ({slots.length}/6)</button>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ textAlign: 'center', color: '#e4e4e7', fontFamily: '"Press Start 2P", cursive', fontSize: '1em' }}>Sua Sala de Mineração</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '20px' }}>
          {slots.map((slot, idx) => {
            const title = slot.filled ? (slot.type === 'free' ? 'CPU Grátis' : `Padrão Tier ${slot.tier}`) : 'Gabinete Vazio';
            const imageUrl = slot.filled ? `/tier${slot.tier || 1}.png` : '/placeholder.png';
            const econKey = slot.filled ? (slot.type === 'free' ? 'free' : (slot.type === 'special' ? slot.tier.toString().toUpperCase() : slot.tier)) : null;
            const timeToMine = econKey ? formatTimeToMine(economyData[econKey]?.gain) : null;

            return (
              <div key={idx} style={{ border: '1px solid #3f3f46', borderRadius: '8px', padding: '10px', width: 'clamp(140px, 45%, 180px)', minHeight: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', background: '#27272a' }}>
                <div style={{ fontWeight: 'bold', fontSize: '0.9em', color: '#a1a1aa' }}>{slot.name}</div>
                
                {slot.filled ? (
                  <div style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1, justifyContent: 'center' }}>
                    <img src={imageUrl} alt={title} style={{ width: '60px', height: '60px', objectFit: 'contain', margin: '10px 0' }} />
                    <p style={{ margin: '8px 0', fontWeight: 'bold' }}>{title}</p>
                    {timeToMine && <p style={{fontSize: '0.8em', color: '#a1a1aa', margin: '4px 0'}}>1 BDG em {timeToMine}</p>}
                    {slot.repairCooldown > 0 ? (
                      <div style={{width: '100%', marginTop: '10px'}}>
                        <p style={{fontSize: '0.8em', margin: '5px 0'}}>Energia: {formatTime(slot.repairCooldown)}</p>
                        <EnergyBar currentTime={slot.repairCooldown} />
                      </div>
                    ) : (
                      <button onClick={() => handleReactivateEnergy(idx)} style={{...buttonStyle, background:'#34d399', marginTop: '10px', width:'auto'}}>Reativar</button>
                    )}
                  </div>
                ) : slot.free ? (
                  <button onClick={() => handleMountFree(idx)} style={{...buttonStyle, marginTop: 'auto'}}>Montar CPU Grátis</button>
                ) : (
                  <p style={{ color: '#a1a1aa', alignSelf: 'center', marginTop: 'auto' }}>Gabinete Vazio</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
