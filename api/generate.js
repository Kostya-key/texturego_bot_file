import sharp from "sharp";

export default async function handler(req, res) {
  try {
    const { imageBase64 } = JSON.parse(req.body);
    const buffer = Buffer.from(imageBase64, "base64");

    let base = await sharp(buffer)
      .resize(2048, 2048, { fit: "cover" })
      .toBuffer();

    const tile = await sharp(base)
      .extend({
        top: 1024,
        bottom: 1024,
        left: 1024,
        right: 1024,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer();

    const final = await sharp(tile)
      .extract({ left: 1024, top: 1024, width: 2048, height: 2048 })
      .png()
      .toBuffer();

    res.status(200).send({ ok: true, result: final.toString("base64") });
  } catch (err) {
    res.status(500).send({ ok: false, error: err.toString() });
  }
}
