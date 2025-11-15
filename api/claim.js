require('dotenv').config();
const { ethers } = require('ethers');

const privateKey = process.env.SERVER_PRIVATE_KEY;
const rpcUrl = process.env.RPC_URL;
const tokenAddress = '0xcB2e51011e60841B56e278291831E8A4b0D301B2';
const tokenAbi = [
  'function mint(address to, uint256 amount) external',
];

// Handler para a Serverless Function da Vercel
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  if (!privateKey || !rpcUrl) {
    console.error('ERRO: Variáveis de ambiente SERVER_PRIVATE_KEY e RPC_URL não definidas');
    return res.status(500).json({ message: 'Configuração do servidor incompleta' });
  }

  const { address, amount } = req.body;

  if (!address || !amount) {
    return res.status(400).json({ message: 'Endereço e quantidade são obrigatórios' });
  }

  try {
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, wallet);

    console.log(`Recebido pedido de claim: ${amount} tokens para ${address}`);

    // IMPORTANTE: Em produção, adicione uma lógica para verificar se o usuário
    // realmente tem direito a essa quantidade de tokens. Confiar no frontend é inseguro.

    const decimals = 18; // Decimais do seu token BDG
    const amountWei = ethers.utils.parseUnits(String(amount), decimals);

    console.log(`Iniciando transação de mint para ${address} com a quantia de ${amountWei.toString()}...`);

    const tx = await tokenContract.mint(address, amountWei);
    await tx.wait();

    console.log(`Transação concluída: ${tx.hash}`);
    res.status(200).json({ message: `Claim de ${amount} tokens realizado com sucesso!`, txHash: tx.hash });

  } catch (error) {
    console.error('Erro no processo de claim:', error);
    res.status(500).json({ message: 'Erro no servidor ao processar o claim' });
  }
};
