const BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.lumbertiergolf.com";
export async function api<T=any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { ...init, cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}
