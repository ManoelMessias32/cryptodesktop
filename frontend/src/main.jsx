import React from 'react';
import ReactDOM from 'react-dom/client';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { walletConnect, injected } from 'wagmi/connectors';

import App from './App.jsx';

const queryClient = new QueryClient();

const projectId = 'de591849407d4745d051c64dcd1c7ce1';

const metadata = {
  name: 'Cryptodesk',
  description: 'Seu jogo de mineração Web3',
  url: 'https://cryptodesktop.vercel.app',
  icons: ['https://cryptodesktop.vercel.app/logo.png']
};

// Configuração com conectores manuais
const wagmiConfig = createConfig({
  chains: [bsc],
  connectors: [
    walletConnect({ projectId, metadata, showQrModal: true }),
    injected({ shimDisconnect: true }),
  ],
  transports: {
    [bsc.id]: http(),
  },
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
