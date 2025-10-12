export default function Success() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 text-center">
      <h1 className="text-3xl font-semibold text-green-700 mb-4">
        ✅ Signed in successfully!
      </h1>
      <p className="text-gray-700">
        You can now close this window or return to the main app.
      </p>
      <a
        href="/"
        className="mt-6 inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
      >
        Go to Dashboard
      </a>
    </div>
  );
}
