import React from 'react';

// Versão de emergência para remover o erro da tela branca.
// A seção de Link de Referência foi completamente removida.

export default function UserPage({ address, coinBdg, username }) {

  const styles = {
    pageContainer: { padding: '10px', maxWidth: '700px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
    container: { padding: '15px', background: '#2d3748', borderRadius: '8px', border: '1px solid #4a5568', marginBottom: '20px' },
    title: { color: '#facc15', borderBottom: '1px solid #4a5568', paddingBottom: '10px', marginBottom: '20px', fontSize: '1.1em', wordBreak: 'break-word', fontFamily: '"Press Start 2P", cursive' },
    infoLine: { margin: '15px 0', fontSize: '1em', color: '#e4e4e7', wordBreak: 'break-word', lineHeight: '1.6' },
    infoLabel: { color: '#a1a1aa', marginRight: '8px', display: 'block', marginBottom: '5px', fontFamily: '"Press Start 2P", cursive', fontSize: '0.8em' },
    disclaimer: { fontSize: '0.8em', color: '#a1a1aa', marginTop: '20px', borderTop: '1px solid #4a5568', paddingTop: '15px', lineHeight: '1.5' }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Seção de Perfil do Jogador */}
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
          <strong style={styles.infoLabel}>Saldo BDG Token:</strong> 
          <span>{(coinBdg || 0).toFixed(4)} BDG</span>
        </p>
      </div>

      {/* A SEÇÃO DE LINK DE REFERÊNCIA FOI REMOVIDA PARA CORRIGIR O CRASH */}

      {/* Seção de Informações do Token */}
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
