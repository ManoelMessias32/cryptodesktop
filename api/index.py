import os
import telebot
from telebot import types
from flask import Flask, request

# --- Configuração do Bot ---
BOT_TOKEN = os.environ.get('BOT_TOKEN')
bot = telebot.TeleBot(BOT_TOKEN)
WEB_APP_URL = "https://cryptodesktop.vercel.app/"

# --- Servidor Flask ---
app = Flask(__name__)

# Esta é a rota que o Vercel irá expor (ex: /api/index)
@app.route('/', methods=['POST'])
def webhook():
    # Processa a atualização (mensagem) vinda do Telegram
    update = types.Update.de_json(request.get_json(force=True))
    bot.process_new_updates([update])
    return 'ok', 200

# --- Lógica do Bot ---
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

# Se o arquivo for executado diretamente (para teste local), o Vercel não usará isso.
if __name__ == "__main__":
    app.run(port=5000)
