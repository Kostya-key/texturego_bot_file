// api/webhook.js - ТЕСТОВАЯ ВЕРСИЯ
export default async (req, res) => {
  console.log('Тест: Функция вызвана. Метод:', req.method);
  
  // 1. Проверяем переменную BOT_TOKEN (выводим в логи первые 5 символов)
  const tokenPreview = process.env.BOT_TOKEN ? process.env.BOT_TOKEN.substring(0, 5) + '...' : 'НЕ НАЙДЕН';
  console.log('Тест: BOT_TOKEN =', tokenPreview);
  
  // 2. Для GET-запроса просто показываем статус
  if (req.method === 'GET') {
    return res.status(200).send(`
      <h1>Тест пройден ✅</h1>
      <p>Функция работает. BOT_TOKEN: ${tokenPreview}</p>
      <p>Теперь отправьте POST-запрос (это сделает Telegram).</p>
    `);
  }
  
  // 3. Для POST-запроса (от Telegram) отвечаем простым JSON
  if (req.method === 'POST') {
    console.log('Тест: Получен POST-запрос (сообщение от Telegram)');
    // Простейший корректный ответ для Telegram
    return res.status(200).json({ method: 'sendMessage', chat_id: 123, text: 'Тестовый ответ от бота' });
  }
  
  // 4. Для других методов
  return res.status(405).send('Method Not Allowed');
};
