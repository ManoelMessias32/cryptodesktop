import React, { useState, useEffect } from 'react';

export default function UserPage({ address }) {
  const [username, setUsername] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [referralLink, setReferralLink] = useState('');

  // Carrega o nome de usuário salvo quando o componente é montado
  useEffect(() => {
    const savedUsername = localStorage.getItem('cryptoDesktopUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      generateReferralLink(savedUsername);
    }
  }, []);

  const generateReferralLink = (name) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/?ref=${encodeURIComponent(name)}`;
    setReferralLink(link);
  };

  const handleSaveUsername = () => {
    if (username.trim()) {
      localStorage.setItem('cryptoDesktopUsername', username.trim());
      generateReferralLink(username.trim());
      setEditMode(false);
      alert('Nome de usuário salvo!');
    } else {
      alert('O nome de usuário não pode estar vazio.');
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      alert('Link de referência copiado!');
    }, () => {
      alert('Falha ao copiar o link.');
    });
  };

  const styles = {
    pageContainer: { maxWidth: '700px', margin: '0 auto' },
    container: { padding: '16px', background: '#1e293b', borderRadius: '8px', border: '1px solid #334155' },
    input: { padding: '8px', marginRight: '8px', borderRadius: '4px', border: '1px solid #9ca3af', background: '#374151', color: 'white' },
    button: { padding: '8px 12px', cursor: 'pointer', border: 'none', borderRadius: '4px', background: '#4f46e5', color: 'white' },
    linkContainer: { marginTop: '16px', background: '#0f172a', padding: '12px', borderRadius: '4px', wordBreak: 'break-all' }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Seção de Usuário e Referência */}
      <div style={styles.container}>
        <h2>Página do Usuário</h2>
        <p><strong>Endereço da Carteira:</strong> {address || 'Conecte a carteira'}</p>
        
        <hr style={{ margin: '20px 0', borderColor: '#334155' }} />

        <h3>Seu Nome de Usuário</h3>
        {editMode || !username ? (
          <div>
            <input
              type="text"
              placeholder="Crie seu nome de usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
            />
            <button onClick={handleSaveUsername} style={styles.button}>Salvar</button>
          </div>
        ) : (
          <div>
            <p><strong>Nome de usuário:</strong> {username}</p>
            <button onClick={() => setEditMode(true)} style={{...styles.button, background: '#64748b'}}>Alterar</button>
          </div>
        )}

        {referralLink && (
          <div style={{ marginTop: '20px' }}>
            <h3>Seu Link de Referência</h3>
            <p>Compartilhe este link para ganhar recompensas!</p>
            <div style={styles.linkContainer}>
              {referralLink}
            </div>
            <button onClick={handleCopyToClipboard} style={{...styles.button, marginTop: '12px'}}>Copiar Link</button>
          </div>
        )}
      </div>
    </div>
  );
}
