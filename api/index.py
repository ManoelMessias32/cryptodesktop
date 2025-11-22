import os
import telebot
from telebot import types
from flask import Flask, request

# --- Configuração do Bot ---
BOT_TOKEN = os.environ.get('BOT_TOKEN')
WEB_APP_URL = "https://cryptodesktop.vercel.app/"

# --- Servidor Flask ---
app = Flask(__name__)

# Rota de teste para verificar se a API está viva
@app.route('/', methods=['GET'])
def health_check():
    return "API do Bot está no ar. Se você está vendo isso, a API está funcionando!"

# Rota que recebe os webhooks do Telegram
@app.route('/', methods=['POST'])
def webhook():
    if not BOT_TOKEN:
        return "Erro: BOT_TOKEN não configurado no Vercel.", 500
    
    bot = telebot.TeleBot(BOT_TOKEN)
    update = types.Update.de_json(request.get_json(force=True))
    bot.process_new_updates([update])
    return 'ok', 200

# --- Lógica do Bot (só é executada se o bot for inicializado) ---
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

# O Vercel não usa este trecho
if __name__ == "__main__":
    app.run(port=5000)
