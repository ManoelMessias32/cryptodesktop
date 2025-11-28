import React from 'react';
import ReactDOM from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { bsc, bscTestnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';

// Configuração BNB (Wagmi)
const bnbConfig = createConfig({
  chains: [bsc, bscTestnet],
  transports: {
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
  },
});

const queryClient = new QueryClient();

// SEU manifest.json (OBRIGATÓRIO estar no /public do projeto)
const tonManifestUrl = "/tonconnect-manifest.json";  // ← ARQUIVO LOCAL, NUNCA EXTERNO!

// Componente que detecta o ambiente NO CLIENTE (não no servidor)
function Root() {
  const [isTelegram, setIsTelegram] = React.useState(false);

  React.useEffect(() => {
    // Só roda no browser
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      setIsTelegram(true);
    }
  }, []);

  if (isTelegram) {
    // Dentro do Telegram → usa TON
    return (
      <TonConnectUIProvider manifestUrl={tonManifestUrl}>
        <App />
      </TonConnectUIProvider>
    );
  }

  // Fora do Telegram (web normal) → usa BNB
  return (
    <WagmiProvider config={bnbConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Renderiza só no cliente
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
