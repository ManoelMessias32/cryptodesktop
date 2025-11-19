import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

import { createWeb3Modal, defaultWagmiConfig } from '@reown/appkit-adapter-wagmi';
import { WagmiProvider } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 1. Cria o cliente da Query
const queryClient = new QueryClient();

// 2. Pega o seu projectId
const projectId = '37e2b189a12b6a74354c78267c260e99';

// 3. Cria a metadata do seu dApp
const metadata = {
  name: 'Cryptodesk',
  description: 'Seu jogo de mineração Web3',
  url: 'https://cryptodesktop.vercel.app',
  icons: ['https://cryptodesktop.vercel.app/logo.png']
};

// 4. Cria a configuração do Wagmi
const wagmiConfig = defaultWagmiConfig({
  chains: [bsc],
  projectId,
  metadata
});

// 5. Cria o Web3Modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  chains: [bsc]
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
