const PAGE_TOKEN = process.env.PAGE_ACCESS_TOKEN || "";
const VERIFY = process.env.META_VERIFY_TOKEN || "";

async function sendText(id, text) {
  await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipient: { id }, message: { text } })
  });
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { ["hub.mode"]: mode, ["hub.verify_token"]: token, ["hub.challenge"]: ch } = req.query;
    if (mode === "subscribe" && token === VERIFY) return res.status(200).send(ch);
    return res.status(403).send("Forbidden");
  }

  if (req.method === "POST") {
    try {
      const entries = req.body?.entry || [];
      for (const e of entries) {
        const msgs = e.messaging || e.changes?.[0]?.value?.messaging || [];
        for (const m of msgs) {
          const sender = m.sender?.id;
          const text = m.message?.text || "";
          if (sender && m.message) {
            await sendText(sender, "مرحبًا! نجهّز ملفات الفيزا (سياحة/دراسة/أعمال). ما النوع والدولة؟");
          }
        }
      }
    } catch (err) { console.log("ERR", err); }
    return res.status(200).send("OK");
  }

  return res.status(405).send("Method Not Allowed");
}
export default async function handler(req, res) {
  const VERIFY = process.env.META_VERIFY_TOKEN || "";

  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    console.log("VERIFY_SET:", !!VERIFY, {
      mode,
      token_len: (token || "").length,
      verify_len: VERIFY.length,
      match: token === VERIFY
    });

    if (mode === "subscribe" && token === VERIFY) return res.status(200).send(challenge);
    return res.status(403).send("Forbidden");
  }

  if (req.method === "POST") return res.status(200).send("OK");
  return res.status(405).send("Method Not Allowed");
}
