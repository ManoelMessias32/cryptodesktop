import React from 'react';
import ReactDOM from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { bsc, bscTestnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';

// --- Configuração para a Rede BNB (usando Wagmi) ---
const bnbConfig = createConfig({
  chains: [bsc, bscTestnet], // Suporta tanto a mainnet quanto a testnet da BNB
  transports: {
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
  },
});
const queryClient = new QueryClient();

// --- Configuração para a Rede TON (usando TonConnect) ---
const tonManifestUrl = 'https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json';

// Detecta se está no ambiente do Telegram
const isTelegram = typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp;

const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderização condicional baseada no ambiente
if (isTelegram) {
  // Se for o bot, renderiza com o provedor da TON
  root.render(
    <React.StrictMode>
      <TonConnectUIProvider manifestUrl={tonManifestUrl}>
        <App />
      </TonConnectUIProvider>
    </React.StrictMode>
  );
} else {
  // Se for na web, renderiza com o provedor da BNB (Wagmi)
  root.render(
    <React.StrictMode>
      <WagmiProvider config={bnbConfig}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </WagmiProvider>
    </React.StrictMode>
  );
}
