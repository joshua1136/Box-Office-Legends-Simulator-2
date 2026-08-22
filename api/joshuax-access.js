export const access = "public";
export const methods = ["POST"];

// Server-side developer gate. The value comes from the platform secret store and is never shipped to the browser.
const JOSHUA_CODE = String(process.env.JOSHUA_X_ACCESS_CODE || "").trim();

export default async function (req, res) {
  const code = String(req.body?.code || "").trim();
  if (!JOSHUA_CODE || code !== JOSHUA_CODE) return res.status(403).json({ ok: false, error: "Invalid access code." });
  return res.json({ ok: true, studio: "JoshuaX Studios", developer: true });
}