import fetch from "node-fetch";
import { config } from "dotenv";
import generateHandler from "./generate.js"; // твоя функция generate.js

config(); // чтобы использовать переменные окружения на локали

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Use POST method" });
  }

  let update = req.body;

  // Если body приходит как текст, парсим JSON
  if (typeof update === "string") {
    try {
      update = JSON.parse(update);
    } catch (e) {
      return res.status(400).json({ ok: false, error: "Invalid JSON" });
    }
  }

  // Проверяем наличие сообщения
  if (!update.message) return res.status(200).json({ ok: true });

  const chat_id = update.message.chat.id;
  const text = update.message.text;

  try {
    // --- Обработка команды /start ---
    if (text === "/start") {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id,
          text: "Привет! Пришли мне фото, и я сделаю тайл 2K."
        })
      });
      return res.status(200).json({ ok: true });
    }

    // --- Обработка фото ---
    if (update.message.photo && update.message.photo.length > 0) {
      // Берём самое большое фото
      const file_id = update.message.photo[update.message.photo.length - 1].file_id;

      // Получаем ссылку на файл через Telegram API
      const fileRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${file_id}`);
      const fileData = await fileRes.json();
      const file_path = fileData.result.file_path;

      const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${file_path}`;
      const imageResp = await fetch(fileUrl);
      const arrayBuffer = await imageResp.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);

      // Генерируем тайл через generate.js
      const fakeReq = { body: JSON.stringify({ imageBase64: imageBuffer.toString("base64") }) };
      const fakeRes = {
        status: (code) => ({ send: (data) => data, json: (data) => data }),
      };

      const result = await generateHandler(fakeReq, fakeRes);
      const base64Result = result.result || result;

      // Отправляем обратно пользователю
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id,
          photo: `data:image/png;base64,${base64Result}`
        })
      });

      return res.status(200).json({ ok: true });
    }

    // --- Неизвестное сообщение ---
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id,
        text: "Отправь /start или фото для генерации тайла."
      })
    });

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.toString() });
  }
}

