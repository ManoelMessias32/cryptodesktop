import os
import telebot
from telebot import types
from flask import Flask, request
import logging

# Configura o log para ser visível no Vercel
logging.basicConfig(level=logging.INFO)

# --- Configuração ---
BOT_TOKEN = os.environ.get('BOT_TOKEN')
WEB_APP_URL = "https://cryptodesktop.vercel.app/"

# Verifica o token logo no início
if not BOT_TOKEN:
    logging.critical("ERRO FATAL: A variável de ambiente BOT_TOKEN não foi encontrada!")

bot = telebot.TeleBot(BOT_TOKEN, threaded=False)
app = Flask(__name__)

# --- Rota do Webhook ---
@app.route('/', methods=['POST'])
def webhook():
    logging.info("Webhook recebido pelo Telegram.")
    try:
        json_string = request.get_data().decode('utf-8')
        update = types.Update.de_json(json_string)
        bot.process_new_updates([update])
        logging.info("Mensagem processada com sucesso.")
        return 'ok', 200
    except Exception as e:
        logging.error(f"Erro ao processar a mensagem: {e}")
        return "error", 500

# --- Comandos do Bot ---
@bot.message_handler(commands=['start', 'play', 'jogar'])
def send_welcome(message):
    markup = types.InlineKeyboardMarkup()
    btn = types.InlineKeyboardButton("🎮 Abrir o Jogo", web_app=types.WebAppInfo(WEB_APP_URL))
    markup.add(btn)
    bot.send_message(message.chat.id, "Bem-vindo ao Cryptobot! Clique para jogar.", reply_markup=markup)

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
    markup = types.InlineKeyboardMarkup()
    btn = types.InlineKeyboardButton("🎮 Abrir o Jogo", web_app=types.WebAppInfo(WEB_APP_URL))
    markup.add(btn)
    bot.send_message(message.chat.id, "Para ver o ranking, por favor, abra o jogo.", reply_markup=markup)

@bot.message_handler(commands=['profile'])
def send_profile(message):
    markup = types.InlineKeyboardMarkup()
    btn = types.InlineKeyboardButton("🎮 Abrir o Jogo", web_app=types.WebAppInfo(WEB_APP_URL))
    markup.add(btn)
    bot.send_message(message.chat.id, "Para ver seu perfil e estatísticas, por favor, abra o jogo.", reply_markup=markup)
