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
    pageContainer: { display: 'flex', flexDirection: 'column', gap: '20px' },
    container: { padding: '16px', background: '#162447', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' },
    input: { padding: '8px', marginRight: '8px', border: '1px solid #ccc', borderRadius: '4px', background: '#f0f2f5', color: '#333' },
    button: { padding: '8px 12px', cursor: 'pointer', border: 'none', borderRadius: '4px', background: '#1f4068', color: 'white' },
    linkContainer: { marginTop: '16px', background: '#1a1a2e', padding: '12px', borderRadius: '4px', wordBreak: 'break-all' },
    infoBox: { lineHeight: '1.6', fontSize: '0.9em' }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Seção de Usuário e Referência */}
      <div style={styles.container}>
        <h2>Página do Usuário</h2>
        <p><strong>Endereço da Carteira:</strong> {address || 'Conecte a carteira'}</p>
        
        <hr style={{ margin: '20px 0', borderColor: '#333' }} />

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
            <button onClick={() => setEditMode(true)} style={{...styles.button, background: '#6c757d'}}>Alterar</button>
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

      {/* Janela de Informações do Token */}
      <div style={styles.container}>
        <h3>Informações do Token</h3>
        <div style={styles.infoBox}>
          <p><strong>Nome da rede:</strong> bsc – Testnet</p>
          <p><strong>Novo URL RPC:</strong> https://data-seed-prebsc-1-s1.binance.org:8545/</p>
          <p><strong>ID da cadeia:</strong> 97</p>
          <p><strong>Símbolo:</strong> BNB</p>
          <p><strong>URL do Explorador de Blocos:</strong> https://testnet.bscscan.com</p>
          <hr style={{ margin: '10px 0', borderColor: '#333' }} />
          <p><strong>Contrato da bdg:</strong> 0xcB2e51011e60841B56e278291831E8A4b0D301B2</p>
          <p><strong>Padrão:</strong> Bep-20, Decimal 18</p>
          <p><strong>Previsão de distribuição do token:</strong> a cada 6 meses</p>
        </div>
      </div>
    </div>
  );
}
