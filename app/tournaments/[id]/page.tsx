// app/tournaments/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
const API = process.env.NEXT_PUBLIC_API_URL || "https://api.lumbertiergolf.com";

type Tournament = {
  id: number | string;
  name: string;
  tour?: string;
  course?: string;
  city?: string;
  country?: string;
  startDate?: string; // ISO
  endDate?: string;   // ISO
  status?: "upcoming" | "active" | "completed" | string;
};

function fmt(iso?: string) {
  if (!iso) return "TBA";
  const d = new Date(iso);
  return d.toLocaleDateString();
}

async function getTournament(id: string): Promise<Tournament | null> {
  const res = await fetch(`${API}/api/tournaments/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch tournament ${id}: ${res.status}`);
  return res.json();
}

export default async function TournamentPage({ params }: { params: { id: string } }) {
  const t = await getTournament(params.id);
  if (!t) notFound();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <Link href="/tournaments" className="text-sm text-zinc-500 hover:underline">
          ← Back to tournaments
        </Link>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight">{t.name}</h1>
      <p className="mt-1 text-sm text-zinc-500">
        {(t.tour || "PGA")} · <span className="capitalize">{t.status || ""}</span>
      </p>

      <div className="mt-4 rounded-2xl border p-4">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase text-zinc-500">Dates</dt>
            <dd className="text-sm">{fmt(t.startDate)} – {fmt(t.endDate)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-zinc-500">Location</dt>
            <dd className="text-sm">
              {[t.course, t.city, t.country].filter(Boolean).join(", ") || "TBA"}
            </dd>
          </div>
        </dl>
      </div>
    </main>
  );
}
