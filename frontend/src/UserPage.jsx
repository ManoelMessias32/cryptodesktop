import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

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

const MINIMUM_CLAIM_AMOUNT = 700;
const BDG_TOKEN_CONTRACT_ADDRESS = '0x9Fd1456F61a8c8212b691353249C411115C53aE8';

const styles = {
  container: { padding: '20px', color: '#e4e4e7', maxWidth: '800px', margin: '0 auto' },
  title: { fontFamily: '"Press Start 2P", cursive', marginBottom: '30px', textAlign: 'center' },
  card: { background: '#27272a', padding: '25px', borderRadius: '10px', marginBottom: '25px', boxShadow: '0 4px 8px rgba(0,0,0,0.3)', textAlign: 'left' },
  label: { fontSize: '0.9em', color: '#a1a1aa', marginBottom: '5px' },
  value: { fontSize: '1.2em', color: '#f4f4f5', fontWeight: 'bold', wordBreak: 'break-all', marginBottom: '15px' },
  addressValue: { fontSize: '1em', color: '#f4f4f5', wordBreak: 'break-all', marginBottom: '15px' },
  referralLink: { fontSize: '1em', color: '#facc15', wordBreak: 'break-all', padding: '10px', background: '#18181b', borderRadius: '5px', display: 'block', margin: '5px 0 15px 0' },
  button: { background: '#6366f1', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontSize: '1em' },
  claimButton: { width: '100%', padding: '15px', fontSize: '1.2em' },
  disabledButton: { background: '#4a5568', cursor: 'not-allowed' },
  statusMessage: { marginTop: '20px', textAlign: 'center', fontSize: '1em', minHeight: '24px' },
};

export default function UserPage({ username, coinBdg, claimableBdg }) {
  const { address: bnbAddress, isConnected } = useAccount();
  const [isClaiming, setIsClaiming] = useState(false);
  const [status, setStatus] = useState('');

  const referralLink = `${window.location.origin}?ref=${username}`;

  const copyToClipboard = (textToCopy, type) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setStatus(`${type} copiado para a área de transferência!`);
      setTimeout(() => setStatus(''), 3000);
    }).catch(err => {
      console.error(`Falha ao copiar ${type}: `, err);
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
      <AdsterraAd atOptions={{ 'key': 'aa5093526197a9f66731eaa5facb698f', 'format': 'iframe', 'height': 90, 'width': 728, 'params': {} }} />
      <h1 style={styles.title}>Perfil</h1>
      
      <div style={styles.card}>
        <p style={styles.label}>Usuário</p>
        <p style={styles.value}>{username}</p>
        
        {isConnected && (
          <>
            <p style={styles.label}>Carteira BNB Conectada</p>
            <p style={styles.addressValue}>{bnbAddress}</p>
          </>
        )}

        <p style={styles.label}>Link de Referência</p>
        <p style={styles.referralLink}>{referralLink}</p>
        <button onClick={() => copyToClipboard(referralLink, 'Link de Referência')} style={styles.button}>Copiar</button>
      </div>

      <div style={styles.card}>
        <p style={styles.label}>Saldo de Moedas (BDG no Jogo)</p>
        <p style={styles.value}>{Math.floor(coinBdg)}</p>

        <p style={{...styles.label, marginTop: '20px'}}>Moedas para Sacar (Claim)</p>
        <p style={styles.value}>{claimableBdg ? claimableBdg.toFixed(4) : '0.0000'}</p>
        
        <button onClick={handleClaim} disabled={isClaiming || !canClaim} style={{...styles.button, ...styles.claimButton, ...(!canClaim || isClaiming ? styles.disabledButton : {})}}>
          {isClaiming ? 'Processando...' : 'Sacar para Carteira'}
        </button>
        {!canClaim && <p style={{fontSize: '0.8em', color: '#a1a1aa', marginTop: '10px', textAlign: 'center'}}>Você precisa de {MINIMUM_CLAIM_AMOUNT} moedas para sacar.</p>}
      </div>

      <div style={styles.card}>
        <p style={styles.label}>Contrato do Token (BNB Chain)</p>
        <p style={styles.addressValue}>{BDG_TOKEN_CONTRACT_ADDRESS}</p>
        <button onClick={() => copyToClipboard(BDG_TOKEN_CONTRACT_ADDRESS, 'Endereço do Contrato')} style={styles.button}>Copiar Endereço</button>
      </div>
      
      {status && <p style={styles.statusMessage}>{status}</p>}

      <AdsterraAd atOptions={{ 'key': '76c30e6631e256ef38ab65c1ce40cee8', 'format': 'iframe', 'height': 250, 'width': 300, 'params': {} }} />
    </div>
  );
}
