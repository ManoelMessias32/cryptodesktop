import os
import telebot
from telebot import types
from flask import Flask, request

# --- Configuração ---
BOT_TOKEN = os.environ.get('BOT_TOKEN')
WEB_APP_URL = "https://cryptodesktop.vercel.app/"
bot = telebot.TeleBot(BOT_TOKEN, threaded=False)

# --- Servidor ---
app = Flask(__name__)

@app.route('/', methods=['POST'])
def webhook():
    if request.headers.get('content-type') == 'application/json':
        json_string = request.get_data().decode('utf-8')
        update = types.Update.de_json(json_string)
        bot.process_new_updates([update])
        return 'ok', 200
    else:
        return "Unsupported Media Type", 415

# --- Funções do Bot ---
def get_game_button():
    markup = types.InlineKeyboardMarkup()
    btn = types.InlineKeyboardButton(
        "🎮 Abrir o Jogo",
        web_app=types.WebAppInfo(WEB_APP_URL)
    )
    markup.add(btn)
    return markup

@bot.message_handler(commands=['start', 'play', 'jogar'])
def send_welcome(message):
    welcome_text = "Bem-vindo ao Cryptobot! Clique abaixo para começar a minerar e jogar."
    bot.send_message(message.chat.id, welcome_text, reply_markup=get_game_button())

@bot.message_handler(commands=['help'])
def send_help(message):
    help_text = (
        "*Comandos Disponíveis*\n\n"
        "/start ou /play - Inicia o bot e abre o jogo\n"
        "/help - Mostra esta lista de comandos\n"
        "/ranking - Abre o jogo para ver o ranking\n"
        "/profile - Abre o jogo para ver seu perfil"
    )
    bot.send_message(message.chat.id, help_text, parse_mode='Markdown')

@bot.message_handler(commands=['ranking'])
def send_ranking(message):
    bot.send_message(message.chat.id, "Para ver o ranking, por favor, abra o jogo.", reply_markup=get_game_button())

@bot.message_handler(commands=['profile'])
def send_profile(message):
    bot.send_message(message.chat.id, "Para ver seu perfil e estatísticas, por favor, abra o jogo.", reply_markup=get_game_button())
