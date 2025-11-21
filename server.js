require('dotenv').config();
const express = require('express');
const path = require('path');
const { ethers } = require('ethers');

const app = express();
const port = 3000;

// Middlewares
app.use(express.static(path.join(__dirname, 'frontend/dist')));
app.use(express.json());

// Configuração da carteira e do contrato
const privateKey = process.env.SERVER_PRIVATE_KEY;
const rpcUrl = process.env.RPC_URL;
const tokenAddress = '0xcB2e51011e60841B56e278291831E8A4b0D301B2'; // Endereço do seu token BDG
const tokenAbi = [
  'function mint(address to, uint256 amount) external',
];

if (!privateKey || !rpcUrl) {
  console.error('ERRO: Defina SERVER_PRIVATE_KEY e RPC_URL no arquivo .env');
  process.exit(1);
}

const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet(privateKey, provider);
const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, wallet);

// Endpoint para o claim de tokens
app.post('/claim', async (req, res) => {
  const { address, amount } = req.body;

  if (!address || !amount) {
    return res.status(400).json({ message: 'Endereço e quantidade são obrigatórios' });
  }

  try {
    console.log(`Recebido pedido de claim: ${amount} tokens para ${address}`);

    // Lógica de verificação (a ser implementada)
    // Aqui você deve verificar se o usuário realmente tem direito a essa quantidade de tokens
    // Por exemplo, consultando um banco de dados ou outra fonte de verdade.
    // Por enquanto, vamos apenas confiar na quantidade enviada pelo frontend (NÃO FAÇA ISSO EM PRODUÇÃO)

    const decimals = 18; // O número de decimais do seu token
    const amountWei = ethers.utils.parseUnits(String(amount), decimals);

    console.log(`Iniciando transação de mint para ${address} com a quantia de ${amountWei.toString()}...`);

    const tx = await tokenContract.mint(address, amountWei);
    await tx.wait();

    console.log(`Transação concluída: ${tx.hash}`);

    res.json({ message: `Claim de ${amount} tokens realizado com sucesso!`, txHash: tx.hash });

  } catch (error) {
    console.error('Erro no processo de claim:', error);
    res.status(500).json({ message: 'Erro no servidor ao processar o claim' });
  }
});

// Para qualquer outra rota, sirva o index.html do frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
