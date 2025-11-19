require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_TOKEN;

if (!token) {
  console.error('Erro: O token do Telegram não foi encontrado. Verifique seu arquivo .env');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// A URL base do jogo
const baseUrl = 'https://cryptodesktop.vercel.app'; // Removido /games para teste

// Função para obter a URL com o "quebrador de cache"
const getGameUrl = () => {
  const cacheBuster = `v=${Date.now()}`;
  return `${baseUrl}?${cacheBuster}`;
}

const getGameButtonOptions = () => ({
  reply_markup: {
    inline_keyboard: [
      [{ text: '🚀 Jogar Agora', web_app: { url: getGameUrl() } }]
    ]
  }
});

// --- Comandos do Bot ---

bot.onText(/\/start/, (msg) => {
  const welcomeMessage = `🎉 Bem-vindo ao Cryptodesk!\n\nClique no botão abaixo para começar a sua jornada.`;
  bot.sendMessage(msg.chat.id, welcomeMessage, getGameButtonOptions());
});

bot.onText(/\/play/, (msg) => {
  bot.sendMessage(msg.chat.id, "Abra o jogo abaixo:", getGameButtonOptions());
});

bot.onText(/\/help/, (msg) => {
  const helpMessage = `*Comandos Disponíveis*\n\n/start - Inicia o bot\n/play - Atalho para abrir o jogo\n/ranking - Dica para ver o ranking\n/profile - Dica para ver seu perfil\n/help - Mostra esta ajuda`;
  bot.sendMessage(msg.chat.id, helpMessage, { parse_mode: 'Markdown' });
});

// ... (outros comandos)

console.log('🤖 O bot do Cryptodesk está no ar e ouvindo todos os comandos!');
