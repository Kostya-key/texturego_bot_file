// api/bot.js - Рабочий MVP для TextureBot
import { Telegraf } from 'telegraf';
import fetch from 'node-fetch'; // Для загрузки файла с серверов Telegram

// Проверяем критически важную переменную
if (!process.env.BOT_TOKEN) {
  throw new Error('❌ FATAL: BOT_TOKEN не найден!');
}
const bot = new Telegraf(process.env.BOT_TOKEN);

// --- Обработка команд ---
bot.command('start', (ctx) => {
  console.log(`👤 Команда /start от ${ctx.from.first_name} (ID: ${ctx.from.id})`);
  ctx.replyWithMarkdown(
    `*🎨 TextureBot MVP*\\n\\n` +
    `Привет! Я превращаю фото поверхностей в текстуры.\\n` +
    `*Как это работает:*\\n` +
    `1. Сфотографируй любую поверхность (стена, дерево, камень)\\n` +
    `2. Отправь фото мне\\n` +
    `3. Через 5-10 секунд получишь текстуру PNG\\n\\n` +
    `*Просто отправь мне фото!* 📸`
  );
});

bot.command('help', (ctx) => ctx.reply('Просто отправь мне фото любой поверхности, и я создам из неё текстуру.'));

// --- Обработка фото (ОСНОВНАЯ ФУНКЦИЯ MVP) ---
bot.on('photo', async (ctx) => {
  const chatId = ctx.message.chat.id;
  const messageId = ctx.message.message_id;
  
  // Сообщение о начале обработки
  const processingMsg = await ctx.reply('🔄 *Принял фото. Начинаю обработку...*', { 
    parse_mode: 'Markdown',
    reply_to_message_id: messageId 
  });

  try {
    console.log(`📸 Фото от ${ctx.from.id}. Начинаю обработку...`);
    
    // 1. Получаем file_id самого качественного варианта фото
    const photo = ctx.message.photo.pop(); // Берём фото с самым высоким разрешением
    const fileId = photo.file_id;
    
    // 2. Получаем путь к файлу на серверах Telegram
    const fileInfo = await ctx.telegram.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${fileInfo.file_path}`;
    console.log(`📥 Ссылка на файл: ${fileUrl}`);
    
    // 3. Загружаем файл (пока просто для примера)
    // В будущем здесь будет ваша логика обработки изображения!
    // const imageBuffer = await fetch(fileUrl).then(res => res.buffer());
    
    // 4. Имитируем обработку (заглушка на 2 секунды)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 5. Подготавливаем "результат" - пока это просто сообщение
    // ВАЖНО: Здесь вы позже будете генерировать реальную текстуру
    const textureInfo = `✅ *Текстура готова!*\n\n` +
                       `Размер: 2048x2048 px\n` +
                       `Формат: PNG\n` +
                       `Файл: texture_${Date.now()}.png`;
    
    // 6. Обновляем сообщение о статусе
    await ctx.telegram.editMessageText(
      chatId,
      processingMsg.message_id,
      null,
      textureInfo,
      { parse_mode: 'Markdown' }
    );
    
    // 7. Отправляем "текстуру" (пока заглушку)
    // В реальности здесь будет: ctx.replyWithDocument({ source: realTextureBuffer, filename: 'texture.png' })
    await ctx.replyWithDocument(
      { 
        source: Buffer.from('Заглушка для будущей текстуры'), 
        filename: `texture_${ctx.from.id}_${Date.now()}.png` 
      },
      { 
        caption: '🎨 Ваша текстура готова к использованию!',
        reply_to_message_id: messageId
      }
    );
    
    console.log(`✅ Успешно обработал фото для ${ctx.from.id}`);
    
  } catch (error) {
    console.error(`💥 Ошибка обработки фото:`, error);
    
    // Пытаемся обновить сообщение об ошибке
    try {
      await ctx.telegram.editMessageText(
        chatId,
        processingMsg.message_id,
        null,
        `❌ *Произошла ошибка при обработке фото*\n\nПопробуйте отправить другое изображение.`,
        { parse_mode: 'Markdown' }
      );
    } catch (e) {
      // Если не удалось обновить, просто отправляем новое сообщение
      ctx.reply('❌ Произошла ошибка. Попробуйте ещё раз.');
    }
  }
});

// --- Обработка текстовых сообщений (не фото) ---
bot.on('text', (ctx) => {
  if (!ctx.message.text.startsWith('/')) {
    ctx.reply('📸 Отправь мне фото поверхности для создания текстуры!');
  }
});

// --- Вебхук-обработчик для Vercel ---
import { createReadStream } from 'fs';

export default async function handler(req, res) {
  // Логируем факт вызова
  console.log(`🌐 [${new Date().toISOString()}] Вебхук вызван: ${req.method}`);
  
  // Обработка GET (для проверки)
  if (req.method === 'GET') {
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><title>TextureBot Status</title></head>
        <body>
          <h1>✅ TextureBot активен</h1>
          <p>Вебхук работает корректно.</p>
          <p>Отправьте /start вашему боту в Telegram.</p>
        </body>
      </html>
    `);
  }
  
  // Обработка POST (основной вебхук)
  if (req.method === 'POST') {
    try {
      // Парсим тело запроса
      const rawBody = await getRawBody(req);
      const update = JSON.parse(rawBody.toString());
      
      // Обрабатываем обновление через бота
      await bot.handleUpdate(update);
      
      // Отвечаем Telegram, что всё ок
      return res.status(200).json({ ok: true });
      
    } catch (error) {
      console.error('💥 Ошибка в вебхуке:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  
  // Все другие методы
  return res.status(405).send('Method Not Allowed');
}

// Вспомогательная функция для чтения тела запроса
async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
