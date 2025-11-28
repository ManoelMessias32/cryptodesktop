import React, { useState } from 'react';
import { useAccount } from 'wagmi';

// Defina o valor mínimo para saque aqui
const MINIMUM_CLAIM_AMOUNT = 700;

// Estilos para a página
const styles = {
  container: { padding: '20px', textAlign: 'center', color: '#e4e4e7' },
  title: { fontFamily: '"Press Start 2P", cursive', marginBottom: '30px' },
  card: { background: '#27272a', padding: '20px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.3)' },
  label: { fontSize: '1em', color: '#a1a1aa' },
  value: { fontSize: '1.2em', color: '#f4f4f5', fontWeight: 'bold', wordBreak: 'break-all', marginTop: '5px' },
  referralLink: { fontSize: '1em', color: '#facc15', wordBreak: 'break-all', padding: '10px', background: '#18181b', borderRadius: '5px', display: 'block', margin: '10px 0' },
  button: { background: '#6366f1', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1em', marginTop: '10px' },
  disabledButton: { background: '#4a5568', cursor: 'not-allowed' },
  statusMessage: { marginTop: '20px', fontSize: '1em', minHeight: '24px' },
};

export default function UserPage({ username, coinBdg, claimableBdg }) {
  const { address: bnbAddress, isConnected } = useAccount();
  const [isClaiming, setIsClaiming] = useState(false);
  const [status, setStatus] = useState('');

  const referralLink = `${window.location.origin}?ref=${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setStatus('Link de referência copiado!');
      setTimeout(() => setStatus(''), 3000);
    }).catch(err => {
      console.error('Falha ao copiar o link: ', err);
      setStatus('❌ Falha ao copiar.');
    });
  };

  const handleClaim = async () => {
    if (!isConnected || !bnbAddress) {
      setStatus('❌ Por favor, conecte sua carteira BNB primeiro.');
      return;
    }
    if (claimableBdg < MINIMUM_CLAIM_AMOUNT) {
      setStatus(`❌ Você precisa de pelo menos ${MINIMUM_CLAIM_AMOUNT} moedas para sacar.`);
      return;
    }

    setIsClaiming(true);
    setStatus('Processando seu saque...');

    try {
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: bnbAddress, amount: claimableBdg }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(`✅ Sucesso! ${claimableBdg.toFixed(2)} BDG foram enviados para sua carteira.`);
        // Aqui, o App.jsx precisaria ser notificado para zerar o claimableBdg
      } else {
        throw new Error(data.error || 'Ocorreu um erro no servidor.');
      }
    } catch (error) {
      setStatus(`❌ Erro ao processar o saque: ${error.message}`);
      console.error('Erro no claim:', error);
    } finally {
      setIsClaiming(false);
    }
  };
  
  const canClaim = claimableBdg >= MINIMUM_CLAIM_AMOUNT;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Perfil</h1>
      
      <div style={styles.card}>
        <p style={styles.label}>Usuário</p>
        <p style={styles.value}>{username}</p>
      </div>

      {isConnected && (
        <div style={styles.card}>
          <p style={styles.label}>Carteira BNB Conectada</p>
          <p style={styles.value}>{`${bnbAddress.substring(0, 6)}...${bnbAddress.substring(bnbAddress.length - 4)}`}</p>
        </div>
      )}

      <div style={styles.card}>
        <p style={styles.label}>Link de Referência</p>
        <p style={styles.referralLink}>{referralLink}</p>
        <button onClick={copyToClipboard} style={styles.button}>Copiar</button>
      </div>

      <div style={styles.card}>
        <p style={styles.label}>Saldo de Moedas (BDG no Jogo)</p>
        <p style={styles.value}>{Math.floor(coinBdg)}</p>
      </div>

      <div style={styles.card}>
        <p style={styles.label}>Moedas para Sacar (Claim)</p>
        <p style={styles.value}>{claimableBdg ? claimableBdg.toFixed(4) : '0.0000'}</p>
        <button onClick={handleClaim} disabled={isClaiming || !canClaim} style={{...styles.button, ...(!canClaim || isClaiming ? styles.disabledButton : {})}}>
          {isClaiming ? 'Processando...' : 'Sacar para Carteira'}
        </button>
        {!canClaim && <p style={{fontSize: '0.8em', color: '#a1a1aa', marginTop: '10px'}}>Você precisa de {MINIMUM_CLAIM_AMOUNT} moedas para sacar.</p>}
      </div>
      
      {status && <p style={styles.statusMessage}>{status}</p>}

    </div>
  );
}
