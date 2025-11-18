import { ethers } from 'ethers';

const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;

let web3Modal;
let provider;
let instance;

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: { 
      rpc: { 56: 'https://bsc-dataseed.binance.org/' },
      chainId: 56,
    },
  },
};

const getWeb3Modal = () => {
  if (!web3Modal) {
    web3Modal = new Web3Modal({
      network: "binance",
      cacheProvider: true, 
      providerOptions,
      theme: "dark",
    });
  }
  return web3Modal;
};

// A função de conexão agora decide a melhor estratégia
export async function connectWallet() {
  // Estratégia 1: Se estiver no Telegram, usa o WalletConnect diretamente para forçar o deep-link
  if (window.Telegram && window.Telegram.WebApp) {
    try {
      instance = new WalletConnectProvider(providerOptions.walletconnect.options);
      await instance.enable();
      provider = new ethers.providers.Web3Provider(instance);
    } catch (e) {
      console.error("Conexão direta com WalletConnect falhou no Telegram:", e);
      throw new Error("Conexão cancelada ou falhou no Telegram.");
    }
  } else {
    // Estratégia 2: Em navegadores normais, usa o Web3Modal para dar opções ao usuário
    const modal = getWeb3Modal();
    try {
      instance = await modal.connect();
      provider = new ethers.providers.Web3Provider(instance);
    } catch (e) {
      console.error("Conexão via Web3Modal falhou:", e);
      throw new Error("Você cancelou a conexão.");
    }
  }

  // Lógica comum após a conexão ter sido estabelecida
  const signer = provider.getSigner();
  const address = await signer.getAddress();

  instance.on("accountsChanged", () => window.location.reload());
  instance.on("chainChanged", () => window.location.reload());
  instance.on("disconnect", () => disconnectWallet());

  return { provider, signer, address };
}

export async function disconnectWallet() {
  const modal = getWeb3Modal();
  if (instance && typeof instance.close === 'function') {
    await instance.close();
  }
  await modal.clearCachedProvider();
  provider = null;
  instance = null;
  window.location.reload();
}

export async function checkConnectedWallet() {
    const modal = getWeb3Modal();
    if (modal.cachedProvider) {
        try {
            return await connectWallet();
        } catch (e) {
            await modal.clearCachedProvider();
            return null;
        }
    }
    return null;
}

export function getProvider() {
  if (!provider) return null;
  return provider;
}
