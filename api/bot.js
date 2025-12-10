// api/bot.js
import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command('start', (ctx) => {
    console.log(`[BOT] Команда /start от ${ctx.from.id}`);
    ctx.reply('🎨 Привет! Я TextureBot. Отправь мне фото.');
});

// Критически важный обработчик для Vercel
export default async (req, res) => {
    // 1. Логируем ВСЕ вызовы функции
    console.log(`[WEBHOOK] Вызов. Метод: ${req.method}, URL: ${req.url}`);

    try {
        // 2. Для GET-запросов (проверка из браузера)
        if (req.method === 'GET') {
            console.log('[WEBHOOK] Отвечаем на GET');
            return res.status(200).send('🤖 Бот активен. Используйте POST для вебхука.');
        }

        // 3. Для POST-запросов (от Telegram)
        if (req.method === 'POST') {
            console.log('[WEBHOOK] Начало обработки POST от Telegram');

            // 3.1. Пробуем распарсить тело запроса (это частая точка сбоя)
            let update;
            try {
                update = req.body;
                console.log('[WEBHOOK] Тело запроса (req.body):', JSON.stringify(update).substring(0, 200));
            } catch (parseError) {
                console.error('[WEBHOOK] Ошибка парсинга req.body:', parseError);
                return res.status(400).json({ error: 'Invalid JSON' });
            }

            // 3.2. Проверяем, есть ли токен бота (вторая частая причина)
            if (!process.env.BOT_TOKEN) {
                throw new Error('Переменная окружения BOT_TOKEN не установлена!');
            }

            // 3.3. Передаём обновление боту на обработку
            console.log(`[WEBHOOK] Передаю update_id ${update.update_id} боту`);
            await bot.handleUpdate(update);
            console.log('[WEBHOOK] Бот успешно обработал update');

            // 3.4. Отправляем Telegram подтверждение
            return res.status(200).json({ ok: true });
        }

        // 4. Для всех остальных методов HTTP
        return res.status(405).send('Method Not Allowed');

    } catch (error) {
        // 5. Ловим и логируем ЛЮБУЮ ошибку
        console.error('[WEBHOOK] КРИТИЧЕСКАЯ ОШИБКА в обработчике:', error);
        console.error('[WEBHOOK] Стек ошибки:', error.stack);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};
