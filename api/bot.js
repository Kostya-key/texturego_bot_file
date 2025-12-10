// api/bot.js - Рабочий вебхук для Vercel
import { Telegraf } from 'telegraf';

// Инициализируем бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Обработка команды /start
bot.command('start', async (ctx) => {
  console.log(`[BOT] /start from ${ctx.from.id}`);
  await ctx.reply('🎉 Бот работает! Теперь можно отправлять фото.');
});

// Главный обработчик Vercel
export default async function handler(req, res) {
  console.log(`[WEBHOOK] Called: ${req.method} ${req.url}`);
  
  // Для GET запросов - проверка
  if (req.method === 'GET') {
    return res.status(200).send('✅ Вебхук активен. Бот готов к работе.');
  }
  
  // Для POST запросов от Telegram
  if (req.method === 'POST') {
    try {
      const update = req.body;
      console.log(`[WEBHOOK] Update received:`, update.update_id);
      
      // Обрабатываем обновление через бота
      await bot.handleUpdate(update);
      
      // Отправляем успешный ответ Telegram
      return res.status(200).json({ ok: true });
      
    } catch (error) {
      console.error('[WEBHOOK] Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  // Для других методов
  return res.status(405).send('Method not allowed');
}
