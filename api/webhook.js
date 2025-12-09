const PAGE_TOKEN = process.env.PAGE_ACCESS_TOKEN || "";
const VERIFY = process.env.META_VERIFY_TOKEN || "";

async function sendText(id, text) {
  await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${PAGE_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "instagram",
      recipient: { id },
      message: { text },
      messaging_type: "RESPONSE"
    })
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
      console.log("RAW_BODY", JSON.stringify(req.body)); // لوق تشخيصي

      const entries = Array.isArray(req.body?.entry) ? req.body.entry : [];
      for (const e of entries) {
        // IG يرسل داخل changes
        const changes = Array.isArray(e?.changes) ? e.changes : [];
        for (const c of changes) {
          const v = c?.value || {};
          const from = v?.from?.id || v?.sender?.id || v?.contact?.id;
          const text = v?.message?.text || v?.messages?.[0]?.text || v?.message;
          if (from && text) {
            await sendText(from, "مرحبًا! نجهّز ملفات الفيزا (سياحة/دراسة/أعمال). ما النوع والدولة؟");
          }
        }
        // احتياط: لو جاء بصيغة Messenger التقليدية
        const msgs = Array.isArray(e?.messaging) ? e.messaging : [];
        for (const m of msgs) {
          const from = m?.sender?.id;
          const text = m?.message?.text;
          if (from && text) {
            await sendText(from, "مرحبًا! نجهّز ملفات الفيزا (سياحة/دراسة/أعمال). ما النوع والدولة؟");
          }
        }
      }
    } catch (err) { console.log("ERR", err); }
    return res.status(200).send("OK");
  }

  return res.status(405).send("Method Not Allowed");
}
