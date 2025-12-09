import fetch from "node-fetch";
import { config } from "dotenv";

config(); // если используешь .env

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Use POST method" });
  }

  const update = req.body;

  // Проверяем наличие сообщения
  if (!update.message) {
    return res.status(200).json({ ok: true });
  }

  const chat_id = update.message.chat.id;
  const text = update.message.text;

  try {
    // Обработка команды /start
    if (text === "/start") {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id,
          text: "Привет! Пришли мне фото, и я сделаю тайл 2K."
        })
      });
    }

    // Здесь позже можно обработать фото и вызвать generate.js

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.toString() });
  }
}
