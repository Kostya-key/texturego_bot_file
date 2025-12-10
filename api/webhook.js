// api/webhook.js - начало функции
export default async (req, res) => {
  console.log('=== НАЧАЛО ВЫПОЛНЕНИЯ ФУНКЦИИ ===');
  
  try {
    // Проверяем токен (безопасно, показываем только первые символы)
    const tokenExists = !!process.env.BOT_TOKEN;
    console.log('BOT_TOKEN существует?', tokenExists);
    
    // Для GET запроса — проверочная страница
    if (req.method === 'GET') {
      return res.status(200).send('<h1>Bot endpoint is live</h1>');
    }
    
    // Для POST запроса от Telegram
    if (req.method === 'POST') {
      console.log('Получен POST запрос от Telegram');
      // Начинаем обрабатывать обновление от Telegram
      const update = req.body;
      console.log('Тип update:', typeof update);
      
      // Инициализируем бота только если токен есть
      if (!tokenExists) {
        throw new Error('BOT_TOKEN не найден в переменных окружения Vercel.');
      }
      const { Telegraf } = await import('telegraf');
      const bot = new Telegraf(process.env.BOT_TOKEN);
      
      // Тут далее идёт ваш код обработки команд
      // ...
    }
  } catch (error) {
    // ВСЕ ошибки будут видны здесь
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА В ФУНКЦИИ:', error.message);
    console.error('Стек ошибки:', error.stack);
    return res.status(500).json({ error: error.message });
  }
};
