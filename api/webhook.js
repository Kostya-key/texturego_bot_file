// api/webhook.js - УЛЬТРА-ПРОСТОЙ ТЕСТ
export default async (req, res) => {
  // Эта строка ОБЯЗАТЕЛЬНО появится в Runtime Logs, если функция вызвана
  console.log('✅ Функция ВЫЗВАНА! Метод запроса:', req.method);
  return res.status(200).send('OK');
};
