import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

const API_BASE = (import.meta.env.VITE_API_URL || "https://ltg-backend.onrender.com").replace(/\/+$/, "");

/**
 * Expected API: GET /api/leaderboard/:id
 * Example response:
 * {
 *   ok: true,
 *   leaderboard: [
 *     {
 *       entry_id: "e1",
 *       user: { name: "Alice", email: "alice@example.com" },
 *       total: -12,
 *       rank: 1,
 *       tiebreaker: 68,
 *       picks: { A: "p1", B: "p2", C: "p3", D: "p4" }
 *     },
 *     ...
 *   ],
 *   updated_at: "2025-10-12T20:15:00Z"
 * }
 */

export default function Leaderboard() {
  const { id = "demo" } = useParams();
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [sortKey, setSortKey] = useState("rank");
  const [sortDir, setSortDir] = useState("asc");
  const [poll, setPoll] = useState(true);

  async function load() {
    setErr("");
    try {
      const res = await fetch(`${API_BASE}/api/leaderboard/${id}`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      setErr(String(e.message || e));
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  // Poll every 60s when enabled
  useEffect(() => {
    if (!poll) return;
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [poll, id]);

  const rows = useMemo(() => {
    const items = data?.leaderboard || [];
    const sorted = [...items].sort((a, b) => {
      const A = a[sortKey];
      const B = b[sortKey];
      if (A == null && B == null) return 0;
      if (A == null) return 1;
      if (B == null) return -1;
      if (A === B) return 0;
      const cmp = A > B ? 1 : -1;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [data, sortKey, sortDir]);

  return (
    <div style={styles.wrap}>
      <Header id={id} updatedAt={data?.updated_at} />
      <div style={{ ...styles.card, marginBottom: 12, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
        <div>
          <label style={styles.label}>Sort by</label>
          <select value={sortKey} onChange={e => setSortKey(e.target.value)} style={styles.input}>
            <option value="rank">Rank</option>
            <option value="total">Total</option>
            <option value="tiebreaker">Tiebreaker</option>
            <option value="entry_id">Entry ID</option>
          </select>
        </div>
        <div>
          <label style={styles.label}>Direction</label>
          <select value={sortDir} onChange={e => setSortDir(e.target.value)} style={styles.input}>
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </div>
        <div>
          <label style={styles.label}>Live update</label>
          <div>
            <button onClick={() => setPoll(p => !p)} style={styles.secondaryBtn}>
              {poll ? "⏸ Pause" : "▶️ Resume"}
            </button>
            <button onClick={load} style={{ ...styles.secondaryBtn, marginLeft: 8 }}>↻ Refresh</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={styles.card}>
        <div style={styles.table.header}>
          <div style={{ textAlign: "right" }}>Rank</div>
          <div>User</div>
          <div style={{ textAlign: "right" }}>Total</div>
          <div>Tiebreaker</div>
          <div>Entry</div>
          <div>Picks</div>
        </div>

        {(rows || []).map((r) => (
          <div key={r.entry_id} style={styles.table.row}>
            <div style={{ textAlign: "right", fontWeight: 700 }}>{r.rank ?? "—"}</div>
            <div>
              <div style={{ fontWeight: 600 }}>{r.user?.name || r.user?.email || "Anonymous"}</div>
              {r.user?.email && <div style={{ color: "#666", fontSize: 12 }}>{r.user.email}</div>}
            </div>
            <div style={{ textAlign: "right" }}>{fmtScore(r.total)}</div>
            <div>{r.tiebreaker ?? "—"}</div>
            <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}>{r.entry_id}</div>
            <div style={{ color: "#333" }}>{fmtPicks(r.picks)}</div>
          </div>
        ))}

        {!rows.length && (
          <div style={{ padding: 12, color: "#666" }}>
            {err ? `Error: ${err}` : "No entries yet."}
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", fontSize: 12, color: "#888", padding: 10 }}>
        Source: {API_BASE}/api/leaderboard/{id}
      </div>
    </div>
  );
}

function Header({ id, updatedAt }) {
  return (
    <div style={styles.header}>
      <div>
        <h1 style={{ margin: 0 }}>Leaderboard</h1>
        <div style={{ color: "#555" }}>Tournament: {id}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        {updatedAt && <div style={{ color: "#666", fontSize: 12 }}>Updated: {new Date(updatedAt).toLocaleString()}</div>}
        <div style={{ marginTop: 6 }}>
          <Link to={`/research/${id}`} style={{ marginRight: 12 }}>← Research</Link>
          <Link to={`/lineup/${id}`}>Build lineup →</Link>
        </div>
      </div>
    </div>
  );
}

function fmtScore(n) {
  if (n == null || Number.isNaN(n)) return "—";
  // Example: show negative numbers with a leading minus, positives with +, zeros as E
  if (n === 0) return "E";
  return n > 0 ? `+${n}` : `${n}`;
}

function fmtPicks(p) {
  if (!p) return "—";
  const order = ["A", "B", "C", "D"];
  return order.map(t => (p[t] ? `${t}:${p[t]}` : null)).filter(Boolean).join(" · ");
}

const styles = {
  wrap: { fontFamily: "system-ui, sans-serif", maxWidth: 980, margin: "0 auto", padding: 16 },
  header: { display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 },
  card: { background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 12, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" },
  label: { display: "block", fontSize: 12, color: "#555", marginBottom: 6 },
  input: { border: "1px solid #ddd", borderRadius: 8, padding: "8px 10px", outline: "none", width: "100%" },
  secondaryBtn: { padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer" },
  table: {
    header: {
      display: "grid",
      gridTemplateColumns: "80px 1fr 120px 140px 160px 1.2fr",
      gap: 8,
      fontWeight: 700,
      color: "#333",
      padding: "6px 4px",
      borderBottom: "1px solid #eee",
    },
    row: {
      display: "grid",
      gridTemplateColumns: "80px 1fr 120px 140px 160px 1.2fr",
      gap: 8,
      padding: "10px 4px",
      borderBottom: "1px solid #f3f3f3",
    },
  },
};
