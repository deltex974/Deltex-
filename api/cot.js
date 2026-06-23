export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const base = "https://publicreporting.cftc.gov/resource/jun7-fc8e.json";
  const q = (name) =>
    fetch(`${base}?$where=market_and_exchange_names like '%25${name}%25'&$limit=1&$order=report_date_as_yyyy_mm_dd DESC`)
      .then((r) => r.json())
      .then((d) => d[0]);
  try {
    const [eu, jpy, gold, wti, sp, nq, btc] = await Promise.all([
      q("EURO FX"), q("JAPANESE YEN"), q("GOLD"), q("CRUDE OIL"),
      q("E-MINI S%26P 500"), q("E-MINI NASDAQ"), q("BITCOIN"),
    ]);
    res.json({ eu, jpy, gold, wti, sp, nq, btc });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
