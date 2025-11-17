import React from 'react';
import AdComponent from './AdComponent';

// ... (constantes e função formatTime)

export default function MiningPage({ 
  coinBdg, setCoinBdg, slots, setSlots, addNewSlot, setStatus,
  adBoostTime, paidBoostTime, setPaidBoostTime, adSessionsLeft, 
  handleAdSessionClick // Recebendo a função do App.jsx
}) {

  // ... (outras funções como handleMountFree, handleRepairSlot, etc.)

  const handleBuyPaidBoost = () => {
    // ... (lógica do boost pago)
  };

  return (
    <div>
      <AdComponent />

      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: 24, padding: 12, border: '1px solid #007bff', borderRadius: 8, background: '#2a2a3e', maxWidth: 600, margin: '24px auto' }}>
        <div>
            <h4>Boost de Anúncio</h4>
            {/* O BOTÃO AGORA CHAMA A FUNÇÃO CORRETA */}
            <button onClick={handleAdSessionClick} disabled={adSessionsLeft <= 0 || adBoostTime > 0}>Usar Anúncio (+20 min)</button>
            <p style={{textAlign: 'center'}}>{adSessionsLeft}/3 restantes</p>
        </div>
        <div>
            <h4>Boost Pago</h4>
            <button onClick={handleBuyPaidBoost} disabled={true}>Ativar (+30 min)</button>
            <p style={{textAlign: 'center'}}>Custo: 80 Coin BDG</p>
        </div>
      </div>

      {/* ... (resto do JSX) ... */}
    </div>
  );
}
