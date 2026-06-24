export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const { symbol = "SPY" } = req.query;
  try {
    const [gexRes, levelsRes] = await Promise.all([
      fetch(`https://lab.flashalpha.com/v1/exposure/gex/${symbol}`, {
        headers: { "X-Api-Key": process.env.FLASHALPHA_API_KEY },
      }),
      fetch(`https://lab.flashalpha.com/v1/exposure/levels/${symbol}`, {
        headers: { "X-Api-Key": process.env.FLASHALPHA_API_KEY },
      }),
    ]);

    const gex = await gexRes.json();
    const levels = await levelsRes.json();

    res.json({
      symbol,
      net_gex: gex.net_gex,
      net_gex_label: gex.net_gex_label,
      gamma_flip: levels.gamma_flip,
      call_wall: levels.call_wall,
      put_wall: levels.put_wall,
      as_of: gex.as_of,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
