import { useState } from "react";

function getFngEmoji(value) {
  if (value <= 20) return "😱";
  if (value <= 40) return "😰";
  if (value <= 60) return "😐";
  if (value <= 80) return "🥵";
  return "🤑";
}

function getFngLabel(value) {
  if (value <= 20) return "Extreme Fear";
  if (value <= 40) return "Fear";
  if (value <= 60) return "Neutral";
  if (value <= 80) return "Greed";
  return "Extreme Greed";
}

const INDICATORS = [
  { id: 3, emoji: "📋", title: "Rapport COT", subtitle: "Commitment of Traders", noChange: true, page: "cot" },
  { id: 4, emoji: "⚡", title: "GEX", subtitle: "Gamma Exposure", noChange: true },
  { id: 5, emoji: "🏦", title: "ETF BTC / ETH", subtitle: "Flux et encours ETF Spot" },
  { id: 6, emoji: "🔥", title: "Liquidation Heatmap", subtitle: "Niveaux de liquidation", noChange: true },
];

function DeltexLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <rect width="100" height="100" rx="10" fill="#000"/>
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C9A84C"/>
          <stop offset="50%" stopColor="#F0D080"/>
          <stop offset="100%" stopColor="#A07830"/>
        </linearGradient>
      </defs>
      <path d="M22 12 L22 88 L54 88 C78 88 86 70 86 50 C86 30 78 12 54 12 Z" stroke="url(#g)" strokeWidth="6" fill="none"/>
      <line x1="33" y1="7" x2="33" y2="18" stroke="url(#g)" strokeWidth="5" strokeLinecap="round"/>
      <line x1="46" y1="7" x2="46" y2="18" stroke="url(#g)" strokeWidth="5" strokeLinecap="round"/>
      <line x1="33" y1="82" x2="33" y2="93" stroke="url(#g)" strokeWidth="5" strokeLinecap="round"/>
      <line x1="46" y1="82" x2="46" y2="93" stroke="url(#g)" strokeWidth="5" strokeLinecap="round"/>
      <line x1="22" y1="36" x2="35" y2="36" stroke="url(#g)" strokeWidth="1.5" opacity="0.7"/>
      <circle cx="35" cy="36" r="2.5" fill="url(#g)" opacity="0.7"/>
      <line x1="22" y1="48" x2="31" y2="48" stroke="url(#g)" strokeWidth="1.5" opacity="0.7"/>
      <circle cx="31" cy="48" r="2.5" fill="url(#g)" opacity="0.7"/>
      <line x1="22" y1="60" x2="35" y2="60" stroke="url(#g)" strokeWidth="1.5" opacity="0.7"/>
      <circle cx="35" cy="60" r="2.5" fill="url(#g)" opacity="0.7"/>
      <line x1="22" y1="72" x2="29" y2="72" stroke="url(#g)" strokeWidth="1.5" opacity="0.7"/>
      <circle cx="29" cy="72" r="2.5" fill="url(#g)" opacity="0.7"/>
      <line x1="51" y1="26" x2="51" y2="70" stroke="url(#g)" strokeWidth="1.5" opacity="0.8"/>
      <rect x="48" y="36" width="6" height="20" fill="url(#g)" opacity="0.6"/>
      <line x1="62" y1="22" x2="62" y2="66" stroke="url(#g)" strokeWidth="1.5" opacity="0.8"/>
      <rect x="59" y="30" width="6" height="24" fill="url(#g)" opacity="0.9"/>
      <line x1="73" y1="18" x2="73" y2="60" stroke="url(#g)" strokeWidth="1.5" opacity="0.8"/>
      <rect x="70" y="25" width="6" height="22" fill="url(#g)" opacity="0.9"/>
    </svg>
  );
}

