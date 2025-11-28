import React from 'react';

// Estilos para a página, mantendo a consistência visual
const styles = {
  container: {
    padding: '20px',
    textAlign: 'center',
    color: '#e4e4e7',
  },
  title: {
    fontFamily: '"Press Start 2P", cursive',
    marginBottom: '30px',
  },
  infoCard: {
    background: '#27272a',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '20px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  },
  infoLabel: {
    fontSize: '1em',
    color: '#a1a1aa',
  },
  infoValue: {
    fontSize: '1.5em',
    color: '#f4f4f5',
    fontWeight: 'bold',
    wordBreak: 'break-all',
  },
  referralContainer: {
    marginTop: '30px',
    padding: '15px',
    background: '#3f3f46',
    borderRadius: '8px',
  },
  referralLink: {
    fontSize: '1.1em',
    color: '#facc15',
    wordBreak: 'break-all',
    padding: '10px',
    background: '#18181b',
    borderRadius: '5px',
    display: 'block',
    marginBottom: '15px',
  },
  copyButton: {
    background: '#6366f1',
    color: 'white',
    border: 'none', 
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1em',
  }
};

export default function UserPage({ username, coinBdg }) {

  // Cria o link de referência baseado no nome de usuário
  const referralLink = `${window.location.origin}?ref=${username}`;

  // Função para copiar o link para a área de transferência
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      alert('Link de referência copiado!');
    }).catch(err => {
      console.error('Falha ao copiar o link: ', err);
    });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Perfil do Usuário</h1>
      
      <div style={styles.infoCard}>
        <p style={styles.infoLabel}>Usuário</p>
        <p style={styles.infoValue}>{username}</p>
      </div>

      <div style={styles.infoCard}>
        <p style={styles.infoLabel}>Saldo de Moedas (BDG)</p>
        <p style={styles.infoValue}>{Math.floor(coinBdg)}</p>
      </div>

      <div style={styles.referralContainer}>
        <h2 style={{fontSize: '1.2em', marginBottom: '10px'}}>Seu Link de Referência</h2>
        <p style={styles.referralLink}>{referralLink}</p>
        <button onClick={copyToClipboard} style={styles.copyButton}>Copiar Link</button>
      </div>

    </div>
  );
}
