import os
import telebot
from telebot import types
from flask import Flask, request

# --- Configuração & Diagnóstico ---
BOT_TOKEN = os.environ.get('BOT_TOKEN')
WEB_APP_URL = "https://cryptodesktop.vercel.app/"

# --- Servidor Flask ---
app = Flask(__name__)

@app.route('/', methods=['POST'])
def webhook():
    # Se o token não foi encontrado, o bot nem tenta iniciar, mas a API responde.
    if not BOT_TOKEN:
        # Este log será visível no Vercel se a função for chamada
        print("ERRO FATAL: BOT_TOKEN não encontrado nas variáveis de ambiente.")
        return "error", 500

    # Se o token existir, prossiga
    bot = telebot.TeleBot(BOT_TOKEN)
    update = types.Update.de_json(request.get_data().decode('utf-8'))
    
    # Adicionando handlers aqui dentro para garantir que o bot está inicializado
    @bot.message_handler(commands=['start', 'play', 'jogar'])
    def send_welcome(message):
        markup = types.InlineKeyboardMarkup()
        btn = types.InlineKeyboardButton("🎮 Abrir o Jogo", web_app=types.WebAppInfo(WEB_APP_URL))
        markup.add(btn)
        bot.send_message(message.chat.id, "Bem-vindo ao Cryptobot! Clique para jogar.", reply_markup=markup)

    # Adicione outros handlers aqui se necessário
    
    bot.process_new_updates([update])
    return 'ok', 200
