import React from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = (import.meta.env.VITE_API_URL || "https://ltg-backend.onrender.com").replace(/\/+$/, "");

/** Utility: safely get tournament id/slug */
function tidOf(t) {
  return t?.id || t?.slug || "";
}

export default function HomePage() {
  const nav = useNavigate();
  const [id, setId] = React.useState("demo");
  const [list, setList] = React.useState([]);
  const [featured, setFeatured] = React.useState(null);
  const [err, setErr] = React.useState("");

  // Load tournaments if your backend exposes /api/tournaments.
  // If it doesn't, we’ll still show the manual entry + demo quick-pick.
  React.useEffect(() => {
    const url = `${API_BASE}/api/tournaments`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data?.tournaments) && data.tournaments.length) {
          setList(data.tournaments);

          // Simple featured: pick the first or the one with a 'featured' flag
          const f =
            data.tournaments.find((t) => t.featured) || data.tournaments[0];
          setFeatured(f);
        } else {
          // fallback featured example
          setFeatured({
            id: "demo",
            name: "Demo Event",
            tour: "PGA",
            date: "This Week",
            field_strength: 72,
          });
        }
      })
      .catch(() => {
        // Offline/demo fallback
        setFeatured({
          id: "demo",
          name: "Demo Event",
          tour: "PGA",
          date: "This Week",
          field_strength: 72,
        });
      });
  }, []);

  function go(e) {
    e.preventDefault();
    const val = id.trim();
    if (!val) return setErr("Enter a tournament ID");
    nav(`/research/${encodeURIComponent(val)}`);
  }

  return (
    <div style={styles.wrap}>
      <header style={styles.header}>
        <h1 style={styles.title}>🏌️‍♂️ The Lumber Yard</h1>
        <div style={styles.subtitle}>Pick a tournament to research.</div>
      </header>

      {/* Featured Tournament */}
      {featured && (
        <button
          className="tourney-card featured"
          style={styles.featuredCard}
          onClick={() => nav(`/research/${encodeURIComponent(tidOf(featured))}`)}
        >
          <div style={styles.featuredLeft}>
            <div style={styles.badge}>{featured.tour || "PGA"}</div>
            <h2 style={styles.featuredTitle}>
              {featured.name || "Featured Tournament"}
            </h2>
            <div style={styles.featuredMeta}>
              <span>{featured.date || "Soon"}</span>
              {featured.field_strength != null && (
                <>
                  <span style={styles.dot}>•</span>
                  <span>Field {featured.field_strength}</span>
                </>
              )}
            </div>
          </div>
          <div style={styles.featuredRight}>
            <div style={styles.cta}>Open Research →</div>
          </div>
        </button>
      )}

      {/* Manual picker */}
      <form onSubmit={go} style={styles.form}>
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="e.g. demo or 2025-pebble-beach"
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Open</button>
      </form>
      {err && <div style={styles.error}>{err}</div>}

      {/* Quick-picks */}
      <div style={styles.quickRow}>
        <Quick id="demo" onPick={setId} />
      </div>

      {/* Cards grid (if list exists) */}
      {!!list.length && (
        <>
          <h3 style={styles.sectionTitle}>All Tournaments</h3>
          <div style={styles.cardGrid}>
            {list.map((t) => {
              const id = tidOf(t);
              const title = t.name || t.title || id;
              return (
                <div
                  key={id}
                  className="tourney-card"
                  onClick={() => nav(`/research/${encodeURIComponent(id)}`)}
                  style={styles.card}
                >
                  <div style={styles.cardHeader}>
                    <div style={styles.cardTitle}>{title}</div>
                    {t.tour && <div style={styles.badge}>{t.tour}</div>}
                  </div>
                  {t.date && <div style={styles.cardDate}>{t.date}</div>}
                  {t.field_strength != null && (
                    <div style={styles.cardMetric}>Field: {t.field_strength}</div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function Quick({ id, onPick }) {
  return (
    <button
      type="button"
      onClick={() => onPick(id)}
      className="tourney-chip"
      style={styles.quickButton}
    >
      {id}
    </button>
  );
}

const styles = {
  wrap: { fontFamily: "system-ui, sans-serif", padding: 24, maxWidth: 1060, margin: "0 auto" },
  header: { marginBottom: 8 },
  title: { fontSize: 32, fontWeight: 800, margin: 0 },
  subtitle: { color: "#555", marginTop: 6, marginBottom: 16, fontSize: 16 },

  // Featured
  featuredCard: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "center",
    padding: 22,
    margin: "10px 0 22px",
    borderRadius: 18,
    border: "1px solid #ececec",
    background:
      "linear-gradient(135deg, rgba(48,48,48,1) 0%, rgba(20,20,20,1) 100%)",
    color: "white",
    textAlign: "left",
  },
  featuredLeft: {},
  featuredTitle: { margin: "6px 0 2px", fontSize: 26, fontWeight: 800 },
  featuredMeta: { color: "rgba(255,255,255,.85)", fontSize: 14, display: "flex", gap: 8, alignItems: "center" },
  featuredRight: {},
  cta: {
    background: "white",
    color: "#111",
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 700,
    border: "1px solid rgba(0,0,0,.06)",
  },

  form: { display: "flex", gap: 10, alignItems: "center", margin: "10px 0 14px" },
  input: { flex: 1, border: "1px solid #ddd", borderRadius: 10, padding: "12px 14px", fontSize: 15 },
  button: { padding: "12px 18px", borderRadius: 10, border: "1px solid #ddd", background: "#111", color: "#fff", fontWeight: 600, cursor: "pointer" },
  error: { color: "#b00020", marginBottom: 8 },

  quickRow: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 },
  quickButton: { padding: "6px 12px", border: "1px solid #ddd", borderRadius: 999, background: "#fafafa", cursor: "pointer" },

  sectionTitle: { fontSize: 18, fontWeight: 700, margin: "6px 0 10px" },
  cardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 },

  card: {
    background: "white",
    borderRadius: 14,
    border: "1px solid #eee",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    padding: 16,
    cursor: "pointer",
  },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
  cardTitle: { fontSize: 18, fontWeight: 600, color: "#111" },
  badge: { fontSize: 12, border: "1px solid #ddd", borderRadius: 999, padding: "2px 8px", background: "#fafafa", color: "#555" },
  cardDate: { color: "#666", fontSize: 13, marginTop: 6 },
  cardMetric: { fontSize: 14, fontWeight: 500, color: "#333", marginTop: 8 },

  dot: { opacity: 0.7 },
};
