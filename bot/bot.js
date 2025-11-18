require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Pega o token do arquivo .env
const token = process.env.TELEGRAM_TOKEN;

if (!token) {
  console.error('Erro: O token do Telegram não foi encontrado. Verifique seu arquivo .env');
  process.exit(1);
}

// Cria o bot em modo polling
const bot = new TelegramBot(token, { polling: true });

// URL do seu jogo, incluindo o "short name" que você configurou no BotFather.
const gameUrl = 'https://cryptodesktop.vercel.app/games';

// Opções do botão que abre o jogo
const options = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '🚀 Jogar Agora', web_app: { url: gameUrl } }]
    ]
  }
};

// O comando /start agora mostra o botão de jogar diretamente.
bot.onText(/\/start/, (msg) => {
  const welcomeMessage = `🎉 Bem-vindo ao Cryptodesk!\n\nClique no botão abaixo para começar a sua jornada.`;
  bot.sendMessage(msg.chat.id, welcomeMessage, options);
});

// O comando /play também mostra o botão, para consistência.
bot.onText(/\/play/, (msg) => {
    bot.sendMessage(msg.chat.id, "Abra o jogo abaixo:", options);
});

console.log('🤖 O bot do Cryptodesk está no ar e ouvindo...');
