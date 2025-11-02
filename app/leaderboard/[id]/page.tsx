type Props = { params: { id: string } };

export default function LeaderboardPage({ params }: Props) {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">Leaderboard: {params.id}</h1>
      <p className="text-sm text-zinc-500 mt-2">Coming soon.</p>
    </main>
  );
}