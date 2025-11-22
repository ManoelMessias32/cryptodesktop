import os
import telebot
from telebot import types
from flask import Flask, request

# --- Configuração ---
BOT_TOKEN = os.environ.get('BOT_TOKEN')
WEB_APP_URL = "https://cryptodesktop.vercel.app/"
bot = telebot.TeleBot(BOT_TOKEN, threaded=False) # threaded=False é recomendado para Vercel

# --- Servidor ---
app = Flask(__name__)

# Rota principal da API que recebe os webhooks do Telegram
@app.route('/', methods=['POST'])
def webhook():
    if request.headers.get('content-type') == 'application/json':
        json_string = request.get_data().decode('utf-8')
        update = types.Update.de_json(json_string)
        bot.process_new_updates([update])
        return 'ok', 200
    else:
        return "Unsupported Media Type", 415

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
                     "Clique no botão abaixo para iniciar o Cryptobot!", 
                     reply_markup=markup)
