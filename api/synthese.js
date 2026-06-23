export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const base = "https://publicreporting.cftc.gov/resource/jun7-fc8e.json";
    const q = (name) =>
      fetch(`${base}?$where=market_and_exchange_names like '%25${name}%25'&$limit=1&$order=report_date_as_yyyy_mm_dd DESC`)
        .then(r => r.json()).then(d => d[0]);

    const [eu, jpy, gold, wti, sp, nq, btc] = await Promise.all([
      q("EURO FX"), q("JAPANESE YEN"), q("GOLD"), q("CRUDE OIL"),
      q("E-MINI S%26P 500"), q("E-MINI NASDAQ"), q("BITCOIN"),
    ]);

    const getNet = (r) => {
      if (!r) return { bias: "inconnu", pct: "0%" };
      const l = parseInt(r.noncomm_positions_long_all || 0);
      const s = parseInt(r.noncomm_positions_short_all || 0);
      const net = l - s;
      const total = l + s;
      return { bias: net > 0 ? "Long" : "Short", pct: total > 0 ? ((net/total)*100).toFixed(1)+"%" : "0%" };
    };

    const context = `EUR/USD: ${getNet(eu).bias} (${getNet(eu).pct}), JPY/USD: ${getNet(jpy).bias} (${getNet(jpy).pct}), Or: ${getNet(gold).bias} (${getNet(gold).pct}), WTI: ${getNet(wti).bias} (${getNet(wti).pct}), SP500: ${getNet(sp).bias} (${getNet(sp).pct}), Nasdaq: ${getNet(nq).bias} (${getNet(nq).pct}), BTC: ${getNet(btc).bias} (${getNet(btc).pct})`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: `Tu es un analyste macro expert. Voici les positions COT: ${context}. Genere une synthese en francais avec 3 sections: 1) LA GRAVITE MACRO 2) ANALYSE STRUCTURELLE 3) EXECUTION TACTIQUE. Sois concis et percutant.` }],
        max_tokens: 800,
      }),
    });

    const groqData = await groqRes.json();
    
    if (!groqData.choices || !groqData.choices[0]) {
      return res.status(500).json({ error: JSON.stringify(groqData) });
    }

    res.json({ synthese: groqData.choices[0].message.content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
