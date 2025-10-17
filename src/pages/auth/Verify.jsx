import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const API_BASE = (import.meta.env.VITE_API_URL || "https://ltg-backend.onrender.com").replace(/\/+$/, "");

export default function Verify() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setStatus("missing");
      return;
    }

    async function verify() {
      try {
        const res = await fetch(`${API_BASE}/api/auth/verify-link?token=${encodeURIComponent(token)}`);
        if (!res.ok) throw new Error("invalid");
        const data = await res.json();

        if (data?.ok) {
          setStatus("success");
          setTimeout(() => nav("/"), 2500); // Redirect after 2.5s
        } else {
          setStatus("invalid");
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    }

    verify();
  }, [params, nav]);

  const ui = {
    loading: (
      <div style={styles.card}>
        <h2>Verifying your link…</h2>
        <p>Please wait a moment.</p>
      </div>
    ),
    success: (
      <div style={styles.card}>
        <h2>✅ Success!</h2>
        <p>You’re now signed in. Redirecting…</p>
      </div>
    ),
    invalid: (
      <div style={styles.card}>
        <h2>⚠️ Invalid link</h2>
        <p>This sign-in link is no longer valid or already used.</p>
      </div>
    ),
    missing: (
      <div style={styles.card}>
        <h2>❌ Missing token</h2>
        <p>Your link seems incomplete. Try requesting a new one.</p>
      </div>
    ),
    error: (
      <div style={styles.card}>
        <h2>❌ Something went wrong</h2>
        <p>We couldn’t verify your link. Please try again later.</p>
      </div>
    ),
  };

  return (
    <div style={styles.wrap}>
      <h1 style={styles.title}>The Lumber Yard</h1>
      {ui[status] || ui.error}
    </div>
  );
}

const styles = {
  wrap: {
    fontFamily: "system-ui, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#fafafa",
    color: "#111",
    padding: 20,
  },
  title: { marginBottom: 20, fontSize: 28, fontWeight: 700 },
  card: {
    background: "white",
    border: "1px solid #eee",
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,.05)",
    padding: 24,
    textAlign: "center",
    maxWidth: 400,
  },
};

