import React from 'react';

export default function UserPage() {
  const styles = {
    pageContainer: {
      padding: '20px',
      textAlign: 'left',
      background: '#1e293b',
      borderRadius: '8px',
      maxWidth: '700px',
      margin: '0 auto',
      color: '#e2e8f0',
      lineHeight: '1.8',
      border: '1px solid #334155'
    },
    title: {
      color: '#facc15',
      marginBottom: '20px',
      borderBottom: '1px solid #334155',
      paddingBottom: '10px',
      textAlign: 'center',
    },
    infoLine: {
      margin: '15px 0',
      fontSize: '1.1em',
    },
    label: {
      color: '#9ca3af',
    },
    contract: {
      color: '#93c5fd',
      wordBreak: 'break-all',
      marginLeft: '10px',
    }
  };

  return (
    <div style={styles.pageContainer}>
      <h2 style={styles.title}>🐾 BAD DOG COIN (BDG) — Informativo Oficial</h2>
      <p style={styles.infoLine}>
        <strong style={styles.label}>🔗 Contrato:</strong> 
        <span style={styles.contract}>0x9Fd1456F61a8c8212b691353249C411115C53aE8</span>
      </p>
      <p style={styles.infoLine}>
        <strong style={styles.label}>🔢 Decimais:</strong> 
        <span style={{ marginLeft: '10px' }}>18</span>
      </p>
      <p style={styles.infoLine}>
        <strong style={styles.label}>📅 Pool de Recompensas:</strong> 
        <span style={{ marginLeft: '10px' }}>Criada a cada 6 meses</span>
      </p>
    </div>
  );
}
