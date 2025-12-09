import type { VercelRequest, VercelResponse } from "vercel";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const VERIFY = process.env.META_VERIFY_TOKEN || "";

  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === VERIFY) return res.status(200).send(challenge);
    return res.status(403).send("Forbidden");
  }

  if (req.method === "POST") {
    // TODO: لاحقًا نحلّل الرسالة ونرد
    return res.status(200).send("OK");
  }

  return res.status(405).send("Method Not Allowed");
}
