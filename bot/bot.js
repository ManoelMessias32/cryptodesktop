require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_TOKEN;

if (!token) {
  console.error('Erro: O token do Telegram não foi encontrado. Verifique seu arquivo .env');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

const gameUrl = 'https://cryptodesktop.vercel.app';

// VOLTANDO PARA O BOTÃO WEB_APP, otimizado para a rede TON
const getGameButtonOptions = () => ({
  reply_markup: {
    inline_keyboard: [
      [{ text: '🚀 Jogar Agora', web_app: { url: gameUrl } }]
    ]
  }
});

// --- Comandos do Bot ---

bot.onText(/\/start/, (msg) => {
  const welcomeMessage = `🎉 Bem-vindo ao Cryptodesk!\n\nClique no botão abaixo para começar a sua jornada.`;
  bot.sendMessage(msg.chat.botid, welcomeMessage, getGameButtonOptions());
});

bot.onText(/\/play/, (msg) => {
  bot.sendMessage(msg.chat.id, "Abra o jogo abaixo:", getGameButtonOptions());
});

bot.onText(/\/help/, (msg) => {
  const helpMessage = `*Comandos Disponíveis*\n\n/start - Inicia o bot\n/play - Atalho para abrir o jogo\n/help - Mostra esta ajuda`;
  bot.sendMessage(msg.chat.id, helpMessage, { parse_mode: 'Markdown' });
});

console.log('🤖 O bot do Cryptodesk está no ar e ouvindo todos os comandos!');
