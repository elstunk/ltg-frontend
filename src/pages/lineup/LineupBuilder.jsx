import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

const API_BASE = (import.meta.env.VITE_API_URL || "https://ltg-backend.onrender.com").replace(/\/+$/, "");

// Key we’ll use to persist unfinished picks in the browser
const draftKey = (tid) => `ltg_lineup_draft_${tid}`;

// Utility
function groupByTier(players = []) {
  const by = {};
  for (const p of players) {
    const t = (p.tier || "U").toUpperCase();
    (by[t] ||= []).push(p);
  }
  // Keep tiers in A→D order if present
  const order = ["A", "B", "C", "D"];
  return Object.fromEntries(
    Object.entries(by).sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
  );
}

export default function LineupBuilder() {
  const { id = "demo" } = useParams();
  const nav = useNavigate();

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // selected: { A: "player_id", B: "player_id", ... }
  const [selected, setSelected] = useState({});

  // Load research (players, tiers)
  useEffect(() => {
    setErr("");
    setData(null);

    // restore draft (if any)
    try {
      const raw = localStorage.getItem(draftKey(id));
      if (raw) setSelected(JSON.parse(raw));
    } catch {}

    fetch(`${API_BASE}/api/tournament/${id}/research`)
      .then((r) => (r.ok ? r.json() : Promise.reject(`${r.status} ${r.statusText}`)))
      .then(setData)
      .catch((e) => setErr(String(e)));
  }, [id]);

  // Group players by tier for UI
  const byTier = useMemo(() => groupByTier(data?.player_form), [data]);

  // Compute whether lineup is complete (one pick per visible tier)
  const tiers = useMemo(() => Object.keys(byTier), [byTier]);
  const isComplete = useMemo(() => tiers.every((t) => !!selected[t]), [tiers, selected]);

  // Persist draft locally whenever selection changes
  useEffect(() => {
    try {
      localStorage.setItem(draftKey(id), JSON.stringify(selected));
    } catch {}
  }, [id, selected]);

  function choose(tier, player_id) {
    setSelected((s) => ({ ...s, [tier]: player_id }));
  }

  async function submit() {
    setSubmitting(true);
    setErr("");
    try {
      const token = localStorage.getItem("ltg_session"); // set by your Verify page if returned by backend
      const res = await fetch(`${API_BASE}/api/lineup/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          tournament_id: id,
          picks: selected, // { A: "p1", B: "p2", ... }
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Submit failed (${res.status})`);
      }

      const out = await res.json().catch(() => ({}));
      // Clear draft on success
      localStorage.removeItem(draftKey(id));
      // Optional: navigate to a “My Entry” view or back to research
      nav(`/research/${id}`);
      alert("✅ Lineup submitted!");
    } catch (e) {
      console.error(e);
      setErr(String(e.message || e));
    } finally {
      setSubmitting(false);
    }
  }

  if (err && !data) {
    return (
      <div style={styles.wrap}>
        <Header id={id} />
        <div style={styles.card}>
          <h3>Couldn’t load players</h3>
          <p style={{ color: "#b00020" }}>{err}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={styles.wrap}>
        <Header id={id} />
        <div style={styles.card}>Loading lineup builder…</div>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <Header id={id} meta={data.meta} />
      <div style={{ display: "grid", gap: 16 }}>
        {tiers.map((tier) => (
          <div key={tier} style={styles.card}>
            <div style={styles.tierHeader}>
              <h3 style={{ margin: 0 }}>Tier {tier}</h3>
              {selected[tier] ? (
                <span style={styles.badge}>Selected</span>
              ) : (
                <span style={{ ...styles.badge, opacity: 0.6 }}>Pick 1</span>
              )}
            </div>

            <div style={styles.list}>
              {(byTier[tier] || []).map((p) => {
                const chosen = selected[tier] === p.player_id;
                return (
                  <button
                    key={p.player_id}
                    onClick={() => choose(tier, p.player_id)}
                    className="tourney-card"
                    style={{
                      ...styles.row,
                      ...(chosen ? styles.rowChosen : {}),
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={styles.rowStats}>
                      <span>L8 {fmt(p.last8_avg)}</span>
                      <span>Trend {fmt(p.last4_trend)}</span>
                      <span>Cuts {p.cuts_made ?? "–"}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {err && (
          <div style={{ ...styles.card, color: "#b00020" }}>
            <strong>Submit error:</strong> {err}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={submit}
            disabled={!isComplete || submitting}
            style={{
              ...styles.primaryBtn,
              opacity: !isComplete || submitting ? 0.6 : 1,
              cursor: !isComplete || submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Submitting…" : "Submit Lineup"}
          </button>
          <button
            onClick={() => localStorage.removeItem(draftKey(id))}
            style={styles.secondaryBtn}
          >
            Clear Draft
          </button>
          <Link to={`/research/${id}`} style={{ marginLeft: "auto" }}>
            ← Back to Research
          </Link>
        </div>
      </div>
    </div>
  );
}

function Header({ id, meta }) {
  return (
    <div style={styles.header}>
      <div>
        <h1 style={{ margin: 0 }}>Lineup Builder</h1>
        <div style={{ color: "#555" }}>Tournament: {meta?.name ?? id}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <Link to={`/research/${id}`}>Research</Link>
      </div>
    </div>
  );
}

function fmt(n) {
  if (n == null || Number.isNaN(n)) return "–";
  return typeof n === "number" ? n.toFixed(1) : String(n);
}

const styles = {
  wrap: { fontFamily: "system-ui, sans-serif", maxWidth: 980, margin: "0 auto", padding: 16 },
  header: { display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 },
  card: { background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: 12, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" },
  tierHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  badge: { fontSize: 12, padding: "2px 8px", borderRadius: 999, border: "1px solid #ddd", background: "#fafafa" },
  list: { display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" },
  row: { textAlign: "left", padding: 12, border: "1px solid #eee", borderRadius: 10, background: "#fff" },
  rowChosen: { outline: "2px solid #2a5cff", borderColor: "#cfe0ff", background: "#f6f9ff" },
  rowStats: { color: "#555", display: "flex", gap: 12, fontSize: 12 },
  primaryBtn: { padding: "12px 16px", borderRadius: 10, border: "1px solid #ddd", background: "#111", color: "#fff", fontWeight: 700 },
  secondaryBtn: { padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", fontWeight: 600 },
};
