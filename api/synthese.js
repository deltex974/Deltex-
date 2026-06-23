export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const { cotData } = req.body || {};
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{
          role: "user",
          content: `Tu es un analyste macro expert en Smart Money. Voici les donnees COT de la semaine : ${JSON.stringify(cotData)}. Genere une synthese hebdomadaire en francais avec 3 sections : 1) La Gravite Macro, 2) Analyse Structurelle, 3) Execution Tactique. Sois concis et percutant.`
        }],
        max_tokens: 800,
      }),
    });
    const data = await response.json();
    res.json({ synthese: data.choices[0].message.content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
