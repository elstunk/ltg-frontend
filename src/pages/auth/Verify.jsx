import { useEffect, useState } from "react";

const API_BASE =
  (import.meta.env.VITE_API_URL || "https://ltg-backend.onrender.com")
    .replace(/\/+$/, "");

export default function Verify() {
  const [msg, setMsg] = useState("Verifying…");

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token"); // adjust if your backend uses a different param, e.g. 't'
    if (!token) {
      setMsg("Missing token.");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/verify?token=${encodeURIComponent(token)}`);
        if (!res.ok) throw new Error(`Verify failed (${res.status})`);
        // success -> send to the success page (or dashboard if you have one)
        window.location.replace("/auth/success");
      } catch (err) {
        console.error(err);
        window.location.replace("/auth/error");
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>{msg}</p>
    </div>
  );
}
