import React, { useState } from 'react';

export default function UserPage({ address, coinBdg, claimableBdg, username }) {
  const [copySuccess, setCopySuccess] = useState('');

  const styles = {
    pageContainer: { padding: '10px', maxWidth: '700px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
    container: { padding: '15px', background: '#2d3748', borderRadius: '8px', border: '1px solid #4a5568', marginBottom: '20px' },
    title: { color: '#facc15', borderBottom: '1px solid #4a5568', paddingBottom: '10px', marginBottom: '20px', fontSize: '1.1em', wordBreak: 'break-word', fontFamily: '"Press Start 2P", cursive' },
    infoLine: { margin: '15px 0', fontSize: '1em', color: '#e4e4e7', wordBreak: 'break-word', lineHeight: '1.6' },
    infoLabel: { color: '#a1a1aa', marginRight: '8px', display: 'block', marginBottom: '5px', fontFamily: '"Press Start 2P", cursive', fontSize: '0.8em' },
    disclaimer: { fontSize: '0.8em', color: '#a1a1aa', marginTop: '20px', borderTop: '1px solid #4a5568', paddingTop: '15px', lineHeight: '1.5' },
    refLinkContainer: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
    refLink: { background: '#1a202c', padding: '8px 12px', borderRadius: '6px', wordBreak: 'break-all', flexGrow: 1 },
    copyButton: { background: '#6366f1', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontFamily: '"Press Start 2P", cursive', fontSize: '0.8em' }
  };

  const handleCopy = () => {
    const refLink = `${window.location.origin}?ref=${username}`;
    navigator.clipboard.writeText(refLink).then(() => {
      setCopySuccess('Copiado!');
      setTimeout(() => setCopySuccess(''), 2000);
    }, () => {
      setCopySuccess('Falhou!');
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        <h2 style={styles.title}>👤 Perfil do Jogador</h2>
        <p style={styles.infoLine}><strong style={styles.infoLabel}>Nome:</strong> {username || 'Não definido'}</p>
        <p style={styles.infoLine}><strong style={styles.infoLabel}>Carteira:</strong> {address || 'Não conectada'}</p>
        <p style={styles.infoLine}><strong style={styles.infoLabel}>Saldo em Jogo (BDG Coin):</strong> {(coinBdg || 0).toFixed(4)}</p>
        <p style={styles.infoLine}><strong style={styles.infoLabel}>Saldo para Saque (BDG Token):</strong> {(claimableBdg || 0).toFixed(4)}</p>
      </div>

      <div style={styles.container}>
        <h2 style={{...styles.title, fontSize: '1em'}}>🚀 Link de Indicação</h2>
        <div style={styles.refLinkContainer}>
            <div style={styles.refLink}>{
                username ? `${window.location.origin}?ref=${username}` : 'Faça login para ver seu link'
            }</div>
            {username && <button onClick={handleCopy} style={styles.copyButton}>{copySuccess || 'Copiar'}</button>}
        </div>
      </div>

      <div style={styles.container}>
        <h2 style={{...styles.title, fontSize: '1em'}}>🐾 BAD DOG COIN (BDG)</h2>
        <p style={styles.infoLine}><strong style={styles.infoLabel}>Rede:</strong> <span>TON (The Open Network)</span></p>
        <p style={styles.infoLine}><strong style={styles.infoLabel}>Contrato:</strong> <span style={{wordBreak: 'break-all'}}>Ainda não definido</span></p>
        <p style={styles.disclaimer}><strong>Aviso:</strong> O token BDG será distribuído a cada 6 meses (podendo haver alteração na data).</p>
      </div>
    </div>
  );
}
