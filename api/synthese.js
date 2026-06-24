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
      if (!r) return { bias: "inconnu", pct: "0%", net: "0k" };
      const l = parseInt(r.noncomm_positions_long_all || 0);
      const s = parseInt(r.noncomm_positions_short_all || 0);
      const net = l - s;
      const total = l + s;
      return {
        bias: net > 0 ? "Long" : "Short",
        pct: total > 0 ? ((net / total) * 100).toFixed(1) + "%" : "0%",
        net: (net > 0 ? "+" : "") + (net / 1000).toFixed(0) + "k contrats"
      };
    };

    const date = eu?.report_date_as_yyyy_mm_dd || "inconnue";
    const euD = getNet(eu);
    const jpyD = getNet(jpy);
    const goldD = getNet(gold);
    const wtiD = getNet(wti);
    const spD = getNet(sp);
    const nqD = getNet(nq);
    const btcD = getNet(btc);

    const prompt = `Tu es un analyste macro expert en Smart Money Concept (SMC). 
Voici les donnees COT officielles de la CFTC pour la semaine du ${date} :

DEVISES :
- EUR/USD : ${euD.bias} (${euD.pct}, ${euD.net})
- JPY/USD : ${jpyD.bias} (${jpyD.pct}, ${jpyD.net})

MATIERES PREMIERES :
- Or : ${goldD.bias} (${goldD.pct}, ${goldD.net})
- WTI Petrole : ${wtiD.bias} (${wtiD.pct}, ${wtiD.net})

INDICES US :
- S&P 500 : ${spD.bias} (${spD.pct}, ${spD.net})
- Nasdaq : ${nqD.bias} (${nqD.pct}, ${nqD.net})

CRYPTO :
- BTC CME : ${btcD.bias} (${btcD.pct}, ${btcD.net})

Sur la base de ces donnees reelles, genere une synthese hebdomadaire professionnelle en francais avec exactement 3 sections :

**LA GRAVITE MACRO**
(analyse du contexte macro global : dollar, taux, risque)

**ANALYSE STRUCTURELLE**
(ce que font les institutionnels sur chaque marche, correlations)

**EXECUTION TACTIQUE**
(biais directionnel clair, actifs a privilegier, risques a surveiller)

Sois concis, percutant, professionnel. Pas de disclaimer. Parle comme un trader institutionnel.`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
      }),
    });

    const data = await groqRes.json();
    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({ error: JSON.stringify(data) });
    }
    res.json({ synthese: data.choices[0].message.content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
