export default function Error() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-center">
      <h1 className="text-3xl font-semibold text-red-700 mb-4">
        ❌ Sign-in failed
      </h1>
      <p className="text-gray-700">
        The login link may have expired or was invalid. Please try again.
      </p>
      <a
        href="/"
        className="mt-6 inline-block bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
      >
        Back to Home
      </a>
    </div>
  );
}
