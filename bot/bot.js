require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TELEGRAM_TOKEN;

if (!token) {
  console.error('Erro: O token do Telegram não foi encontrado. Verifique seu arquivo .env');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// TESTE DEFINITIVO: URL do Google
const testUrl = 'https://www.google.com';

const getTestButton = () => ({
  reply_markup: {
    inline_keyboard: [
      [{ text: '🚀 Abrir o Google', url: testUrl }]
    ]
  }
});

bot.onText(/\/start/, (msg) => {
  const welcomeMessage = `Este é um teste. Por favor, clique no botão abaixo e veja se ele abre o Google no seu navegador principal (Chrome, Safari, etc.) ou dentro do Telegram.`;
  bot.sendMessage(msg.chat.id, welcomeMessage, getTestButton());
});

console.log('🤖 O bot de teste do Google está no ar!');
