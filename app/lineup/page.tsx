"use client";
import { useState } from "react";

export default function LineupPage() {
  const [name, setName] = useState("");
  const [picks, setPicks] = useState("");

  const submit = async () => {
    alert("Submit to /api/lineup/submit when backend is ready.");
  };

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Submit Lineup</h1>
      <div className="space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Team name" className="w-full rounded-xl border px-3 py-2" />
        <textarea value={picks} onChange={(e) => setPicks(e.target.value)} placeholder='Enter picks JSON (["p1","p2",...])' className="w-full rounded-xl border p-3 h-40" />
        <button onClick={submit} className="rounded-xl border px-3 py-2 shadow-sm hover:shadow">
          Submit
        </button>
      </div>
    </main>
  );
}