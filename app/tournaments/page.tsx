// app/tournaments/page.tsx (server component)
import Link from "next/link";

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
  status?: string;
};

async function getData(): Promise<Tournament[]> {
  const res = await fetch(`${API}/api/tournaments`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch tournaments: ${res.status}`);
  return res.json();
}

function fmtDate(iso?: string) {
  if (!iso) return "TBA";
  const d = new Date(iso);
  return d.toLocaleDateString();
}

export default async function TournamentsPage() {
  const data = await getData();

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Tournaments</h1>

      {data.length === 0 ? (
        <p className="text-sm text-zinc-500">No tournaments yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((t) => (
            <li key={String(t.id)} className="rounded-2xl border p-4 shadow-sm">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>{t.tour || "PGA"}</span>
                <span className="capitalize">{t.status || ""}</span>
              </div>

              <h3 className="font-semibold mt-1">
                <Link href={`/tournaments/${t.id}`} className="hover:underline">
                  {t.name}
                </Link>
              </h3>

              <p className="text-sm text-zinc-600">
                {fmtDate(t.startDate)} – {fmtDate(t.endDate)}
              </p>

              {(t.course || t.city || t.country) && (
                <p className="text-xs text-zinc-500 mt-1">
                  {[t.course, t.city, t.country].filter(Boolean).join(", ")}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
