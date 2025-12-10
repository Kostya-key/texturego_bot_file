// api/bot.mjs - Автономный обработчик для Vercel + Telegram

export default async function handler(request, response) {
  // 1. Логируем ВСЕ входящие запросы (это появится в логах)
  console.log('🔔 [HANDLER] Вызван. Метод:', request.method, 'URL:', request.url);

  try {
    // 2. Обработка GET-запроса (для проверки в браузере)
    if (request.method === 'GET') {
      console.log('✅ Отвечаем на GET');
      return response.status(200).send('🚀 Бот активен. Ожидаю POST от Telegram.');
    }

    // 3. Обработка POST-запроса (основной вебхук от Telegram)
    if (request.method === 'POST') {
      console.log('📨 Начало обработки POST от Telegram');
      
      // 3.1 Безопасно получаем тело запроса
      const rawBody = await getRawBody(request);
      const bodyText = rawBody.toString('utf8');
      console.log('📄 Тело запроса (первые 500 символов):', bodyText.substring(0, 500));

      let update;
      try {
        update = JSON.parse(bodyText);
        console.log('🔄 Парсинг JSON успешен, update_id:', update.update_id);
      } catch (parseError) {
        console.error('❌ Ошибка парсинга JSON:', parseError.message);
        return response.status(400).json({ ok: false, error: 'Invalid JSON' });
      }

      // 3.2 Импортируем и инициализируем бота динамически (экономит память)
      const { Telegraf } = await import('telegraf');
      const BOT_TOKEN = process.env.BOT_TOKEN;
      
      if (!BOT_TOKEN) {
        throw new Error('❌ Критическая ошибка: BOT_TOKEN не найден в Environment Variables Vercel!');
      }
      const bot = new Telegraf(BOT_TOKEN);

      // 3.3 Обработка команды /start прямо здесь (без middleware)
      if (update.message && update.message.text === '/start') {
        console.log(`👋 Обработка /start от пользователя ${update.message.from.id}`);
        const chatId = update.message.chat.id;
        
        // Имитируем ответ бота через прямой вызов API Telegram
        const telegramResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: '🎉 Привет! Я бот для создания текстур. Работаю через Vercel Functions!'
          })
        });
        
        const result = await telegramResponse.json();
        console.log('📤 Ответ Telegram API:', result.ok ? 'Успешно' : 'Ошибка');
      }

      // 3.4 Отправляем успешный ответ в Telegram API
      console.log('📤 Отправляю 200 OK в Telegram API');
      return response.status(200).json({ ok: true });
    }

    // 4. Все остальные HTTP-методы
    return response.status(405).send('Method Not Allowed');

  } catch (error) {
    // 5. Глобальный перехватчик ошибок
    console.error('💥 КРИТИЧЕСКАЯ ОШИБКА в обработчике:', error.message);
    console.error('📝 Стек ошибки:', error.stack);
    return response.status(500).json({ 
      ok: false, 
      error: 'Internal Server Error',
      details: error.message 
    });
  }
}

// Вспомогательная функция для безопасного чтения тела запроса
async function getRawBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
