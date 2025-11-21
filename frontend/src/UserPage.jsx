import React from 'react';

// A página agora recebe `username` do App.jsx
export default function UserPage({ address, coinBdg, username }) {

  const styles = {
    pageContainer: { display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px', margin: '0 auto', fontFamily: '"Press Start 2P", cursive', padding: '20px' },
    container: { padding: '16px', background: '#2d3748', borderRadius: '8px', border: '1px solid #4a5568' },
    title: { color: '#facc15', borderBottom: '1px solid #4a5568', paddingBottom: '10px', marginBottom: '20px', fontSize: '1.2em' },
    infoLine: { margin: '15px 0', fontSize: '0.9em', color: '#e4e4e7', wordBreak: 'break-all' },
    infoLabel: { color: '#a1a1aa', marginRight: '10px' },
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
      {/* Seção de Perfil do Usuário */}
      <div style={styles.container}>
        <h2 style={styles.title}>👤 Perfil do Jogador</h2>
        <p style={styles.infoLine}>
          <strong style={styles.infoLabel}>Nome:</strong> 
          <span>{username || 'Não definido'}</span>
        </p>
        <p style={styles.infoLine}>
          <strong style={styles.infoLabel}>Carteira:</strong> 
          <span>{address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : 'Não conectada'}</span>
        </p>
        <p style={styles.infoLine}>
          <strong style={styles.infoLabel}>Saldo:</strong> 
          <span>{coinBdg.toFixed(4)} BDG</span>
        </p>
      </div>

      {/* Seção do Link de Referência */}
      {username && (
          <div style={styles.container}>
            <h3 style={{...styles.title, fontSize: '1em'}}>Seu Link de Referência</h3>
            <p style={{...styles.infoLine, fontSize: '0.8em'}}>Compartilhe para ganhar recompensas!</p>
            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '4px', wordBreak: 'break-all' }}>
              {referralLink}
            </div>
            <button onClick={handleCopyToClipboard} style={{ padding: '8px 12px', cursor: 'pointer', border: 'none', borderRadius: '4px', background: '#4f46e5', color: 'white', marginTop: '12px'}}>Copiar Link</button>
          </div>
        )}

      {/* Informativo Oficial BAD DOG COIN */}
      <div style={styles.container}>
        <h2 style={{...styles.title, fontSize: '1em'}}>🐾 BAD DOG COIN (BDG)</h2>
        <p style={styles.infoLine}>
          <strong style={styles.infoLabel}>🔗 Contrato:</strong> 
          <span style={{ fontSize: '0.8em' }}>0x9Fd1456F61a8c8212b691353249C411115C53aE8</span>
        </p>
        <p style={styles.infoLine}>
          <strong style={styles.infoLabel}>🔢 Decimais:</strong> 
          <span>18</span>
        </p>
      </div>
    </div>
  );
}
