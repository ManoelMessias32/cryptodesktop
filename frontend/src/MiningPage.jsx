import React, { useEffect } from 'react';

// Componente reutilizável para os anúncios da Adsterra
const AdsterraAd = ({ atOptions }) => {
  const adContainer = React.useRef(null);

  useEffect(() => {
    if (adContainer.current && !adContainer.current.hasChildNodes()) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = `atOptions = ${JSON.stringify(atOptions)};`;

      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = `//www.highperformanceformat.com/${atOptions.key}/invoke.js`;

      adContainer.current.appendChild(script);
      adContainer.current.appendChild(invokeScript);
    }
  }, [atOptions]);

  return <div ref={adContainer} style={{ textAlign: 'center', margin: '20px auto' }} />;
};

const ONE_HOUR_IN_SECONDS = 3600;
const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 3600;
const PAID_BOOST_COST = 80;

// ... (o resto do seu código da MiningPage permanece o mesmo)

const formatTime = (seconds) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d > 0 ? `${d}d ` : ''}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const Bar = ({ current, max, color }) => {
    const percentage = max > 0 ? (current / max) * 100 : 0;
    return (
        <div style={{ background: '#4a5568', borderRadius: '5px', overflow: 'hidden', width: '100%', height: '8px' }}>
            <div style={{ width: `${percentage}%`, background: color, height: '100%' }}></div>
        </div>
    );
};

export default function MiningPage({ 
  coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus, 
  paidBoostTime, setPaidBoostTime, economyData, handleBuyEnergyForAll, handleRepairCpu
}) {

  const handleBuyPaidBoost = () => {
    if (coinBdg >= PAID_BOOST_COST) {
      setCoinBdg(coinBdg - PAID_BOOST_COST);
      setPaidBoostTime(30 * 24 * 3600);
      setStatus("Boost ativado por um mês!");
    } else {
      setStatus("Você não tem moedas suficientes para ativar o boost.");
    }
  };
  
  const getImagePath = (slot) => {
    if (!slot.filled) return '';
    if (slot.type === 'free') return '/cpu gratis.png';
    if (slot.type === 'special') return `/especial_${slot.tier.toLowerCase()}.jpg`;
    return `/tier${slot.tier}.png`;
  };

  const buttonStyle = { background: '#6366f1', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontFamily: '"Press Start 2P", cursive', fontSize: '0.8em' };
  const repairButtonStyle = { ...buttonStyle, background: '#f56565', fontSize: '0.7em', padding: '8px 12px', marginTop: '10px' };

  const refillCost = 10 * slots.length;

  return (
    <div style={{padding: '0 10px 80px 10px'}}>
      {/* Anúncio Banner Topo */}
      <AdsterraAd atOptions={{
        'key' : 'aa5093526197a9f66731eaa5facb698f',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      }} />

      <div style={{ textAlign: 'center', margin: '20px auto', padding: '20px', background: '#2d3748', borderRadius: '10px', maxWidth: '90vw' }}>
        <p style={{ margin: 0, color: '#a1a1aa', fontFamily: '"Press Start 2P", cursive', fontSize: '0.8em'}}>Seu Saldo</p>
        <h2 style={{ fontSize: '2em', margin: '10px 0 0 0', color: '#facc15', fontFamily: '"Press Start 2P", cursive' }}>{coinBdg.toFixed(4)}</h2>
        <p style={{ margin: '5px 0', color: '#a1a1aa' }}>Token Coin</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', margin: '24px auto', flexWrap: 'wrap' }}>
        <button onClick={handleBuyEnergyForAll} style={{...buttonStyle, width: 'auto'}}>
          Reabastecer Energia ({refillCost} TC)
        </button>
        <button onClick={handleBuyPaidBoost} disabled={paidBoostTime > 0} style={{...buttonStyle, width: 'auto'}}>
          Ativar Boost ({PAID_BOOST_COST} TC)
        </button>
      </div>
      <div style={{textAlign: 'center', minHeight: '20px'}}>{paidBoostTime > 0 && <p>Boost: {formatTime(paidBoostTime)}</p>}</div>

      <div style={{ textAlign: 'center', margin: '24px auto', maxWidth: '400px' }}>
        <button onClick={addNewSlot} disabled={slots.length >= 6} style={{...buttonStyle, width: '100%'}}>Comprar Gabinete ({slots.length}/6)</button>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ textAlign: 'center', color: '#e4e4e7', fontFamily: '"Press Start 2P", cursive', fontSize: '1em' }}>Sua Sala de Mineração</h3>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '15px', padding: '20px 10px' }}>
          {slots.map((slot, index) => (
            <div key={index} style={{ background: '#2d3748', padding: '15px', borderRadius: '8px', border: `1px solid ${slot.filled ? '#4a5568' : '#6366f1'}`, width: '220px', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#facc15', fontFamily: '"Press Start 2P", cursive', fontSize: '0.8em' }}>{slot.name}</h4>
              {slot.filled ? (
                <>
                  <img src={getImagePath(slot)} alt={`CPU ${slot.tier}`} style={{width: '70px', height: '70px', margin: '10px auto', objectFit: 'contain'}} />
                  <p style={{ margin: '10px 0', color: '#e4e4e7', fontSize: '0.9em' }}>{slot.type === 'free' ? 'CPU Grátis' : `Tier ${slot.tier}`}</p>
                  
                  <p style={{ margin: '10px 0 2px', color: '#a1a1aa', fontSize: '0.8em' }}>Energia: {formatTime(slot.repairCooldown)}</p>
                  <Bar current={slot.repairCooldown} max={ONE_HOUR_IN_SECONDS} color="#48bb78" />
                  
                  <p style={{ margin: '10px 0 2px', color: '#a1a1aa', fontSize: '0.8em' }}>Durabilidade: {formatTime(slot.durability)}</p>
                  <Bar current={slot.durability} max={SEVEN_DAYS_IN_SECONDS} color="#f6ad55" />

                  {slot.durability < (SEVEN_DAYS_IN_SECONDS * 0.2) && (
                      <button onClick={() => handleRepairCpu(index)} style={repairButtonStyle}>Reparar CPU</button>
                  )}
                </>
              ) : (
                <p style={{ color: '#a1a1aa', textAlign: 'center', margin: '20px 0', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Vazio</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Anúncio Banner Final */}
      <AdsterraAd atOptions={{
        'key' : '76c30e6631e256ef38ab65c1ce40cee8',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      }} />
    </div>
  );
}
