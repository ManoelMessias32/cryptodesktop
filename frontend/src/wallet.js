import { ethers } from 'ethers';

// Carrega as bibliotecas do window, que foram adicionadas no index.html
const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;

let web3Modal;
let provider;
let instance;

// 1. Define as opções para o Web3Modal, principalmente para o WalletConnect
const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      rpc: {
        56: 'https://bsc-dataseed.binance.org/', // BNB Chain Mainnet
      },
      chainId: 56,
    },
  },
};

// 2. Cria a instância do Web3Modal (apenas uma vez)
const getWeb3Modal = () => {
  if (!web3Modal) {
    web3Modal = new Web3Modal({
      network: "binance", // Ajuda a sugerir a rede correta
      cacheProvider: true, // Lembra da carteira que o usuário conectou
      providerOptions,
      theme: "dark",
      disableInjectedProvider: false, // Garante que a opção MetaMask apareça
    });
  }
  return web3Modal;
}

// 3. Função principal para conectar
export async function connectWallet() {
  const modal = getWeb3Modal();
  try {
    // Abre o pop-up do Web3Modal e aguarda o usuário escolher uma carteira
    instance = await modal.connect();

    // Cria o provedor ethers a partir da instância da carteira escolhida
    provider = new ethers.providers.Web3Provider(instance);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    // Monitora eventos importantes para recarregar a página e evitar bugs
    instance.on("accountsChanged", () => window.location.reload());
    instance.on("chainChanged", () => window.location.reload());
    instance.on("disconnect", () => disconnectWallet());

    return { provider, signer, address };
  } catch (e) {
    // O usuário fechou o pop-up
    console.error("Não foi possível conectar a carteira via Web3Modal:", e);
    throw new Error("Você cancelou a conexão.");
  }
}

// 4. Função para desconectar
export async function disconnectWallet() {
  const modal = getWeb3Modal();
  if (instance && instance.close) {
    await instance.close();
  }
  await modal.clearCachedProvider();
  provider = null;
  instance = null;
  window.location.reload(); // Recarrega para um estado limpo
}

// 5. Função para reconectar automaticamente
export async function checkConnectedWallet() {
    const modal = getWeb3Modal();
    if (modal.cachedProvider) {
        try {
            // Tenta se reconectar silenciosamente, sem abrir o pop-up
            const result = await connectWallet();
            return result;
        } catch (e) {
            console.log("Não foi possível reconectar automaticamente.", e);
            await modal.clearCachedProvider(); // Limpa o cache se a reconexão falhar
            return null;
        }
    }
    return null;
}
