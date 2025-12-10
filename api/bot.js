// api/bot.js
import { Telegraf } from 'telegraf';

// Получаем токен из переменных окружения Vercel
const BOT_TOKEN = process.env.BOT_TOKEN;

// Проверяем, что токен есть
if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN environment variable is not set');
}

// Создаём экземпляр бота
const bot = new Telegraf(BOT_TOKEN);

// Обрабатываем команду
