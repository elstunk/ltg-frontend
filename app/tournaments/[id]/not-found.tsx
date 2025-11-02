export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-xl font-semibold">Tournament not found</h1>
      <p className="mt-2 text-sm text-zinc-500">
        The tournament you’re looking for doesn’t exist or was removed.
      </p>
      <a href="/tournaments" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
        ← Back to tournaments
      </a>
    </main>
  );
}
