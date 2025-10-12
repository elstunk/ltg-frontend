import { useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
  "https://ltg-backend.onrender.com"; // fallback for local/dev

export default function Login() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);

    // super-light validation
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setMsg({ type: "error", text: "Please enter a valid email." });
      return;
    }

    try {
      setSending(true);

      const res = await fetch(`${API_BASE}/api/auth/request-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        // try to surface server message if present
        let detail = "";
        try {
          const data = await res.json();
          detail = data?.message || data?.error || "";
        } catch {}
        throw new Error(detail || `Request failed (${res.status})`);
      }

      // If your backend returns JSON you can read it here if needed
      // const data = await res.json();

      // Success: show confirmation and/or redirect to your success page
      setMsg({
        type: "success",
        text: "Magic link sent! Check your email.",
      });

      // If you want an immediate redirect instead of an on-page message:
      // window.location.href = "/auth/success";
    } catch (err) {
      console.error(err);
      // Optionally redirect to a dedicated error page:
      // window.location.href = "/auth/error";
      setMsg({
        type: "error",
        text: err?.message || "Could not send login link. Please try again.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
        <h1 className="text-2xl font-semibold mb-2">Sign in</h1>
        <p className="text-sm text-slate-500 mb-6">
          Enter your email and we’ll send you a one-time magic link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-slate-700">Email</span>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </label>

          <button
            type="submit"
            disabled={sending}
            className={`w-full rounded-lg px-4 py-2 text-white ${
              sending ? "bg-slate-400" : "bg-black hover:opacity-90"
            }`}
          >
            {sending ? "Sending…" : "Email me a login link"}
          </button>
        </form>

        {msg && (
          <div
            className={`mt-4 rounded-lg px-3 py-2 text-sm ${
              msg.type === "success"
                ? "bg-green-50 text-green-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {msg.text}
          </div>
        )}

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-slate-500 hover:underline">
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}
