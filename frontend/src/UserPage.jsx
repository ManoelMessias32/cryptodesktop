import React from 'react';

export default function UserPage({ address }) {
  return (
    <div>
      <h2>Página do Usuário</h2>
      {address ? (
        <div>
          <p><strong>Endereço da Carteira:</strong> {address}</p>
          {/* Outras informações do usuário podem vir aqui */}
        </div>
      ) : (
        <p>Conecte sua carteira para ver suas informações.</p>
      )}
    </div>
  );
}
