import React from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import "./index.css";

// External pages as separate files
import ResearchPage from "./pages/research/ResearchPage.jsx";
import LineupBuilder from "./pages/lineup/LineupBuilder.jsx";
import Leaderboard from "./pages/leaderboard/Leaderboard.jsx";

/** SINGLE source of truth for the backend URL */
const API_BASE = (import.meta.env.VITE_API_URL || "https://ltg-backend.onrender.com").replace(/\/+$/, "");

/* ----------------------------------------------------
 * HomePage  (Featured card + tournament picker + grid)
 * ---------------------------------------------------- */
function HomePage() {
  const nav = useNavigate();
  const [id, setId] = React.useState("demo");
  const [list, setList] = React.useState([]);
  const [featured, setFeatured] = React.useState(null);
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    const url = `${API_BASE}/api/tournaments`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data?.tournaments) && data.tournaments.length) {
          setList(data.tournaments);
          const f = data.tournaments.find((t) => t.featured) || data.tournaments[0];
          setFeatured(f);
        } else {
          setFeatured({ id: "demo", name: "Demo Event", tour: "PGA", date: "This Week", field_strength: 72 });
        }
      })
      .catch(() => {
        setFeatured({ id: "demo", name: "Demo Event", tour: "PGA", date: "This Week", field_strength: 72 });
      });
  }, []);

  function tidOf(t) { return t?.id || t?.slug || ""; }

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

      {featured && (
        <button
          className="tourney-card featured"
          style={styles.featuredCard}
          onClick={() => nav(`/research/${encodeURIComponent(tidOf(featured))}`)}
        >
          <div>
            <div style={styles.badge}>{featured.tour || "PGA"}</div>
            <h2 style={styles.featuredTitle}>{featured.name || "Featured Tournament"}</h2>
            <div style={styles.featuredMeta}>
              <span>{featured.date || "Soon"}</span>
              {featured.field_strength != null && (
                <>
                  <span style={{ opacity: 0.7 }}>•</span>
                  <span>Field {featured.field_strength}</span>
                </>
              )}
            </div>
          </div>
          <div>
            <div style={styles.cta}>Open Research →</div>
          </div>
        </button>
      )}

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

      <div style={styles.quickRow}>
        <button
          type="button"
          className="tourney-chip"
          style={styles.quickButton}
          onClick={() => setId("demo")}
        >
          demo
        </button>
      </div>

      {!!list.length && (
        <>
          <h3 style={styles.sectionTitle}>All Tournaments</h3>
          <div style={styles.cardGrid}>
            {list.map((t) => {
              const tid = tidOf(t);
              const title = t.name || t.title || tid;
              return (
                <div
                  key={tid}
                  className="tourney-card"
                  onClick={() => nav(`/research/${encodeURIComponent(tid)}`)}
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
                  <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); nav(`/leaderboard/${encodeURIComponent(tid)}`); }}
                      style={styles.smallBtn}
                    >
                      Leaderboard
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nav(`/lineup/${encodeURIComponent(tid)}`); }}
                      style={styles.smallBtn}
                    >
                      Build lineup
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* -----------------------------------------
 * Verify page (magic-link token verification)
 * ----------------------------------------- */
function Verify() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [status, setStatus] = React.useState("loading");

  React.useEffect(() => {
    const token = params.get("token");
    if (!token) { setStatus("missing"); return; }

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/verify-link?token=${encodeURIComponent(token)}`);
        if (!res.ok) throw new Error("invalid");
        const data = await res.json();
        if (data?.ok) {
          setStatus("success");
          if (data.token) localStorage.setItem("ltg_session", data.token);
          setTimeout(() => nav("/"), 2500);
        } else {
          setStatus("invalid");
        }
      } catch {
        setStatus("error");
      }
    })();
  }, [params, nav]);

  const ui = {
    loading: <Card title="Verifying your link…">Please wait a moment.</Card>,
    success: <Card title="✅ Success!">You’re now signed in. Redirecting…</Card>,
    invalid: <Card title="⚠️ Invalid link">This sign-in link is no longer valid or already used.</Card>,
    missing: <Card title="❌ Missing token">Your link seems incomplete. Try requesting a new one.</Card>,
    error:   <Card title="❌ Something went wrong">We couldn’t verify your link. Please try again later.</Card>,
  };
  return (
    <div style={styles.centerWrap}>
      <h1 style={{ marginBottom: 16 }}>The Lumber Yard</h1>
      {ui[status] || ui.error}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,.05)",
        padding: 24,
        textAlign: "center",
        maxWidth: 420,
      }}
    >
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <p>{children}</p>
    </div>
  );
}

/* --------
 * 404 page
 * -------- */
function NotFound() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <h1>404</h1>
      <p>Page not found. <a href="/">Go home</a></p>
    </div>
  );
}

/* -------------
 * Router config
 * ------------- */
const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/research/:id", element: <ResearchPage /> },
  { path: "/research", element: <ResearchPage /> },
  { path: "/auth/verify", element: <Verify /> },
  { path: "/lineup/:id", element: <LineupBuilder /> },
  { path: "/leaderboard/:id", element: <Leaderboard /> },   // ✅ NEW
  { path: "*", element: <NotFound /> },
]);

// Mount
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

/* -----------
 * Inline styles
 * ----------- */
const styles = {
  wrap: { fontFamily: "system-ui, sans-serif", padding: 24, maxWidth: 1060, margin: "0 auto" },
  header: { marginBottom: 8 },
  title: { fontSize: 32, fontWeight: 800, margin: 0 },
  subtitle: { color: "#555", marginTop: 6, marginBottom: 16, fontSize: 16 },

  featuredCard: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "center",
    padding: 22,
    margin: "10px 0 22px",
    borderRadius: 18,
    border: "1px solid #ececec",
    background: "linear-gradient(135deg, #2a5cff 0%, #111 100%)",
    color: "white",
    textAlign: "left",
  },
  featuredTitle: { margin: "6px 0 2px", fontSize: 26, fontWeight: 800 },
  featuredMeta: { color: "rgba(255,255,255,.85)", fontSize: 14, display: "flex", gap: 8, alignItems: "center" },
  badge: { fontSize: 12, border: "1px solid rgba(255,255,255,.35)", borderRadius: 999, padding: "2px 8px", background: "rgba(255,255,255,.08)", color: "#fff" },
  cta: { background: "#fff", color: "#111", padding: "10px 14px", borderRadius: 12, fontWeight: 700, border: "1px solid rgba(0,0,0,.06)" },

  form: { display: "flex", gap: 10, alignItems: "center", margin: "10px 0 14px" },
  input: { flex: 1, border: "1px solid #ddd", borderRadius: 10, padding: "12px 14px", fontSize: 15 },
  button: { padding: "12px 18px", borderRadius: 10, border: "1px solid #ddd", background: "#111", color: "#fff", fontWeight: 600, cursor: "pointer" },
  error: { color: "#b00020", marginBottom: 8 },

  quickRow: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 },
  quickButton: { padding: "6px 12px", border: "1px solid #ddd", borderRadius: 999, background: "#fafafa", cursor: "pointer" },

  sectionTitle: { fontSize: 18, fontWeight: 700, margin: "6px 0 10px" },
  cardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 },
  card: { background: "#fff", borderRadius: 14, border: "1px solid #eee", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", padding: 16, cursor: "pointer" },
  smallBtn: { padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 12 },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
  cardTitle: { fontSize: 18, fontWeight: 600, color: "#111" },

  centerWrap: { fontFamily: "system-ui, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#fafafa", color: "#111", padding: 20 },
};
