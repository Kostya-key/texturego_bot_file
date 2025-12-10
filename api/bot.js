// api/bot.js - Рабочий вебхук для Vercel с парсингом тела
import { Telegraf } from 'telegraf';

// 1. Функция для чтения raw body запроса
async function readRawBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

// 2. Инициализируем бота
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  throw new Error('❌ BOT_TOKEN не найден в настройках Vercel!');
}
const bot = new Telegraf(BOT_TOKEN);

// 3. Обработка команды /start
bot.command('start', async (ctx) => {
  console.log(`[BOT] /start от пользователя ${ctx.from.id}`);
  await ctx.reply('🎉 Привет! Я TextureBot. Отправь мне фото для создания текстуры.');
});

// 4. Главный обработчик Vercel
export default async function handler(req, res) {
  console.log(`[WEBHOOK] Вызов: ${req.method} ${req.url}`);
  
  // Для GET запросов - проверка
  if (req.method === 'GET') {
    return res.status(200).send('✅ Вебхук активен. Бот готов к работе.');
  }
  
  // Для POST запросов от Telegram
  if (req.method === 'POST') {
    try {
      console.log('[WEBHOOK] Чтение тела запроса...');
      
      // 4.1. Читаем raw body
      const rawBody = await readRawBody(req);
      const bodyText = rawBody.toString('utf8');
      console.log('[WEBHOOK] Тело запроса (первые 300 символов):', bodyText.substring(0, 300));
      
      // 4.2. Парсим JSON
      let update;
      try {
        update = JSON.parse(bodyText);
        console.log(`[WEBHOOK] Парсинг успешен, update_id: ${update.update_id}`);
      } catch (parseError) {
        console.error('[WEBHOOK] Ошибка парсинга JSON:', parseError.message);
        return res.status(400).json({ error: 'Invalid JSON', details: parseError.message });
      }
      
      // 4.3. Проверяем структуру update
      if (!update || typeof update !== 'object') {
        throw new Error('Invalid update structure');
      }
      
      // 4.4. Обрабатываем обновление через бота
      console.log('[WEBHOOK] Передаю обновление боту...');
      await bot.handleUpdate(update);
      console.log('[WEBHOOK] Бот обработал обновление');
      
      // 4.5. Отправляем успешный ответ Telegram
      return res.status(200).json({ ok: true });
      
    } catch (error) {
      // 4.6. Логируем ВСЕ ошибки
      console.error('[WEBHOOK] КРИТИЧЕСКАЯ ОШИБКА:', error.message);
      console.error('[WEBHOOK] Стек ошибки:', error.stack);
      
      // Отправляем 500, но с информацией для логов
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  }
  
  // Для других методов HTTP
  return res.status(405).send('Method not allowed');
}
