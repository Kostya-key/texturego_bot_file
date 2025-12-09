import sharp from "sharp-esm";

export const config = {
  runtime: "nodejs20.x",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Use POST method" });
  }

  let data = req.body;

  // Если req.body строка → парсим
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (e) {
      return res.status(400).json({ ok: false, error: "Invalid JSON" });
    }
  }

  if (!data || !data.imageBase64) {
    return res
      .status(400)
      .json({ ok: false, error: "imageBase64 field is required" });
  }

  try {
    const buffer = Buffer.from(data.imageBase64, "base64");

    const base = await sharp(buffer)
      .resize(2048, 2048, { fit: "cover" })
      .toBuffer();

    const expanded = await sharp(base)
      .extend({
        top: 1024,
        bottom: 1024,
        left: 1024,
        right: 1024,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer();

    const final = await sharp(expanded)
      .extract({ left: 1024, top: 1024, width: 2048, height: 2048 })
      .png()
      .toBuffer();

    return res.status(200).json({
      ok: true,
      result: final.toString("base64")
    });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.toString()
    });
  }
}