function CotPage({ onBack }) {
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [cotData, setCotData] = useState(null);
  const [error, setError] = useState(null);

  const fetchCot = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{
            role: "user",
            content: `Tu es un analyste COT expert. Cherche les dernières données du rapport COT (Commitment of Traders) de la CFTC publiées cette semaine.

Retourne UNIQUEMENT un JSON valide avec cette structure exacte, sans texte avant ou après :
{
  "date": "date de publication",
  "blocs": [
    {
      "id": "macro",
      "icon": "🏛️",
      "title": "Macro & Devises",
      "badge": "sentiment global ex: RISK-ON ou RISK-OFF",
      "badgeColor": "#26a69a ou #ef5350",
      "rows": [
        { "label": "TAUX US10Y", "value": "ex: 4.32%", "change": "ex: -0.18%" },
        { "label": "EUR/USD (Smart Money)", "value": "ex: Shorts", "change": "ex: +5.9%" },
        { "label": "JPY/USD (Leveraged)", "value": "ex: Longs", "change": "ex: -12%" }
      ],
      "note": "une phrase de synthese sur la macro"
    },
    {
      "id": "indices",
      "icon": "📈",
      "title": "Indices (ES & NQ)",
      "badge": "sentiment",
      "badgeColor": "#26a69a ou #ef5350",
      "rows": [
        { "label": "S&P 500 (Asset Managers)", "value": "ex: Longs", "change": "ex: +1.7%" },
        { "label": "Nasdaq (Asset Managers)", "value": "ex: Longs", "change": "ex: +3.8%" },
        { "label": "Nasdaq (Leveraged)", "value": "ex: Shorts", "change": "ex: -15.2%" }
      ],
      "note": "une phrase de synthese sur les indices"
    },
    {
      "id": "commodities",
      "icon": "🛢️",
      "title": "Commodities",
      "badge": "sentiment",
      "badgeColor": "#26a69a ou #ef5350",
      "rows": [
        { "label": "WTI (Producteurs)", "value": "ex: Shorts", "change": "ex: +6.4%" },
        { "label": "Or (Managed Money)", "value": "ex: Longs", "change": "ex: +3.9%" },
        { "label": "Or (Open Interest)", "value": "ex: 550k", "change": "ex: Stable" }
      ],
      "note": "une phrase de synthese sur les commodities"
    },
    {
      "id": "crypto",
      "icon": "₿",
      "title": "Cryptos",
      "badge": "sentiment",
      "badgeColor": "#26a69a ou #ef5350",
      "rows": [
        { "label": "BTC (Leveraged Longs)", "value": "ex: Fuite", "change": "ex: -21.4%" },
        { "label": "ETH (Asset Managers)", "value": "ex: Longs", "change": "ex: -1.6%" },
        { "label": "Flux ETF Spot", "value": "ex: Anemiques", "change": "" }
      ],
      "note": "une phrase de synthese sur les cryptos"
    }
  ],
  "synthese": "Une phrase de synthese globale du marche cette semaine"
}`
          }]
        })
      });

      const data = await response.json();
      const textBlock = data.content?.find(b => b.type === "text");
      if (!textBlock) throw new Error("Pas de reponse");

      const clean = textBlock.text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setCotData(parsed);
      setLastUpdate(new Date().toLocaleTimeString("fr-FR"));
    } catch (e) {
      setError("Erreur lors de la recuperation des donnees. Reessaie dans quelques instants.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={cotStyles.root}>
      <div style={cotStyles.topBar}>
        <button onClick={onBack} style={cotStyles.backBtn}>← Retour</button>
        <div style={cotStyles.topCenter}>
          <div style={cotStyles.eyebrow}>Synthese Executive COT</div>
          <div style={cotStyles.pageTitle}>Rapport COT</div>
          {cotData && <div style={cotStyles.date}>{cotData.date}</div>}
        </div>
        <button onClick={fetchCot} style={{ ...cotStyles.updateBtn, opacity: loading ? 0.6 : 1 }} disabled={loading}>
          {loading ? "Chargement..." : "🔄 Actualiser"}
        </button>
      </div>

      {!cotData && !loading && !error && (
        <div style={cotStyles.empty}>
          <div style={cotStyles.emptyIcon}>📋</div>
          <div style={cotStyles.emptyTitle}>Rapport COT</div>
          <div style={cotStyles.emptyText}>Clique sur Actualiser pour charger les dernieres donnees CFTC.</div>
          <button onClick={fetchCot} style={cotStyles.emptyBtn}>Charger le rapport</button>
        </div>
      )}

      {loading && (
        <div style={cotStyles.empty}>
          <div style={cotStyles.emptyIcon}>⏳</div>
          <div style={cotStyles.emptyTitle}>Analyse en cours...</div>
          <div style={cotStyles.emptyText}>Recuperation et analyse des donnees CFTC.</div>
        </div>
      )}

      {error && (
        <div style={cotStyles.empty}>
          <div style={cotStyles.emptyIcon}>⚠️</div>
          <div style={cotStyles.emptyTitle}>Erreur</div>
          <div style={cotStyles.emptyText}>{error}</div>
          <button onClick={fetchCot} style={cotStyles.emptyBtn}>Reessayer</button>
        </div>
      )}

      {cotData && !loading && (
        <>
          {cotData.synthese && (
            <div style={cotStyles.synthese}>
              <span style={cotStyles.syntheseLabel}>Synthese</span>
              <span style={cotStyles.syntheseText}>{cotData.synthese}</span>
            </div>
          )}
          <div style={cotStyles.grid}>
            {cotData.blocs.map((bloc) => (
              <div key={bloc.id} style={cotStyles.bloc}>
                <div style={cotStyles.blocHeader}>
                  <span style={cotStyles.blocIcon}>{bloc.icon}</span>
                  <span style={cotStyles.blocTitle}>{bloc.title}</span>
                  {bloc.badge && (
                    <span style={{ ...cotStyles.badge, background: bloc.badgeColor }}>
                      {bloc.badge}
                    </span>
                  )}
                </div>
                <div style={cotStyles.rows}>
                  {bloc.rows.map((row, i) => (
                    <div key={i} style={cotStyles.row}>
                      <span style={cotStyles.rowLabel}>{row.label}</span>
                      <span style={cotStyles.rowRight}>
                        <span style={cotStyles.rowValue}>{row.value || "—"}</span>
                        {row.change && (
                          <span style={{ ...cotStyles.rowChange, color: row.change.startsWith("-") ? "#ef5350" : "#26a69a" }}>
                            {row.change}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                {bloc.note && <div style={cotStyles.note}>⚡ {bloc.note}</div>}
              </div>
            ))}
          </div>
          {lastUpdate && <div style={cotStyles.updated}>Derniere mise a jour : {lastUpdate}</div>}
        </>
      )}

      <div style={cotStyles.footer}>
        <span style={cotStyles.footerQuote}>Coupez le bruit. Lisez les flux. Protegez votre capital.</span>
        <span style={cotStyles.footerBrand}>DELTEX</span>
      </div>
    </div>
  );
}

const cotStyles = {
  root: { background: "#fff", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", color: "#0a0a0a" },
  topBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #e5e5e5", position: "sticky", top: 0, background: "#fff", zIndex: 10 },
  backBtn: { background: "none", border: "1px solid #e5e5e5", borderRadius: 6, padding: "6px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#0a0a0a" },
  topCenter: { textAlign: "center", flex: 1 },
  eyebrow: { fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#aaa", textTransform: "uppercase", marginBottom: 4 },
  pageTitle: { fontSize: 20, fontWeight: 900, color: "#0a0a0a" },
  date: { fontSize: 11, color: "#aaa", marginTop: 2 },
  updateBtn: { fontSize: 12, fontWeight: 700, border: "1px solid #0a0a0a", borderRadius: 6, padding: "7px 14px", cursor: "pointer", background: "#0a0a0a", color: "#fff" },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: 12, textAlign: "center" },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { fontSize: 18, fontWeight: 800, color: "#0a0a0a" },
  emptyText: { fontSize: 13, color: "#aaa", maxWidth: 300, lineHeight: 1.6 },
  emptyBtn: { marginTop: 8, background: "#0a0a0a", color: "#fff", border: "none", borderRadius: 8, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  synthese: { display: "flex", gap: 10, alignItems: "flex-start", padding: "14px 20px", background: "#f9f9f9", borderBottom: "1px solid #e5e5e5" },
  syntheseLabel: { fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "#aaa", textTransform: "uppercase", whiteSpace: "nowrap", paddingTop: 2 },
  syntheseText: { fontSize: 13, color: "#444", lineHeight: 1.5, fontStyle: "italic" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "16px", maxWidth: 800, margin: "0 auto" },
  bloc: { border: "1px solid #e5e5e5", borderRadius: 10, padding: "16px", background: "#fafafa" },
  blocHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #f0f0f0" },
  blocIcon: { fontSize: 16 },
  blocTitle: { fontSize: 12, fontWeight: 800, color: "#0a0a0a", flex: 1, textTransform: "uppercase", letterSpacing: "0.04em" },
  badge: { fontSize: 9, fontWeight: 800, color: "#fff", borderRadius: 3, padding: "2px 6px", letterSpacing: "0.06em" },
  rows: { display: "flex", flexDirection: "column", gap: 10 },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  rowLabel: { fontSize: 11, color: "#888", fontWeight: 500 },
  rowRight: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 },
  rowValue: { fontSize: 13, fontWeight: 700, color: "#0a0a0a" },
  rowChange: { fontSize: 11, fontWeight: 600 },
  note: { marginTop: 12, fontSize: 11, color: "#888", borderTop: "1px solid #f0f0f0", paddingTop: 10, fontStyle: "italic" },
  updated: { textAlign: "center", fontSize: 11, color: "#bbb", padding: "8px", marginTop: 4 },
  footer: { borderTop: "1px solid #e5e5e5", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 },
  footerQuote: { fontSize: 11, color: "#bbb", fontStyle: "italic" },
  footerBrand: { fontSize: 12, fontWeight: 900, letterSpacing: "0.16em", color: "#0a0a0a" },
};

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [fngValue, setFngValue] = useState(50);

  if (currentPage === "cot") return <CotPage onBack={() => setCurrentPage("home")} />;

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <div style={styles.logoWrap}>
          <DeltexLogo size={38} />
          <span style={styles.logoText}>DELTEX</span>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.cardList}>
          {INDICATORS.map((ind) => (
            <div
              key={ind.id}
              style={{ ...styles.card, cursor: ind.page ? "pointer" : "default" }}
              onClick={() => ind.page && setCurrentPage(ind.page)}
            >
              <div style={styles.cardIcon}>{ind.emoji}</div>
              <div style={styles.cardContent}>
                <div style={styles.cardTitle}>{ind.title}</div>
                <div style={styles.cardSubtitle}>{ind.subtitle}</div>
              </div>
              <div style={styles.cardRight}>
                {ind.page ? (
                  <span style={styles.arrow}>›</span>
                ) : (
                  <>
                    <div style={styles.cardValue}><span style={styles.empty}>--</span></div>
                    {!ind.noChange && <div style={styles.cardChange}><span style={styles.emptyChange}>+0.00%</span></div>}
                  </>
                )}
              </div>
            </div>
          ))}

          <div style={styles.card}>
            <div style={styles.cardIcon}>{getFngEmoji(fngValue)}</div>
            <div style={styles.cardContent}>
              <div style={styles.cardTitle}>Fear & Greed Index</div>
              <div style={styles.cardSubtitle}>Sentiment du marche</div>
            </div>
            <div style={styles.cardRight}>
              <div style={styles.cardValue}>{fngValue}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: fngValue <= 40 ? "#ef5350" : fngValue <= 60 ? "#888" : "#26a69a" }}>
                {getFngLabel(fngValue)}
              </div>
            </div>
          </div>

          <div style={styles.sliderWrap}>
            <span style={styles.sliderLabel}>Demo F&G :</span>
            <input type="range" min="0" max="100" value={fngValue} onChange={(e) => setFngValue(Number(e.target.value))} style={styles.slider} />
            <span style={styles.sliderVal}>{fngValue}</span>
          </div>
        </div>
      </main>

      <footer style={styles.footer}>
        <span style={styles.footerLogo}>DELTEX</span>
        <span style={styles.footerText}>2026 - Pas de conseil en investissement.</span>
      </footer>
    </div>
  );
}

const styles = {
  root: { background: "#ffffff", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", color: "#0a0a0a" },
  header: { display: "flex", alignItems: "center", padding: "0 24px", height: 64, borderBottom: "1px solid #1a1a1a", background: "#000000", position: "sticky", top: 0, zIndex: 10 },
  logoWrap: { display: "flex", alignItems: "center", gap: 10 },
  logoText: { fontSize: 15, fontWeight: 900, letterSpacing: "0.18em", color: "#ffffff" },
  main: { padding: "20px 16px", maxWidth: 680, margin: "0 auto" },
  cardList: { display: "flex", flexDirection: "column", gap: 10 },
  card: { display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", border: "1px solid #e5e5e5", borderRadius: 8, background: "#fafafa" },
  cardIcon: { width: 36, height: 36, borderRadius: "50%", background: "#f0f0f0", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 },
  cardContent: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 14, fontWeight: 700, color: "#0a0a0a", marginBottom: 3 },
  cardSubtitle: { fontSize: 11, color: "#aaa" },
  cardRight: { textAlign: "right", flexShrink: 0 },
  cardValue: { fontSize: 15, fontWeight: 800, color: "#0a0a0a", marginBottom: 3 },
  cardChange: { fontSize: 11, fontWeight: 600 },
  arrow: { fontSize: 22, color: "#ccc", fontWeight: 300 },
  empty: { color: "#ccc", fontWeight: 400, fontSize: 13 },
  emptyChange: { color: "#ddd", fontWeight: 500, fontSize: 11 },
  sliderWrap: { display: "flex", alignItems: "center", gap: 10, padding: "8px 18px", background: "#f5f5f5", borderRadius: 8, border: "1px solid #e5e5e5" },
  sliderLabel: { fontSize: 11, color: "#aaa", whiteSpace: "nowrap" },
  slider: { flex: 1, cursor: "pointer" },
  sliderVal: { fontSize: 12, fontWeight: 700, color: "#0a0a0a", minWidth: 24, textAlign: "right" },
  footer: { borderTop: "1px solid #e5e5e5", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 40 },
  footerLogo: { fontSize: 12, fontWeight: 900, letterSpacing: "0.16em", color: "#0a0a0a" },
  footerText: { fontSize: 11, color: "#bbb" },
};
