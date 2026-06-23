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

function getNet(r) {
  if (!r) return { bias: "—", net: "—", pct: "", color: "#888" };
  const l = parseInt(r.noncomm_positions_long_all || 0);
  const s = parseInt(r.noncomm_positions_short_all || 0);
  const net = l - s;
  const total = l + s;
  const pct = total > 0 ? ((net / total) * 100).toFixed(1) : "0";
  return {
    bias: net > 0 ? "Longs" : "Shorts",
    net: (net > 0 ? "+" : "") + (net / 1000).toFixed(0) + "k",
    pct: (net > 0 ? "+" : "") + pct + "%",
    color: net > 0 ? "#26a69a" : "#ef5350",
  };
}

function CotPage({ onBack }) {
  const [loading, setLoading] = useState(false);
  const [cotData, setCotData] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [activeTab, setActiveTab] = useState("donnees");
  const [synthese, setSynthese] = useState(null);
  const [syntheseLoading, setSyntheseLoading] = useState(false);

  const fetchCot = async () => {
    setLoading(true);
    setError(null);
    try {
      const base = "https://publicreporting.cftc.gov/resource/jun7-fc8e.json";
      const q = (name) =>
        fetch(`${base}?$where=market_and_exchange_names like '%25${encodeURIComponent(name)}%25'&$limit=1&$order=report_date_as_yyyy_mm_dd DESC`)
          .then((r) => r.json())
          .then((d) => d[0]);

      const [eu, jpy, gold, wti, sp, nq, btc] = await Promise.all([
        q("EURO FX"), q("JAPANESE YEN"), q("GOLD"), q("CRUDE OIL"),
        q("E-MINI S&P 500"), q("E-MINI NASDAQ"), q("BITCOIN"),
      ]);

      const euD = getNet(eu);
      const jpyD = getNet(jpy);
      const goldD = getNet(gold);
      const wtiD = getNet(wti);
      const spD = getNet(sp);
      const nqD = getNet(nq);
      const btcD = getNet(btc);

      const reportDate = eu?.report_date_as_yyyy_mm_dd;
      const dateStr = reportDate
        ? new Date(reportDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
        : "—";

      const data = {
        date: "Semaine du " + dateStr,
        raw: { eu, jpy, gold, wti, sp, nq, btc },
        blocs: [
          {
            id: "macro", icon: "🏛️", title: "Macro & Devises",
            badge: euD.bias === "Longs" ? "RISK-ON" : "RISK-OFF",
            badgeColor: euD.bias === "Longs" ? "#26a69a" : "#ef5350",
            rows: [
              { label: "EUR/USD (Non-comm)", value: euD.bias, change: euD.pct, color: euD.color },
              { label: "JPY/USD (Non-comm)", value: jpyD.bias, change: jpyD.pct, color: jpyD.color },
              { label: "Or (Non-comm)", value: goldD.bias, change: goldD.pct, color: goldD.color },
            ],
            note: euD.bias === "Longs" ? "Flux vers les devises risquees." : "Fuite vers le dollar. Risk-off.",
          },
          {
            id: "indices", icon: "📈", title: "Indices (ES & NQ)",
            badge: spD.bias === "Longs" ? "ACHAT" : "VENTE",
            badgeColor: spD.bias === "Longs" ? "#26a69a" : "#ef5350",
            rows: [
              { label: "S&P 500 (Non-comm)", value: spD.bias, change: spD.pct, color: spD.color },
              { label: "Nasdaq (Non-comm)", value: nqD.bias, change: nqD.pct, color: nqD.color },
            ],
            note: spD.bias === "Longs" ? "Speculateurs long sur les indices US." : "Speculateurs short sur les indices US.",
          },
          {
            id: "commodities", icon: "🛢️", title: "Commodities",
            badge: wtiD.bias === "Longs" ? "HAUSSIER" : "BAISSIER",
            badgeColor: wtiD.bias === "Longs" ? "#26a69a" : "#ef5350",
            rows: [
              { label: "WTI Crude (Non-comm)", value: wtiD.bias, change: wtiD.pct, color: wtiD.color },
              { label: "Or net position", value: goldD.net, change: goldD.pct, color: goldD.color },
            ],
            note: wtiD.bias === "Longs" ? "Speculateurs acheteurs sur le petrole." : "Pression vendeuse sur le petrole.",
          },
          {
            id: "crypto", icon: "₿", title: "Cryptos",
            badge: btcD.bias === "Longs" ? "HAUSSIER" : "BAISSIER",
            badgeColor: btcD.bias === "Longs" ? "#26a69a" : "#ef5350",
            rows: [
              { label: "BTC (Non-comm)", value: btcD.bias, change: btcD.pct, color: btcD.color },
              { label: "BTC net position", value: btcD.net, change: "", color: btcD.color },
            ],
            note: btcD.bias === "Longs" ? "Speculateurs long sur BTC CME." : "Speculateurs short sur BTC CME.",
          },
        ],
      };
      setCotData(data);
      setLastUpdate(new Date().toLocaleTimeString("fr-FR"));
    } catch (e) {
      setError("Erreur : " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSynthese = async () => {
    if (!cotData) return;
    setSyntheseLoading(true);
    try {
      const res = await fetch("/api/synthese", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cotData: cotData.blocs }),
      });
      const data = await res.json();
      setSynthese(data.synthese);
    } catch (e) {
      setSynthese("Erreur lors de la generation de la synthese.");
    } finally {
      setSyntheseLoading(false);
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
          {loading ? "..." : "🔄 Actualiser"}
        </button>
      </div>

      {/* ONGLETS */}
      <div style={cotStyles.tabs}>
        <button
          style={{ ...cotStyles.tab, ...(activeTab === "donnees" ? cotStyles.tabActive : {}) }}
          onClick={() => setActiveTab("donnees")}
        >Donnees COT</button>
        <button
          style={{ ...cotStyles.tab, ...(activeTab === "synthese" ? cotStyles.tabActive : {}) }}
          onClick={() => { setActiveTab("synthese"); if (cotData && !synthese) fetchSynthese(); }}
        >Synthese IA</button>
      </div>

      {!cotData && !loading && !error && (
        <div style={cotStyles.empty}>
          <div style={cotStyles.emptyIcon}>📋</div>
          <div style={cotStyles.emptyTitle}>Rapport COT</div>
          <div style={cotStyles.emptyText}>Donnees CFTC officielles. Publication chaque vendredi.</div>
          <button onClick={fetchCot} style={cotStyles.emptyBtn}>Charger le rapport</button>
        </div>
      )}

      {loading && (
        <div style={cotStyles.empty}>
          <div style={cotStyles.emptyIcon}>⏳</div>
          <div style={cotStyles.emptyTitle}>Chargement...</div>
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

      {cotData && !loading && activeTab === "donnees" && (
        <>
          <div style={cotStyles.grid}>
            {cotData.blocs.map((bloc) => (
              <div key={bloc.id} style={cotStyles.bloc}>
                <div style={cotStyles.blocHeader}>
                  <span style={cotStyles.blocIcon}>{bloc.icon}</span>
                  <span style={cotStyles.blocTitle}>{bloc.title}</span>
                  {bloc.badge && <span style={{ ...cotStyles.badge, background: bloc.badgeColor }}>{bloc.badge}</span>}
                </div>
                <div style={cotStyles.rows}>
                  {bloc.rows.map((row, i) => (
                    <div key={i} style={cotStyles.row}>
                      <span style={cotStyles.rowLabel}>{row.label}</span>
                      <span style={cotStyles.rowRight}>
                        <span style={{ ...cotStyles.rowValue, color: row.color || "#0a0a0a" }}>{row.value}</span>
                        {row.change && <span style={{ ...cotStyles.rowChange, color: row.color || "#888" }}>{row.change}</span>}
                      </span>
                    </div>
                  ))}
                </div>
                {bloc.note && <div style={cotStyles.note}>⚡ {bloc.note}</div>}
              </div>
            ))}
          </div>
          {lastUpdate && <div style={cotStyles.updated}>Mis a jour : {lastUpdate}</div>}
        </>
      )}

      {cotData && !loading && activeTab === "synthese" && (
        <div style={cotStyles.syntheseWrap}>
          {syntheseLoading && (
            <div style={cotStyles.empty}>
              <div style={cotStyles.emptyIcon}>🤖</div>
              <div style={cotStyles.emptyTitle}>Generation en cours...</div>
              <div style={cotStyles.emptyText}>L'IA analyse les donnees COT.</div>
            </div>
          )}
          {!syntheseLoading && !synthese && (
            <div style={cotStyles.empty}>
              <div style={cotStyles.emptyIcon}>🤖</div>
              <div style={cotStyles.emptyTitle}>Synthese IA</div>
              <div style={cotStyles.emptyText}>Charge d'abord les donnees COT puis genere la synthese.</div>
              <button onClick={fetchSynthese} style={cotStyles.emptyBtn}>Generer la synthese</button>
            </div>
          )}
          {!syntheseLoading && synthese && (
            <div style={cotStyles.syntheseCard}>
              <div style={cotStyles.syntheseHeader}>
                <span>🤖 Synthese hebdomadaire</span>
                <button onClick={fetchSynthese} style={cotStyles.regenBtn}>🔄 Regenerer</button>
              </div>
              <div style={cotStyles.syntheseText}>{synthese}</div>
            </div>
          )}
        </div>
      )}

      {!cotData && activeTab === "synthese" && !loading && (
        <div style={cotStyles.empty}>
          <div style={cotStyles.emptyIcon}>📋</div>
          <div style={cotStyles.emptyTitle}>Charge d'abord les donnees</div>
          <div style={cotStyles.emptyText}>Va dans l'onglet Donnees COT et clique sur Actualiser.</div>
        </div>
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
  tabs: { display: "flex", borderBottom: "1px solid #e5e5e5", padding: "0 16px" },
  tab: { background: "none", border: "none", borderBottom: "2px solid transparent", padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#aaa", cursor: "pointer", marginBottom: -1 },
  tabActive: { color: "#0a0a0a", borderBottomColor: "#0a0a0a" },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: 12, textAlign: "center" },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { fontSize: 18, fontWeight: 800, color: "#0a0a0a" },
  emptyText: { fontSize: 13, color: "#aaa", maxWidth: 300, lineHeight: 1.6 },
  emptyBtn: { marginTop: 8, background: "#0a0a0a", color: "#fff", border: "none", borderRadius: 8, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
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
  rowValue: { fontSize: 13, fontWeight: 700 },
  rowChange: { fontSize: 11, fontWeight: 600 },
  note: { marginTop: 12, fontSize: 11, color: "#888", borderTop: "1px solid #f0f0f0", paddingTop: 10, fontStyle: "italic" },
  updated: { textAlign: "center", fontSize: 11, color: "#bbb", padding: "8px" },
  syntheseWrap: { padding: "16px", maxWidth: 800, margin: "0 auto" },
  syntheseCard: { border: "1px solid #e5e5e5", borderRadius: 10, padding: "20px", background: "#fafafa" },
  syntheseHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #f0f0f0", fontSize: 13, fontWeight: 700 },
  regenBtn: { background: "none", border: "1px solid #e5e5e5", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", color: "#0a0a0a" },
  syntheseText: { fontSize: 13, color: "#333", lineHeight: 1.8, whiteSpace: "pre-wrap" },
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
            <div key={ind.id} style={{ ...styles.card, cursor: ind.page ? "pointer" : "default" }} onClick={() => ind.page && setCurrentPage(ind.page)}>
              <div style={styles.cardIcon}>{ind.emoji}</div>
              <div style={styles.cardContent}>
                <div style={styles.cardTitle}>{ind.title}</div>
                <div style={styles.cardSubtitle}>{ind.subtitle}</div>
              </div>
              <div style={styles.cardRight}>
                {ind.page ? <span style={styles.arrow}>›</span> : (
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
              <div style={{ fontSize: 11, fontWeight: 700, color: fngValue <= 40 ? "#ef5350" : fngValue <= 60 ? "#888" : "#26a69a" }}>{getFngLabel(fngValue)}</div>
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
