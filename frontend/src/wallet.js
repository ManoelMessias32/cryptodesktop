import { ethers } from 'ethers';

// Referência ao provedor do WalletConnect, que é carregado pelo script no index.html
const WalletConnectProvider = window.WalletConnectProvider?.default;

let providerInstance;
let provider;

// Configuração do provedor WalletConnect
const getProviderInstance = () => {
  if (!providerInstance) {
    providerInstance = new WalletConnectProvider({
      rpc: {
        56: 'https://bsc-dataseed.binance.org/', // BNB Chain Mainnet
      },
      // Isso força a conexão com a BNB Chain
      chainId: 56,
    });
  }
  return providerInstance;
};

export async function connectWallet() {
  if (!WalletConnectProvider) {
    throw new Error("Falha ao carregar o provedor WalletConnect. Verifique a conexão com a internet.");
  }

  try {
    const wcProvider = getProviderInstance();

    // Se já estiver conectado, reutiliza a sessão
    if (wcProvider.connected) {
      provider = new ethers.providers.Web3Provider(wcProvider);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      return { provider, signer, address };
    }

    // Ativa a sessão do WalletConnect (mostra o QR code ou abre o app da carteira)
    await wcProvider.enable();

    provider = new ethers.providers.Web3Provider(wcProvider);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    return { provider, signer, address };

  } catch (e) {
    console.error("Não foi possível conectar a carteira:", e);
    // Se o usuário fechar o modal do QR Code, um erro é lançado.
    throw new Error("Conexão com a carteira cancelada ou falhou.");
  }
}

export async function disconnectWallet() {
    const wcProvider = getProviderInstance();
    if (wcProvider && wcProvider.connected) {
        await wcProvider.disconnect();
        providerInstance = null; // Limpa a instância para uma nova conexão no futuro
    }
}

// Função para verificar se há uma sessão ativa do WalletConnect
export async function checkConnectedWallet() {
    const wcProvider = getProviderInstance();
    if (wcProvider && wcProvider.connected) {
        provider = new ethers.providers.Web3Provider(wcProvider);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        return { provider, signer, address };
    }
    return null; // Retorna nulo se não houver sessão ativa
}
