import { Telegraf } from "telegraf";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply("Отправь фото поверхности, и я сделаю текстуру-тайл 2K PNG.");
});

bot.on("photo", async (ctx) => {
  try {
    const file = await ctx.telegram.getFileLink(
      ctx.message.photo.pop().file_id
    );
    const img = await fetch(file).then((r) => r.arrayBuffer());

    const response = await fetch(process.env.VERCEL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: Buffer.from(img).toString("base64") }),
    }).then((r) => r.json());

    await ctx.replyWithPhoto({ source: Buffer.from(response.result, "base64") });
    ctx.reply("Отправьте следующее фото 🙌");
  } catch (error) {
    ctx.reply("Ошибка обработки. Попробуйте снова.");
  }
});

bot.launch();
