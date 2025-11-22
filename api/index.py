import os
import telebot
from telebot import types

# Pega o token do bot das variáveis de ambiente do Vercel
BOT_TOKEN = os.environ.get('BOT_TOKEN')
bot = telebot.TeleBot(BOT_TOKEN)

# URL CORRETA do seu Mini App
WEB_APP_URL = "https://cryptodesktop.vercel.app/"

# Esta é a função principal que o Vercel irá executar
def handler(request):
    # Processa a atualização (mensagem) vinda do Telegram
    update = types.Update.de_json(request.get_json(force=True))
    bot.process_new_updates([update])
    return 'ok', 200

@bot.message_handler(commands=['start', 'jogar'])
def send_welcome(message):
    markup = types.InlineKeyboardMarkup()
    btn = types.InlineKeyboardButton(
        "🎮 Jogar agora",
        web_app=types.WebAppInfo(WEB_APP_URL)
    )
    markup.add(btn)
    bot.send_message(message.chat.id, 
                     "Clique no botão abaixo para iniciar o Cryptobot e começar a minerar!", 
                     reply_markup=markup)

# Este trecho é apenas para teste local e não será usado no Vercel
if __name__ == "__main__":
    print("Bot rodando localmente...")
    bot.polling()
