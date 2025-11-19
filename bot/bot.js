require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_TOKEN;

if (!token) {
  console.error('Erro: O token do Telegram não foi encontrado. Verifique seu arquivo .env');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// A URL base do jogo
const baseUrl = 'https://cryptodesktop.vercel.app/games';

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

bot.onText(/\/ranking/, (msg) => {
  const rankingMessage = `Para ver o ranking, abra o jogo e clique na aba *🏆 Rankings*.`;
  bot.sendMessage(msg.chat.id, rankingMessage, {
    parse_mode: 'Markdown',
    ...getGameButtonOptions()
  });
});

bot.onText(/\/profile/, (msg) => {
  const profileMessage = `Para ver seu perfil e link de referência, abra o jogo e clique na aba *👤 Usuário*.`;
  bot.sendMessage(msg.chat.id, profileMessage, {
    parse_mode: 'Markdown',
    ...getGameButtonOptions()
  });
});

console.log('🤖 O bot do Cryptodesk está no ar e ouvindo todos os comandos!');
