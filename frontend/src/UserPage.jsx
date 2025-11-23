import React from 'react';

export default function UserPage({ address, coinBdg, username }) {

  const styles = {
    pageContainer: {
      padding: '10px',
      maxWidth: '700px',
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', // Fonte "lisinha"
    },
    container: {
      padding: '15px',
      background: '#2d3748',
      borderRadius: '8px',
      border: '1px solid #4a5568',
      marginBottom: '20px',
    },
    title: {
      color: '#facc15',
      borderBottom: '1px solid #4a5568',
      paddingBottom: '10px',
      marginBottom: '20px',
      fontSize: '1.1em',
      wordBreak: 'break-word',
      fontFamily: '"Press Start 2P", cursive', // Mantém a fonte pixelada para títulos
    },
    infoLine: {
      margin: '15px 0',
      fontSize: '1em', // Aumenta o tamanho da fonte para legibilidade
      color: '#e4e4e7',
      wordBreak: 'break-word',
      lineHeight: '1.6', 
    },
    infoLabel: {
      color: '#a1a1aa',
      marginRight: '8px',
      display: 'block',
      marginBottom: '5px',
      fontFamily: '"Press Start 2P", cursive', // Mantém a fonte pixelada para labels
      fontSize: '0.8em', 
    },
    button: {
      padding: '10px 15px',
      cursor: 'pointer',
      border: 'none',
      borderRadius: '4px',
      background: '#4f46e5',
      color: 'white',
      fontFamily: '"Press Start 2P", cursive', // Mantém a fonte pixelada para botões
      fontSize: '0.8em'
    },
    linkBox: {
      background: '#1e293b',
      padding: '12px',
      borderRadius: '4px',
      wordBreak: 'break-all',
      marginBottom: '15px',
      fontSize: '0.9em', // Aumenta a fonte do link
      lineHeight: '1.5',
    },
    disclaimer: {
      fontSize: '0.8em',
      color: '#a1a1aa',
      marginTop: '20px',
      borderTop: '1px solid #4a5568',
      paddingTop: '15px',
      lineHeight: '1.5',
    }
  };

  const referralLink = `${window.location.origin}/?ref=${encodeURIComponent(username)}`;

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      alert('Link de referência copiado!');
    }, () => {
      alert('Falha ao copiar o link.');
    });
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        <h2 style={styles.title}>👤 Perfil do Jogador</h2>
        <p style={styles.infoLine}>
          <strong style={styles.infoLabel}>Nome:</strong> 
          <span>{username || 'Não definido'}</span>
        </p>
        <p style={styles.infoLine}>
          <strong style={styles.infoLabel}>Carteira:</strong> 
          <span>{address ? address : 'Não conectada'}</span>
        </p>
        <p style={styles.infoLine}>
          {/* Alterado para refletir o BDG TOKEN */}
          <strong style={styles.infoLabel}>Saldo BDG Token:</strong> 
          <span>{coinBdg.toFixed(4)} BDG</span>
        </p>
      </div>

      {username && (
          <div style={styles.container}>
            <h3 style={{...styles.title, fontSize: '1em'}}>Seu Link de Referência</h3>
            <p style={{...styles.infoLine, fontSize: '0.9em', fontFamily: '"Press Start 2P", cursive'}}>Compartilhe para ganhar recompensas!</p>
            <div style={styles.linkBox}>
              {referralLink}
            </div>
            <button onClick={handleCopyToClipboard} style={styles.button}>Copiar Link</button>
          </div>
        )}

      <div style={styles.container}>
        <h2 style={{...styles.title, fontSize: '1em'}}>🐾 BAD DOG COIN (BDG)</h2>
        <p style={styles.infoLine}>
          <strong style={styles.infoLabel}>Rede:</strong> 
          <span>BNB Smart Chain</span>
        </p>
        <p style={styles.infoLine}>
          <strong style={styles.infoLabel}>Contrato:</strong> 
          <span style={{wordBreak: 'break-all'}}>0x9Fd1456F61a8c8212b691353249C411115C53aE8</span>
        </p>
        <p style={styles.disclaimer}>
          <strong>Aviso:</strong> O token BDG será distribuído a cada 6 meses (podendo haver alteração na data).
        </p>
      </div>
    </div>
  );
}
