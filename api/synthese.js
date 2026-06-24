export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [{ role: "user", content: "Genere une synthese macro hebdomadaire fictive en francais avec 3 sections: 1) LA GRAVITE MACRO 2) ANALYSE STRUCTURELLE 3) EXECUTION TACTIQUE. Sois concis et percutant." }],
        max_tokens: 800,
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
