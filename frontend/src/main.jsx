import React from 'react';
import ReactDOM from 'react-dom/client';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';

import App from './App.jsx';

// 1. Configuração do QueryClient para caching de dados
const queryClient = new QueryClient();

// 2. Seu Project ID do WalletConnect Cloud
const projectId = '37e2b189a12b6a74354c78267c260e99';

// 3. Metadados do seu dApp
const metadata = {
  name: 'Cryptodesk',
  description: 'Seu jogo de mineração Web3',
  url: 'https://cryptodesktop.vercel.app',
  icons: ['https://cryptodesktop.vercel.app/logo.png']
};

// 4. Criação da configuração do Wagmi com a sintaxe mais recente
const wagmiConfig = createConfig({
  chains: [bsc],
  transports: {
    [bsc.id]: http()
  },
  metadata
});

// 5. Criação do Modal do Web3Modal
createWeb3Modal({
  wagmiConfig: wagmiConfig,
  projectId,
  chains: [bsc],
  themeMode: 'dark'
});

// Renderiza a aplicação envolvendo-a com os provedores necessários
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
