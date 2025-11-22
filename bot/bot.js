const gameUrl = 'https://cryptodesktop.vercel.app';

// Botão WebApp
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
  bot.sendMessage(msg.chat.id, welcomeMessage, getGameButtonOptions()); // <-- corrigido
});

bot.onText(/\/play/, (msg) => {
  bot.sendMessage(msg.chat.id, "Abra o jogo abaixo:", getGameButtonOptions());
});

bot.onText(/\/help/, (msg) => {
  const helpMessage = `*Comandos Disponíveis*\n\n/start - Inicia o bot\n/play - Atalho para abrir o jogo\n/help - Mostra esta ajuda`;
  bot.sendMessage(msg.chat.id, helpMessage, { parse_mode: 'Markdown' });
});

console.log('🤖 O bot do Cryptodesk está no ar e ouvindo todos os comandos!');
