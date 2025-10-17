import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

// SINGLE source of truth for the backend URL (mirrors your main.jsx)
const API_BASE = (import.meta.env.VITE_API_URL || "https://ltg-backend.onrender.com").replace(/\/+$/, "");

function number(n) {
  if (n == null || Number.isNaN(n)) return "–";
  return typeof n === "number" ? n.toFixed(1) : String(n);
}

export default function ResearchPage() {
  const { id = "demo" } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [tier, setTier] = useState("all");
  const [sortKey, setSortKey] = useState("last8_avg");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    setError("");
    setData(null);
    fetch(`${API_BASE}/api/tournament/${id}/research`)
      .then((r) => (r.ok ? r.json() : Promise.reject(`${r.status} ${r.statusText}`)))
      .then(setData)
      .catch((e) => setError(String(e)));
  }, [id]);

  const players = useMemo(() => {
    if (!data?.player_form) return [];
    let rows = [...data.player_form];
    if (tier !== "all") rows = rows.filter((p) => (p.tier || "").toUpperCase() === tier);
    if (q) rows = rows.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
    rows.sort((a, b) => {
      const A = a[sortKey];
      const B = b[sortKey];
      const s = A === B ? 0 : A > B ? 1 : -1;
      return sortDir === "asc" ? s : -s;
    });
    return rows;
  }, [data, q, tier, sortKey, sortDir]);

  if (error) {
    return (
      <div style={styles.wrap}>
        <Header id={id} meta={data?.meta} />
        <div style={styles.card}>
          <h3>API error</h3>
          <p style={{ color: "#b00020" }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={styles.wrap}>
        <Header id={id} />
        <div style={styles.card}>Loading research…</div>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <Header id={id} meta={data.meta} fieldStrength={data.field_strength?.metric} />

      {/* Controls */}
      <div style={{ ...styles.card, display: "grid", gap: 12, gridTemplateColumns: "1fr 120px 160px 120px" }}>
        <input
          placeholder="Search players…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={styles.input}
        />
        <select value={tier} onChange={(e) => setTier(e.target.value)} style={styles.input}>
          <option value="all">All tiers</option>
          <option value="A">Tier A</option>
          <option value="B">Tier B</option>
          <option value="C">Tier C</option>
          <option value="D">Tier D</option>
        </select>
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} style={styles.input}>
          <option value="last8_avg">Sort: Last-8 Avg</option>
          <option value="last4_trend">Sort: Last-4 Trend</option>
          <option value="cuts_made">Sort: Cuts Made</option>
          <option value="top10s">Sort: Top 10s</option>
          <option value="top25s">Sort: Top 25s</option>
          <option value="name">Sort: Name</option>
        </select>
        <select value={sortDir} onChange={(e) => setSortDir(e.target.value)} style={styles.input}>
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>

      {/* Table */}
      <div style={styles.card}>
        <div style={styles.table.header}>
          <div>Tier</div>
          <div>Name</div>
          <div style={{ textAlign: "right" }}>L8 Avg</div>
          <div style={{ textAlign: "right" }}>L4 Trend</div>
          <div style={{ textAlign: "right" }}>Cuts</div>
          <div style={{ textAlign: "right" }}>Top 10s</div>
          <div style={{ textAlign: "right" }}>Top 25s</div>
        </div>
        {players.map((p) => (
          <div key={p.player_id} style={styles.table.row}>
            <div>{(p.tier || "").toUpperCase()}</div>
            <div>{p.name}</div>
            <div style={{ textAlign: "right" }}>{number(p.last8_avg)}</div>
            <div style={{ textAlign: "right" }}>{number(p.last4_trend)}</div>
            <div style={{ textAlign: "right" }}>{p.cuts_made ?? "–"}</div>
            <div style={{ textAlign: "right" }}>{p.top10s ?? "–"}</div>
            <div style={{ textAlign: "right" }}>{p.top25s ?? "–"}</div>
          </div>
        ))}
        {!players.length && <div style={{ padding: 12, color: "#666" }}>No players match the current filters.</div>}
      </div>

      <div style={{ fontSize: 12, color: "#888", textAlign: "center", padding: 12 }}>
        Data source: {API_BASE}/api/tournament/{id}/research
      </div>
    </div>
  );
}

function Header({ id, meta, fieldStrength }) {
  return (
    <div style={styles.header}>
      <div>
        <h1 style={{ margin: 0 }}>Tournament Research</h1>
        <div style={{ color: "#555" }}>ID: {id}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontWeight: 600 }}>{meta?.name ?? "Loading…"}</div>
        {meta?.tour && <div style={{ color: "#555" }}>{meta.tour}</div>}
        {fieldStrength != null && (
          <div style={{ marginTop: 6 }}>
            <span style={styles.badge}>Field {fieldStrength}</span>
          </div>
        )}
        <div style={{ marginTop: 8 }}>
          <Link to="/">← Back</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 980, margin: "0 auto", padding: 16, fontFamily: "system-ui, sans-serif" },
  header: { display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 },
  card: { background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 12, marginBottom: 12, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" },
  input: { border: "1px solid #ddd", borderRadius: 8, padding: "8px 10px", outline: "none" },
  badge: { display: "inline-block", padding: "4px 8px", borderRadius: 999, border: "1px solid #ddd", background: "#fafafa" },
  table: {
    header: { display: "grid", gridTemplateColumns: "80px 1fr repeat(5, 120px)", gap: 8, fontWeight: 600, color: "#333", padding: "6px 4px", borderBottom: "1px solid #eee" },
    row: { display: "grid", gridTemplateColumns: "80px 1fr repeat(5, 120px)", gap: 8, padding: "8px 4px", borderBottom: "1px solid #f3f3f3" },
  },
};
