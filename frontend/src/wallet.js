import { ethers } from 'ethers';

const WalletConnectProvider = window.WalletConnectProvider?.default;

let providerInstance;

// Função para criar uma NOVA instância do provedor
const createNewProviderInstance = () => {
  if (!WalletConnectProvider) {
    console.error("Biblioteca do WalletConnect não encontrada!");
    return null;
  }
  return new WalletConnectProvider({
    rpc: {
      56: 'https://bsc-dataseed.binance.org/', // BNB Chain Mainnet
    },
    chainId: 56,
  });
};

export async function connectWallet() {
  // Força a criação de uma nova instância para evitar que carteiras "agressivas" (Ronin) roubem a sessão.
  providerInstance = createNewProviderInstance();

  if (!providerInstance) {
    throw new Error("Falha ao carregar o provedor WalletConnect.");
  }

  // Garante que qualquer sessão antiga seja encerrada antes de começar uma nova.
  if (providerInstance.connected) {
    await providerInstance.disconnect();
  }

  try {
    // Ativa a sessão do WalletConnect (mostra o QR code ou abre o app da carteira)
    await providerInstance.enable();

    const provider = new ethers.providers.Web3Provider(providerInstance);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    // Monitora o evento de desconexão
    providerInstance.on("disconnect", (code, reason) => {
        console.log("Carteira desconectada", code, reason);
        window.location.reload(); // Recarrega a página para limpar o estado
    });

    return { provider, signer, address };

  } catch (e) {
    console.error("Não foi possível conectar a carteira:", e);
    throw new Error("Conexão com a carteira cancelada ou falhou.");
  }
}

export async function disconnectWallet() {
    if (providerInstance && providerInstance.connected) {
        await providerInstance.disconnect();
    }
    providerInstance = null;
}

export async function checkConnectedWallet() {
  // Esta função não é mais necessária, pois a sessão é gerenciada ativamente.
  // Manter para não quebrar a importação, mas não deve ser usada para auto-login com este setup.
  return null;
}
