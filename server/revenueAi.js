export function revenueAiMiddleware(env, request = fetch) {
  let busy = false;
  let lastRequest = 0;
  return async (req, res, next) => {
    if (req.url?.split("?")[0] !== "/api/revenue-analysis") return next();
    const send = (status, body) => {
      res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      res.end(JSON.stringify(body));
    };
    const configured = Boolean(env.OPENAI_API_KEY && env.OPENAI_MODEL);
    if (req.method === "GET") return send(200, { configured });
    if (req.method !== "POST") return send(405, { error: "Bu usul qo‘llab-quvvatlanmaydi." });
    // This local endpoint has no public authentication; reject cross-site callers.
    const origin = req.headers.origin;
    if (origin !== `http://${req.headers.host}` && origin !== `https://${req.headers.host}`) return send(403, { error: "So‘rov manbasi ruxsat etilmagan." });
    if (!configured) return send(503, { error: "OpenAI kaliti va modeli serverda sozlanmagan." });
    if (busy || Date.now() - lastRequest < 10000) return send(429, { error: "Bir oz kutib, qayta urinib ko‘ring." });
    try {
      let body = "";
      for await (const chunk of req) {
        body += chunk;
        if (Buffer.byteLength(body) > 32000) return send(413, { error: "Ma’lumot hajmi juda katta." });
      }
      let data;
      try { data = JSON.parse(body); } catch { return send(400, { error: "Noto‘g‘ri so‘rov." }); }
      if (!Array.isArray(data.buckets) || data.buckets.length < 1 || data.buckets.length > 366 ||
          data.buckets.some((item) => !Number.isFinite(item.time) || !Number.isFinite(item.value) || item.value < 0) ||
          !Number.isInteger(data.saleCount) || data.saleCount < 1 ||
          !["Kunlik", "Haftalik", "Oylik", "6 oylik", "1 yillik"].includes(data.period)) {
        return send(400, { error: "Tahlil uchun haqiqiy sotuv ma’lumotlari kerak." });
      }
      busy = true;
      lastRequest = Date.now();
      const response = await request("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(30000),
        body: JSON.stringify({
          model: env.OPENAI_MODEL, store: false, max_output_tokens: 700,
          instructions: "Siz daromad tahlilchisisiz. Faqat yuborilgan sotuv tushumlarini o‘zbek tilida 2-3 qisqa gapda tahlil qiling. Valyuta UZS, vaqt Asia/Tashkent. Asosiy o‘zgarish va bitta amaliy tavsiya bering. Xarajat, sof foyda yoki oldingi davr haqida ma’lumot yo‘q: ularni o‘ylab topmang. Ma’lumot yetmasa ayting. Markdown ishlatmang.",
          input: JSON.stringify({ period: data.period, saleCount: data.saleCount, buckets: data.buckets.map(({ time, value }) => ({ time, value })) }),
        }),
      });
      if (!response.ok) return send(502, { error: response.status === 429 ? "OpenAI limiti tugagan. Keyinroq urinib ko‘ring." : "OpenAI so‘rovi bajarilmadi. Serverdagi model va kalitni tekshiring." });
      const result = await response.json();
      const analysis = (result.output ?? []).filter((item) => item.type === "message")
        .flatMap((item) => item.content ?? []).filter((item) => item.type === "output_text")
        .map((item) => item.text).join("\n");
      if (!analysis.trim()) return send(502, { error: "AI matnli javob qaytarmadi. Qayta urinib ko‘ring." });
      send(200, { analysis });
    } catch {
      send(502, { error: "AI xizmatiga ulanishda xato. Qayta urinib ko‘ring." });
    } finally {
      busy = false;
    }
  };
}
