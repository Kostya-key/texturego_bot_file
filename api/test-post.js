// api/test-post.js
export default async function handler(req, res) {
  // Логируем ВСЁ
  console.log('✅ [TEST-POST] Функция вызвана! Метод:', req.method);
  
  // Просто отвечаем на любой запрос
  return res.status(200).json({ 
    message: 'TEST OK', 
    method: req.method,
    body: req.body // Посмотрим, что приходит
  });
}
