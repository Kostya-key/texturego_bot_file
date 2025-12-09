import sharp from "sharp";

export default async function handler(req, res) {
  // 1. Только POST
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Use POST method"
    });
  }

  // 2. Проверяем тело запроса
  let data = req.body;

  // В некоторых конфигурациях req.body может быть строкой
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (e) {
      return res.status(400).json({
        ok: false,
        error: "Invalid JSON"
      });
    }
  }

  const { imageBase64 } = data;

  if (!imageBase64) {
    return res.status(400).json({
      ok: false,
      error: "imageBase64 field is required"
    });
  }

  try {
    // 3. Декодирование изображения
    const buffer = Buffer.from(imageBase64, "base64");

    // 4. Ресайз до 2k
    const base = await sharp(buffer)
      .resize(2048, 2048, { fit: "cover" })
      .toBuffer();

    // 5. Расширение канвы для создания тайла
    const tile = await sharp(base)
      .extend({
        top: 1024,
        bottom: 1024,
        left: 1024,
        right: 1024,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer();

    // 6. Вырезаем финальный seamless тайл 2048×2048
    const final = await sharp(tile)
      .extract({ left: 1024, top: 1024, width: 2048, height: 2048 })
      .png()
      .toBuffer();

    return res.status(200).json({
      ok: true,
      result: final.toStri

  } catch (err) {
    res.status(500).send({ ok: false, error: err.toString() });
  }
}
